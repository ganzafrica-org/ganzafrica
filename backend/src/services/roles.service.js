"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleService = void 0;
exports.createRole = createRole;
exports.getRoleById = getRoleById;
exports.getRoleByName = getRoleByName;
exports.updateRole = updateRole;
exports.deleteRole = deleteRole;
exports.listRoles = listRoles;
exports.assignRoleToUser = assignRoleToUser;
exports.replaceUserRole = replaceUserRole;
exports.removeRoleFromUser = removeRoleFromUser;
exports.getUserRoles = getUserRoles;
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("RoleService");
// Create a new role
async function createRole(roleData) {
    try {
        // Check if a role with the same name already exists
        const existingRole = await client_1.db
            .select()
            .from(schema_1.roles)
            .where((0, drizzle_orm_1.eq)(schema_1.roles.name, roleData.name))
            .limit(1);
        if (existingRole.length > 0) {
            throw new middlewares_1.AppError(`Role with name '${roleData.name}' already exists`, 409);
        }
        // Get the maximum ID to generate next ID
        const maxIdResult = await client_1.db.select({ maxId: (0, drizzle_orm_1.max)(schema_1.roles.id) }).from(schema_1.roles);
        const maxId = maxIdResult[0]?.maxId || 1000;
        const roleId = maxId + 1;
        // Insert the role with an explicit ID
        await client_1.db.insert(schema_1.roles).values({
            id: roleId,
            name: roleData.name,
            description: roleData.description || null,
            created_at: new Date(),
            updated_at: new Date(),
        });
        // Get the created role
        const createdRole = await client_1.db
            .select()
            .from(schema_1.roles)
            .where((0, drizzle_orm_1.eq)(schema_1.roles.id, roleId))
            .limit(1);
        if (!createdRole.length) {
            throw new middlewares_1.AppError("Failed to create role", 500);
        }
        return mapToRoleOutput(createdRole[0]);
    }
    catch (error) {
        logger.error("Error creating role", error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to create role", 500);
    }
}
// Get role by ID
async function getRoleById(id) {
    try {
        const result = await client_1.db
            .select()
            .from(schema_1.roles)
            .where((0, drizzle_orm_1.eq)(schema_1.roles.id, id))
            .limit(1);
        if (!result.length) {
            throw new middlewares_1.AppError("Role not found", 404);
        }
        return mapToRoleOutput(result[0]);
    }
    catch (error) {
        logger.error(`Error getting role by ID: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to get role", 500);
    }
}
// Get role by name
async function getRoleByName(name) {
    try {
        const result = await client_1.db
            .select()
            .from(schema_1.roles)
            .where((0, drizzle_orm_1.eq)(schema_1.roles.name, name))
            .limit(1);
        if (!result.length) {
            throw new middlewares_1.AppError("Role not found", 404);
        }
        return mapToRoleOutput(result[0]);
    }
    catch (error) {
        logger.error(`Error getting role by name: ${name}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to get role", 500);
    }
}
// Update role
async function updateRole(id, roleData) {
    try {
        // Check if role exists
        const existingRole = await client_1.db
            .select()
            .from(schema_1.roles)
            .where((0, drizzle_orm_1.eq)(schema_1.roles.id, id))
            .limit(1);
        if (!existingRole.length) {
            throw new middlewares_1.AppError("Role not found", 404);
        }
        // If updating name, check if the new name already exists
        if (roleData.name && roleData.name !== existingRole[0].name) {
            const nameExists = await client_1.db
                .select()
                .from(schema_1.roles)
                .where((0, drizzle_orm_1.eq)(schema_1.roles.name, roleData.name))
                .limit(1);
            if (nameExists.length > 0) {
                throw new middlewares_1.AppError(`Role with name '${roleData.name}' already exists`, 409);
            }
        }
        // Update role
        await client_1.db
            .update(schema_1.roles)
            .set({
            ...(roleData.name ? { name: roleData.name } : {}),
            ...(roleData.description !== undefined
                ? { description: roleData.description }
                : {}),
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.roles.id, id));
        // Get updated role
        const updatedRole = await client_1.db
            .select()
            .from(schema_1.roles)
            .where((0, drizzle_orm_1.eq)(schema_1.roles.id, id))
            .limit(1);
        return mapToRoleOutput(updatedRole[0]);
    }
    catch (error) {
        logger.error(`Error updating role: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to update role", 500);
    }
}
// Delete role
async function deleteRole(id) {
    try {
        // Check if role exists
        const existingRole = await client_1.db
            .select()
            .from(schema_1.roles)
            .where((0, drizzle_orm_1.eq)(schema_1.roles.id, id))
            .limit(1);
        if (!existingRole.length) {
            throw new middlewares_1.AppError("Role not found", 404);
        }
        // Check if the role is assigned to any users
        const roleInUse = await client_1.db
            .select()
            .from(schema_1.user_roles)
            .where((0, drizzle_orm_1.eq)(schema_1.user_roles.role_id, id))
            .limit(1);
        if (roleInUse.length > 0) {
            throw new middlewares_1.AppError("Cannot delete role that is assigned to users", 409);
        }
        // Delete the role
        await client_1.db.delete(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, id));
        return true;
    }
    catch (error) {
        logger.error(`Error deleting role: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to delete role", 500);
    }
}
// List all roles
async function listRoles() {
    try {
        const result = await client_1.db.select().from(schema_1.roles);
        return result.map(mapToRoleOutput);
    }
    catch (error) {
        logger.error("Error listing roles", error);
        throw new middlewares_1.AppError("Failed to list roles", 500);
    }
}
// Assign role to user
async function assignRoleToUser(userId, roleId) {
    try {
        return await (0, client_1.withDbTransaction)(async (txDb) => {
            // First check if user exists
            const user = await txDb
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId))
                .limit(1);
            if (!user.length) {
                throw new middlewares_1.AppError("User not found", 404);
            }
            // Check if role exists
            const role = await txDb
                .select()
                .from(schema_1.roles)
                .where((0, drizzle_orm_1.eq)(schema_1.roles.id, roleId))
                .limit(1);
            if (!role.length) {
                throw new middlewares_1.AppError("Role not found", 404);
            }
            // Check if user already has this role
            const existingUserRole = await txDb
                .select()
                .from(schema_1.user_roles)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.user_roles.user_id, userId), (0, drizzle_orm_1.eq)(schema_1.user_roles.role_id, roleId)))
                .limit(1);
            if (existingUserRole.length > 0) {
                throw new middlewares_1.AppError("User already has this role", 409);
            }
            // Get maximum ID to generate next ID safely
            const maxIdResult = await txDb.select({ maxId: (0, drizzle_orm_1.max)(schema_1.user_roles.id) }).from(schema_1.user_roles);
            const maxUserRoleId = maxIdResult[0]?.maxId || 5000;
            const userRoleId = maxUserRoleId + 1;
            const now = new Date();
            // Perform the actual insertion of user_role
            try {
                await txDb.insert(schema_1.user_roles).values({
                    id: userRoleId,
                    user_id: userId,
                    role_id: roleId,
                    created_at: now,
                    updated_at: now,
                });
            }
            catch (insertError) {
                logger.error(`Error inserting user role: ${insertError}`);
                throw new middlewares_1.AppError("Database error while assigning role", 500);
            }
            // Update the user's role_id in the users table
            try {
                await txDb.update(schema_1.users)
                    .set({
                    role_id: roleId,
                    updated_at: now,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            }
            catch (updateError) {
                logger.error(`Error updating user role_id: ${updateError}`);
                throw new middlewares_1.AppError("Database error while updating user's role_id", 500);
            }
            // Get the created user role assignment with role name
            const createdUserRole = await txDb
                .select({
                id: schema_1.user_roles.id,
                user_id: schema_1.user_roles.user_id,
                role_id: schema_1.user_roles.role_id,
                role_name: schema_1.roles.name,
                created_at: schema_1.user_roles.created_at,
                updated_at: schema_1.user_roles.updated_at,
            })
                .from(schema_1.user_roles)
                .innerJoin(schema_1.roles, (0, drizzle_orm_1.eq)(schema_1.user_roles.role_id, schema_1.roles.id))
                .where((0, drizzle_orm_1.eq)(schema_1.user_roles.id, userRoleId))
                .limit(1);
            if (!createdUserRole.length) {
                throw new middlewares_1.AppError("Failed to retrieve assigned role", 500);
            }
            return createdUserRole[0];
        });
    }
    catch (error) {
        logger.error(`Error assigning role ${roleId} to user ${userId}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to assign role to user", 500);
    }
}
// Replace all user roles with a single role
async function replaceUserRole(userId, newRoleId) {
    try {
        return await (0, client_1.withDbTransaction)(async (txDb) => {
            // Check if user exists
            const user = await txDb
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId))
                .limit(1);
            if (!user.length) {
                throw new middlewares_1.AppError("User not found", 404);
            }
            // Check if role exists
            const role = await txDb
                .select()
                .from(schema_1.roles)
                .where((0, drizzle_orm_1.eq)(schema_1.roles.id, newRoleId))
                .limit(1);
            if (!role.length) {
                throw new middlewares_1.AppError("Role not found", 404);
            }
            // Remove all existing roles for this user
            await txDb.delete(schema_1.user_roles).where((0, drizzle_orm_1.eq)(schema_1.user_roles.user_id, userId));
            // Get maximum ID to generate next ID safely
            const maxIdResult = await txDb.select({ maxId: (0, drizzle_orm_1.max)(schema_1.user_roles.id) }).from(schema_1.user_roles);
            const maxUserRoleId = maxIdResult[0]?.maxId || 5000;
            const userRoleId = maxUserRoleId + 1;
            const now = new Date();
            // Assign new role to user
            await txDb.insert(schema_1.user_roles).values({
                id: userRoleId,
                user_id: userId,
                role_id: newRoleId,
                created_at: now,
                updated_at: now,
            });
            // Update the user's role_id in the users table
            await txDb.update(schema_1.users)
                .set({
                role_id: newRoleId,
                updated_at: now,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            // Get the created user role assignment with role name
            const createdUserRole = await txDb
                .select({
                id: schema_1.user_roles.id,
                user_id: schema_1.user_roles.user_id,
                role_id: schema_1.user_roles.role_id,
                role_name: schema_1.roles.name,
                created_at: schema_1.user_roles.created_at,
                updated_at: schema_1.user_roles.updated_at,
            })
                .from(schema_1.user_roles)
                .innerJoin(schema_1.roles, (0, drizzle_orm_1.eq)(schema_1.user_roles.role_id, schema_1.roles.id))
                .where((0, drizzle_orm_1.eq)(schema_1.user_roles.id, userRoleId))
                .limit(1);
            if (!createdUserRole.length) {
                throw new middlewares_1.AppError("Failed to retrieve assigned role", 500);
            }
            return createdUserRole[0];
        });
    }
    catch (error) {
        logger.error(`Error replacing roles for user ${userId} with role ${newRoleId}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to replace user role", 500);
    }
}
// Remove role from user
async function removeRoleFromUser(userId, roleId) {
    try {
        return await (0, client_1.withDbTransaction)(async (txDb) => {
            // Check if user has this role
            const existingUserRole = await txDb
                .select()
                .from(schema_1.user_roles)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.user_roles.user_id, userId), (0, drizzle_orm_1.eq)(schema_1.user_roles.role_id, roleId)))
                .limit(1);
            if (!existingUserRole.length) {
                throw new middlewares_1.AppError("User does not have this role", 404);
            }
            // Remove role from user in user_roles table
            await txDb
                .delete(schema_1.user_roles)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.user_roles.user_id, userId), (0, drizzle_orm_1.eq)(schema_1.user_roles.role_id, roleId)));
            // Get remaining roles for this user, if any
            const remainingRoles = await txDb
                .select()
                .from(schema_1.user_roles)
                .where((0, drizzle_orm_1.eq)(schema_1.user_roles.user_id, userId))
                .orderBy(schema_1.user_roles.created_at, 'desc');
            // Update the users table to reflect the most recent role assignment
            // If no roles remain, you might need a default role or handle that accordingly
            if (remainingRoles.length > 0) {
                await txDb.update(schema_1.users)
                    .set({
                    role_id: remainingRoles[0].role_id,
                    updated_at: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            }
            else {
                // If the user has no roles left, you might want to assign a default role
                // or handle this case according to your application's requirements
                logger.warn(`User ${userId} has no remaining roles after removal.`);
                // Option 1: Set to a default role (e.g., "user" role with ID 1)
                // await txDb.update(users)
                //   .set({
                //     role_id: 1, // ID of default "user" role
                //     updated_at: new Date(),
                //   })
                //   .where(eq(users.id, userId));
                // Option 2: Log a warning but don't change user's current role_id
                // This is the current implementation
            }
            return true;
        });
    }
    catch (error) {
        logger.error(`Error removing role ${roleId} from user ${userId}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to remove role from user", 500);
    }
}
// Get all roles for a user
async function getUserRoles(userId) {
    try {
        // Check if user exists
        const user = await client_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId))
            .limit(1);
        if (!user.length) {
            throw new middlewares_1.AppError("User not found", 404);
        }
        // Get user roles
        const userRoles = await client_1.db
            .select({
            id: schema_1.user_roles.id,
            user_id: schema_1.user_roles.user_id,
            role_id: schema_1.user_roles.role_id,
            role_name: schema_1.roles.name,
            created_at: schema_1.user_roles.created_at,
            updated_at: schema_1.user_roles.updated_at,
        })
            .from(schema_1.user_roles)
            .innerJoin(schema_1.roles, (0, drizzle_orm_1.eq)(schema_1.user_roles.role_id, schema_1.roles.id))
            .where((0, drizzle_orm_1.eq)(schema_1.user_roles.user_id, userId));
        return userRoles;
    }
    catch (error) {
        logger.error(`Error getting roles for user ${userId}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to get user roles", 500);
    }
}
// Helper function to map database role to RoleOutput type
function mapToRoleOutput(role) {
    return {
        id: role.id,
        name: role.name,
        description: role.description,
        created_at: role.created_at,
        updated_at: role.updated_at,
    };
}
// Export the service functions
exports.roleService = {
    createRole,
    getRoleById,
    getRoleByName,
    updateRole,
    deleteRole,
    listRoles,
    assignRoleToUser,
    removeRoleFromUser,
    getUserRoles,
    replaceUserRole,
};
// Default export for the service object
exports.default = exports.roleService;
