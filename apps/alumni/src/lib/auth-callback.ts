import apiClient from "./api-client";

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

interface Options {
  code: string | null;
  next: string;
  onSuccess: (dest: string) => void;
}

/**
 * Standard SSO callback (FND-06): existing session cookie → straight in; else exchange the
 * one-time handoff code; else bounce to portal login. No URL tokens, no localStorage.
 */
export async function completeAuthCallback({ code, next, onSuccess }: Options): Promise<void> {
  try {
    await apiClient.get("/auth/me");
    onSuccess(next);
    return;
  } catch {
    // no valid session yet
  }

  if (code) {
    try {
      await apiClient.post("/auth/handoff/exchange", { code });
      onSuccess(next);
      return;
    } catch {
      // fall through
    }
  }

  const login = new URL(`${PORTAL_URL}/login`);
  login.searchParams.set("next", window.location.href);
  window.location.href = login.toString();
}
