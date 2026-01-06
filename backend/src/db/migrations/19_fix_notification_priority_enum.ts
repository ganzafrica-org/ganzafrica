import { db } from "../client";
import { sql } from "drizzle-orm";

/**
 * Migration: Fix notification_priority enum and task assignment trigger
 */
export async function fixNotificationPriorityEnum() {
  try {
    console.log("Starting migration: Fix notification_priority enum...");

    // Create notification_priority enum if it doesn't exist
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("✓ Created notification_priority enum");

    // Create or replace the task assignment notification trigger with proper enum casting
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION task_assignment_notification_trigger()
      RETURNS TRIGGER AS $task_assign_func$
      DECLARE
          task_record RECORD;
          assigner_record RECORD;
      BEGIN
          -- Get task details
          SELECT * INTO task_record FROM tasks WHERE id = NEW.task_id;
          
          -- Get assigner details
          SELECT * INTO assigner_record FROM users WHERE id = task_record.created_by;
          
          -- Insert notification with proper enum casting
          INSERT INTO notifications (
              user_id,
              type,
              priority,
              title,
              message,
              data,
              is_read,
              created_at
          ) VALUES (
              NEW.user_id,
              'task_assigned',
              CASE 
                  WHEN task_record.due_date IS NOT NULL AND task_record.due_date <= NOW() + INTERVAL '3 days' THEN 'high'::notification_priority
                  ELSE 'medium'::notification_priority
              END,
              'New Task Assignment',
              assigner_record.name || ' assigned you a new task: "' || task_record.title || '"' ||
              CASE 
                  WHEN task_record.due_date IS NOT NULL THEN ' (Due: ' || task_record.due_date::text || ')'
                  ELSE ''
              END,
              jsonb_build_object(
                  'task_id', NEW.task_id,
                  'assigner_id', task_record.created_by,
                  'due_date', task_record.due_date
              ),
              FALSE,
              NOW()
          );
          
          RETURN NEW;
      END;
      $task_assign_func$ LANGUAGE plpgsql;
    `);
    console.log("✓ Created/updated task_assignment_notification_trigger function");

    // Create the trigger
    await db.execute(sql`
      DROP TRIGGER IF EXISTS task_assignment_notification_trigger ON task_assignees;
      CREATE TRIGGER task_assignment_notification_trigger
          AFTER INSERT ON task_assignees
          FOR EACH ROW
          EXECUTE FUNCTION task_assignment_notification_trigger();
    `);
    console.log("✓ Created task_assignment_notification_trigger");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  fixNotificationPriorityEnum()
    .then(() => {
      console.log("Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
