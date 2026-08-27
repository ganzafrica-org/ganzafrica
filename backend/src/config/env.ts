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
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
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

  // Email — Azure Communication Services. Optional so local dev can run without it (unconfigured
  // sends are logged, not delivered). RESEND_* is kept as a fallback provider for local/dev use.
  ACS_CONNECTION_STRING: z.string().nullish(),
  ACS_FROM_EMAIL: z.string().default("GanzAfrica <donotreply@ganzafrica.org>"),
  RESEND_API_KEY: z.string().nullish(),
  RESEND_FROM_EMAIL: z.string().default("GanzAfrica <no-reply@ganzafrica.org>"),
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
  COOKIE_DOMAIN: z.string().nullish(), // e.g. ".ganzafrica.org" in prod; unset in dev (host-only)

  // Object storage — Azure Blob. Files default to the private container and are read back via
  // short-lived SAS URLs; only genuinely public assets (website images) go to the public container.
  AZURE_STORAGE_CONNECTION_STRING: z.string(),
  AZURE_STORAGE_ACCOUNT: z.string(),
  AZURE_STORAGE_CONTAINER_PRIVATE: z.string().default("uploads"),
  AZURE_STORAGE_CONTAINER_PUBLIC: z.string().default("public"),

  // Google Calendar (optional - only required if Google Calendar integration is used)
  GOOGLE_CALENDAR_CLIENT_ID: z.string().nullish(),
  GOOGLE_CALENDAR_CLIENT_SECRET: z.string().nullish(),
  GOOGLE_CALENDAR_REDIRECT_URI: z.string().url().nullish(),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

export default env;
