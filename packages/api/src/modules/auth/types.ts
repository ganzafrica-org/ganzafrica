import { z } from 'zod';


export const baseRoleEnum = z.enum(['public', 'applicant', 'fellow', 'employee', 'alumni']);
export type BaseRole = z.infer<typeof baseRoleEnum>;

export type UserSession = {
    id: string;
    email: string;
    name: string;
    role: BaseRole;
    permissions: string[];
};

export type AuthTokenPayload = {
    sub: string; // user ID
    email: string;
    name: string;
    role: string;
    sessionId: string;
    jti: string; // unique token ID
    iat: number; // issued at
    exp: number; // expires at
};

export enum TwoFactorMethod {
    EMAIL_OTP = 'email_otp',
    AUTHENTICATOR = 'authenticator',
}