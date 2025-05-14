"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.role_permissions = exports.permissions = exports.user_roles = exports.roles = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
const users_1 = require("./users");
// Roles Table
exports.roles = (0, pg_core_1.pgTable)("roles", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    ...common_1.timestampFields,
});
// User Roles Table for mapping users to roles
exports.user_roles = (0, pg_core_1.pgTable)("user_roles", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    user_id: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => users_1.users.id, { onDelete: "cascade" }),
    role_id: (0, pg_core_1.integer)("role_id")
        .notNull()
        .references(() => exports.roles.id, { onDelete: "cascade" }),
    ...common_1.timestampFields,
}, (table) => {
    return {
        userRoleIdx: (0, pg_core_1.uniqueIndex)("user_role_idx").on(table.user_id, table.role_id),
    };
});
exports.permissions = (0, pg_core_1.pgTable)("permissions", {
    id: (0, pg_core_1.integer)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    resource: (0, pg_core_1.text)("resource").notNull(),
    action: (0, pg_core_1.text)("action").notNull(),
    ...common_1.timestampFields,
});
exports.role_permissions = (0, pg_core_1.pgTable)("role_permissions", {
    id: (0, pg_core_1.integer)("id").primaryKey(),
    role_id: (0, pg_core_1.integer)("role_id")
        .notNull()
        .references(() => exports.roles.id),
    permission_id: (0, pg_core_1.integer)("permission_id")
        .notNull()
        .references(() => exports.permissions.id),
});
