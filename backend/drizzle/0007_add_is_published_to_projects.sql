-- Add is_published column to projects table
-- This migration adds the is_published boolean field to track project publication status

ALTER TABLE "public"."projects" 
ADD COLUMN IF NOT EXISTS "is_published" boolean NOT NULL DEFAULT false;

-- Update existing projects to be unpublished by default (already handled by DEFAULT false)
-- This ensures all existing projects remain unpublished unless explicitly published


