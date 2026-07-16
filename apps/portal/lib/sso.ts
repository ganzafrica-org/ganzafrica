import apiClient from "./api-client";

/**
 * Redirect to a sibling app via a one-time SSO handoff code (FND-06). During the transition the
 * legacy token/user query params are still appended so app callbacks that haven't been migrated
 * keep working; they are removed in the final rollout stage.
 */
export async function redirectToApp(
  targetApp: string,
  appOrigin: string,
  next = "/",
): Promise<void> {
  let code: string | null = null;
  try {
    const res = await apiClient.post("/auth/handoff", { target_app: targetApp });
    code = res.data?.code ?? null;
  } catch {
    // fall through to legacy params
  }

  const url = new URL(`${appOrigin}/auth-callback`);
  if (code) {
    url.searchParams.set("code", code);
    url.searchParams.set("next", next);
  }

  // Legacy fallback (removed in rollout stage 3).
  const token = localStorage.getItem("accessToken");
  const userData = localStorage.getItem("user");
  if (token) url.searchParams.set("token", token);
  if (userData) url.searchParams.set("user", encodeURIComponent(userData));

  window.location.href = url.toString();
}
