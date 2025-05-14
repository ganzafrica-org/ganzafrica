import { Request, Response } from "express";
/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new team member
 *     tags: [Teams]
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
 *               - team_type_id
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               photo_url:
 *                 type: string
 *               bio:
 *                 type: string
 *               email:
 *                 type: string
 *               profile_link:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               team_type_id:
 *                 type: number
 *     responses:
 *       201:
 *         description: Team member created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const createTeam: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /teams:
 *   get:
 *     summary: List all team members
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: team_type_id
 *         schema:
 *           type: number
 *         description: Filter teams by team type ID
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *         description: Field to sort by (defaults to created_at)
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc or desc, defaults to desc)
 *     responses:
 *       200:
 *         description: List of team members
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const listTeams: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get team member by ID
 *     tags: [Teams]
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
 *         description: Team member found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team member not found
 *       500:
 *         description: Server error
 */
export declare const getTeamById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     summary: Update a team member
 *     tags: [Teams]
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
 *               position:
 *                 type: string
 *               photo_url:
 *                 type: string
 *               bio:
 *                 type: string
 *               email:
 *                 type: string
 *               profile_link:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               team_type_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Team member updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team member not found
 *       500:
 *         description: Server error
 */
export declare const updateTeam: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Delete a team member
 *     tags: [Teams]
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
 *         description: Team member deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team member not found
 *       500:
 *         description: Server error
 */
export declare const deleteTeam: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const teamController: {
    createTeam: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listTeams: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getTeamById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateTeam: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteTeam: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default teamController;
//# sourceMappingURL=team-controller.d.ts.map