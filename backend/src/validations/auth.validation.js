"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.verifyEmailSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Base email and password validation
const email = zod_1.z.string().email("Invalid email address");
const password = zod_1.z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");
// Login validation
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email,
        password: zod_1.z.string().min(1, "Password is required"),
        remember_me: zod_1.z.boolean().optional(),
    }),
});
// Register validation
exports.registerSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        email,
        password,
        confirm_password: zod_1.z.string().min(1, "Please confirm your password"),
        name: zod_1.z.string().min(1, "Name is required"),
    })
        .refine((data) => data.password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"],
    }),
});
// Password reset request validation
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email,
    }),
});
// Password reset validation
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        token: zod_1.z.string().min(1, "Token is required"),
        password,
        confirm_password: zod_1.z.string().min(1, "Please confirm your password"),
    })
        .refine((data) => data.password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"],
    }),
});
// Email verification validation
exports.verifyEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(1, "Token is required"),
    }),
});
// Refresh token validation
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refresh_token: zod_1.z.string().min(1, "Refresh token is required"),
    }),
});
