"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importUsers = exports.listUsers = exports.deleteUser = exports.updateUser = exports.getUserById = exports.createUser = void 0;
const services_1 = require("../services");
const roles_service_1 = require("../services/roles.service");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("UserController");
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Users]
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
 *               - email
 *               - password
 *               - name
 *               - role_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *               role_id:
 *                 type: integer
 *               avatar_url:
 *                 type: string
 *                 format: uri
 *               email_verified:
 *                 type: boolean
 *               sendVerificationEmail:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
const createUser = async (req, res) => {
    try {
        const userData = req.body;
        const user = await services_1.userService.createUser(userData);
        // Get role name for response
        const role = await roles_service_1.roleService.getRoleById(user.role_id);
        res.status(201).json({
            message: config_1.constants.SUCCESS_MESSAGES.USER_CREATED,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role_name: role.name,
                email_verified: user.email_verified,
            },
        });
    }
    catch (error) {
        logger.error("Create user error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "User Creation Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "User Creation Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.createUser = createUser;
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await services_1.userService.getUserById(id);
        res.status(200).json({ user });
    }
    catch (error) {
        logger.error(`Get user error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "User Retrieval Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "User Retrieval Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.getUserById = getUserById;
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
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
 *               role_id:
 *                 type: integer
 *               avatar_url:
 *                 type: string
 *                 format: uri
 *               email_verified:
 *                 type: boolean
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.body;
        // Need to check if the current user is updating their own profile
        // or if they're an admin (who can update any profile)
        const currentUser = await services_1.userService.getUserById(req.user.id);
        const adminRole = await roles_service_1.roleService.getRoleByName("admin");
        // Only allow users to update themselves unless they're an admin
        if (req.user?.id !== id && currentUser.role_id !== adminRole.id) {
            return res.status(403).json({
                error: "Forbidden",
                message: config_1.constants.ERROR_MESSAGES.UNAUTHORIZED,
            });
        }
        // If user is updating their own profile but not an admin,
        // prevent them from changing their role
        if (req.user?.id === id &&
            currentUser.role_id !== adminRole.id &&
            userData.role_id) {
            delete userData.role_id; // Remove role_id from update data
        }
        const user = await services_1.userService.updateUser(id, userData);
        res.status(200).json({
            message: config_1.constants.SUCCESS_MESSAGES.USER_UPDATED,
            user,
        });
    }
    catch (error) {
        logger.error(`Update user error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "User Update Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "User Update Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.updateUser = updateUser;
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user (soft delete)
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await services_1.userService.deleteUser(id);
        res.status(200).json({
            message: config_1.constants.SUCCESS_MESSAGES.USER_DELETED,
        });
    }
    catch (error) {
        logger.error(`Delete user error: ${req.params.id}`, error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "User Deletion Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "User Deletion Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.deleteUser = deleteUser;
/**
 * @swagger
 * /users:
 *   get:
 *     summary: List users with pagination and filtering
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [name, email, role_id, created_at]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
const listUsers = async (req, res) => {
    try {
        const params = {
            page: parseInt(req.query.page, 10) || 1,
            limit: parseInt(req.query.limit, 10) || 10,
            search: req.query.search,
            sort_by: req.query.sort_by,
            sort_order: req.query.sort_order,
            role_id: req.query.role_id
                ? parseInt(req.query.role_id, 10)
                : undefined,
            is_active: req.query.is_active === undefined
                ? undefined
                : req.query.is_active === "true",
        };
        const { users, total } = await services_1.userService.listUsers(params);
        res.status(200).json({
            users,
            pagination: {
                total,
                page: params.page,
                limit: params.limit,
                pages: Math.ceil(total / params.limit),
            },
        });
    }
    catch (error) {
        logger.error("List users error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "User Listing Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "User Listing Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.listUsers = listUsers;
/**
 * @swagger
 * /users/import:
 *   post:
 *     summary: Import multiple users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - email
 *                 - password
 *                 - name
 *                 - role_id
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                 password:
 *                   type: string
 *                   minLength: 8
 *                 name:
 *                   type: string
 *                 role_id:
 *                   type: integer
 *                 avatar_url:
 *                   type: string
 *                   format: uri
 *                 email_verified:
 *                   type: boolean
 *                 sendVerificationEmail:
 *                   type: boolean
 *     responses:
 *       200:
 *         description: Users imported successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
const importUsers = async (req, res) => {
    try {
        const usersData = req.body;
        const result = await services_1.userService.importUsers(usersData);
        res.status(200).json({
            message: `Successfully imported ${result.successful} users. Failed to import ${result.failed} users.`,
            ...result,
        });
    }
    catch (error) {
        logger.error("Import users error", error);
        if (error instanceof middlewares_1.AppError) {
            return res.status(error.statusCode).json({
                error: "User Import Error",
                message: error.message,
            });
        }
        res.status(500).json({
            error: "User Import Error",
            message: config_1.constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
};
exports.importUsers = importUsers;
