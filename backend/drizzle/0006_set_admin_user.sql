-- Migration to set jeannineuwasee@gmail.com as admin
-- This is a one-time migration to set a specific user as admin

-- First, ensure the admin role exists (it should from the initial migration)
-- If admin role doesn't exist, create it
DO $$
DECLARE
    admin_role_id INTEGER;
    target_user_id INTEGER;
    existing_user_role_id INTEGER;
    max_user_role_id INTEGER;
BEGIN
    -- Find or create admin role
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin' LIMIT 1;
    
    IF admin_role_id IS NULL THEN
        -- Get the maximum role ID to create a new admin role
        SELECT COALESCE(MAX(id), 1000) + 1 INTO admin_role_id FROM roles;
        
        INSERT INTO roles (id, name, description, created_at, updated_at)
        VALUES (admin_role_id, 'admin', 'Administrator with full access', NOW(), NOW());
        
        RAISE NOTICE 'Created admin role with ID: %', admin_role_id;
    ELSE
        RAISE NOTICE 'Admin role found with ID: %', admin_role_id;
    END IF;
    
    -- Find the user by email
    SELECT id INTO target_user_id FROM users WHERE email = 'jeannineuwasee@gmail.com' LIMIT 1;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email jeannineuwasee@gmail.com not found';
    ELSE
        RAISE NOTICE 'User found with ID: %', target_user_id;
    END IF;
    
    -- Check if user already has admin role in user_roles table
    SELECT id INTO existing_user_role_id 
    FROM user_roles 
    WHERE user_id = target_user_id AND role_id = admin_role_id 
    LIMIT 1;
    
    -- If user doesn't have admin role in user_roles, add it
    IF existing_user_role_id IS NULL THEN
        -- Get the maximum user_roles ID
        SELECT COALESCE(MAX(id), 5000) + 1 INTO max_user_role_id FROM user_roles;
        
        INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
        VALUES (max_user_role_id, target_user_id, admin_role_id, NOW(), NOW());
        
        RAISE NOTICE 'Added admin role to user_roles table';
    ELSE
        RAISE NOTICE 'User already has admin role in user_roles table';
    END IF;
    
    -- Update the user's primary role_id to admin
    UPDATE users 
    SET role_id = admin_role_id, updated_at = NOW()
    WHERE id = target_user_id;
    
    RAISE NOTICE 'Successfully set user jeannineuwasee@gmail.com as admin';
END $$;

