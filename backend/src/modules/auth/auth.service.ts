import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Role } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { driverProfile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      // Check if the ban has expired (for temp bans)
      if (user.banUntil && new Date(user.banUntil) < new Date()) {
        // Ban expired, auto-unban
        await this.prisma.user.update({
          where: { id: user.id },
          data: { isBanned: false, banUntil: null, banReason: null },
        });
      } else {
        const banMsg = user.banUntil
          ? `Your account is banned until ${new Date(user.banUntil).toLocaleDateString()}. Reason: ${user.banReason || 'N/A'}`
          : 'Your account has been banned';
        throw new UnauthorizedException(banMsg);
      }
    }

    // Block unapproved drivers
    if (user.role === 'DRIVER' && user.driverProfile && !user.driverProfile.isApproved) {
      throw new UnauthorizedException(
        'Your driver application is pending admin approval. Please wait for an admin to review your documents.',
      );
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    // Remove password hash and driverProfile from response (will be separate)
    const { passwordHash, driverProfile, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async register(dto: RegisterDto) {
    if (dto.role === Role.ADMIN) {
      throw new BadRequestException('Cannot register as an admin');
    }

    // Check if email or phone exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) throw new ConflictException('Email already in use');

    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existingPhone)
      throw new ConflictException('Phone number already in use');

    if (
      dto.role === Role.DRIVER &&
      (!dto.carModel || !dto.plateNumber || !dto.licenseNumber)
    ) {
      throw new BadRequestException(
        'Driver requires car model, plate number, and license number',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: dto.role || Role.PASSENGER,
        wallet: {
          create: {
            balance: 0,
          },
        },
        ...(dto.role === Role.DRIVER
          ? {
              driverProfile: {
                create: {
                  carModel: dto.carModel!,
                  plateNumber: dto.plateNumber!,
                  licenseNumber: dto.licenseNumber!,
                  personalPhotoUrl: dto.personalPhotoUrl,
                  identityPhotos: dto.identityPhotos || [],
                  drivingLicensePhotos: dto.drivingLicensePhotos || [],
                  carLicensePhotos: dto.carLicensePhotos || [],
                  isApproved: false,
                },
              },
            }
          : {}),
      },
    });

    if (dto.role === Role.DRIVER) {
      // Notify admins
      const admins = await this.prisma.user.findMany({
        where: { role: Role.ADMIN },
      });
      for (const admin of admins) {
        await this.notificationService.create({
          userId: admin.id,
          type: NotificationType.DRIVER_ALERT,
          title: 'New Driver Application',
          message: `${user.firstName} ${user.lastName} has applied as a Driver and needs approval.`,
          metadata: { driverId: user.id },
        });
      }
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }
}
