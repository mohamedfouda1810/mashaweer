import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('SMTP_USER') || '',
        pass: this.configService.get<string>('SMTP_PASS') || '',
      },
    });
  }

  private get fromAddress(): string {
    return (
      this.configService.get<string>('SMTP_FROM') ||
      this.configService.get<string>('SMTP_USER') ||
      'noreply@mashaweer.com'
    );
  }

  private get frontendUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:3000'
    );
  }

  /**
   * Send a password reset email with a link containing the reset token.
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    const html = `
    <!DOCTYPE html>
    <html dir="ltr" lang="en">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1A4270 0%,#04A056 100%);padding:32px 24px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">🔐 Mashaweer</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Password Reset Request</p>
        </div>
        <!-- Body -->
        <div style="padding:32px 24px;">
          <p style="margin:0 0 16px;color:#27272a;font-size:15px;line-height:1.6;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#1A4270,#04A056);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
              Reset Password
            </a>
          </div>
          <p style="margin:16px 0 0;color:#71717a;font-size:13px;line-height:1.5;">
            This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;">
          <p style="margin:0;color:#a1a1aa;font-size:12px;text-align:center;">
            Mashaweer — Inter-City Ride Sharing Platform
          </p>
        </div>
      </div>
    </body>
    </html>`;

    try {
      await this.transporter.sendMail({
        from: `"Mashaweer" <${this.fromAddress}>`,
        to: email,
        subject: '🔐 Reset Your Mashaweer Password',
        html,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw new Error('Failed to send password reset email. Please try again.');
    }
  }

  /**
   * Send an email verification link after registration.
   */
  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    const html = `
    <!DOCTYPE html>
    <html dir="ltr" lang="en">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1A4270 0%,#04A056 100%);padding:32px 24px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">✉️ Mashaweer</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Verify Your Email</p>
        </div>
        <!-- Body -->
        <div style="padding:32px 24px;">
          <p style="margin:0 0 16px;color:#27272a;font-size:15px;line-height:1.6;">
            Hi <strong>${firstName}</strong>! 👋<br><br>
            Welcome to Mashaweer! Please verify your email address to activate your account:
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#1A4270,#04A056);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
              Verify Email
            </a>
          </div>
          <p style="margin:16px 0 0;color:#71717a;font-size:13px;line-height:1.5;">
            This link expires in <strong>24 hours</strong>. If you did not create an account, you can safely ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;">
          <p style="margin:0;color:#a1a1aa;font-size:12px;text-align:center;">
            Mashaweer — Inter-City Ride Sharing Platform
          </p>
        </div>
      </div>
    </body>
    </html>`;

    try {
      await this.transporter.sendMail({
        from: `"Mashaweer" <${this.fromAddress}>`,
        to: email,
        subject: '✉️ Verify Your Mashaweer Account',
        html,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      // Don't throw — registration should succeed even if email fails
    }
  }
}
