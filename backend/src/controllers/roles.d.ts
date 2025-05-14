import { Request, Response } from "express";
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
export declare const createRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const listRoles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const getRoleById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const updateRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const deleteRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const getUserRoles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const assignRoleToUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const replaceUserRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
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
export declare const removeRoleFromUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const roleController: {
    createRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listRoles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getRoleById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getUserRoles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    assignRoleToUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    replaceUserRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    removeRoleFromUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default roleController;
//# sourceMappingURL=roles.d.ts.map