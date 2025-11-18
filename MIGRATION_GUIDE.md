# Migration Guide: Add is_published Column

## Problem
The `is_published` column doesn't exist in the `projects` table, causing errors when listing projects.

## Solution
Run the migration to add the `is_published` column to the projects table.

## Migration Steps

### Option 1: Run the standalone migration script (Recommended)
```bash
cd backend
npm run db:migrate
```

Or directly:
```bash
cd backend
tsx src/db/migrations/run-add-is-published.ts
```

### Option 2: Run SQL directly in your database
If the migration script doesn't work, run this SQL directly in your PostgreSQL database:

```sql
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;
```

### Option 3: Use Drizzle migrations
```bash
cd backend
npm run db:migrate
```

## Verify Migration
After running the migration, verify the column exists:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'is_published';
```

You should see:
- column_name: `is_published`
- data_type: `boolean`
- column_default: `false`

## What the Migration Does
- Adds `is_published` column to `projects` table
- Sets default value to `false` (unpublished)
- Makes it NOT NULL (required)
- Uses `IF NOT EXISTS` to prevent errors if column already exists

## After Migration
- All existing projects will have `is_published = false` by default
- You can update projects to `is_published = true` to publish them
- The website will only show projects where `is_published = true`


