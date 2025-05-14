import { Request, Response } from "express";
/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new project category
 *     tags: [Categories]
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
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const createCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const listCategories: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
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
 *         description: Category found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
export declare const getCategoryById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
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
 *         description: Category updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name already exists
 *       500:
 *         description: Server error
 */
export declare const updateCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
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
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
export declare const deleteCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const categoryController: {
    createCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listCategories: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getCategoryById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default categoryController;
//# sourceMappingURL=categories.d.ts.map