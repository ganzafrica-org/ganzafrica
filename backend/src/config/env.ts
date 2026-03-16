import { z } from "zod";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables from .env file
function loadEnv() {
  const backendEnvPath = path.resolve(__dirname, "../../.env");
  const rootEnvPath = path.resolve(__dirname, "../../../.env");

  if (fs.existsSync(backendEnvPath)) {
    dotenv.config({ path: backendEnvPath });
  } else if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
  } else {
    dotenv.config();
  }
}

loadEnv();

// Define environment variables schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Application
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_PORT: z.coerce.number().default(3002),
  API_BASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3002),

  // URLs
  WEBSITE_URL: z.string().url(),
  PORTAL_URL: z.string().url(),
  TASK_URL: z.string().url().nullish(),

  // Authentication
  SESSION_SECRET: z.string().min(32),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRY: z.string().default("24h"),
  REFRESH_TOKEN_EXPIRY: z.string().default("30d"),

  // Payroll - comma-separated emails that receive net salary in USD (Format 1 USD employees)
  USD_SALARY_EMAILS: z.string().optional().default(""),

  // Email (optional - only required if email functionality is used)
  RESEND_API_KEY: z.string().nullish(),
  EMAIL_FROM: z.string().nullish(),
  EMAIL_PASSWORD: z.string().nullish(),
  SMTP_HOST: z.string().nullish(),
  SMTP_PORT: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().nullish()),
  // Support EMAIL_PORT as alias for SMTP_PORT (can be used instead of SMTP_PORT)
  EMAIL_PORT: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().nullish()),

  // Security
  CORS_ORIGINS: z.string().transform((val) => val.split(",")),

  // Digital Ocean Spaces
  DO_SPACES_ENDPOINT: z.string().url(),
  DO_SPACES_REGION: z.string(),
  DO_SPACES_ACCESS_KEY: z.string(),
  DO_SPACES_SECRET_KEY: z.string(),
  DO_SPACES_BUCKET: z.string(),
  DO_SPACES_CDN_URL: z.string().url().optional(),

  // Google Calendar (optional - only required if Google Calendar integration is used)
  GOOGLE_CALENDAR_CLIENT_ID: z.string().nullish(),
  GOOGLE_CALENDAR_CLIENT_SECRET: z.string().nullish(),
  GOOGLE_CALENDAR_REDIRECT_URI: z.string().url().nullish(),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

export default env;
