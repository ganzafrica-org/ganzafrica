"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partners = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
// Partners Table
exports.partners = (0, pg_core_1.pgTable)("partners", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    logo: (0, pg_core_1.text)("logo"),
    website_url: (0, pg_core_1.varchar)("website_url", { length: 255 }),
    location: (0, pg_core_1.varchar)("location", { length: 255 }),
    ...common_1.timestampFields,
}, (table) => {
    return {
        nameIdx: (0, pg_core_1.index)("partners_name_idx").on(table.name),
        locationIdx: (0, pg_core_1.index)("partners_location_idx").on(table.location),
    };
});
