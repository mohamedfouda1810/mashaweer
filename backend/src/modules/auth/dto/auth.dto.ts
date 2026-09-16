import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsArray,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '@prisma/client';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  password!: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^01[0125][0-9]{8}$/, {
    message: 'Phone must be a valid Egyptian mobile number (e.g. 01xxxxxxxxx)',
  })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  password!: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  // Driver fields
  @IsString()
  @IsOptional()
  @MaxLength(100)
  carModel?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  plateNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  personalPhotoUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  identityPhotos?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  drivingLicensePhotos?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  carLicensePhotos?: string[];
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  newPassword!: string;
}
