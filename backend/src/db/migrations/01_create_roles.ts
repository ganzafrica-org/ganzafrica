// 01_create_roles.ts
// Place this in your migrations folder (likely in ../../../drizzle based on your code)

import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

// Add proper type for the db parameter
export async function up(db: NodePgDatabase<any>) {
  // Check if there are any roles
  const existingRoles = await db.execute(
    sql`SELECT * FROM roles LIMIT 1`
  );
  
  // Only insert default roles if none exist
  if (existingRoles.rows.length === 0) {
    await db.execute(sql`
      INSERT INTO roles (name, description, created_at, updated_at)
      VALUES 
        ('admin', 'Administrator with full access', NOW(), NOW()),
        ('team', 'Team member with limited access', NOW(), NOW()),
        ('public', 'Regular user with basic access', NOW(), NOW())
    `);
    console.log('Default roles created successfully');
  } else {
    console.log('Roles already exist, skipping creation');
  }
}

// Add proper type for the db parameter here too
export async function down(db: NodePgDatabase<any>) {
  // Revert the migration if needed
  // Be careful with this in production - you might not want to delete all roles
  // await db.execute(sql`DELETE FROM roles WHERE name IN ('admin', 'team', 'public')`);
}