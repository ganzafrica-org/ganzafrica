import { Request, Response } from 'express';
import { userService } from '../services';
import { AppError } from '../middlewares';
import { constants, Logger } from '../config';

const logger = new Logger('UserController');

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
 *               - base_role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *               base_role:
 *                 type: string
 *                 enum: [public, applicant, fellow, employee, alumni]
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
export const createUser = async (req: Request, res: Response) => {
    try {
        const userData = req.body;

        const user = await userService.createUser(userData);

        res.status(201).json({
            message: constants.SUCCESS_MESSAGES.USER_CREATED,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                base_role: user.base_role,
                email_verified: user.email_verified
            }
        });
    } catch (error) {
        logger.error('Create user error', error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: 'User Creation Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'User Creation Error',
            message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

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
export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await userService.getUserById(id);

        res.status(200).json({ user });
    } catch (error) {
        logger.error(`Get user error: ${req.params.id}`, error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: 'User Retrieval Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'User Retrieval Error',
            message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

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
 *               base_role:
 *                 type: string
 *                 enum: [public, applicant, fellow, employee, alumni]
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
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userData = req.body;

        // Only allow users to update themselves unless they're an admin
        if (req.user?.id !== id && req.user?.base_role !== 'admin') {
            return res.status(403).json({
                error: 'Forbidden',
                message: constants.ERROR_MESSAGES.UNAUTHORIZED
            });
        }

        const user = await userService.updateUser(id, userData);

        res.status(200).json({
            message: constants.SUCCESS_MESSAGES.USER_UPDATED,
            user
        });
    } catch (error) {
        logger.error(`Update user error: ${req.params.id}`, error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: 'User Update Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'User Update Error',
            message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

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
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await userService.deleteUser(id);

        res.status(200).json({
            message: constants.SUCCESS_MESSAGES.USER_DELETED
        });
    } catch (error) {
        logger.error(`Delete user error: ${req.params.id}`, error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: 'User Deletion Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'User Deletion Error',
            message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

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
 *           enum: [name, email, base_role, created_at]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
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

export const listUsers = async (req: Request, res: Response) => {
    try {
        const params = {
            page: parseInt(req.query.page as string, 10) || 1,
            limit: parseInt(req.query.limit as string, 10) || 10,
            search: req.query.search as string,
            sort_by: req.query.sort_by as string,
            sort_order: req.query.sort_order as 'asc' | 'desc',
            role: req.query.role as string,
            is_active: req.query.is_active === 'true'
        };

        const { users, total } = await userService.listUsers(params);

        res.status(200).json({
            users,
            pagination: {
                total,
                page: params.page,
                limit: params.limit,
                pages: Math.ceil(total / params.limit)
            }
        });
    } catch (error) {
        logger.error('List users error', error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: 'User Listing Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'User Listing Error',
            message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

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
 *                 - base_role
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                 password:
 *                   type: string
 *                   minLength: 8
 *                 name:
 *                   type: string
 *                 base_role:
 *                   type: string
 *                   enum: [public, applicant, fellow, employee, alumni]
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
export const importUsers = async (req: Request, res: Response) => {
    try {
        const usersData = req.body;

        const result = await userService.importUsers(usersData);

        res.status(200).json({
            message: `Successfully imported ${result.successful} users. Failed to import ${result.failed} users.`,
            ...result
        });
    } catch (error) {
        logger.error('Import users error', error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: 'User Import Error',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'User Import Error',
            message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};