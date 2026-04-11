import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, ResendVerificationDto } from './dto/auth.dto';
import { Role } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
    private emailService: EmailService,
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

    // Check email verification
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before signing in. Check your inbox for the verification link.',
      );
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
    const { passwordHash, driverProfile, emailVerificationToken, passwordResetToken, passwordResetExpiry, ...userWithoutPassword } = user;

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
    const verificationToken = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: dto.role || Role.PASSENGER,
        emailVerified: false,
        emailVerificationToken: verificationToken,
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

    // Send verification email (non-blocking)
    this.emailService
      .sendVerificationEmail(user.email, verificationToken, user.firstName)
      .catch(() => {});

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

    const { passwordHash: _, emailVerificationToken: __, ...userWithoutSensitive } = user;

    return {
      message: 'Registration successful! Please check your email to verify your account.',
      user: userWithoutSensitive,
    };
  }

  /**
   * Verify email using token
   */
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification link.');
    }

    if (user.emailVerified) {
      return { message: 'Email is already verified. You can sign in.' };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    return { message: 'Email verified successfully! You can now sign in.' };
  }

  /**
   * Resend verification email
   */
  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Don't reveal if the email exists
      return { message: 'If an account exists with this email, a verification link has been sent.' };
    }

    if (user.emailVerified) {
      return { message: 'Email is already verified. You can sign in.' };
    }

    const newToken = uuidv4();
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: newToken },
    });

    await this.emailService.sendVerificationEmail(user.email, newToken, user.firstName);

    return { message: 'If an account exists with this email, a verification link has been sent.' };
  }

  /**
   * Forgot password — send reset email
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }

    const resetToken = uuidv4();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: expiry,
      },
    });

    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  /**
   * Reset password using token
   */
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: dto.token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    if (user.passwordResetExpiry && new Date(user.passwordResetExpiry) < new Date()) {
      throw new BadRequestException('Reset token has expired. Please request a new one.');
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    return { message: 'Password has been reset successfully. You can now sign in with your new password.' };
  }
}
