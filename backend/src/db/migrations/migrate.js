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
exports.runMigrations = runMigrations;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const migrator_1 = require("drizzle-orm/node-postgres/migrator");
const pg_1 = require("pg");
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
const setup_triggers_1 = require("./setup-triggers");
// Load environment variables
const envPath = path_1.default.resolve(__dirname, "../../../.env");
dotenv.config({ path: envPath });
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
}
async function runMigrations() {
    const pool = new pg_1.Pool({
        connectionString: DATABASE_URL,
    });
    try {
        console.log("Starting database migrations...");
        const db = (0, node_postgres_1.drizzle)(pool);
        // Run the SQL migrations
        await (0, migrator_1.migrate)(db, {
            migrationsFolder: path_1.default.resolve(__dirname, "../../../drizzle"),
        });
        console.log("SQL migrations completed");
        // Setup triggers
        await (0, setup_triggers_1.setupTriggers)();
        console.log("Triggers setup completed");
        console.log("All database migrations completed successfully!");
    }
    catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
    finally {
        await pool.end();
    }
}
// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations().catch(console.error);
}
