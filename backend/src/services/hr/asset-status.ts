// MOD-04 §4 — the asset status machine. Every endpoint that changes hr_assets.status
// (assign, return, maintenance open/close, flag-triggered states if any, delete->DISPOSED)
// must go through assertAssetStatusTransition rather than writing `status` directly.
// PATCH /hr/assets/:id no longer accepts a `status` field for this reason.
import { AppError } from "../../middlewares";

export type AssetStatus = "AVAILABLE" | "ASSIGNED" | "UNDER_MAINTENANCE" | "DISPOSED";

/**
 * Legal transitions, spec §4:
 *   AVAILABLE         -> ASSIGNED | UNDER_MAINTENANCE | DISPOSED
 *   ASSIGNED          -> AVAILABLE | UNDER_MAINTENANCE        (via /return)
 *   UNDER_MAINTENANCE -> AVAILABLE | DISPOSED
 *   DISPOSED          -> (terminal)
 * Self-transitions (A -> A) are deliberately absent — call sites should skip invoking
 * the assertion when no state change is needed rather than treat A -> A as a legal edge.
 */
export const ASSET_STATUS_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  AVAILABLE: ["ASSIGNED", "UNDER_MAINTENANCE", "DISPOSED"],
  ASSIGNED: ["AVAILABLE", "UNDER_MAINTENANCE"],
  UNDER_MAINTENANCE: ["AVAILABLE", "DISPOSED"],
  DISPOSED: [],
};

/**
 * Throws AppError(409) with the allowed next states if `from -> to` is not a legal
 * transition. Returns void (does not mutate anything) on success — callers still have
 * to perform the actual DB write themselves, typically inside a transaction alongside
 * the denormalized/assignment-row writes.
 */
export function assertAssetStatusTransition(from: AssetStatus, to: AssetStatus): void {
  const allowed = ASSET_STATUS_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new AppError(
      `Illegal asset status transition: ${from} -> ${to}`,
      409,
      "ASSET_STATUS_TRANSITION_INVALID",
    );
  }
}
