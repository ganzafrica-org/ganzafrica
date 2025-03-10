import { z } from 'zod';

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Environment variable schema validation
 * Ensures all required environment variables are present and of the correct type
 */
const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().min(1),

    // General
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Auth
    SESSION_SECRET: z.string().min(32).default('super_secret_development_key_at_least_32_chars'),
    PASETO_SECRET: z.string().min(32).default('super_secret_development_key_at_least_32_chars'),

    // Server
    PORT: z.coerce.number().default(3000),

    // Email (Nodemailer)
    EMAIL_FROM: z.string().email().default('noreply@ganzafrica.org'),
    EMAIL_PASSWORD: z.string().min(1).optional(),
    SMTP_HOST: z.string().default('smtp.gmail.com'),
    SMTP_PORT: z.coerce.number().default(587),

    // Legacy Email (Resend)
    RESEND_API_KEY: z.string().optional(),

    // Website
    WEBSITE_URL: z.string().min(1).default('http://localhost:3001'),
    PORTAL_URL: z.string().min(1).default('http://localhost:3001'),

    // Optional
    CLOUDFLARE_R2_ACCOUNT_ID: z.string().optional(),
    CLOUDFLARE_R2_ACCESS_KEY: z.string().optional(),
    CLOUDFLARE_R2_SECRET_KEY: z.string().optional(),
    CLOUDFLARE_R2_BUCKET_NAME: z.string().optional(),
});

// Parse environment variables or throw error with details
function getEnv() {
    // First we try to parse with default values
    try {
        return envSchema.parse(process.env);
    } catch (error: any) {
        // If parsing fails, log helpful error message
        console.error('❌ Invalid environment variables:', error.format());

        if (isDevelopment) {
            console.warn('⚠️ Running in development mode with default values for some missing variables');
            // Create a partial environment with defaults for development
            return envSchema.parse({
                ...process.env,
                DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:123456qwerty@localhost:5432/ganzafrica',
            });
        }

        throw new Error('Invalid environment variables');
    }
}


export const env = getEnv();