import { V4, decode } from 'paseto';
import * as crypto from 'crypto';
import { env } from '../../config/env';
import { AUTH } from '../../config/constants';
import { createLogger } from '../../config/logger';
import { AuthTokenPayload } from './types';

const logger = createLogger('paseto');

/**
 * Generate or load the key for signing/verifying PASETO tokens
 * For production, keys should be stored securely, not generated on startup
 */
const getKeyPair = async () => {
    try {
        // In production, load existing keys from secure storage
        if (env.NODE_ENV === 'production') {
            // Implementation would depend on your key management strategy
            if (!env.PASETO_SECRET) {
                throw new Error('PASETO_SECRET environment variable is required in production');
            }

            // Generate key using the V4 mechanism
            return await V4.generateKey('public');
        }

        // For development, generate a new keypair
        return await V4.generateKey('public');
    } catch (error) {
        logger.error('Failed to generate or load PASETO key pair', { error });
        throw new Error('Failed to initialize authentication system');
    }
};

// Initialize the key pair
let keyPair: crypto.KeyObject | { publicKey: crypto.KeyObject; privateKey: crypto.KeyObject };
(async () => {
    keyPair = await getKeyPair();
})();

/**
 * Create a new PASETO token
 * @param payload Data to include in the token
 * @param options Options for token creation
 * @returns The generated token
 */
export async function createToken(
    payload: Partial<AuthTokenPayload>,
    options: {
        expiresIn?: number;
        audience?: string;
        issuer?: string;
        subject?: string;
        footer?: Record<string, any> | string;
    } = {}
): Promise<string> {
    try {
        if (!keyPair) {
            keyPair = await getKeyPair();
        }

        // Ensure keyPair has the right shape
        const privateKey = 'privateKey' in keyPair ? keyPair.privateKey : keyPair;

        // Calculate expiration based on expiresIn
        const exp = Math.floor(Date.now() / 1000) + (options.expiresIn || AUTH.TOKEN_EXPIRY);
        const iat = Math.floor(Date.now() / 1000);
        const jti = crypto.randomUUID();

        // Prepare the final payload
        const tokenPayload = {
            ...payload,
            iat,
            exp,
            jti,
            ...(options.audience && { aud: options.audience }),
            ...(options.issuer && { iss: options.issuer }),
            ...(options.subject && { sub: options.subject }),
        };

        // Sign the token
        return await V4.sign(tokenPayload, privateKey, {
            footer: options.footer
        });
    } catch (error) {
        logger.error('Failed to create token', { error });
        throw new Error('Authentication error');
    }
}

/**
 * Verify a PASETO token
 * @param token The token to verify
 * @param options Options for token verification
 * @returns The decoded payload if valid
 */
export async function verifyToken<T = any>(
    token: string,
    options: {
        audience?: string;
        issuer?: string;
        subject?: string;
        clockTolerance?: string;
    } = {}
): Promise<T> {
    try {
        if (!keyPair) {
            keyPair = await getKeyPair();
        }

        // Ensure keyPair has the right shape
        const publicKey = 'publicKey' in keyPair ? keyPair.publicKey :
            crypto.createPublicKey(keyPair as crypto.KeyObject);

        // Verify the token
        return await V4.verify(token, publicKey, {
            audience: options.audience,
            issuer: options.issuer,
            subject: options.subject,
            clockTolerance: options.clockTolerance || '5s',
        });
    } catch (error) {
        logger.error('Token verification failed', { error });
        throw new Error('Invalid authentication token');
    }
}

/**
 * Extract payload from a token without verification
 * Only use this for non-sensitive operations where verification isn't needed
 */
export function decodeToken<T = any>(token: string): T {
    try {
        const { payload } = decode(token);
        return payload as T;
    } catch (error) {
        logger.error('Token decoding failed', { error });
        throw new Error('Invalid token format');
    }
}