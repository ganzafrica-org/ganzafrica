import { Request, Response } from "express";
/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - status
 *               - start_date
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [planned, active, completed, cancelled, on_hold]
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               category_id:
 *                 type: integer
 *               partner_id:
 *                 type: integer
 *               location:
 *                 type: string
 *               goals:
 *                 type: object
 *                 properties:
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         completed:
 *                           type: boolean
 *                         order:
 *                           type: integer
 *               outcomes:
 *                 type: object
 *                 properties:
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         status:
 *                           type: string
 *                         order:
 *                           type: integer
 *               media:
 *                 type: object
 *                 properties:
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         type:
 *                           type: string
 *                           enum: [image, video]
 *                         url:
 *                           type: string
 *                         cover:
 *                           type: boolean
 *                         tag:
 *                           type: string
 *                           enum: [feature, description, others]
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         size:
 *                           type: integer
 *                         duration:
 *                           type: integer
 *                         thumbnailUrl:
 *                           type: string
 *                         order:
 *                           type: integer
 *               other_information:
 *                 type: object
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - team_id
 *                     - role
 *                     - start_date
 *                   properties:
 *                     team_id:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [lead, member, supervisor, contributor]
 *                     start_date:
 *                       type: string
 *                       format: date-time
 *                     end_date:
 *                       type: string
 *                       format: date-time
 *               partners:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - partner_id
 *                   properties:
 *                     partner_id:
 *                       type: integer
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple files can be uploaded
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const createProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
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
 *         description: Project found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
export declare const getProjectById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [planned, active, completed, cancelled, on_hold]
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               category_id:
 *                 type: integer
 *               partner_id:
 *                 type: integer
 *               location:
 *                 type: string
 *               goals:
 *                 type: object
 *               outcomes:
 *                 type: object
 *               media:
 *                 type: object
 *               other_information:
 *                 type: object
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple files can be uploaded
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
export declare const updateProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete project and all related data
 *     tags: [Projects]
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
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
export declare const deleteProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /projects:
 *   get:
 *     summary: List projects with pagination and filtering
 *     tags: [Projects]
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
 *           enum: [name, status, start_date, created_at]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planned, active, completed, cancelled, on_hold]
 *       - in: query
 *         name: team_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: partner_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of projects
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const listProjects: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const projectController: {
    createProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getProjectById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listProjects: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default projectController;
//# sourceMappingURL=project.d.ts.map