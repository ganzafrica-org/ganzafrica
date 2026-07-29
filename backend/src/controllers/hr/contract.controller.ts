import { Request, Response } from "express";
import { constants, Logger } from "../../config";
import { AppError } from "../../middlewares";
import * as contractService from "../../services/hr/contract.service";
import type {
  CompensationType,
  ContractStatus,
  CreateContractInput,
  EmploymentTerm,
  EmploymentType,
  SalaryScale,
} from "@/types/contract.types";
/**
 * @swagger
 * /hr/employees/{employeeId}/contracts:
 *   get:
 *     summary: List employee contracts
 *     tags: [HR Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contracts fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HrContract'
 *   post:
 *     summary: Create employee contract
 *     tags: [HR Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HrContract'
 *     responses:
 *       201:
 *         description: Contract created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HrContract'
 *
 * /hr/employees/{employeeId}/contracts/{contractId}:
 *   get:
 *     summary: Get contract details
 *     tags: [HR Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contract fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HrContract'
 *   patch:
 *     summary: Update contract
 *     tags: [HR Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HrContract'
 *     responses:
 *       200:
 *         description: Contract updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HrContract'
 *   delete:
 *     summary: Delete contract
 *     tags: [HR Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contract deleted
 */

const logger = new Logger("ContractController");

function handleErrorResponse(error: unknown, res: Response, errorType: string): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: errorType, message: error.message });
  } else {
    res.status(500).json({
      error: errorType,
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
}

function parseContractBody(body: Record<string, unknown>): CreateContractInput {
  return {
    jobTitle: body.jobTitle as string,
    department: (body.department as string | null) ?? null,
    workLocation: (body.workLocation as string | null) ?? null,
    manager: (body.manager as string | null) ?? null,
    reportTo: (body.reportTo as string | null) ?? null,
    startDate: new Date(body.startDate as string),
    employmentTerm: body.employmentTerm as EmploymentTerm,
    endDate: body.endDate ? new Date(body.endDate as string) : null,
    employmentType: body.employmentType as EmploymentType,
    daysPerWeek: body.daysPerWeek ? Number(body.daysPerWeek) : null,
    compensationType: body.compensationType as CompensationType,
    salaryScale: (body.salaryScale as SalaryScale) ?? null,
    currency: (body.currency as string) ?? "RWF",
    baseMonthlyRate: (body.baseMonthlyRate as string | null) ?? null,
    grossAnnualRate: (body.grossAnnualRate as string | null) ?? null,
    employmentAgreementUrl: (body.employmentAgreementUrl as string | null) ?? null,
    status: body.status as ContractStatus | undefined,
    notes: (body.notes as string | null) ?? null,
  };
}

export const listContracts = async (req: Request, res: Response): Promise<void> => {
  try {
    const contracts = await contractService.listContractsByEmployee(req.params.employeeId);
    res.status(200).json(contracts);
  } catch (error) {
    logger.error("List contracts error", error);
    handleErrorResponse(error, res, "List Contracts Error");
  }
};

export const getContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const contract = await contractService.getContractById(
      req.params.employeeId,
      req.params.contractId,
    );
    res.status(200).json(contract);
  } catch (error) {
    logger.error("Get contract error", error);
    handleErrorResponse(error, res, "Get Contract Error");
  }
};

export const createContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const contract = await contractService.createContract(
      req.params.employeeId,
      parseContractBody(req.body),
    );
    res.status(201).json(contract);
  } catch (error) {
    logger.error("Create contract error", error);
    handleErrorResponse(error, res, "Create Contract Error");
  }
};

export const updateContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const contract = await contractService.updateContract(
      req.params.employeeId,
      req.params.contractId,
      {
        // Job details
        jobTitle: body.jobTitle,
        department: body.department,
        workLocation: body.workLocation,
        manager: body.manager,
        reportTo: body.reportTo,
        // Contract details
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        employmentTerm: body.employmentTerm,
        endDate:
          body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : undefined,
        employmentType: body.employmentType,
        daysPerWeek: body.daysPerWeek !== undefined ? Number(body.daysPerWeek) : undefined,
        compensationType: body.compensationType,
        salaryScale: body.salaryScale,
        currency: body.currency,
        baseMonthlyRate: body.baseMonthlyRate,
        grossAnnualRate: body.grossAnnualRate,
        employmentAgreementUrl: body.employmentAgreementUrl,
        status: body.status,
        notes: body.notes,
      },
    );
    res.status(200).json(contract);
  } catch (error) {
    logger.error("Update contract error", error);
    handleErrorResponse(error, res, "Update Contract Error");
  }
};

export const deleteContract = async (req: Request, res: Response): Promise<void> => {
  try {
    await contractService.deleteContract(req.params.employeeId, req.params.contractId);
    res.status(200).json({ message: "Contract deleted successfully" });
  } catch (error) {
    logger.error("Delete contract error", error);
    handleErrorResponse(error, res, "Delete Contract Error");
  }
};
