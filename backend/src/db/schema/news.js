"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.news = exports.news_to_tags = exports.news_tags = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
const enums_1 = require("./enums");
// News Tags Table
exports.news_tags = (0, pg_core_1.pgTable)("news_tags", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 50 }).notNull().unique(),
    ...common_1.timestampFields,
});
// News Tags Relation Table (many-to-many)
exports.news_to_tags = (0, pg_core_1.pgTable)("news_to_tags", {
    news_id: (0, pg_core_1.integer)("news_id")
        .notNull()
        .references(() => exports.news.id, { onDelete: "cascade" }),
    tag_id: (0, pg_core_1.integer)("tag_id")
        .notNull()
        .references(() => exports.news_tags.id, { onDelete: "cascade" }),
}, (table) => {
    return {
        pk: (0, pg_core_1.primaryKey)({ columns: [table.news_id, table.tag_id] }),
        newsIdx: (0, pg_core_1.index)("news_to_tags_news_id_idx").on(table.news_id),
        tagIdx: (0, pg_core_1.index)("news_to_tags_tag_id_idx").on(table.tag_id),
    };
});
// News Table
exports.news = (0, pg_core_1.pgTable)("news", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    status: (0, enums_1.newsStatusEnum)("status").notNull().default("not_published"),
    publish_date: (0, pg_core_1.timestamp)("publish_date", { withTimezone: true }),
    category: (0, enums_1.newsCategoryEnum)("category").notNull().default("news"),
    key_lessons: (0, pg_core_1.text)("key_lessons"),
    media: (0, pg_core_1.jsonb)("media").$type(),
    ...common_1.timestampFields,
}, (table) => {
    return {
        statusIdx: (0, pg_core_1.index)("news_status_idx").on(table.status),
        categoryIdx: (0, pg_core_1.index)("news_category_idx").on(table.category),
        publishDateIdx: (0, pg_core_1.index)("news_publish_date_idx").on(table.publish_date),
    };
});
