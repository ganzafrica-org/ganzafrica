-- Add 'overdue' status to project_status enum
-- This migration adds the overdue status to the project status enum

-- Add the 'overdue' value to the project_status enum
ALTER TYPE "public"."project_status" ADD VALUE 'overdue';

-- Note: We cannot remove existing values from the enum in PostgreSQL
-- The new 'overdue' value will be available for new records
