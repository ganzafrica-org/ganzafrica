import { db, newId, withDbTransaction } from "../db/client";
import { users, user_profiles, user_roles, roles } from "../db/schema";
import { eq, and, inArray, like, desc, asc, sql } from "drizzle-orm";
import { hashPassword, sendVerification } from "./auth.service";
import { sendWelcomeEmail } from "./email.service";
import { AppError } from "../middlewares";
import { Logger } from "../config";
import { toDbId, toApiId } from "../utils/bigint";

const logger = new Logger("UserService");

// User types for service input/output
export type CreateUserInput = {
  email: string;
  password: string;
  name: string;
  base_role: string;
  avatar_url?: string;
  email_verified?: boolean;
  sendVerificationEmail?: boolean;
};

export type UpdateUserInput = {
  name?: string;
  avatar_url?: string;
  base_role?: string;
  email_verified?: boolean;
  is_active?: boolean;
};

export type UserOutput = {
  id: string;
  email: string;
  name: string;
  base_role: string;
  avatar_url?: string;
  email_verified: boolean;
  is_active: boolean;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
};

type UserSearchParams = {
  page: number;
  limit: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  role?: string;
  is_active?: boolean;
};

// Create a new user
export async function createUser(
  userData: CreateUserInput,
): Promise<UserOutput> {
  try {
    return await withDbTransaction(async (txDb) => {
      // Check if user with this email already exists
      const existingUser = await txDb
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new AppError("User with this email already exists", 409);
      }

      // Hash the password
      const passwordHash = await hashPassword(userData.password);

      // Generate user ID
      const userId = newId();

      // Insert the user
      await txDb.insert(users).values({
        id: Number(userId), // Convert to Number
        email: userData.email,
        name: userData.name,
        base_role: userData.base_role,
        password_hash: passwordHash,
        avatar_url: userData.avatar_url,
        email_verified: userData.email_verified || false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Create user profile
      await txDb.insert(user_profiles).values({
        id: Number(newId()), // Convert to Number
        user_id: Number(userId), // Convert to Number
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Send verification email if requested
      if (userData.sendVerificationEmail && !userData.email_verified) {
        await sendVerification(userId, userData.email);
      }

      // Send welcome email if email is already verified
      if (userData.email_verified) {
        await sendWelcomeEmail(userData.email, userData.name);
      }

      // Get the created user to return
      const createdUser = await txDb
        .select()
        .from(users)
        .where(eq(users.id, Number(userId))) // Convert to Number
        .limit(1);

      if (!createdUser.length) {
        throw new AppError("Failed to create user", 500);
      }

      return mapToUserOutput(createdUser[0]);
    });
  } catch (error) {
    logger.error("Error creating user", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to create user", 500);
  }
}

// Get user by ID
export async function getUserById(id: string | bigint): Promise<UserOutput> {
  try {
    const userId = toDbId(id); // Use our utility function

    if (!userId) {
      throw new AppError("Invalid user ID", 400);
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!result.length) {
      throw new AppError("User not found", 404);
    }

    return mapToUserOutput(result[0]);
  } catch (error) {
    logger.error(`Error getting user by ID: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get user", 500);
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<UserOutput> {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!result.length) {
      throw new AppError("User not found", 404);
    }

    return mapToUserOutput(result[0]);
  } catch (error) {
    logger.error(`Error getting user by email: ${email}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get user", 500);
  }
}

// Update user
export async function updateUser(
  id: string | bigint,
  userData: UpdateUserInput,
): Promise<UserOutput> {
  try {
    const userId = toDbId(id); // Use our utility function

    if (!userId) {
      throw new AppError("Invalid user ID", 400);
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser.length) {
      throw new AppError("User not found", 404);
    }

    // Update user
    await db
      .update(users)
      .set({
        ...userData,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    // Get updated user
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return mapToUserOutput(updatedUser[0]);
  } catch (error) {
    logger.error(`Error updating user: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to update user", 500);
  }
}

// Delete user (soft delete by marking as inactive)
export async function deleteUser(id: string | bigint): Promise<boolean> {
  try {
    const userId = toDbId(id); // Use our utility function

    if (!userId) {
      throw new AppError("Invalid user ID", 400);
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser.length) {
      throw new AppError("User not found", 404);
    }

    // Soft delete by marking as inactive
    await db
      .update(users)
      .set({
        is_active: false,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    return true;
  } catch (error) {
    logger.error(`Error deleting user: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to delete user", 500);
  }
}

// List users with pagination and filtering
export async function listUsers(
  params: UserSearchParams,
): Promise<{ users: UserOutput[]; total: number }> {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sort_by = "created_at",
      sort_order = "desc",
      role,
      is_active,
    } = params;
    const offset = (page - 1) * limit;

    // Build query conditions
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        sql`(${users.name} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`})`,
      );
    }

    if (role) {
      whereConditions.push(eq(users.base_role, role));
    }

    if (is_active !== undefined) {
      whereConditions.push(eq(users.is_active, is_active));
    }

    // Combine conditions
    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    // Sort order
    const sortDirection = sort_order === "asc" ? asc : desc;
    let orderBy;

    // Determine sort column
    switch (sort_by) {
      case "name":
        orderBy = sortDirection(users.name);
        break;
      case "email":
        orderBy = sortDirection(users.email);
        break;
      case "base_role":
        orderBy = sortDirection(users.base_role);
        break;
      case "created_at":
      default:
        orderBy = sortDirection(users.created_at);
    }

    // Get paginated results
    const result = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const userList = result.map(mapToUserOutput);

    return {
      users: userList,
      total,
    };
  } catch (error) {
    logger.error("Error listing users", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to list users", 500);
  }
}

// Bulk import users
export async function importUsers(
  usersData: CreateUserInput[],
): Promise<{
  successful: number;
  failed: number;
  errors: { email: string; reason: string }[];
}> {
  try {
    const result = {
      successful: 0,
      failed: 0,
      errors: [] as { email: string; reason: string }[],
    };

    await withDbTransaction(async (txDb) => {
      // Process each user
      for (const userData of usersData) {
        try {
          // Check if user already exists
          const existingUser = await txDb
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, userData.email))
            .limit(1);

          if (existingUser.length > 0) {
            result.failed++;
            result.errors.push({
              email: userData.email,
              reason: "User with this email already exists",
            });
            continue;
          }

          // Hash the password
          const passwordHash = await hashPassword(userData.password);

          // Generate user ID
          const userId = newId();

          // Insert the user
          await txDb.insert(users).values({
            id: Number(userId), // Convert to Number
            email: userData.email,
            name: userData.name,
            base_role: userData.base_role,
            password_hash: passwordHash,
            avatar_url: userData.avatar_url,
            email_verified: userData.email_verified || false,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          });

          // Create user profile
          await txDb.insert(user_profiles).values({
            id: Number(newId()), // Convert to Number
            user_id: Number(userId), // Convert to Number
            created_at: new Date(),
            updated_at: new Date(),
          });

          // Send verification email if requested
          if (userData.sendVerificationEmail && !userData.email_verified) {
            await sendVerification(userId, userData.email);
          }

          result.successful++;
        } catch (error) {
          logger.error(`Error importing user: ${userData.email}`, error);
          result.failed++;
          result.errors.push({
            email: userData.email,
            reason: error instanceof AppError ? error.message : "Unknown error",
          });
        }
      }
    });

    return result;
  } catch (error) {
    logger.error("Error importing users", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to import users", 500);
  }
}

// Helper function to map database user to UserOutput type
function mapToUserOutput(user: any): UserOutput {
  return {
    id: toApiId(user.id), // Convert number to string
    email: user.email,
    name: user.name,
    base_role: user.base_role,
    avatar_url: user.avatar_url,
    email_verified: user.email_verified,
    is_active: user.is_active,
    password_hash: user.password_hash,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
