import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from './email.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
          throw new Error(
            'FATAL: JWT_SECRET environment variable is not set. ' +
            'Refusing to start with an insecure default. ' +
            'Set JWT_SECRET in your .env file.',
          );
        }
        return {
          secret: jwtSecret,
          signOptions: { expiresIn: '7d' }, // 7 days expiration
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, JwtStrategy],
  exports: [AuthService, EmailService],
})
export class AuthModule {}
