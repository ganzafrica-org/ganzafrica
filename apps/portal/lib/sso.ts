import apiClient from "./api-client";

/**
 * Redirect to a sibling app via a one-time SSO handoff code (FND-06). The target app's
 * /auth-callback exchanges the code for a session cookie. No tokens are placed in the URL.
 */
export async function redirectToApp(
  targetApp: string,
  appOrigin: string,
  next = "/",
): Promise<void> {
  const res = await apiClient.post("/auth/handoff", { target_app: targetApp });
  const code: string = res.data.code;
  const url = new URL(`${appOrigin}/auth-callback`);
  url.searchParams.set("code", code);
  url.searchParams.set("next", next);
  window.location.href = url.toString();
}
