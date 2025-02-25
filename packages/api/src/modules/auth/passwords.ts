import * as argon2 from 'argon2';
import { createLogger } from '../../config';

const logger = createLogger('passwords');

// Configuration for Argon2id
const HASH_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 65536, // 64MB
    timeCost: 3,       // Number of iterations
    parallelism: 4,    // Degree of parallelism
    hashLength: 32,    // Output length in bytes
};

/**
 * Hash a password using Argon2id
 * @param password The plain text password
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    try {
        return await argon2.hash(password, HASH_OPTIONS);
    } catch (error) {
        logger.error('Password hashing failed', { error });
        throw new Error('Failed to process password');
    }
}

/**
 * Verify a password against a hash
 * @param password The plain text password
 * @param hash The hashed password
 * @returns True if the password matches the hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
        return await argon2.verify(hash, password);
    } catch (error) {
        logger.error('Password verification failed', { error });
        return false;
    }
}