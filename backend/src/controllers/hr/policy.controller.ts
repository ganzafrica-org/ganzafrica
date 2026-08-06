import { Request, Response, NextFunction } from "express";
/**
 * @swagger
 * /hr/policies:
 *   get:
 *     summary: List all policies
 *     tags: [HR Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Policies fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HrPolicy'
 *   post:
 *     summary: Create new policy
 *     tags: [HR Policies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HrPolicy'
 *     responses:
 *       201:
 *         description: Policy created
 *
 * /hr/policies/{id}:
 *   get:
 *     summary: Get policy details
 *     tags: [HR Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Policy fetched
 *   patch:
 *     summary: Update policy
 *     tags: [HR Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HrPolicy'
 *     responses:
 *       200:
 *         description: Policy updated
 *   delete:
 *     summary: Delete policy
 *     tags: [HR Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Policy deleted
 *
 * /hr/policies/{id}/download:
 *   get:
 *     summary: Download policy file
 *     tags: [HR Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 */
import { sendResponse } from "@/utils/sendResponse";
import * as policyService from "../../services/hr/policy.service";
import { getEmployeeForUser } from "../../services/hr/employee-context";

export const listPolicies = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const q = req.query as unknown as Record<string, string | undefined>;
    const page = q.page ? parseInt(q.page, 10) : 1;
    const limit = q.limit ? parseInt(q.limit, 10) : 10;

    const { data, total } = await policyService.listPolicies({
      page,
      limit,
      category: q.category,
      status: q.status as policyService.PolicyStatus | undefined,
      sortBy: q.sortBy as policyService.ListPoliciesQuery["sortBy"],
      sortOrder: (q.sortOrder as "asc" | "desc" | undefined) ?? "desc",
    });

    sendResponse(res, {
      success: true,
      message: "Policies fetched",
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    next(err);
  }
};

export const getPolicy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const policy = await policyService.getPolicy(req.params.id);
    sendResponse(res, { success: true, message: "Policy fetched", data: policy });
  } catch (err) {
    next(err);
  }
};

export const createPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // The creator is the authenticated employee, not a client-supplied id.
    const { employeeId } = await getEmployeeForUser(Number(req.user!.id));
    const created = await policyService.createPolicy({ ...req.body, createdById: employeeId });
    res.status(201);
    sendResponse(res, { success: true, message: "Policy created", data: created });
  } catch (err) {
    next(err);
  }
};

export const updatePolicy = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const updated = await policyService.updatePolicy(req.params.id, req.body);
    sendResponse(res, { success: true, message: "Policy updated", data: updated });
  } catch (err) {
    next(err);
  }
};

export const deletePolicy = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await policyService.deletePolicy(req.params.id);
    sendResponse(res, { success: true, message: "Policy deleted", data: {} });
  } catch (err) {
    next(err);
  }
};

export const downloadPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { absolutePath, fileName } = await policyService.incrementDownloadsAndGetPath(
      req.params.id,
    );

    res.download(absolutePath, fileName, (err) => {
      if (err) next(err);
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Publish a policy — transitions from DRAFT to PUBLISHED, bumps version,
 * and deactivates the previous version if it exists.
 */
export const publishPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const published = await policyService.publishPolicy(req.params.id);
    sendResponse(res, {
      success: true,
      message: "Policy published successfully",
      data: published,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Employee acknowledges a policy — creates/updates acknowledgement record for the current version.
 * Idempotent: calling twice with same data does not error or create duplicates.
 */
export const acknowledgePolicy = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { employeeId } = await getEmployeeForUser(Number(req.user!.id));
    const acknowledged = await policyService.acknowledgePolicy(req.params.id, employeeId);
    sendResponse(res, {
      success: true,
      message: "Policy acknowledged successfully",
      data: acknowledged,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get acknowledgement report for a policy — shows who's acknowledged and who's missing.
 * LEFT JOINs active employees to identify gaps.
 */
export const getAcknowledgementReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const report = await policyService.getAcknowledgementReport(req.params.id);
    sendResponse(res, {
      success: true,
      message: "Acknowledgement report retrieved",
      data: report,
    });
  } catch (err) {
    next(err);
  }
};
