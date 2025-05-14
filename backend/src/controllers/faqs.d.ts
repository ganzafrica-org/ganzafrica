import { Request, Response } from "express";
/**
 * @swagger
 * /faqs:
 *   post:
 *     summary: Create a new FAQ
 *     tags: [FAQs]
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
 *               - question
 *               - answer
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: FAQ created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const createFaq: (req: Request, res: Response) => Promise<void>;
/**
 * @swagger
 * /faqs:
 *   get:
 *     summary: List all FAQs
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *         description: If true, returns only active FAQs
 *     responses:
 *       200:
 *         description: List of FAQs
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const listFaqs: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /faqs/{id}:
 *   get:
 *     summary: Get FAQ by ID
 *     tags: [FAQs]
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
 *         description: FAQ found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
export declare const getFaqById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /faqs/{id}:
 *   put:
 *     summary: Update a FAQ
 *     tags: [FAQs]
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
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               view_count:
 *                 type: integer
 *     responses:
 *       200:
 *         description: FAQ updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
export declare const updateFaq: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /faqs/{id}:
 *   delete:
 *     summary: Delete a FAQ
 *     tags: [FAQs]
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
 *         description: FAQ deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Server error
 */
export declare const deleteFaq: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const faqController: {
    createFaq: (req: Request, res: Response) => Promise<void>;
    listFaqs: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getFaqById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateFaq: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteFaq: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default faqController;
//# sourceMappingURL=faqs.d.ts.map