import { Request, Response } from "express";
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
export declare const createUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const getUserById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const updateUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const deleteUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const listUsers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const importUsers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=user.d.ts.map