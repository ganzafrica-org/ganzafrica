/**
 * Application logging configuration
 * Structured logging with different levels based on environment
 */
import { env } from './env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
    message: string;
    [key: string]: any;
}

class Logger {
    private context: string;

    constructor(context: string) {
        this.context = context;
    }

    private log(level: LogLevel, payload: LogPayload): void {
        // Check if we're in browser context
        if (typeof window !== 'undefined') {
            // Simple browser-friendly logging
            switch(level) {
                case 'debug':
                    console.debug(`[${this.context}]`, payload.message, payload);
                    break;
                case 'info':
                    console.info(`[${this.context}]`, payload.message, payload);
                    break;
                case 'warn':
                    console.warn(`[${this.context}]`, payload.message, payload);
                    break;
                case 'error':
                    console.error(`[${this.context}]`, payload.message, payload);
                    break;
            }
            return;
        }

        // Skip debug logs in production for server environment
        if (level === 'debug' && env?.NODE_ENV === 'production') {
            return;
        }

        const timestamp = new Date().toISOString();
        const output = {
            timestamp,
            level,
            context: this.context,
            ...payload,
        };

        // In production, log as JSON for easier parsing
        if (env?.NODE_ENV === 'production') {
            console[level](JSON.stringify(output));
        } else {
            // In development, log in a more readable format
            const { message, ...meta } = payload;
            console[level](`[${timestamp}] ${level.toUpperCase()} [${this.context}]: ${message}`,
                Object.keys(meta).length ? meta : '');
        }
    }

    debug(message: string, meta: Record<string, any> = {}): void {
        this.log('debug', { message, ...meta });
    }

    info(message: string, meta: Record<string, any> = {}): void {
        this.log('info', { message, ...meta });
    }

    warn(message: string, meta: Record<string, any> = {}): void {
        this.log('warn', { message, ...meta });
    }

    error(message: string, meta: Record<string, any> = {}): void {
        this.log('error', { message, ...meta });
    }
}

export function createLogger(context: string): Logger {
    return new Logger(context);
}