import { V4 } from 'paseto';
import * as crypto from 'crypto';
import { env } from '../../config/env';
import { AUTH } from '../../config/constants';
import { createLogger } from '../../config/logger';

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
            // This is just a placeholder
            const publicKey = crypto.createPublicKey(env.PASETO_PUBLIC_KEY || '');
            const privateKey = crypto.createPrivateKey(env.PASETO_PRIVATE_KEY || '');
            return { publicKey, privateKey };
        }

        // For development, generate a new keypair (or load existing if available)
        return await V4.generateKey('public');
    } catch (error) {
        logger.error('Failed to generate or load PASETO key pair', { error });
        throw new Error('Failed to initialize authentication system');
    }
};

// Initialize the key pair
let keyPair;
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
    payload: Record<string, any>,
    options: {
        expiresIn?: string | number;
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

        // Calculate expiration based on expiresIn
        let exp;
        if (options.expiresIn) {
            if (typeof options.expiresIn === 'number') {
                exp = Math.floor(Date.now() / 1000) + options.expiresIn;
            } else {
                // Parse string like '1h', '2d', etc.
                const match = options.expiresIn.match(/^(\d+)\s*([smhdw])$/i);
                if (match) {
                    const val = parseInt(match[1], 10);
                    const unit = match[2].toLowerCase();
                    const multiplier = {
                        s: 1,
                        m: 60,
                        h: 60 * 60,
                        d: 60 * 60 * 24,
                        w: 60 * 60 * 24 * 7
                    }[unit];
                    exp = Math.floor(Date.now() / 1000) + (val * multiplier);
                }
            }
        }

        // Prepare the final payload
        const tokenPayload = {
            ...payload,
            iat: Math.floor(Date.now() / 1000),
            ...(exp && { exp }),
            ...(options.audience && { aud: options.audience }),
            ...(options.issuer && { iss: options.issuer }),
            ...(options.subject && { sub: options.subject }),
        };

        // Sign the token
        return await V4.sign(tokenPayload, keyPair.privateKey, {
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
export async function verifyToken(
    token: string,
    options: {
        audience?: string;
        issuer?: string;
        subject?: string;
        clockTolerance?: string;
    } = {}
): Promise<Record<string, any>> {
    try {
        if (!keyPair) {
            keyPair = await getKeyPair();
        }

        // Verify the token
        return await V4.verify(token, keyPair.publicKey, {
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
export function decodeToken(token: string): Record<string, any> {
    try {
        const { payload } = decode(token);
        return payload;
    } catch (error) {
        logger.error('Token decoding failed', { error });
        throw new Error('Invalid token format');
    }
}

// Re-export PASETO functionality for direct use
export { V4, decode } from 'paseto';