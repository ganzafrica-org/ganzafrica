"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTriggers = setupTriggers;
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function setupTriggers() {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
        console.error("DATABASE_URL environment variable is required");
        process.exit(1);
    }
    const pool = new pg_1.Pool({
        connectionString: DATABASE_URL,
    });
    try {
        console.log("Setting up database triggers...");
        const sqlPath = path_1.default.resolve(__dirname, "../triggers.sql");
        const sql = fs_1.default.readFileSync(sqlPath, "utf8");
        await pool.query(sql);
        console.log("Triggers setup complete!");
    }
    catch (error) {
        console.error("Error setting up triggers:", error);
        throw error;
    }
    finally {
        await pool.end();
    }
}
