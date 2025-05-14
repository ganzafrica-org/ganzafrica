export declare const AUTH_COOKIE_NAME = "ganzafrica_auth";
export declare const REFRESH_COOKIE_NAME = "ganzafrica_refresh";
export declare const CSRF_COOKIE_NAME = "ganzafrica_csrf";
export declare const COOKIE_OPTIONS: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict";
    path: string;
};
export declare const ROLES: {
    ADMIN: string;
    USER: string;
    FELLOW: string;
    MENTOR: string;
    STAFF: string;
};
export declare const BASE_ROLES: {
    APPLICANT: string;
    FELLOW: string;
    EMPLOYEE: string;
    ALUMNI: string;
};
export declare const ERROR_MESSAGES: {
    UNAUTHORIZED: string;
    NOT_FOUND: string;
    VALIDATION_ERROR: string;
    INTERNAL_SERVER_ERROR: string;
    INVALID_CREDENTIALS: string;
    EMAIL_ALREADY_EXISTS: string;
    EMAIL_NOT_VERIFIED: string;
    ACCOUNT_LOCKED: string;
    INVALID_TOKEN: string;
    PASSWORD_RESET_EXPIRED: string;
    FORBIDDEN: string;
    USER_NOT_FOUND: string;
    INVALID_PASSWORD: string;
    PASSWORD_MISMATCH: string;
    INVALID_EMAIL: string;
    INVALID_PHONE: string;
    INVALID_VERIFICATION_CODE: string;
    INVALID_TWO_FACTOR_CODE: string;
    USER_ALREADY_EXISTS: string;
    USER_NOT_ACTIVE: string;
    USER_NOT_VERIFIED: string;
    USER_ALREADY_VERIFIED: string;
    ACCOUNT_INACTIVE: string;
    ACCOUNT_SUSPENDED: string;
    BAD_REQUEST: string;
    EMAIL_NOT_FOUND: string;
};
export declare const SUCCESS_MESSAGES: {
    USER_CREATED: string;
    USER_UPDATED: string;
    USER_DELETED: string;
    LOGIN_SUCCESS: string;
    LOGOUT_SUCCESS: string;
    EMAIL_VERIFICATION_SENT: string;
    EMAIL_VERIFIED: string;
    PASSWORD_RESET_SENT: string;
    PASSWORD_RESET_SUCCESS: string;
};
export declare const EMAIL_TEMPLATES: {
    VERIFICATION: string;
    PASSWORD_RESET: string;
    WELCOME: string;
};
export declare const TOKEN_TYPES: {
    ACCESS: string;
    REFRESH: string;
    VERIFICATION: string;
    PASSWORD_RESET: string;
    TWO_FACTOR: string;
};
export declare const TOKEN_EXPIRY: {
    ACCESS: string;
    REFRESH: string;
    VERIFICATION: string;
    PASSWORD_RESET: string;
    TWO_FACTOR: string;
};
export declare const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export declare const FAILED_LOGIN_TIMEOUT_MINUTES = 15;
//# sourceMappingURL=constants.d.ts.map