import { Resend } from 'resend';
import { env } from '../../config';
import { createLogger } from '../../config';

const logger = createLogger('email-service');

// Initialize Resend with API key
let resend: Resend;
try {
    resend = new Resend(env.RESEND_API_KEY);
} catch (error) {
    logger.error('Failed to initialize Resend', { error });
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
                                    to,
                                    subject,
                                    html,
                                    from = env.EMAIL_FROM || 'noreply@ganzafrica.org',
                                }: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
}): Promise<{ id: string } | null> {
    try {
        if (!resend) {
            logger.error('Resend not initialized');
            return null;
        }

        const { data, error } = await resend.emails.send({
            from,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        });

        if (error) {
            logger.error('Failed to send email', { error });
            return null;
        }

        logger.info('Email sent successfully', { id: data?.id, to });
        return { id: data?.id?.toString() ?? '' };
    } catch (error) {
        logger.error('Error sending email', { error });
        return null;
    }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
    email: string,
    token: string
): Promise<{ id: string } | null> {
    const verificationUrl = `${env.WEBSITE_URL}/verify-email?token=${token}`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Verify Your Email</h1>
      <p>Thank you for signing up for GanzAfrica. Please verify your email address by clicking the button below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email</a>
      <p>If you did not sign up for GanzAfrica, please ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `;

    return sendEmail({
        to: email,
        subject: 'Verify Your GanzAfrica Email',
        html,
    });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
    email: string,
    token: string
): Promise<{ id: string } | null> {
    const resetUrl = `${env.WEBSITE_URL}/reset-password?token=${token}`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Reset Your Password</h1>
      <p>You requested to reset your password. Click the button below to create a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `;

    return sendEmail({
        to: email,
        subject: 'Reset Your GanzAfrica Password',
        html,
    });
}

/**
 * Send OTP email
 */
export async function sendOtpEmail(
    email: string,
    otp: string
): Promise<{ id: string } | null> {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Your Verification Code</h1>
      <p>Your verification code is:</p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">${otp}</div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this code, please ignore this email or contact support if you have concerns.</p>
    </div>
  `;

    return sendEmail({
        to: email,
        subject: 'Your GanzAfrica Verification Code',
        html,
    });
}