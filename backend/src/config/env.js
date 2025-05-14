"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables from .env file
function loadEnv() {
    const backendEnvPath = path_1.default.resolve(__dirname, "../../.env");
    const rootEnvPath = path_1.default.resolve(__dirname, "../../../.env");
    if (fs_1.default.existsSync(backendEnvPath)) {
        dotenv.config({ path: backendEnvPath });
    }
    else if (fs_1.default.existsSync(rootEnvPath)) {
        dotenv.config({ path: rootEnvPath });
    }
    else {
        dotenv.config();
    }
}
loadEnv();
// Define environment variables schema
const envSchema = zod_1.z.object({
    // Database
    DATABASE_URL: zod_1.z.string().url(),
    // Application
    NODE_ENV: zod_1.z
        .enum(["development", "test", "production"])
        .default("development"),
    API_PORT: zod_1.z.coerce.number().default(3002),
    API_BASE_URL: zod_1.z.string().url(),
    PORT: zod_1.z.coerce.number().default(3002),
    // URLs
    WEBSITE_URL: zod_1.z.string().url(),
    PORTAL_URL: zod_1.z.string().url(),
    // Authentication
    SESSION_SECRET: zod_1.z.string().min(32),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    ACCESS_TOKEN_EXPIRY: zod_1.z.string().default("15m"),
    REFRESH_TOKEN_EXPIRY: zod_1.z.string().default("7d"),
    // Email
    EMAIL_FROM: zod_1.z.string().email(),
    EMAIL_PASSWORD: zod_1.z.string(),
    SMTP_HOST: zod_1.z.string(),
    SMTP_PORT: zod_1.z.coerce.number(),
    // Security
    CORS_ORIGINS: zod_1.z.string().transform((val) => val.split(",")),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().default(900000), // 15 minutes
    RATE_LIMIT_MAX: zod_1.z.coerce.number().default(100), // 100 requests per window
});
// Parse and validate environment variables
const env = envSchema.parse(process.env);
exports.default = env;
