import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";
const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

type TokenBundle = {
  accessToken?: string;
  refreshToken?: string;
};

type HttpServiceConfig = {
  tokenReader?: () => TokenBundle | null;
  tokenWriter?: (tokens: TokenBundle) => void;
  logoutHandler?: () => void;
};

let httpServiceConfig: HttpServiceConfig = {};

export function configureHttpService(config: HttpServiceConfig) {
  httpServiceConfig = config;
}

const httpClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

httpClient.interceptors.request.use((config) => {
  const method = (config.method || "get").toUpperCase();
  const tokens = httpServiceConfig.tokenReader?.();
  const accessToken = tokens?.accessToken;
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = readCookie("ganzafrica_csrf");
    if (csrf) config.headers.set("X-CSRF-Token", csrf);
  }
  return config;
});

let refreshPromise: Promise<boolean> | null = null;

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true })
          .then((response) => {
            const tokens = response.data ?? {};
            httpServiceConfig.tokenWriter?.(tokens);
            return true;
          })
          .catch(() => false)
          .finally(() => {
            refreshPromise = null;
          });
      }
      if (await refreshPromise) return httpClient(original);
      httpServiceConfig.logoutHandler?.();
      redirectToLogin();
    }
    return Promise.reject(error);
  },
);

function redirectToLogin() {
  if (typeof window !== "undefined") {
    const login = new URL(`${PORTAL_URL}/login`);
    login.searchParams.set("next", window.location.href);
    window.location.href = login.toString();
  }
}

export default httpClient;
export { httpClient };
