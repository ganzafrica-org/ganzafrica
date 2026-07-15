// 08_create_task_teams.ts
// Migration to create task team management tables

import { sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export async function up(db: NodePgDatabase<any>) {
  console.log("Creating task team management tables...");

  // Create enums first
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE task_team_role AS ENUM ('owner', 'admin', 'member', 'viewer');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE task_team_status AS ENUM ('active', 'inactive', 'archived');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE task_project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Create task_teams table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS task_teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      avatar_url VARCHAR(500),
      color VARCHAR(7),
      status task_team_status NOT NULL DEFAULT 'active',
      created_by INTEGER NOT NULL REFERENCES users(id),
      settings TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);

  // Create indexes for task_teams
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS task_teams_created_by_idx ON task_teams(created_by)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS task_teams_status_idx ON task_teams(status)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS task_teams_name_idx ON task_teams(name)
  `);

  // Create task_team_members table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS task_team_members (
      id SERIAL PRIMARY KEY,
      team_id INTEGER NOT NULL REFERENCES task_teams(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role task_team_role NOT NULL DEFAULT 'member',
      is_active BOOLEAN NOT NULL DEFAULT true,
      joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      UNIQUE(team_id, user_id)
    )
  `);

  // Create indexes for task_team_members
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS task_team_members_team_id_idx ON task_team_members(team_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS task_team_members_user_id_idx ON task_team_members(user_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS task_team_members_role_idx ON task_team_members(role)
  `);

  // Create task_team_projects table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS task_team_projects (
      id SERIAL PRIMARY KEY,
      team_id INTEGER NOT NULL REFERENCES task_teams(id) ON DELETE CASCADE,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      status task_project_status NOT NULL DEFAULT 'planning',
      start_date TIMESTAMP WITH TIME ZONE,
      end_date TIMESTAMP WITH TIME ZONE,
      color VARCHAR(7),
      created_by INTEGER NOT NULL REFERENCES users(id),
      settings TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);

  // Create indexes for task_team_projects
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS task_team_projects_team_id_idx ON task_team_projects(team_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS task_team_projects_status_idx ON task_team_projects(status)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS task_team_projects_created_by_idx ON task_team_projects(created_by)
  `);

  // Create task_project_members table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS task_project_members (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES task_team_projects(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role task_team_role NOT NULL DEFAULT 'member',
      is_active BOOLEAN NOT NULL DEFAULT true,
      joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      UNIQUE(project_id, user_id)
    )
  `);

  // Create indexes for task_project_members
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS task_project_members_project_id_idx ON task_project_members(project_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS task_project_members_user_id_idx ON task_project_members(user_id)
  `);

  console.log("Task team management tables created successfully");
}

export async function down(db: NodePgDatabase<any>) {
  console.log("Dropping task team management tables...");

  // Drop tables in reverse order
  await db.execute(sql`DROP TABLE IF EXISTS task_project_members CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS task_team_projects CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS task_team_members CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS task_teams CASCADE`);

  // Drop enums
  await db.execute(sql`DROP TYPE IF EXISTS task_project_status`);
  await db.execute(sql`DROP TYPE IF EXISTS task_team_status`);
  await db.execute(sql`DROP TYPE IF EXISTS task_team_role`);

  console.log("Task team management tables dropped successfully");
}
