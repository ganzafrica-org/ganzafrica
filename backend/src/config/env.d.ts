declare const env: {
    DATABASE_URL: string;
    NODE_ENV: "development" | "test" | "production";
    API_PORT: number;
    API_BASE_URL: string;
    PORT: number;
    WEBSITE_URL: string;
    PORTAL_URL: string;
    SESSION_SECRET: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    ACCESS_TOKEN_EXPIRY: string;
    REFRESH_TOKEN_EXPIRY: string;
    EMAIL_FROM: string;
    EMAIL_PASSWORD: string;
    SMTP_HOST: string;
    SMTP_PORT: number;
    CORS_ORIGINS: string[];
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX: number;
};
export default env;
//# sourceMappingURL=env.d.ts.map