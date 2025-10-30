import { db } from "../db/client";
import { users, user_profiles, roles } from "../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../middlewares";
import { constants } from "../config";
import { hashPassword } from "./auth.service";
import { User, CreateUserInput, UpdateUserInput } from "./types";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../services/email.service";
import { createToken } from "./auth.service";

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
      console.error("Failed to send verification email:", error);
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
 * Delete user (soft delete)
 */
export const deleteUser = async (id: number | string): Promise<void> => {
  // Implement as soft delete using is_active field
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
  console.log("Count query:", countQuery);

  const countResults = await db.execute(countQuery);
  console.log("Count results:", countResults);
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
  console.log("Users query:", usersQuery);

  const usersResults = await db.execute(usersQuery);
  console.log("Users results structure:", Object.keys(usersResults));

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