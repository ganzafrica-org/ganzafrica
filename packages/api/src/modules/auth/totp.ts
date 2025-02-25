import * as OTPAuth from 'otpauth';
import * as crypto from 'crypto';
import { createLogger } from '../../config';
import { Resend } from 'resend';

const logger = createLogger('totp');
const resend = new Resend(process.env.RESEND_API_KEY || 're_jkgeHisy_KngArPP8Cx6aUiBLpcXns5R9');

/**
 * Generate a new TOTP secret
 * @returns Base32 encoded secret and a URL for QR code
 */
export function generateTotpSecret(email: string, issuer: string = 'GanzAfrica'): { secret: string; url: string } {
    try {
        // Generate a secure random secret
        const secret = OTPAuth.Secret.fromHex(crypto.randomBytes(20).toString('hex'));

        // Create a new TOTP instance
        const totp = new OTPAuth.TOTP({
            issuer,
            label: email,
            secret,
            digits: 6,
            period: 30,
            algorithm: 'SHA1',
        });

        // Get the URL for QR code generation
        const url = totp.toString();

        return {
            secret: secret.base32,
            url,
        };
    } catch (error) {
        logger.error('TOTP secret generation failed', { error });
        throw new Error('Failed to generate TOTP secret');
    }
}

/**
 * Verify a TOTP code against a secret
 * @param secret Base32 encoded secret
 * @param token The TOTP code to verify
 * @returns True if the token is valid
 */
export function verifyTotpToken(secret: string, token: string): boolean {
    try {
        // Create a TOTP instance with the user's secret
        const totp = new OTPAuth.TOTP({
            issuer: 'GanzAfrica',
            label: 'user',
            secret: OTPAuth.Secret.fromBase32(secret),
            digits: 6,
            period: 30,
            algorithm: 'SHA1',
        });

        // Allow a window of 1 period before and after for clock drift
        const delta = totp.validate({ token, window: 1 });

        return delta !== null;
    } catch (error) {
        logger.error('TOTP verification failed', { error });
        return false;
    }
}

/**
 * Generate a one-time email verification code
 * @returns A 6-digit numeric code
 */
export function generateEmailOtp(): string {
    // Generate a 6-digit code
    return crypto.randomInt(100000, 999999).toString();
}

/**
 * Send verification email with OTP
 * @param email Recipient email
 * @param otp One-time password to send
 */
export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
    try {
        const { data, error } = await resend.emails.send({
            from: 'GanzAfrica <noreply@ganzafrica.org>',
            to: email,
            subject: 'Your GanzAfrica Verification Code',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>GanzAfrica Verification</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #f0f0f0; padding: 10px; text-align: center; letter-spacing: 5px;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Thank you,<br>GanzAfrica Team</p>
        </div>
      `
        });

        if (error) {
            logger.error('Failed to send OTP email', { error, email });
            return false;
        }

        logger.info('OTP email sent successfully', { email, messageId: data?.id });
        return true;
    } catch (error) {
        logger.error('Email sending error', { error, email });
        return false;
    }
}