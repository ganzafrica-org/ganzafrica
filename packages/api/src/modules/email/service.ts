import * as nodemailer from 'nodemailer';
import { createLogger } from '../../config';

const logger = createLogger('email-service');

// debug
console.log('Email Configuration:');
console.log('User:', process.env.EMAIL_FROM);
console.log('Password provided:', !!process.env.EMAIL_PASSWORD);

// Create a reusable transporter object using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify connection configuration
transporter.verify()
    .then(() => {
        logger.info('SMTP server connection ready');
    })
    .catch((error) => {
        logger.error('SMTP connection verification failed', { error });
    });

/**
 * Send an email
 */
export async function sendEmail({
                                    to,
                                    subject,
                                    html,
                                    from = process.env.EMAIL_FROM,
                                    attachments = []
                                }: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    attachments?: Array<{
        filename: string;
        content?: Buffer | string;
        path?: string;
        contentType?: string;
    }>;
}): Promise<{ id: string } | null> {
    try {
        const toAddresses = Array.isArray(to) ? to : [to];

        // Send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"GanzAfrica" <${from}>`,
            to: toAddresses.join(', '),
            subject,
            html,
            attachments
        });

        logger.info('Email sent successfully', {
            messageId: info.messageId,
            to: toAddresses
        });

        return { id: info.messageId };
    } catch (error) {
        logger.error('Failed to send email', { error, to });
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
    const verificationUrl = `${process.env.PORTAL_URL}/verify?token=${token}`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Verify Your Email</h1>
      <p>Thank you for signing up for GanzAfrica. Please verify your email address by clicking the button below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email</a>
      <p>If you did not sign up for GanzAfrica, please ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
      <p>Or copy and paste this link: ${verificationUrl}</p>
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
    const resetUrl = `${process.env.PORTAL_URL}/reset-password?token=${token}`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Reset Your Password</h1>
      <p>You requested to reset your password. Click the button below to create a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      <p>This link will expire in 24 hours.</p>
      <p>Or copy and paste this link: ${resetUrl}</p>
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

/**
 * Send email with attachment(s)
 */
export async function sendEmailWithAttachments(
    to: string | string[],
    subject: string,
    html: string,
    attachments: Array<{
        filename: string;
        content?: Buffer | string;
        path?: string;
        contentType?: string;
    }>
): Promise<{ id: string } | null> {
    return sendEmail({
        to,
        subject,
        html,
        attachments
    });
}