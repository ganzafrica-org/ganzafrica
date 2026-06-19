import { Request, Response } from "express";
import { constants, Logger } from "../../config";
import { AppError } from "../../middlewares";
import * as contractService from "../../services/hr/contract.service";
import type { ContractStatus, ContractType } from "@/types/contract.types";
import { getHrRequester } from "../../utils/hr-requester";
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

function parseContractBody(body: Record<string, unknown>) {
  return {
    type: body.type as ContractType,
    startDate: new Date(body.startDate as string),
    endDate: body.endDate ? new Date(body.endDate as string) : null,
    salary: body.salary as string,
    currency: body.currency as string | undefined,
    status: body.status as ContractStatus | undefined,
    notes: (body.notes as string | null | undefined) ?? null,
  };
}

export const listContracts = async (req: Request, res: Response): Promise<void> => {
  try {
    const contracts = await contractService.listContractsByEmployee(
      getHrRequester(req),
      req.params.employeeId,
    );
    res.status(200).json(contracts);
  } catch (error) {
    logger.error("List contracts error", error);
    handleErrorResponse(error, res, "List Contracts Error");
  }
};

export const getContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const contract = await contractService.getContractById(
      getHrRequester(req),
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
      getHrRequester(req),
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
      getHrRequester(req),
      req.params.employeeId,
      req.params.contractId,
      {
        type: body.type,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : undefined,
        salary: body.salary,
        currency: body.currency,
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
    await contractService.deleteContract(
      getHrRequester(req),
      req.params.employeeId,
      req.params.contractId,
    );
    res.status(200).json({ message: "Contract deleted successfully" });
  } catch (error) {
    logger.error("Delete contract error", error);
    handleErrorResponse(error, res, "Delete Contract Error");
  }
};
