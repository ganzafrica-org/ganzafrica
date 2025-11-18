# Quick Fix: Add is_published Column

## The Problem
The `npm run db:migrate` command is failing because it's trying to recreate enums that already exist.

## Solution: Run the Standalone Migration

Instead of using `npm run db:migrate`, run the standalone migration script:

```bash
cd backend
tsx src/db/migrations/run-add-is-published.ts
```

This script uses `IF NOT EXISTS` so it won't fail if the column already exists.

## Alternative: Run SQL Directly

If the script doesn't work, connect to your PostgreSQL database and run:

```sql
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;
```

## Verify It Worked

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

## After Migration

1. Restart your backend server
2. The error should be gone
3. All existing projects will have `is_published = false` by default


