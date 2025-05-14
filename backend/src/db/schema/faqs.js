"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqs = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
// FAQs Table
exports.faqs = (0, pg_core_1.pgTable)("faqs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    question: (0, pg_core_1.text)("question").notNull(),
    answer: (0, pg_core_1.text)("answer").notNull(),
    is_active: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    view_count: (0, pg_core_1.integer)("view_count").notNull().default(0),
    ...common_1.timestampFields,
}, (table) => {
    return {
        isActiveIdx: (0, pg_core_1.index)("faqs_is_active_idx").on(table.is_active),
    };
});
exports.default = exports.faqs;
