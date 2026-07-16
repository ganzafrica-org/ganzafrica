const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

function readCsrf(): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|; )ganzafrica_csrf=([^;]+)/);
  return m && m[1] ? decodeURIComponent(m[1]) : "";
}

/**
 * fetch wrapper that authenticates via the shared session cookie (credentials: include) and
 * attaches the CSRF token on mutating requests. On 401 it bounces to the portal login.
 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers.set("X-CSRF-Token", readCsrf());
  }
  const res = await fetch(input, { ...init, credentials: "include", headers });
  if (res.status === 401 && typeof window !== "undefined") {
    const login = new URL(`${PORTAL_URL}/login`);
    login.searchParams.set("next", window.location.href);
    window.location.href = login.toString();
  }
  return res;
}
