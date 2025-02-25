import { z } from 'zod';

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

    // Email
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().min(1).default('noreply@ganzafrica.org'),

    // Website
    WEBSITE_URL: z.string().min(1).default('http://ganzafrica.org'),

    // Optional
    CLOUDFLARE_R2_ACCOUNT_ID: z.string().optional(),
    CLOUDFLARE_R2_ACCESS_KEY: z.string().optional(),
    CLOUDFLARE_R2_SECRET_KEY: z.string().optional(),
    CLOUDFLARE_R2_BUCKET_NAME: z.string().optional(),
});

// Parse environment variables or throw error with details
function getEnv() {
    // First try to parse with default values
    try {
        return envSchema.parse(process.env);
    } catch (error: any) {
        // If parsing fails, log helpful error message
        console.error('❌ Invalid environment variables:', error.format());
        throw new Error('Invalid environment variables');
    }
}

// Export environment variables
export const env = getEnv();