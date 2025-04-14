import { z } from "zod";

// Base role validation
const baseRoleEnum = z.enum([
  "public",
  "applicant",
  "fellow",
  "employee",
  "alumni",
]);

// Create user validation
export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    name: z.string().min(1, "Name is required"),
    base_role: baseRoleEnum,
    avatar_url: z.string().url().optional(),
    email_verified: z.boolean().optional(),
    sendVerificationEmail: z.boolean().optional(),
  }),
});

// Update user validation
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    base_role: baseRoleEnum.optional(),
    avatar_url: z.string().url().optional().nullable(),
    email_verified: z.boolean().optional(),
    is_active: z.boolean().optional(),
  }),
});

// Get user by ID validation
export const getUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
});

// Delete user validation
export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
});

// List users validation
export const listUsersSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    sort_by: z.string().optional(),
    sort_order: z.enum(["asc", "desc"]).optional(),
    role: z.string().optional(),
    is_active: z
      .string()
      .optional()
      .transform((val) => val === "true"),
  }),
});

// Import users validation
export const importUsersSchema = z.object({
  body: z
    .array(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        name: z.string().min(1, "Name is required"),
        base_role: baseRoleEnum,
        avatar_url: z.string().url().optional(),
        email_verified: z.boolean().optional(),
        sendVerificationEmail: z.boolean().optional(),
      }),
    )
    .min(1, "At least one user is required"),
});
