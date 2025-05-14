import { Request, Response } from "express";
/**
 * @swagger
 * /testimonials:
 *   post:
 *     summary: Create a new testimonial
 *     tags: [Testimonials]
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
 *               - author_name
 *               - description
 *             properties:
 *               author_name:
 *                 type: string
 *               position:
 *                 type: string
 *               image:
 *                 type: string
 *               description:
 *                 type: string
 *               company:
 *                 type: string
 *               occupation:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Testimonial created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const createTestimonial: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /testimonials:
 *   get:
 *     summary: List all testimonials
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of testimonials
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const listTestimonials: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /testimonials/{id}:
 *   get:
 *     summary: Get testimonial by ID
 *     tags: [Testimonials]
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
 *         description: Testimonial found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Testimonial not found
 *       500:
 *         description: Server error
 */
export declare const getTestimonialById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /testimonials/{id}:
 *   put:
 *     summary: Update a testimonial
 *     tags: [Testimonials]
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
 *               author_name:
 *                 type: string
 *               position:
 *                 type: string
 *               image:
 *                 type: string
 *               description:
 *                 type: string
 *               company:
 *                 type: string
 *               occupation:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Testimonial updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Testimonial not found
 *       500:
 *         description: Server error
 */
export declare const updateTestimonial: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /testimonials/{id}:
 *   delete:
 *     summary: Delete a testimonial
 *     tags: [Testimonials]
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
 *         description: Testimonial deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Testimonial not found
 *       500:
 *         description: Server error
 */
export declare const deleteTestimonial: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const testimonialController: {
    createTestimonial: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listTestimonials: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getTestimonialById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateTestimonial: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteTestimonial: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default testimonialController;
//# sourceMappingURL=testimonial.controller.d.ts.map