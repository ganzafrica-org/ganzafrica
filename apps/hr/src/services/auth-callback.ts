import httpClient from "./http.service";

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

interface Options {
  code: string | null;
  next: string;
  onSuccess: (dest: string) => void;
}

export async function completeAuthCallback({ code, next, onSuccess }: Options): Promise<void> {
  try {
    await httpClient.get("/auth/me");
    onSuccess(next);
    return;
  } catch {
    // no valid session yet
  }

  if (code) {
    try {
      await httpClient.post("/auth/handoff/exchange", { code });
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
