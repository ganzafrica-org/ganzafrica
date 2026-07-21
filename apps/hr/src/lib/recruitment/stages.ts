/**
 * Client-side pipeline stage metadata (REC-03) — mirrors the backend ALLOWED_TRANSITIONS
 * (services/recruitment/pipeline.service.ts). The server is authoritative; this drives the board's
 * per-card move menu and optimistic UI.
 */
import type { PipelineStage } from "@/services/recruitment.service";

// Columns shown on the board (rejected/withdrawn are terminal and collapsed elsewhere).
export const BOARD_STAGES: PipelineStage[] = [
  "submitted",
  "screening",
  "shortlisted",
  "interview",
  "evaluation",
  "offer",
  "hired",
];

export const ALL_STAGES: PipelineStage[] = [...BOARD_STAGES, "rejected", "withdrawn"];

export const ALLOWED_TRANSITIONS: Record<PipelineStage, PipelineStage[]> = {
  submitted: ["screening", "rejected", "withdrawn"],
  screening: ["shortlisted", "rejected", "withdrawn"],
  shortlisted: ["interview", "rejected", "withdrawn"],
  interview: ["evaluation", "rejected", "withdrawn"],
  evaluation: ["offer", "rejected", "withdrawn"],
  offer: ["hired", "rejected", "withdrawn"],
  hired: [],
  rejected: [],
  withdrawn: [],
};
