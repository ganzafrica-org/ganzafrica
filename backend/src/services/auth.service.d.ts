interface TokenPayload {
    id: string;
    type: string;
    [key: string]: any;
}
interface SessionData {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
}
/**
 * Hash a password using bcrypt
 * @param {string} password
 * @returns {Promise<string>}
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Verify a password against its hash
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Stored hash to verify against
 * @returns {Promise<boolean>} - True if password matches hash
 */
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
/**
 * Create a JWT token
 * @param {TokenPayload} payload - Data to include in the token
 * @param {string} expiresIn - Token expiration time
 * @param {boolean} isRefresh - Whether this is a refresh token
 * @returns {Promise<string>} - Signed JWT token
 */
export declare function createToken(payload: TokenPayload, expiresIn?: string, isRefresh?: boolean): Promise<string>;
/**
 * Create a JWT token with complete user information
 * @param {number} userId - User ID
 * @param {string} tokenType - Token type (access or refresh)
 * @param {string} expiresIn - Token expiration time
 * @param {boolean} isRefresh - Whether this is a refresh token
 * @returns {Promise<string>} - Signed JWT token
 */
export declare function createUserToken(userId: number, tokenType: string, expiresIn?: string, isRefresh?: boolean): Promise<string>;
/**
 * Verify a JWT token
 * @param {string} token - Token to verify
 * @param {boolean} isRefresh - Whether this is a refresh token
 * @returns {Promise<TokenPayload>} - Decoded token payload
 */
export declare function verifyToken(token: string, isRefresh?: boolean): Promise<TokenPayload>;
/**
 * Create a new session for a user
 * @param {number} userId - User ID
 * @param {string} ipAddress - User's IP address
 * @param {string} userAgent - User's browser/device information
 * @returns {Promise<SessionData>} - Session details with tokens
 */
export declare function createSession(userId: number, ipAddress: string, userAgent: string): Promise<SessionData>;
/**
 * Invalidate a user session
 * @param {string} tokenOrSessionId - Token or session ID to invalidate
 * @param {boolean} isToken - Whether the provided value is a token or session ID
 * @returns {Promise<boolean>} - Result of invalidation operation
 */
export declare function invalidateSession(tokenOrSessionId: string, isToken?: boolean): Promise<boolean>;
/**
 * Update session activity timestamp
 * @param {string} sessionId - Session ID to update
 * @returns {Promise<boolean>} - Result of update operation
 */
export declare function updateSessionActivity(sessionId: string): Promise<boolean>;
/**
 * Send password reset email
 * @param {number} userId - User ID
 * @param {string} email - User's email address
 * @param {string} ipAddress - User's IP address
 * @returns {Promise<boolean>} - Result of operation
 */
export declare function sendPasswordReset(userId: number, email: string, ipAddress: string): Promise<boolean>;
/**
 * Verify email verification token
 * @param {string} token - Token to verify
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} - Result of verification
 */
export declare function verifyEmailToken(token: string, userId: number): Promise<boolean>;
/**
 * Reset user password
 * @param {string} token - Password reset token
 * @param {number} userId - User ID
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - Result of operation
 */
export declare function resetPassword(token: string, userId: number, newPassword: string): Promise<boolean>;
export {};
//# sourceMappingURL=auth.service.d.ts.map