import type { Response } from "express";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
};

export function sendResponse<T>(res: Response, payload: SuccessResponse<T>): void {
  res.json(payload);
}
