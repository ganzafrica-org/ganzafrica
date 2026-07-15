import { db } from "../client";
import { sql } from "drizzle-orm";

/**
 * Migration: Create tasks, task_assignees, and task_comments tables
 */
export async function createTasksTables() {
  try {
    console.log("Starting migration: Create tasks tables...");

    // Step 1: Create enums
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("✓ Created task_priority enum");

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'inprogress', 'review', 'done');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("✓ Created task_status enum");

    // Step 2: Create tasks table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES task_team_projects(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        deliverables TEXT,
        status task_status NOT NULL DEFAULT 'backlog',
        priority task_priority NOT NULL DEFAULT 'medium',
        due_date TIMESTAMP WITH TIME ZONE,
        labels JSONB DEFAULT '[]'::jsonb,
        attachments JSONB DEFAULT '[]'::jsonb,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("✓ Created tasks table");

    // Step 3: Create indexes for tasks
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id);
      CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
      CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks(priority);
      CREATE INDEX IF NOT EXISTS tasks_created_by_idx ON tasks(created_by);
      CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);
    `);
    console.log("✓ Created indexes for tasks");

    // Step 4: Create task_assignees table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS task_assignees (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("✓ Created task_assignees table");

    // Step 5: Create indexes for task_assignees
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS task_assignees_task_id_idx ON task_assignees(task_id);
      CREATE INDEX IF NOT EXISTS task_assignees_user_id_idx ON task_assignees(user_id);
    `);
    console.log("✓ Created indexes for task_assignees");

    // Step 6: Create task_comments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS task_comments (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("✓ Created task_comments table");

    // Step 7: Create indexes for task_comments
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS task_comments_task_id_idx ON task_comments(task_id);
      CREATE INDEX IF NOT EXISTS task_comments_user_id_idx ON task_comments(user_id);
    `);
    console.log("✓ Created indexes for task_comments");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  createTasksTables()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
