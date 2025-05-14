"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleController = exports.removeRoleFromUser = exports.replaceUserRole = exports.assignRoleToUser = exports.getUserRoles = exports.deleteRole = exports.updateRole = exports.getRoleById = exports.listRoles = exports.createRole = void 0;
const roles_service_1 = require("../services/roles.service");
const services_1 = require("../services");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("RoleController");
/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const createRole = async (req, res) => {
    try {
        const roleData = {
            name: req.body.name,
            description: req.body.description,
        };
        const role = await roles_service_1.roleService.createRole(roleData);
        res.status(201).json({
            message: "Role created successfully",
            role,
        });
    }
    catch (error) {
        logger.error("Create role error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Role Creation Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Role Creation Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.createRole = createRole;
/**
 * @swagger
 * /roles:
 *   get:
 *     summary: List all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const listRoles = async (req, res) => {
    try {
        const roles = await roles_service_1.roleService.listRoles();
        res.status(200).json({ roles });
    }
    catch (error) {
        logger.error("List roles error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Role Listing Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Role Listing Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.listRoles = listRoles;
/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
const getRoleById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                error: "Invalid Role ID",
                message: "Role ID must be a valid number",
            });
        }
        const role = await roles_service_1.roleService.getRoleById(id);
        res.status(200).json({ role });
    }
    catch (error) {
        logger.error(`Get role error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Role Retrieval Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Role Retrieval Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.getRoleById = getRoleById;
/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 *       409:
 *         description: Role name already exists
 *       500:
 *         description: Server error
 */
const updateRole = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                error: "Invalid Role ID",
                message: "Role ID must be a valid number",
            });
        }
        const roleData = {
            name: req.body.name,
            description: req.body.description,
        };
        const role = await roles_service_1.roleService.updateRole(id, roleData);
        res.status(200).json({
            message: "Role updated successfully",
            role,
        });
    }
    catch (error) {
        logger.error(`Update role error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Role Update Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Role Update Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.updateRole = updateRole;
/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 *       409:
 *         description: Role is in use
 *       500:
 *         description: Server error
 */
const deleteRole = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                error: "Invalid Role ID",
                message: "Role ID must be a valid number",
            });
        }
        await roles_service_1.roleService.deleteRole(id);
        res.status(200).json({
            message: "Role deleted successfully",
        });
    }
    catch (error) {
        logger.error(`Delete role error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Role Deletion Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Role Deletion Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.deleteRole = deleteRole;
/**
 * @swagger
 * /roles/users/{userId}:
 *   get:
 *     summary: Get all roles for a user
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User roles retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const getUserRoles = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({
                error: "Invalid User ID",
                message: "User ID must be a valid number",
            });
        }
        const userRoles = await roles_service_1.roleService.getUserRoles(userId);
        res.status(200).json({
            userRoles,
        });
    }
    catch (error) {
        logger.error(`Get user roles error: ${req.params.userId}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "User Roles Retrieval Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "User Roles Retrieval Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.getUserRoles = getUserRoles;
/**
 * @swagger
 * /roles/users/{userId}/assign/{roleId}:
 *   post:
 *     summary: Assign a role to a user
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Role assigned successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User or role not found
 *       409:
 *         description: User already has this role
 *       500:
 *         description: Server error
 */
const assignRoleToUser = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const roleId = Number(req.params.roleId);
        if (isNaN(userId) || isNaN(roleId)) {
            return res.status(400).json({
                error: "Invalid ID",
                message: "User ID and Role ID must be valid numbers",
            });
        }
        // Add additional logging to help diagnose issues
        logger.info(`Attempting to assign role ${roleId} to user ${userId}`);
        const userRole = await roles_service_1.roleService.assignRoleToUser(userId, roleId);
        // Get updated user to confirm role_id has changed
        const updatedUser = await services_1.userService.getUserById(userId);
        logger.info(`Successfully assigned role ${roleId} to user ${userId}. User role_id is now ${updatedUser.role_id}`);
        res.status(201).json({
            message: "Role assigned to user successfully",
            userRole,
            user: {
                id: updatedUser.id,
                role_id: updatedUser.role_id
            }
        });
    }
    catch (error) {
        logger.error(`Assign role error: User ${req.params.userId}, Role ${req.params.roleId}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Role Assignment Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Role Assignment Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.assignRoleToUser = assignRoleToUser;
/**
 * @swagger
 * /roles/users/{userId}/replace/{roleId}:
 *   post:
 *     summary: Replace all user roles with a single role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Role replaced successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User or role not found
 *       500:
 *         description: Server error
 */
const replaceUserRole = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const roleId = Number(req.params.roleId);
        if (isNaN(userId) || isNaN(roleId)) {
            return res.status(400).json({
                error: "Invalid ID",
                message: "User ID and Role ID must be valid numbers",
            });
        }
        logger.info(`Attempting to replace all roles for user ${userId} with role ${roleId}`);
        const userRole = await roles_service_1.roleService.replaceUserRole(userId, roleId);
        // Get updated user to confirm role_id has changed
        const updatedUser = await services_1.userService.getUserById(userId);
        logger.info(`Successfully replaced roles for user ${userId} with role ${roleId}. User role_id is now ${updatedUser.role_id}`);
        res.status(201).json({
            message: "User roles replaced successfully",
            userRole,
            user: {
                id: updatedUser.id,
                role_id: updatedUser.role_id
            }
        });
    }
    catch (error) {
        logger.error(`Replace role error: User ${req.params.userId}, Role ${req.params.roleId}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Role Replacement Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Role Replacement Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.replaceUserRole = replaceUserRole;
/**
 * @swagger
 * /roles/users/{userId}/remove/{roleId}:
 *   delete:
 *     summary: Remove a role from a user
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User does not have this role
 *       500:
 *         description: Server error
 */
const removeRoleFromUser = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const roleId = Number(req.params.roleId);
        if (isNaN(userId) || isNaN(roleId)) {
            return res.status(400).json({
                error: "Invalid ID",
                message: "User ID and Role ID must be valid numbers",
            });
        }
        logger.info(`Attempting to remove role ${roleId} from user ${userId}`);
        await roles_service_1.roleService.removeRoleFromUser(userId, roleId);
        // Get updated user to confirm role_id has been updated if applicable
        const updatedUser = await services_1.userService.getUserById(userId);
        logger.info(`Successfully removed role ${roleId} from user ${userId}. User role_id is now ${updatedUser.role_id}`);
        res.status(200).json({
            message: "Role removed from user successfully",
            user: {
                id: updatedUser.id,
                role_id: updatedUser.role_id
            }
        });
    }
    catch (error) {
        logger.error(`Remove role error: User ${req.params.userId}, Role ${req.params.roleId}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "Role Removal Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "Role Removal Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.removeRoleFromUser = removeRoleFromUser;
// Create object to export all controller functions together
exports.roleController = {
    createRole: exports.createRole,
    listRoles: exports.listRoles,
    getRoleById: exports.getRoleById,
    updateRole: exports.updateRole,
    deleteRole: exports.deleteRole,
    getUserRoles: exports.getUserRoles,
    assignRoleToUser: exports.assignRoleToUser,
    replaceUserRole: exports.replaceUserRole,
    removeRoleFromUser: exports.removeRoleFromUser,
};
// Default export for the controller object
exports.default = exports.roleController;
