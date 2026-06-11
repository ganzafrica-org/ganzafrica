/**
 * Server-side only backend URL.
 */
export const BACKEND_URL = process.env.BACKEND_URL;

/**
 * Client-side backend URL.
 * Exposed to the browser via NEXT_PUBLIC_ prefix.
 */
export const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (typeof window !== 'undefined' && !NEXT_PUBLIC_BACKEND_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is missing. Please check your .env file.");
}

export function getBackendUrl(): string {
    const url = NEXT_PUBLIC_BACKEND_URL || BACKEND_URL;
    if (!url) {
        throw new Error("Backend URL is not configured. Add NEXT_PUBLIC_BACKEND_URL or BACKEND_URL to your .env file.");
    }
    return url;
}
