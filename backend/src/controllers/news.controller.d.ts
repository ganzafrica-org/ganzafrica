import { Request, Response } from "express";
/**
 * @swagger
 * /news:
 *   post:
 *     summary: Create a new news item
 *     tags: [News]
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
 *               - title
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [published, not_published]
 *               publish_date:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *                 enum: [all, news, blogs, reports, publications]
 *               key_lessons:
 *                 type: string
 *               media:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: News item created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const createNews: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /news:
 *   get:
 *     summary: List news items with filtering
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tag IDs
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Pagination limit
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Pagination offset
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sortDir
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: List of news items
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const listNews: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /news/{id}:
 *   get:
 *     summary: Get news item by ID
 *     tags: [News]
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
 *         description: News item found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: News item not found
 *       500:
 *         description: Server error
 */
export declare const getNewsById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /news/{id}:
 *   put:
 *     summary: Update a news item
 *     tags: [News]
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [published, not_published]
 *               publish_date:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *                 enum: [all, news, blogs, reports, publications]
 *               key_lessons:
 *                 type: string
 *               media:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: News item updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: News item not found
 *       500:
 *         description: Server error
 */
export declare const updateNews: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /news/{id}:
 *   delete:
 *     summary: Delete a news item
 *     tags: [News]
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
 *         description: News item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: News item not found
 *       500:
 *         description: Server error
 */
export declare const deleteNews: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /news/tags:
 *   get:
 *     summary: List all news tags
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of news tags
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const listTags: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /news/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [News]
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
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export declare const createTag: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /news/tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [News]
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
 *         description: Tag deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 */
export declare const deleteTag: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const newsController: {
    createNews: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listNews: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getNewsById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateNews: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteNews: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listTags: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createTag: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteTag: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default newsController;
//# sourceMappingURL=news.controller.d.ts.map