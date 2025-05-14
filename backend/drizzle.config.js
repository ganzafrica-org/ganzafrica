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
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function loadEnv() {
    // Try to load from backend directory
    const backendEnvPath = path_1.default.resolve(__dirname, ".env");
    // Then try to load from root directory
    const rootEnvPath = path_1.default.resolve(__dirname, "../.env");
    if (fs_1.default.existsSync(backendEnvPath)) {
        console.log(`Loading environment from ${backendEnvPath}`);
        dotenv.config({ path: backendEnvPath });
    }
    else if (fs_1.default.existsSync(rootEnvPath)) {
        console.log(`Loading environment from ${rootEnvPath}`);
        dotenv.config({ path: rootEnvPath });
    }
    else {
        console.warn("No .env file found, using environment variables");
        dotenv.config();
    }
}
// Load environment variables
loadEnv();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
}
/**
 * Drizzle configuration
 */
exports.default = {
    schema: "./src/db/schema/**/*.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: connectionString,
    },
    verbose: true,
    strict: true,
};
