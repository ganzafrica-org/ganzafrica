/**
 * Anonymous recruitment funnel instrumentation (REC-04). Fire-and-forget beacons for
 * view → form_start → form_submit, deduped server-side per session. The session key is a per-tab
 * uuid in sessionStorage — no cross-visit tracking, no PII, no consent-banner implications.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";
const SESSION_STORAGE_KEY = "ga_funnel_session";

export type FunnelEvent = "view" | "form_start" | "form_submit";

let memorySessionKey: string | null = null;

function newUuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  // Fallback for very old environments.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Per-tab session key. Falls back to an in-memory key when sessionStorage is unavailable. */
export function getSessionKey(): string {
  try {
    if (typeof sessionStorage !== "undefined") {
      let key = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!key) {
        key = newUuid();
        sessionStorage.setItem(SESSION_STORAGE_KEY, key);
      }
      return key;
    }
  } catch {
    // sessionStorage can throw in private mode — fall through to the in-memory key.
  }
  if (!memorySessionKey) memorySessionKey = newUuid();
  return memorySessionKey;
}

/** Send a funnel event. Uses sendBeacon when available, keepalive fetch otherwise. Never throws. */
export function trackFunnel(opportunityId: number | string, event: FunnelEvent): void {
  try {
    const url = `${API_URL}/opportunities/${opportunityId}/events`;
    const payload = JSON.stringify({ event, session_key: getSessionKey() });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      return;
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Instrumentation must never affect the page.
  }
}
