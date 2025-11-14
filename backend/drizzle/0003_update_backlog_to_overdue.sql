-- Update existing tasks with 'backlog' status to 'overdue'
-- This migration handles the status enum change from 'backlog' to 'overdue'

-- First, update the enum type to include 'overdue' and remove 'backlog'
ALTER TYPE "public"."task_status" ADD VALUE 'overdue';

-- Update existing tasks with 'backlog' status to 'overdue'
UPDATE "public"."tasks" 
SET "status" = 'overdue' 
WHERE "status" = 'backlog';

-- Note: We cannot remove the 'backlog' value from the enum in PostgreSQL
-- The old value will remain but won't be used in new records




















