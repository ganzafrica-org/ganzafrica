declare function verifyEmailConnection(): Promise<boolean>;
export declare function sendVerificationEmail(to: string, data: {
    token: string;
    expiresAt: Date;
}): Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
export declare function sendPasswordResetEmail(to: string, data: {
    token: string;
    expiresAt: Date;
}): Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
export declare function sendWelcomeEmail(to: string, name: string): Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
export { verifyEmailConnection };
//# sourceMappingURL=email.service.d.ts.map