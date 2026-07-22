/**
 * Seam between REC-05 (hire) and LCM-01 (onboarding). REC-05 calls onHired after an accepted
 * offer; until LCM-01 lands, the default is a no-op and the caller records onboarding_pending so
 * LCM-01's migration can backfill. LCM-01 replaces this implementation with instantiateProcess().
 */
import { Logger } from "../../config";

const logger = new Logger("OnboardingHooks");

export interface HiredContext {
  employeeId: string;
  offerId: number;
  applicationId: number;
  employmentType: string;
  startDate?: string | null;
}

export interface OnboardingHooks {
  /** Returns true if an onboarding process was instantiated, false if deferred (pending). */
  onHired: (ctx: HiredContext) => Promise<boolean>;
}

const defaultHooks: OnboardingHooks = {
  async onHired(ctx) {
    logger.info(
      `Onboarding deferred for employee ${ctx.employeeId} (LCM-01 not wired) — marked pending`,
    );
    return false;
  },
};

let hooks: OnboardingHooks = defaultHooks;

/** LCM-01 calls this at startup to wire real onboarding instantiation. */
export function setOnboardingHooks(next: OnboardingHooks): void {
  hooks = next;
}

export function getOnboardingHooks(): OnboardingHooks {
  return hooks;
}
