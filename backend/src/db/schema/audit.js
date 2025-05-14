"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audit_logs = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
const users_1 = require("./users");
exports.audit_logs = (0, pg_core_1.pgTable)("audit_logs", {
    id: (0, pg_core_1.integer)("id").primaryKey(),
    user_id: (0, pg_core_1.integer)("user_id").references(() => users_1.users.id),
    action: (0, pg_core_1.text)("action").notNull(),
    resource_type: (0, pg_core_1.text)("resource_type").notNull(),
    resource_id: (0, pg_core_1.integer)("resource_id"),
    changes: (0, pg_core_1.jsonb)("changes"),
    ip_address: (0, pg_core_1.text)("ip_address"),
    ...common_1.timestampFields,
});
