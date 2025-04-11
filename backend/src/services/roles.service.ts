import { db, withDbTransaction } from "../db/client";
import { roles, user_roles, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AppError } from "../middlewares";
import { Logger } from "../config";

const logger = new Logger("RoleService");

// Role types for service input/output
export type CreateRoleInput = {
  name: string;
  description?: string;
};

export type UpdateRoleInput = {
  name?: string;
  description?: string;
};

export type RoleOutput = {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

export type UserRoleOutput = {
  id: number;
  user_id: number;
  role_id: number;
  role_name: string;
  created_at: Date;
  updated_at: Date;
};

// Generate numeric ID (simple implementation - in real app you might use an auto-increment from DB)
let lastRoleId = 1000;
function generateRoleId(): number {
  return ++lastRoleId;
}

let lastUserRoleId = 5000;
function generateUserRoleId(): number {
  return ++lastUserRoleId;
}

// Create a new role
export async function createRole(
  roleData: CreateRoleInput,
): Promise<RoleOutput> {
  try {
    // Check if a role with the same name already exists
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, roleData.name))
      .limit(1);

    if (existingRole.length > 0) {
      throw new AppError(
        `Role with name '${roleData.name}' already exists`,
        409,
      );
    }

    // Generate role ID
    const roleId = generateRoleId();

    // Insert the role with an explicit ID
    await db.insert(roles).values({
      id: roleId,
      name: roleData.name,
      description: roleData.description || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Get the created role
    const createdRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    if (!createdRole.length) {
      throw new AppError("Failed to create role", 500);
    }

    return mapToRoleOutput(createdRole[0]);
  } catch (error) {
    logger.error("Error creating role", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to create role", 500);
  }
}

// Get role by ID
export async function getRoleById(id: number): Promise<RoleOutput> {
  try {
    const result = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    if (!result.length) {
      throw new AppError("Role not found", 404);
    }

    return mapToRoleOutput(result[0]);
  } catch (error) {
    logger.error(`Error getting role by ID: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get role", 500);
  }
}

// Update role
export async function updateRole(
  id: number,
  roleData: UpdateRoleInput,
): Promise<RoleOutput> {
  try {
    // Check if role exists
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    if (!existingRole.length) {
      throw new AppError("Role not found", 404);
    }

    // If updating name, check if the new name already exists
    if (roleData.name && roleData.name !== existingRole[0].name) {
      const nameExists = await db
        .select()
        .from(roles)
        .where(eq(roles.name, roleData.name))
        .limit(1);

      if (nameExists.length > 0) {
        throw new AppError(
          `Role with name '${roleData.name}' already exists`,
          409,
        );
      }
    }

    // Update role
    await db
      .update(roles)
      .set({
        ...(roleData.name ? { name: roleData.name } : {}),
        ...(roleData.description !== undefined
          ? { description: roleData.description }
          : {}),
        updated_at: new Date(),
      })
      .where(eq(roles.id, id));

    // Get updated role
    const updatedRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    return mapToRoleOutput(updatedRole[0]);
  } catch (error) {
    logger.error(`Error updating role: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to update role", 500);
  }
}

// Delete role
export async function deleteRole(id: number): Promise<boolean> {
  try {
    // Check if role exists
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    if (!existingRole.length) {
      throw new AppError("Role not found", 404);
    }

    // Check if the role is assigned to any users
    const roleInUse = await db
      .select()
      .from(user_roles)
      .where(eq(user_roles.role_id, id))
      .limit(1);

    if (roleInUse.length > 0) {
      throw new AppError("Cannot delete role that is assigned to users", 409);
    }

    // Delete the role
    await db.delete(roles).where(eq(roles.id, id));

    return true;
  } catch (error) {
    logger.error(`Error deleting role: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to delete role", 500);
  }
}

// List all roles
export async function listRoles(): Promise<RoleOutput[]> {
  try {
    const result = await db.select().from(roles);

    return result.map(mapToRoleOutput);
  } catch (error) {
    logger.error("Error listing roles", error);
    throw new AppError("Failed to list roles", 500);
  }
}

// Assign role to user
export async function assignRoleToUser(
  userId: number,
  roleId: number,
): Promise<UserRoleOutput> {
  try {
    // First check if user exists outside transaction
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length) {
      throw new AppError("User not found", 404);
    }

    // Check if role exists outside transaction
    const role = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    if (!role.length) {
      throw new AppError("Role not found", 404);
    }

    // Check if user already has this role
    const existingUserRole = await db
      .select()
      .from(user_roles)
      .where(
        and(eq(user_roles.user_id, userId), eq(user_roles.role_id, roleId)),
      )
      .limit(1);

    if (existingUserRole.length > 0) {
      throw new AppError("User already has this role", 409);
    }

    // Generate user role ID
    const userRoleId = generateUserRoleId();
    const now = new Date();

    // Perform the actual insertion
    try {
      // FIX: Use userRoleId instead of user_roles.id
      await db.insert(user_roles).values({
        id: userRoleId,
        user_id: userId,
        role_id: roleId,
        created_at: now,
        updated_at: now,
      });
    } catch (insertError) {
      logger.error(`Error inserting user role: ${insertError}`);
      throw new AppError("Database error while assigning role", 500);
    }

    // Get the created user role assignment with role name
    const createdUserRole = await db
      .select({
        id: user_roles.id,
        user_id: user_roles.user_id,
        role_id: user_roles.role_id,
        role_name: roles.name,
        created_at: user_roles.created_at,
        updated_at: user_roles.updated_at,
      })
      .from(user_roles)
      .innerJoin(roles, eq(user_roles.role_id, roles.id))
      .where(eq(user_roles.id, userRoleId))
      .limit(1);

    if (!createdUserRole.length) {
      throw new AppError("Failed to retrieve assigned role", 500);
    }

    return createdUserRole[0];
  } catch (error) {
    logger.error(`Error assigning role ${roleId} to user ${userId}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to assign role to user", 500);
  }
}

// Add this function to your roles.service.ts file
export async function replaceUserRole(
  userId: number,
  newRoleId: number,
): Promise<UserRoleOutput> {
  try {
    return await withDbTransaction(async (txDb) => {
      // Check if user exists
      const user = await txDb
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        throw new AppError("User not found", 404);
      }

      // Check if role exists
      const role = await txDb
        .select()
        .from(roles)
        .where(eq(roles.id, newRoleId))
        .limit(1);

      if (!role.length) {
        throw new AppError("Role not found", 404);
      }

      // Remove all existing roles for this user
      await txDb.delete(user_roles).where(eq(user_roles.user_id, userId));

      // Generate user role ID
      const userRoleId = generateUserRoleId();
      const now = new Date();

      // Assign new role to user
      await txDb.insert(user_roles).values({
        id: userRoleId,
        user_id: userId,
        role_id: newRoleId,
        created_at: now,
        updated_at: now,
      });

      // Get the created user role assignment with role name
      const createdUserRole = await txDb
        .select({
          id: user_roles.id,
          user_id: user_roles.user_id,
          role_id: user_roles.role_id,
          role_name: roles.name,
          created_at: user_roles.created_at,
          updated_at: user_roles.updated_at,
        })
        .from(user_roles)
        .innerJoin(roles, eq(user_roles.role_id, roles.id))
        .where(eq(user_roles.id, userRoleId))
        .limit(1);

      if (!createdUserRole.length) {
        throw new AppError("Failed to retrieve assigned role", 500);
      }

      return createdUserRole[0];
    });
  } catch (error) {
    logger.error(
      `Error replacing roles for user ${userId} with role ${newRoleId}`,
      error,
    );
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to replace user role", 500);
  }
}

// Remove role from user
export async function removeRoleFromUser(
  userId: number,
  roleId: number,
): Promise<boolean> {
  try {
    // Check if user has this role
    const existingUserRole = await db
      .select()
      .from(user_roles)
      .where(
        and(eq(user_roles.user_id, userId), eq(user_roles.role_id, roleId)),
      )
      .limit(1);

    if (!existingUserRole.length) {
      throw new AppError("User does not have this role", 404);
    }

    // Remove role from user
    await db
      .delete(user_roles)
      .where(
        and(eq(user_roles.user_id, userId), eq(user_roles.role_id, roleId)),
      );

    return true;
  } catch (error) {
    logger.error(`Error removing role ${roleId} from user ${userId}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to remove role from user", 500);
  }
}

// Get all roles for a user
export async function getUserRoles(userId: number): Promise<UserRoleOutput[]> {
  try {
    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length) {
      throw new AppError("User not found", 404);
    }

    // Get user roles
    const userRoles = await db
      .select({
        id: user_roles.id,
        user_id: user_roles.user_id,
        role_id: user_roles.role_id,
        role_name: roles.name,
        created_at: user_roles.created_at,
        updated_at: user_roles.updated_at,
      })
      .from(user_roles)
      .innerJoin(roles, eq(user_roles.role_id, roles.id))
      .where(eq(user_roles.user_id, userId));

    return userRoles;
  } catch (error) {
    logger.error(`Error getting roles for user ${userId}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get user roles", 500);
  }
}

// Helper function to map database role to RoleOutput type
function mapToRoleOutput(role: any): RoleOutput {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    created_at: role.created_at,
    updated_at: role.updated_at,
  };
}

// Export the service functions
export const roleService = {
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  listRoles,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  replaceUserRole,
};

// Default export for the service object
export default roleService;
