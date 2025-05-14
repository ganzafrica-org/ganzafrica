import { Request, Response } from "express";
/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Submit a new contact form message
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               message:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact form submitted successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
export declare const createContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: List all contact form submissions
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter contacts by status
 *       - in: query
 *         name: is_resolved
 *         schema:
 *           type: boolean
 *         description: Filter contacts by resolution status
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter contacts by location
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
 *         description: List of contact form submissions
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const listContacts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /contacts/{id}:
 *   get:
 *     summary: Get contact form submission by ID
 *     tags: [Contacts]
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
 *         description: Contact form submission found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contact form submission not found
 *       500:
 *         description: Server error
 */
export declare const getContactById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /contacts/{id}:
 *   put:
 *     summary: Update a contact form submission
 *     tags: [Contacts]
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
 *               status:
 *                 type: string
 *               is_resolved:
 *                 type: boolean
 *               responded_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Contact form submission updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contact form submission not found
 *       500:
 *         description: Server error
 */
export declare const updateContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /contacts/{id}:
 *   delete:
 *     summary: Delete a contact form submission
 *     tags: [Contacts]
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
 *         description: Contact form submission deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contact form submission not found
 *       500:
 *         description: Server error
 */
export declare const deleteContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /newsletter/subscribe:
 *   post:
 *     summary: Subscribe to newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscribed to newsletter successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
export declare const subscribeNewsletter: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /newsletter/unsubscribe/{id}:
 *   post:
 *     summary: Unsubscribe from newsletter
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unsubscribed from newsletter successfully
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Server error
 */
export declare const unsubscribeNewsletter: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /newsletter/subscribers:
 *   get:
 *     summary: List all newsletter subscribers
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *         description: Only return active subscribers
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *         description: Field to sort by (defaults to subscribed_at)
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc or desc, defaults to desc)
 *     responses:
 *       200:
 *         description: List of newsletter subscribers
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const listNewsletterSubscribers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const contactController: {
    createContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listContacts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getContactById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    subscribeNewsletter: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    unsubscribeNewsletter: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listNewsletterSubscribers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default contactController;
//# sourceMappingURL=contact.d.ts.map