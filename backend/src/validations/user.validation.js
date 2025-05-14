"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importUsersSchema = exports.listUsersSchema = exports.deleteUserSchema = exports.getUserSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
// Create user validation
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
        name: zod_1.z.string().min(1, "Name is required"),
        // Accept either role_id or role
        role_id: zod_1.z
            .number()
            .int()
            .positive("Role ID must be a positive integer")
            .or(zod_1.z.string().regex(/^\d+$/).transform(Number))
            .optional(),
        avatar_url: zod_1.z.string().optional(),
        email_verified: zod_1.z.boolean().optional(),
        sendVerificationEmail: zod_1.z.boolean().optional(),
    })
        .refine((data) => data.role_id !== undefined, {
        message: "Either 'role_id' or 'role' must be provided",
        path: ["role_id"],
    }),
});
// Update user validation
exports.updateUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "User ID is required"),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        RoleId: zod_1.z
            .number()
            .int()
            .positive()
            .or(zod_1.z.string().regex(/^\d+$/).transform(Number))
            .optional(),
        avatar_url: zod_1.z.string().optional(),
        email_verified: zod_1.z.boolean().optional(),
        is_active: zod_1.z.boolean().optional(),
    }),
});
// Get user by ID validation
exports.getUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "User ID is required"),
    }),
});
// Delete user validation
exports.deleteUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "User ID is required"),
    }),
});
// List users validation
exports.listUsersSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 1)),
        limit: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 10)),
        search: zod_1.z.string().optional(),
        sort_by: zod_1.z.string().optional(),
        sort_order: zod_1.z.enum(["asc", "desc"]).optional(),
        role_id: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : undefined)),
        is_active: zod_1.z
            .string()
            .optional()
            .transform((val) => val === "true"),
    }),
});
// Import users validation
exports.importUsersSchema = zod_1.z.object({
    body: zod_1.z
        .array(zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
        name: zod_1.z.string().min(1, "Name is required"),
        role_id: zod_1.z
            .number()
            .int()
            .positive("Role ID must be a positive integer"),
        avatar_url: zod_1.z.string().url().optional(),
        email_verified: zod_1.z.boolean().optional(),
        sendVerificationEmail: zod_1.z.boolean().optional(),
    }))
        .min(1, "At least one user is required"),
});
