import { Request, Response } from "express";
/**
 * @swagger
 * /partners:
 *   post:
 *     summary: Create a new partner
 *     tags: [Partners]
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
 *               logo:
 *                 type: string
 *               website_url:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Partner created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const createPartner: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /partners:
 *   get:
 *     summary: List all partners
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of partners
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const listPartners: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /partners/{id}:
 *   get:
 *     summary: Get partner by ID
 *     tags: [Partners]
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
 *         description: Partner found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Partner not found
 *       500:
 *         description: Server error
 */
export declare const getPartnerById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /partners/{id}:
 *   put:
 *     summary: Update a partner
 *     tags: [Partners]
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
 *               logo:
 *                 type: string
 *               website_url:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Partner updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Partner not found
 *       409:
 *         description: Partner name already exists
 *       500:
 *         description: Server error
 */
export declare const updatePartner: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /partners/{id}:
 *   delete:
 *     summary: Delete a partner
 *     tags: [Partners]
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
 *         description: Partner deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Partner not found
 *       500:
 *         description: Server error
 */
export declare const deletePartner: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const partnerController: {
    createPartner: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listPartners: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getPartnerById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updatePartner: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deletePartner: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default partnerController;
//# sourceMappingURL=partner.controller.d.ts.map