import { z } from "zod";

// Configure dotenv in Node.js environment
let dotenv;
if (typeof window === "undefined") {
  // We're in a Node.js environment
  dotenv = require("dotenv");
  dotenv.config();
}

const isDevelopment = process.env?.NODE_ENV !== "production";

/**
 * Environment variable schema validation
 * Ensures all required environment variables are present and of the correct type
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // General
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Auth
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters")
    .default("super_secret_development_key_at_least_32_chars"),
  PASETO_SECRET: z
    .string()
    .min(32, "PASETO_SECRET must be at least 32 characters")
    .default("super_secret_development_key_at_least_32_chars"),

  // Server
  PORT: z.coerce.number().default(3000),

  // Email (Nodemailer)
  EMAIL_FROM: z.string().email().default("noreply@ganzafrica.org"),
  EMAIL_PASSWORD: z.string().min(1).optional(),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),

  // Legacy Email (Resend)
  RESEND_API_KEY: z.string().optional(),

  // Website
  WEBSITE_URL: z.string().min(1).default("http://localhost:3001"),
  PORTAL_URL: z.string().min(1).default("http://localhost:3001"),

  // Optional
  CLOUDFLARE_R2_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_R2_ACCESS_KEY: z.string().optional(),
  CLOUDFLARE_R2_SECRET_KEY: z.string().optional(),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().optional(),
});

// Parse environment variables or throw error with details
function getEnv() {
  // Check if we're in a browser context
  if (typeof window !== "undefined") {
    // We're in a browser environment, return an empty object
    // This prevents crashes while not exposing any values
    return {} as ReturnType<typeof envSchema.parse>;
  }

  // Server-side environment parsing
  try {
    return envSchema.parse(process.env);
  } catch (error: any) {
    // If parsing fails, log helpful error message
    if (error.format) {
      console.error("❌ Invalid environment variables:", error.format());
    } else {
      console.error("❌ Invalid environment variables:", error);
    }

    if (isDevelopment) {
      console.warn(
        "⚠️ Running in development mode with default values for some missing variables",
      );
      // Create a partial environment with defaults for development
      return envSchema.parse({
        ...process.env,
        DATABASE_URL:
          process.env.DATABASE_URL ||
          "postgres://postgres:postgres@localhost:5432/ganzafrica",
      });
    }

    throw new Error("Invalid environment variables");
  }
}

export const env = getEnv();
