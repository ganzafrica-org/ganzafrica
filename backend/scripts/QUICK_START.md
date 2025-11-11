# Quick Start: Set User as Admin

## Option 1: Run the Script Directly (Easiest)

This is the fastest way to set the user as admin right now.

### Steps:

1. **Make sure you have access to your database**
   - You need the `DATABASE_URL` from your `.env` file or hosting platform

2. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

3. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```

4. **Run the script:**
   ```bash
   npm run db:set-admin
   ```

5. **You should see output like:**
   ```
   Setting jeannineuwasee@gmail.com as admin...
   Admin role ID: 1
   Found user: [User Name] (ID: 123)
   Added admin role to user_roles table
   ✅ Successfully set jeannineuwasee@gmail.com as admin!
      User ID: 123
      Admin Role ID: 1
   ```

6. **Have the user log out and log back in** to refresh their session

---

## Option 2: Run Database Migration

If you prefer to use the migration system:

### Steps:

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Run the migration:**
   ```bash
   npm run db:migrate
   ```

3. **This will run all pending migrations, including the one that sets the user as admin**

4. **Have the user log out and log back in** to refresh their session

---

## For Hosted/Production Environment

If you're running this on a hosted platform (like Render, Heroku, DigitalOcean, etc.):

### Method A: SSH into your server
1. SSH into your server
2. Navigate to your project directory
3. Run: `npm run db:set-admin`

### Method B: Run via your hosting platform's console
1. Access your hosting platform's console/terminal
2. Navigate to the backend directory
3. Run: `npm run db:set-admin`

### Method C: Run the SQL directly
1. Connect to your database using a SQL client (pgAdmin, DBeaver, etc.)
2. Copy the contents of `backend/drizzle/0006_set_admin_user.sql`
3. Execute it directly in your database

---

## Verify It Worked

After running either method:

1. **Check the database:**
   ```sql
   -- Check user's role_id
   SELECT id, email, role_id FROM users WHERE email = 'jeannineuwasee@gmail.com';
   
   -- Check user_roles table
   SELECT ur.*, r.name as role_name 
   FROM user_roles ur 
   JOIN roles r ON ur.role_id = r.id 
   WHERE ur.user_id = (SELECT id FROM users WHERE email = 'jeannineuwasee@gmail.com');
   ```

2. **Have the user:**
   - Log out completely
   - Clear browser cache (optional but recommended)
   - Log back in
   - They should now see admin features in the portal

---

## Troubleshooting

### Error: "User not found"
- Make sure the user exists in the database
- Check that the email is exactly: `jeannineuwasee@gmail.com`

### Error: "DATABASE_URL not found"
- Make sure your `.env` file has `DATABASE_URL` set
- For hosted environments, check your environment variables in your hosting platform

### Error: "Connection refused"
- Check that your database is accessible
- Verify your `DATABASE_URL` is correct
- For hosted databases, make sure your IP is whitelisted (if required)

### User still doesn't have admin access
- Make sure they logged out and back in
- Check the browser console for any errors
- Verify the database changes were applied (see "Verify It Worked" above)

---

## Next Steps

Once the user is set as admin:
1. They can now access admin features in the portal
2. They can manage other users and roles through the UI
3. You can remove or disable this script after use (for security)

