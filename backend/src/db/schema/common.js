"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timestampFields = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.timestampFields = {
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
};
