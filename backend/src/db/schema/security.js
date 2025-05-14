"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.two_factor_credentials = exports.two_factor_temp_tokens = exports.sessions = exports.verification_tokens = exports.password_reset_tokens = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
const users_1 = require("./users");
const enums_1 = require("./enums");
exports.password_reset_tokens = (0, pg_core_1.pgTable)("password_reset_tokens", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    user_id: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => users_1.users.id),
    token_hash: (0, pg_core_1.text)("token_hash").notNull(),
    expires_at: (0, pg_core_1.timestamp)("expires_at").notNull(),
    used: (0, pg_core_1.boolean)("used").notNull().default(false),
    ip_address: (0, pg_core_1.text)("ip_address").notNull(),
    ...common_1.timestampFields,
});
exports.verification_tokens = (0, pg_core_1.pgTable)("verification_tokens", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    user_id: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => users_1.users.id),
    type: (0, enums_1.verificationTypeEnum)("type").notNull(),
    token_hash: (0, pg_core_1.text)("token_hash").notNull(),
    expires_at: (0, pg_core_1.timestamp)("expires_at").notNull(),
    used: (0, pg_core_1.boolean)("used").notNull().default(false),
    ...common_1.timestampFields,
});
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    id: (0, pg_core_1.integer)("id").primaryKey(),
    user_id: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => users_1.users.id),
    token_hash: (0, pg_core_1.text)("token_hash").notNull(),
    refresh_token_hash: (0, pg_core_1.text)("refresh_token_hash"),
    expires_at: (0, pg_core_1.timestamp)("expires_at").notNull(),
    last_activity: (0, pg_core_1.timestamp)("last_activity").notNull(),
    ip_address: (0, pg_core_1.text)("ip_address").notNull(),
    user_agent: (0, pg_core_1.text)("user_agent").notNull(),
    device_info: (0, pg_core_1.jsonb)("device_info"),
    is_valid: (0, pg_core_1.boolean)("is_valid").notNull().default(true),
    ...common_1.timestampFields,
});
exports.two_factor_temp_tokens = (0, pg_core_1.pgTable)("two_factor_temp_tokens", {
    id: (0, pg_core_1.integer)("id").primaryKey(),
    user_id: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => users_1.users.id),
    token_hash: (0, pg_core_1.text)("token_hash").notNull(),
    expires_at: (0, pg_core_1.timestamp)("expires_at").notNull(),
    used: (0, pg_core_1.boolean)("used").notNull().default(false),
    ...common_1.timestampFields,
});
exports.two_factor_credentials = (0, pg_core_1.pgTable)("two_factor_credentials", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    user_id: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => users_1.users.id),
    method: (0, pg_core_1.text)("method").notNull(),
    secret: (0, pg_core_1.text)("secret"),
    verified: (0, pg_core_1.boolean)("verified").notNull().default(false),
    ...common_1.timestampFields,
});
