import { db } from "../db/client";
import { users, user_profiles, roles } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { AppError } from "../middlewares";
import { constants, Logger } from "../config";
import { hashPassword } from "./auth.service";
import { User, CreateUserInput, UpdateUserInput } from "./types";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../services/email.service";
import { createToken } from "./auth.service";

const logger = new Logger("UserService");

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserInput): Promise<User> => {
  // Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, userData.email),
  });

  if (existingUser) {
    throw new AppError(constants.ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
  }
  if (existingUser) {
    throw new AppError(constants.ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
  }

  // Hash password
  const password_hash = await hashPassword(userData.password);

  // Insert user into database
  const [newUser] = await db
    .insert(users)
    .values({
      email: userData.email,
      name: userData.name,
      password_hash,
      role_id: userData.role_id,
      email_verified: userData.email_verified || false,
      avatar_url: userData.avatar_url,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  if (!newUser) {
    throw new AppError(constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }

  // Send verification email if requested and not already verified
  if (userData.sendVerificationEmail && !userData.email_verified) {
    try {
      // Create a verification token (24 hour expiry)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const token = await createToken(
        {
          id: newUser.id.toString(),
          type: "verify_email", // assuming this is the token type for email verification
        },
        "24h", // token expiry time
      );

      // Send the verification email
      await sendVerificationEmail(newUser.email, {
        token,
        expiresAt,
      });

      // Optionally also send a welcome email
      await sendWelcomeEmail(newUser.email, newUser.name);
    } catch (error) {
      logger.error("Failed to send verification email:", error);
      // Don't fail the user creation if email sending fails
    }
  }

  return newUser;
};

/**
 * Get user by ID
 */
export const getUserById = async (id: number | string): Promise<User> => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, Number(id)),
  });

  if (!user) {
    throw new AppError(constants.ERROR_MESSAGES.NOT_FOUND, 404);
  }

  return user;
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User> => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new AppError(constants.ERROR_MESSAGES.NOT_FOUND, 404);
  }

  return user;
};

/**
 * Update user
 */
export const updateUser = async (
  id: number | string,
  userData: UpdateUserInput,
): Promise<User> => {
  const [updatedUser] = await db
    .update(users)
    .set({
      ...userData,
      // No need to cast role_id as it's now a direct integer
      updated_at: new Date(),
    })
    .where(eq(users.id, Number(id)))
    .returning();

  if (!updatedUser) {
    throw new AppError(constants.ERROR_MESSAGES.NOT_FOUND, 404);
  }

  return updatedUser;
};
/**
 * Activate user (sets is_active to true)
 */
export const activateUser = async (id: number | string): Promise<void> => {
  const [updatedUser] = await db
    .update(users)
    .set({
      is_active: true,
      updated_at: new Date(),
    })
    .where(eq(users.id, Number(id)))
    .returning();

  if (!updatedUser) {
    throw new AppError(constants.ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }
};

/**
 * Deactivate user (soft delete - sets is_active to false)
 */
export const deactivateUser = async (id: number | string): Promise<void> => {
  const [updatedUser] = await db
    .update(users)
    .set({
      is_active: false,
      updated_at: new Date(),
    })
    .where(eq(users.id, Number(id)))
    .returning();

  if (!updatedUser) {
    throw new AppError(constants.ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }
};

/**
 * Delete user (hard delete - completely removes from database)
 * This function deletes all related records first to handle foreign key constraints
 */
export const deleteUser = async (id: number | string): Promise<void> => {
  const userId = Number(id);
  
  // Validate ID
  if (isNaN(userId) || userId <= 0) {
    throw new AppError(constants.ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  // First, verify the user exists
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new AppError(constants.ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  // Helper function to safely delete from a table
  const safeDelete = async (tableName: string, query: any) => {
    try {
      await db.execute(query);
    } catch (error: any) {
      // If table doesn't exist (42P01) or column doesn't exist, just continue
      if (error.code !== '42P01' && error.code !== '42703') {
        // For other errors, log but continue (might be constraint issues)
        logger.warn(`Error deleting from ${tableName}: ${error.message}`);
      }
    }
  };
  
  // Query database for ALL foreign keys that reference users.id
  let allFKs: any[] = [];
  try {
    const fkResult = await db.execute(sql`
      SELECT 
        tc.table_name, 
        kcu.column_name,
        tc.constraint_name,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
        AND rc.constraint_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name = 'users'
        AND ccu.column_name = 'id'
    `);
    allFKs = fkResult.rows || [];
  } catch (fkError: any) {
    logger.warn(`Could not query foreign keys: ${fkError.message}`);
  }
  
  // Delete from known tables first
  await safeDelete('user_profiles', sql`DELETE FROM user_profiles WHERE user_id = ${userId}`);
  await safeDelete('password_reset_tokens', sql`DELETE FROM password_reset_tokens WHERE user_id = ${userId}`);
  await safeDelete('verification_tokens', sql`DELETE FROM verification_tokens WHERE user_id = ${userId}`);
  await safeDelete('sessions', sql`DELETE FROM sessions WHERE user_id = ${userId}`);
  await safeDelete('two_factor_temp_tokens', sql`DELETE FROM two_factor_temp_tokens WHERE user_id = ${userId}`);
  await safeDelete('two_factor_credentials', sql`DELETE FROM two_factor_credentials WHERE user_id = ${userId}`);
  await safeDelete('task_comments', sql`DELETE FROM task_comments WHERE user_id = ${userId}`);
  await safeDelete('task_assignees', sql`DELETE FROM task_assignees WHERE user_id = ${userId}`);
  await safeDelete('task_team_members', sql`DELETE FROM task_team_members WHERE user_id = ${userId}`);
  await safeDelete('task_project_members', sql`DELETE FROM task_project_members WHERE user_id = ${userId}`);
  await safeDelete('user_roles', sql`DELETE FROM user_roles WHERE user_id = ${userId}`);
  await safeDelete('applications', sql`DELETE FROM applications WHERE user_id = ${userId}`);
  await safeDelete('tasks', sql`DELETE FROM tasks WHERE created_by = ${userId} OR assigned_to = ${userId}`);
  await safeDelete('reports', sql`DELETE FROM reports WHERE created_by = ${userId} OR assigned_to = ${userId} OR reviewed_by = ${userId} OR approved_by = ${userId}`);
  await safeDelete('opportunities', sql`DELETE FROM opportunities WHERE created_by = ${userId} OR assigned_to = ${userId} OR updated_by = ${userId}`);
  
  // Delete from any additional tables found via FK query (that don't have CASCADE)
  if (allFKs.length > 0) {
    for (const fk of allFKs) {
      if (fk.delete_rule === 'CASCADE') {
        continue;
      }
      
      try {
        const check = await db.execute(sql.raw(`
          SELECT COUNT(*) as count 
          FROM ${fk.table_name} 
          WHERE ${fk.column_name} = ${userId}
        `));
        if (check.rows && check.rows[0]) {
          const count = parseInt(String(check.rows[0].count || '0'), 10);
          if (count > 0) {
            await db.execute(sql.raw(`DELETE FROM ${fk.table_name} WHERE ${fk.column_name} = ${userId}`));
          }
        }
      } catch (e: any) {
        logger.warn(`Could not delete from ${fk.table_name}.${fk.column_name}: ${e.message}`);
      }
    }
  }
  
  // Use advisory lock to prevent race conditions when dropping/recreating trigger
  const LOCK_ID = 12345;
  let lockAcquired = false;
  let triggerDropped = false;
  
  try {
    await db.execute(sql`SELECT pg_advisory_lock(${LOCK_ID})`);
    lockAcquired = true;
    
    try {
      await db.execute(sql`DROP TRIGGER IF EXISTS prevent_user_delete_trigger ON users`);
      triggerDropped = true;
    } catch (triggerError: any) {
      logger.warn(`Could not drop trigger: ${triggerError.message}`);
    }
    
    const deleteResult = await db.execute(
      sql`DELETE FROM users WHERE id = ${userId}`
    );
    
    if ((deleteResult.rowCount || 0) === 0) {
      throw new AppError("Failed to delete user - no rows deleted", 500);
    }
  } catch (deleteError: any) {
    logger.error(`Error during user deletion:`, deleteError);
    if (deleteError.code === '23503') {
      throw new AppError("Cannot delete user - still referenced by other records.", 409);
    }
    throw deleteError;
  } finally {
    if (triggerDropped) {
      try {
        const triggerCheck = await db.execute(sql`
          SELECT COUNT(*) as count
          FROM pg_trigger
          WHERE tgname = 'prevent_user_delete_trigger'
        `);
        const triggerExists = (triggerCheck.rows?.[0] as any)?.count > 0;
        
        if (!triggerExists) {
          await db.execute(sql`
            CREATE TRIGGER prevent_user_delete_trigger
            BEFORE DELETE ON users
            FOR EACH ROW
            EXECUTE FUNCTION soft_delete_trigger()
          `);
        }
      } catch (triggerError: any) {
        if (triggerError.code !== '42P07') {
          logger.error(`CRITICAL: Could not re-create trigger: ${triggerError.message}`);
        }
      }
    }
    
    if (lockAcquired) {
      try {
        await db.execute(sql`SELECT pg_advisory_unlock(${LOCK_ID})`);
      } catch (unlockError: any) {
        logger.warn(`Could not release advisory lock: ${unlockError.message}`);
      }
    }
  }

  // Final verification
  const finalCheck = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  
  if (finalCheck) {
    logger.error(`CRITICAL: User still exists after successful delete! ID: ${userId}`);
    throw new AppError("Delete operation failed - user still exists", 500);
  }
};

/**
 * List users with filtering and pagination
 */
export const listUsers = async (params: any) => {
  const {
    page = 1,
    limit = 10,
    search,
    sort_by = "created_at",
    sort_order = "desc",
    role_id,
    is_active,
  } = params;

  // Build where conditions
  const whereConditions = [];

  if (search) {
    whereConditions.push(
      `(u.name ILIKE '%${search}%' OR u.email ILIKE '%${search}%')`,
    );
  }

  if (role_id) {
    whereConditions.push(`u.role_id = ${role_id}`);
  }

  if (typeof is_active === "boolean") {
    whereConditions.push(`u.is_active = ${is_active}`);
  }

  // Build where clause
  const whereClause = whereConditions.length
    ? `WHERE ${whereConditions.join(" AND ")}`
    : "";

  // Count total matching users
  const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
  const countResults = await db.execute(countQuery);
  const total = parseInt(String(countResults.rows?.[0]?.total || "0"), 10);

  // Get paginated users
  const offset = (page - 1) * limit;

  const usersQuery = `
    SELECT u.*, r.name as role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    ${whereClause}
    ORDER BY u.${sort_by} ${sort_order === "asc" ? "ASC" : "DESC"}
    LIMIT ${limit} OFFSET ${offset}
  `;
  const usersResults = await db.execute(usersQuery);

  // Return the users and total
  return {
    users: usersResults.rows || [],
    total,
  };
};
/**
 * Import multiple users (for bulk operations)
 */
export const importUsers = async (
  usersData: CreateUserInput[],
): Promise<{
  successful: number;
  failed: number;
  errors: any[];
}> => {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as any[],
  };

  // Process each user
  for (const userData of usersData) {
    try {
      await createUser(userData);
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        email: userData.email,
        error: error instanceof AppError ? error.message : "Unknown error",
      });
    }
  }

  return results;
};

/**
 * Get user profile (combines user data with user_profiles table)
 */
export const getUserProfile = async (userId: string) => {
  try {
    // Get user basic information
    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(userId)),
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Get user profile information
    const userProfile = await db.query.user_profiles.findFirst({
      where: eq(user_profiles.user_id, parseInt(userId)),
    });

    // Get role information
    const role = await db.query.roles.findFirst({
      where: eq(roles.id, user.role_id),
    });

    // Combine user data with profile data
    const profile = {
      id: user.id,
      email: user.email,
      name: user.name,
      role_id: user.role_id,
      role_name: role?.name || 'Unknown',
      avatar_url: user.avatar_url,
      phone_number: user.phone_number,
      email_verified: user.email_verified,
      phone_verified: user.phone_verified,
      is_active: user.is_active,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at,
      // Profile-specific data
      bio: userProfile?.bio || null,
      address: userProfile?.address || null,
      social_links: userProfile?.social_links || null,
      preferences: userProfile?.preferences || null,
    };

    return profile;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to get user profile", 500);
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const userIdNum = parseInt(userId);

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userIdNum),
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Separate user table fields from profile table fields
    const userFields = {
      name: profileData.name,
      phone_number: profileData.phone_number,
      avatar_url: profileData.avatar_url,
    };

    const profileFields = {
      bio: profileData.bio,
      address: profileData.address,
      social_links: profileData.social_links,
      preferences: profileData.preferences,
    };

    // Update user table fields (only if provided)
    const userUpdateData: any = {};
    Object.keys(userFields).forEach(key => {
      if (profileData[key] !== undefined) {
        userUpdateData[key] = profileData[key];
      }
    });

    if (Object.keys(userUpdateData).length > 0) {
      userUpdateData.updated_at = new Date();
      await db
        .update(users)
        .set(userUpdateData)
        .where(eq(users.id, userIdNum));
    }

    // Update or create user profile
    const existingProfile = await db.query.user_profiles.findFirst({
      where: eq(user_profiles.user_id, userIdNum),
    });

    const profileUpdateData: any = {};
    Object.keys(profileFields).forEach(key => {
      if (profileData[key] !== undefined) {
        profileUpdateData[key] = profileData[key];
      }
    });

    if (Object.keys(profileUpdateData).length > 0) {
      profileUpdateData.updated_at = new Date();

      if (existingProfile) {
        // Update existing profile
        await db
          .update(user_profiles)
          .set(profileUpdateData)
          .where(eq(user_profiles.user_id, userIdNum));
      } else {
        // Create new profile
        profileUpdateData.user_id = userIdNum;
        profileUpdateData.created_at = new Date();
        await db.insert(user_profiles).values(profileUpdateData);
      }
    }

    // Return updated profile
    return await getUserProfile(userId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update user profile", 500);
  }
};