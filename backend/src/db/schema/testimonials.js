"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testimonials = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
// Testimonials Table
exports.testimonials = (0, pg_core_1.pgTable)("testimonials", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    author_name: (0, pg_core_1.varchar)("author_name", { length: 200 }).notNull(),
    position: (0, pg_core_1.varchar)("position", { length: 200 }),
    image: (0, pg_core_1.text)("image"),
    description: (0, pg_core_1.text)("description").notNull(),
    company: (0, pg_core_1.varchar)("company", { length: 200 }),
    occupation: (0, pg_core_1.varchar)("occupation", { length: 200 }),
    date: (0, pg_core_1.timestamp)("date", { withTimezone: true }).defaultNow(),
    rating: (0, pg_core_1.integer)("rating"),
    ...common_1.timestampFields,
}, (table) => {
    return {
        authorNameIdx: (0, pg_core_1.index)("testimonials_author_name_idx").on(table.author_name),
        companyIdx: (0, pg_core_1.index)("testimonials_company_idx").on(table.company),
        ratingIdx: (0, pg_core_1.index)("testimonials_rating_idx").on(table.rating),
    };
});
