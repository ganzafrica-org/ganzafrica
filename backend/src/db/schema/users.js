"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.user_profiles = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
const enums_1 = require("./enums");
const roles_1 = require("./roles");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    name: (0, pg_core_1.text)("name").notNull(),
    role_id: (0, pg_core_1.integer)("role_id")
        .notNull()
        .references(() => roles_1.roles.id),
    password_hash: (0, pg_core_1.text)("password_hash").notNull(),
    avatar_url: (0, pg_core_1.text)("avatar_url"),
    two_factor_enabled: (0, pg_core_1.boolean)("two_factor_enabled").notNull().default(false),
    two_factor_method: (0, enums_1.twoFactorMethodEnum)("two_factor_method"),
    backup_codes: (0, pg_core_1.jsonb)("backup_codes"),
    email_verified: (0, pg_core_1.boolean)("email_verified").notNull().default(false),
    phone_number: (0, pg_core_1.text)("phone_number"),
    phone_verified: (0, pg_core_1.boolean)("phone_verified").notNull().default(false),
    last_password_change: (0, pg_core_1.timestamp)("last_password_change"),
    last_login: (0, pg_core_1.timestamp)("last_login"),
    is_active: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    account_locked: (0, pg_core_1.boolean)("account_locked").notNull().default(false),
    failed_login_attempts: (0, pg_core_1.integer)("failed_login_attempts").notNull().default(0),
    last_failed_attempt: (0, pg_core_1.timestamp)("last_failed_attempt"),
    ...common_1.timestampFields,
});
exports.user_profiles = (0, pg_core_1.pgTable)("user_profiles", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    user_id: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id),
    bio: (0, pg_core_1.text)("bio"),
    phone: (0, pg_core_1.text)("phone"),
    address: (0, pg_core_1.text)("address"),
    social_links: (0, pg_core_1.jsonb)("social_links"),
    preferences: (0, pg_core_1.jsonb)("preferences"),
    ...common_1.timestampFields,
});
