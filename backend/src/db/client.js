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
exports.db = void 0;
exports.withDbTransaction = withDbTransaction;
exports.setDbContext = setDbContext;
exports.checkDatabaseConnection = checkDatabaseConnection;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const config_1 = require("../config");
const logger_1 = __importDefault(require("../config/logger"));
const schema = __importStar(require("./schema"));
const logger = new logger_1.default("DatabaseClient");
// Create a Postgres connection pool
const connectionPool = new pg_1.Pool({
    connectionString: config_1.env.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
});
// Add error handling
connectionPool.on("error", (err) => {
    logger.error("Unexpected database error:", err);
    // In a production system, this would trigger monitoring alerts
});
// Initialize Drizzle with our schema
exports.db = (0, node_postgres_1.drizzle)(connectionPool, { schema });
// Extend the pool with middleware functionality
async function withDbTransaction(callback) {
    const client = await connectionPool.connect();
    try {
        await client.query("BEGIN");
        const txDb = (0, node_postgres_1.drizzle)(client, { schema });
        const result = await callback(txDb);
        await client.query("COMMIT");
        return result;
    }
    catch (e) {
        await client.query("ROLLBACK");
        throw e;
    }
    finally {
        client.release();
    }
}
// Setup context for audit logging
async function setDbContext(userId, ipAddress) {
    const client = await connectionPool.connect();
    try {
        if (userId) {
            // Convert string IDs to numbers if needed
            const parsedId = typeof userId === "string" ? parseInt(userId) : userId;
            await client.query("SET LOCAL app.current_user_id = $1", [parsedId]);
        }
        if (ipAddress) {
            await client.query("SET LOCAL app.current_ip_address = $1", [ipAddress]);
        }
    }
    finally {
        client.release();
    }
}
// Close the database connection when the application shuts down
process.on("SIGINT", () => {
    logger.info("Closing database connections...");
    connectionPool.end().then(() => {
        logger.info("Database connections closed");
        process.exit(0);
    });
});
// Function to check database connectivity
async function checkDatabaseConnection() {
    try {
        const client = await connectionPool.connect();
        try {
            await client.query("SELECT 1");
            logger.info("Database connection successful");
            return true;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        logger.error("Database connection failed", error);
        return false;
    }
}
