/**
 * Application constants
 * Central place for all hardcoded values
 */

export const AUTH = {
    COOKIE_NAME: 'ganzafrica_auth',
    TOKEN_EXPIRY: 60 * 60 * 24 * 7, // 7 days in seconds
    REFRESH_TOKEN_EXPIRY: 60 * 60 * 24 * 30, // 30 days in seconds
    PASSWORD_RESET_EXPIRY: 60 * 60 * 24, // 24 hours in seconds
    VERIFICATION_TOKEN_EXPIRY: 60 * 60 * 24, // 24 hours in seconds
    MAX_FAILED_ATTEMPTS: 5,
    LOCKOUT_DURATION: 60 * 15, // 15 minutes in seconds
    MINIMUM_PASSWORD_LENGTH: 8,
    OTP_EXPIRY: 60 * 10, // 10 minutes in seconds
};

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
};

export const FILE_UPLOAD = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_MIME_TYPES: [
        'images/jpeg',
        'images/png',
        'images/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
};

export const STORAGE = {
    PROFILE_IMAGE_PATH: 'profile-images',
    DOCUMENT_PATH: 'documents',
    RESOURCE_PATH: 'resources',
};

// Base roles and their hierarchy
export const ROLES = {
    PUBLIC: 'public',
    APPLICANT: 'applicant',
    FELLOW: 'fellow',
    EMPLOYEE: 'employee',
    ALUMNI: 'alumni',
    // Admin roles
    CONTENT_ADMIN: 'content_admin',
    HR_ADMIN: 'hr_admin',
    SUPER_ADMIN: 'super_admin',
};