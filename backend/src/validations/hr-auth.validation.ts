import { z } from "zod";

const email = z.string().email("Invalid email address");
const password = z.string().min(8, "Password must be at least 8 characters");

export const generateOtpSchema = z.object({
  body: z.object({
    email,
  }),
});

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email,
    password,
    code: z.string().regex(/^\d{6}$/, "OTP code must be 6 digits"),
    role: z.enum(["EMPLOYEE", "HR"]),
    department: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password,
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

