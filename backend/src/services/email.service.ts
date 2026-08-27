import { Resend } from "resend";
import { env, Logger } from "../config";
import { AppError } from "../middlewares";

const logger = new Logger("EmailService");

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const isEmailConfigured = () => !!resend;

// Generic function to send emails
export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  if (!resend) {
    // No RESEND_API_KEY (typical for local dev) — nothing gets delivered, so surface every link
    // the email would have contained, otherwise there's no way to click through it locally.
    const links = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    logger.warn(
      `Resend not configured (missing RESEND_API_KEY). Skipping email to ${to} with subject: ${subject}` +
        (links.length ? `\nLink(s): ${links.join(", ")}` : ""),
    );
    return null;
  }

  try {
    // A text part is included whenever the caller has one — several clients (and inbox preview
    // snippets) render an html-only email as blank, since they read the text part for the
    // preview/fallback rather than parsing the html.
    const { data, error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
      ...(text ? { text } : {}),
    });

    if (error) {
      logger.error("Resend error:", error);
      throw new AppError(`Failed to send email: ${error.message}`, 500);
    }

    logger.info(`Email sent via Resend: ${data?.id}`);
    return data;
  } catch (error) {
    logger.error("Failed to send email", error);
    throw new AppError("Failed to send email", 500);
  }
}

// Send email verification email
export async function sendVerificationEmail(to: string, data: { token: string; expiresAt: Date }) {
  const verificationUrl = `${env.PORTAL_URL}/verify-email?token=${data.token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify your email address</h2>
      <p>Thank you for signing up for Ganzafrica. Please verify your email address by clicking the button below:</p>
      <div style="margin: 20px 0;">
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
      </div>
      <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire on ${data.expiresAt.toLocaleString()}.</p>
      <p>If you didn't sign up for Ganzafrica, you can safely ignore this email.</p>
      <hr>
      <p style="font-size: 12px; color: #666;">This is an automated email, please do not reply.</p>
    </div>
  `;

  return sendEmail(to, "Verify your Ganzafrica email address", html);
}

// Send password reset email
export async function sendPasswordResetEmail(
  to: string,
  data: { token: string; expiresAt: Date; next?: string },
) {
  const resetUrl = new URL("/reset-password", env.PORTAL_URL);
  resetUrl.searchParams.set("token", data.token);
  if (data.next) resetUrl.searchParams.set("next", data.next);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset your password</h2>
      <p>You have requested to reset your password for Ganzafrica. Please click the button below to set a new password:</p>
      <div style="margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      </div>
      <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire on ${data.expiresAt.toLocaleString()}.</p>
      <p>If you didn't request a password reset, you can safely ignore this email and your password will remain unchanged.</p>
      <hr>
      <p style="font-size: 12px; color: #666;">This is an automated email, please do not reply.</p>
    </div>
  `;

  return sendEmail(to, "Reset your Ganzafrica password", html);
}

// Send welcome email
export async function sendWelcomeEmail(to: string, name: string) {
  const loginUrl = `${env.PORTAL_URL}/login`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Ganzafrica!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for joining Ganzafrica. We're excited to have you on board!</p>
      <p>You can now log in to your account and start exploring:</p>
      <div style="margin: 20px 0;">
        <a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Log In to Your Account</a>
      </div>
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The Ganzafrica Team</p>
      <hr>
      <p style="font-size: 12px; color: #666;">This is an automated email, please do not reply.</p>
    </div>
  `;

  return sendEmail(to, "Welcome to Ganzafrica", html);
}

// Kept for compatibility — no-op with Resend (connection is stateless)
export async function verifyEmailConnection() {
  if (!resend) {
    logger.warn("Resend not configured. Email functionality will be disabled.");
    return false;
  }
  logger.info("Resend email client initialized");
  return true;
}
