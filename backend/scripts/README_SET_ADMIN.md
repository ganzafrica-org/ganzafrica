# Setting a User as Admin

This directory contains scripts and migrations to set a specific user (jeannineuwasee@gmail.com) as an admin.

## Solution 1: Database Migration (Recommended for Production)

The SQL migration file `../drizzle/0006_set_admin_user.sql` will automatically set the user as admin when you run database migrations.

### To run the migration:

```bash
# From the backend directory
npm run db:migrate
```

This will:
1. Find or create the admin role
2. Find the user by email (jeannineuwasee@gmail.com)
3. Add the admin role to the user_roles table
4. Update the user's primary role_id to admin

## Solution 2: Node.js Script (Alternative)

You can also run the TypeScript script directly:

### To run the script:

```bash
# From the backend directory
npm run db:set-admin

# Or directly with tsx
tsx scripts/set-admin-user.ts
```

### Prerequisites:

- Node.js and npm installed
- Database connection string in `.env` file (DATABASE_URL)
- The user must already exist in the database

### What the script does:

1. Connects to the database using DATABASE_URL from .env
2. Finds or creates the admin role
3. Finds the user by email (jeannineuwasee@gmail.com)
4. Adds the admin role to user_roles table if not already present
5. Updates the user's primary role_id to admin
6. Confirms success with a message

### Troubleshooting:

- **User not found**: Make sure the user with email `jeannineuwasee@gmail.com` exists in the database
- **Database connection error**: Verify your DATABASE_URL in the .env file is correct
- **Role already exists**: The script will skip adding the role if it already exists (this is safe)

## Security Note

After setting the user as admin, they will have full access to:
- User management
- Role management
- All administrative features

Make sure to:
1. Verify the user's identity before running this script
2. Remove or disable this script after use in production
3. Consider adding proper authentication/authorization checks for role changes in the future

## After Running

Once the user is set as admin:
1. They should log out and log back in to refresh their session
2. They will now have access to admin features in the portal
3. They can manage other users and roles through the UI

