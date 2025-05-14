"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teams = exports.team_types = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
// Team Types Table
exports.team_types = (0, pg_core_1.pgTable)("team_types", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    ...common_1.timestampFields,
});
// Teams Table
exports.teams = (0, pg_core_1.pgTable)("teams", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    position: (0, pg_core_1.varchar)("position", { length: 200 }),
    photo_url: (0, pg_core_1.varchar)("photo_url", { length: 255 }),
    bio: (0, pg_core_1.text)("bio"),
    email: (0, pg_core_1.varchar)("email", { length: 255 }),
    profile_link: (0, pg_core_1.varchar)("profile_link", { length: 255 }),
    skills: (0, pg_core_1.jsonb)("skills").$type(),
    team_type_id: (0, pg_core_1.integer)("team_type_id")
        .references(() => exports.team_types.id)
        .notNull(),
    ...common_1.timestampFields,
}, (table) => {
    return {
        teamTypeIdx: (0, pg_core_1.index)("teams_team_type_id_idx").on(table.team_type_id),
        emailIdx: (0, pg_core_1.index)("teams_email_idx").on(table.email),
    };
});
// Default export
exports.default = { team_types: exports.team_types, teams: exports.teams };
