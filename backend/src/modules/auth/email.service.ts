import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private get frontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${token}`;
    try {
      await this.transporter.sendMail({
        from: `"Mashaweer" <${this.configService.get<string>('SMTP_USER')}>`,
        to: email,
        subject: '✉️ Verify Your Mashaweer Account',
        html: `
        <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);font-family:'Segoe UI',sans-serif;">
          <div style="background:linear-gradient(135deg,#1A4270 0%,#04A056 100%);padding:32px 24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:24px;">✉️ Mashaweer</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Verify Your Email</p>
          </div>
          <div style="padding:32px 24px;">
            <p style="color:#27272a;font-size:15px;line-height:1.6;">Hi <strong>${firstName}</strong>! 👋<br><br>Welcome to Mashaweer! Please verify your email:</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${verifyUrl}" style="background:linear-gradient(135deg,#1A4270,#04A056);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">Verify Email</a>
            </div>
            <p style="color:#71717a;font-size:13px;">This link expires in <strong>24 hours</strong>.</p>
          </div>
        </div>`,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email`, error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    try {
      await this.transporter.sendMail({
        from: `"Mashaweer" <${this.configService.get<string>('SMTP_USER')}>`,
        to: email,
        subject: '🔐 Reset Your Mashaweer Password',
        html: `
        <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);font-family:'Segoe UI',sans-serif;">
          <div style="background:linear-gradient(135deg,#1A4270 0%,#04A056 100%);padding:32px 24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:24px;">🔐 Mashaweer</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Password Reset</p>
          </div>
          <div style="padding:32px 24px;">
            <p style="color:#27272a;font-size:15px;line-height:1.6;">Click below to reset your password:</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${resetUrl}" style="background:linear-gradient(135deg,#1A4270,#04A056);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">Reset Password</a>
            </div>
            <p style="color:#71717a;font-size:13px;">This link expires in <strong>1 hour</strong>.</p>
          </div>
        </div>`,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email`, error);
      throw new Error('Failed to send password reset email');
    }
  }
}