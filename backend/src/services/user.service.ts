import { db } from '../db/client';
import { users, user_profiles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../middlewares';
import { constants } from '../config';
import { hashPassword } from './auth.service';
import { User, CreateUserInput, UpdateUserInput } from '../services/types';
import { sendVerificationEmail, sendWelcomeEmail } from '../services/email.service';
import { createToken } from './auth.service';

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserInput): Promise<User> => {
  // Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, userData.email)
  });

  if (existingUser) {
    throw new AppError(constants.ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
  }

  // Hash password
  const password_hash = await hashPassword(userData.password);

  // Insert user into database
  const [newUser] = await db.insert(users)
    .values({
      email: userData.email,
      name: userData.name,
      password_hash,
      base_role: userData.base_role as 'applicant' | 'public' | 'fellow' | 'employee' | 'alumni' | 'admin' || 'applicant',
      email_verified: userData.email_verified || false,
      avatar_url: userData.avatar_url,
      created_at: new Date(),
      updated_at: new Date()
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
          type: 'verify_email' // assuming this is the token type for email verification
        },
        '24h' // token expiry time
      );
      
      // Send the verification email
      await sendVerificationEmail(newUser.email, {
        token,
        expiresAt
      });
      
      // Optionally also send a welcome email
      await sendWelcomeEmail(newUser.email, newUser.name);
    } catch (error) {
      console.error('Failed to send verification email:', error);
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
    where: eq(users.id, Number(id))
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
    where: eq(users.email, email)
  });

  if (!user) {
    throw new AppError(constants.ERROR_MESSAGES.NOT_FOUND, 404);
  }

  return user;
};

/**
 * Update user
 */
export const updateUser = async (id: number | string, userData: UpdateUserInput): Promise<User> => {
  const [updatedUser] = await db.update(users)
    .set({
      ...userData,
      base_role: userData.base_role as 'applicant' | 'public' | 'fellow' | 'employee' | 'alumni' | undefined,
      updated_at: new Date()
    })
    .where(eq(users.id, Number(id)))
    .returning();

  if (!updatedUser) {
    throw new AppError(constants.ERROR_MESSAGES.NOT_FOUND, 404);
  }

  return updatedUser;
};

/**
 * Create user profile
 */
export const createUserProfile = async (profileData: any): Promise<any> => {
  const [profile] = await db.insert(user_profiles)
    .values({
      user_id: profileData.user_id,
      bio: profileData.bio,
      social_links: profileData.social_links,
      preferences: profileData.preferences,
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning();

  if (!profile) {
    throw new AppError('Failed to create user profile', 500);
  }

  return profile;
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId: number | string): Promise<any> => {
  const profile = await db.query.user_profiles.findFirst({
    where: eq(user_profiles.user_id, Number(userId))
  });

  if (!profile) {
    throw new AppError('User profile not found', 404);
  }

  return profile;
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (id: number | string): Promise<void> => {
  // Implement as soft delete using is_active field
  const [updatedUser] = await db.update(users)
    .set({
      is_active: false,
      updated_at: new Date()
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
  const { page = 1, limit = 10, search, sort_by = 'created_at', sort_order = 'desc', role, is_active } = params;
  
  // Build where conditions
  const whereConditions = [];
  
  if (search) {
    whereConditions.push(
      `(name ILIKE '%${search}%' OR email ILIKE '%${search}%')`
    );
  }
  
  if (role) {
    whereConditions.push(
      `base_role = '${role}'`
    );
  }
  
  if (typeof is_active === 'boolean') {
    whereConditions.push(
      `is_active = ${is_active}`
    );
  }
  
  // Count total matching users
  const countQuery = `
    SELECT COUNT(*) FROM users
    ${whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : ''}
  `;
  
  const [countResult] = await db.execute(countQuery);
  const total = parseInt(countResult.count, 10);
  
  // Get paginated users
  const offset = (page - 1) * limit;
  
  const usersQuery = `
    SELECT * FROM users
    ${whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : ''}
    ORDER BY ${sort_by} ${sort_order === 'asc' ? 'ASC' : 'DESC'}
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  const users = await db.execute(usersQuery);
  
  return {
    users,
    total
  };
};

/**
 * Get user projects (placeholder implementation)
 */
export const getUserProjects = async (userId: number | string): Promise<any[]> => {
  // Placeholder - implement based on your schema
  // This would typically query a user_projects or projects table
  // where project.user_id = userId or from a join table
  
  // For now returning empty array
  return [];
};

/**
 * Import multiple users (for bulk operations)
 */
export const importUsers = async (usersData: CreateUserInput[]): Promise<{
  successful: number;
  failed: number;
  errors: any[];
}> => {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as any[]
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
        error: error instanceof AppError ? error.message : 'Unknown error'
      });
    }
  }

  return results;
};