import { Request, Response } from 'express';
/**
 * @swagger
 * /opportunities:
 *   post:
 *     summary: Create a new opportunity (fellowship or employment)
 *     tags: [Opportunities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CreateFellowshipRequest'
 *               - $ref: '#/components/schemas/CreateEmploymentRequest'
 *     responses:
 *       201:
 *         description: Opportunity created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
export declare const createOpportunity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /opportunities:
 *   get:
 *     summary: List all opportunities
 *     tags: [Opportunities]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [fellowship, employment]
 *         description: Filter by opportunity type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, closed, cancelled]
 *         description: Filter by opportunity status
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *     responses:
 *       200:
 *         description: List of opportunities
 *       500:
 *         description: Server error
 */
export declare const listOpportunities: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /opportunities/{id}:
 *   get:
 *     summary: Get opportunity by ID
 *     tags: [Opportunities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Opportunity found
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
export declare const getOpportunityById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /opportunities/{id}:
 *   put:
 *     summary: Update an opportunity
 *     tags: [Opportunities]
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
 *             oneOf:
 *               - $ref: '#/components/schemas/UpdateFellowshipRequest'
 *               - $ref: '#/components/schemas/UpdateEmploymentRequest'
 *     responses:
 *       200:
 *         description: Opportunity updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
export declare const updateOpportunity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /opportunities/{id}/publish:
 *   post:
 *     summary: Publish an opportunity
 *     tags: [Opportunities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Opportunity published successfully
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
export declare const publishOpportunity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /opportunities/{id}/close:
 *   post:
 *     summary: Close an opportunity
 *     tags: [Opportunities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Opportunity closed successfully
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
export declare const closeOpportunity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /opportunities/{id}:
 *   delete:
 *     summary: Delete an opportunity
 *     tags: [Opportunities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Opportunity deleted successfully
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
export declare const deleteOpportunity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Submit a general GanzAfrica application
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationSubmission'
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
export declare const submitGeneralApplication: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /opportunities/{id}/apply:
 *   post:
 *     summary: Submit an application for a specific opportunity
 *     tags: [Applications]
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
 *             $ref: '#/components/schemas/ApplicationSubmission'
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
export declare const submitApplication: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /opportunities/{id}/applications:
 *   get:
 *     summary: List applications for an opportunity
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by application status
 *     responses:
 *       200:
 *         description: List of applications
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
export declare const listApplications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Get application by ID
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application found
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
export declare const getApplicationById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /applications/{id}/status:
 *   put:
 *     summary: Update application status
 *     tags: [Applications]
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
 *             $ref: '#/components/schemas/UpdateApplicationStatus'
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
export declare const updateApplicationStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /applications:
 *   get:
 *     summary: List all applications across all opportunities
 *     tags: [Applications]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by application status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of all applications
 *       500:
 *         description: Server error
 */
export declare const listAllApplications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @swagger
 * /applications/{id}/review:
 *   post:
 *     summary: Submit a review for an application
 *     tags: [Applications]
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
 *             $ref: '#/components/schemas/ApplicationReview'
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
export declare const submitApplicationReview: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const opportunityController: {
    createOpportunity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listOpportunities: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getOpportunityById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateOpportunity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    publishOpportunity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    closeOpportunity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteOpportunity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    submitApplication: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    submitGeneralApplication: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listApplications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getApplicationById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateApplicationStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    submitApplicationReview: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    listAllApplications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default opportunityController;
//# sourceMappingURL=opportunity.d.ts.map