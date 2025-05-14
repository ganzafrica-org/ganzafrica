"use strict";
// 01_create_roles.ts
// Place this in your migrations folder (likely in ../../../drizzle based on your code)
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const drizzle_orm_1 = require("drizzle-orm");
// Add proper type for the db parameter
async function up(db) {
    // Check if there are any roles
    const existingRoles = await db.execute((0, drizzle_orm_1.sql) `SELECT * FROM roles LIMIT 1`);
    // Only insert default roles if none exist
    if (existingRoles.rows.length === 0) {
        await db.execute((0, drizzle_orm_1.sql) `
      INSERT INTO roles (name, description, created_at, updated_at)
      VALUES 
        ('admin', 'Administrator with full access', NOW(), NOW()),
        ('team', 'Team member with limited access', NOW(), NOW()),
        ('public', 'Regular user with basic access', NOW(), NOW())
    `);
        console.log('Default roles created successfully');
    }
    else {
        console.log('Roles already exist, skipping creation');
    }
}
// Add proper type for the db parameter here too
async function down(db) {
    // Revert the migration if needed
    // Be careful with this in production - you might not want to delete all roles
    // await db.execute(sql`DELETE FROM roles WHERE name IN ('admin', 'team', 'public')`);
}
