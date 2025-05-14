import { Request, Response } from "express";
/**
 * @swagger
 * /team-types:
 *   post:
 *     summary: Create a new team type
 *     tags: [TeamTypes]
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
 *         description: Team type created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const createTeamType: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /team-types:
 *   get:
 *     summary: List all team types
 *     tags: [TeamTypes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of team types
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const listTeamTypes: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /team-types/{id}:
 *   get:
 *     summary: Get team type by ID
 *     tags: [TeamTypes]
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
 *         description: Team type found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team type not found
 *       500:
 *         description: Server error
 */
export declare const getTeamTypeById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /team-types/{id}:
 *   put:
 *     summary: Update a team type
 *     tags: [TeamTypes]
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
 *         description: Team type updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team type not found
 *       409:
 *         description: Team type name already exists
 *       500:
 *         description: Server error
 */
export declare const updateTeamType: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /team-types/{id}:
 *   delete:
 *     summary: Delete a team type
 *     tags: [TeamTypes]
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
 *         description: Team type deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team type not found
 *       500:
 *         description: Server error
 */
export declare const deleteTeamType: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const teamTypeController: {
    createTeamType: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listTeamTypes: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getTeamTypeById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateTeamType: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteTeamType: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default teamTypeController;
//# sourceMappingURL=team-type-controller.d.ts.map