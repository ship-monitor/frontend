// Настройка сгенерированного oazapfts-клиента: baseUrl из окружения,
// Bearer-заголовок и автоматический refresh при 401.
import { defaults, refreshToken } from "@/api";
import { ROUTES } from "@/constants/routes";
import { getAuthToken, getRefreshToken, setAuthToken, setRefreshToken } from "@/utils/authToken";

let refreshing: Promise<boolean> | null = null;

const REQUEST_TIMEOUT_MS = 5000;

const rawFetch = globalThis.fetch.bind(globalThis);

const isAuthRequest = (input: RequestInfo | URL): boolean => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.pathname
        : input.url;
  return url.includes("/auth/");
};

const saveTokens = (data: unknown): boolean => {
  const record =
    data && typeof data === "object"
      ? (data as Record<string, unknown>)
      : {};
  const token = record["token"];
  const refresh = record["refreshToken"];
  if (record["success"] !== true || typeof token !== "string" || !token) {
    return false;
  }
  if (typeof refresh !== "string" || !refresh) {
    return false;
  }
  setAuthToken(token);
  setRefreshToken(refresh);
  return true;
};

const tryRefresh = (): Promise<boolean> => {
  if (!refreshing) {
    refreshing = (async () => {
      const current = getRefreshToken();
      if (!current) return false;

      try {
        // Прямой rawFetch: сам refresh не должен ни тащить протухший
        // Bearer, ни рекурсивно попадать в 401-обработку.
        const response = await refreshToken(
          { refreshToken: current },
          { fetch: rawFetch }
        );
        if (response.status !== 200) return false;
        return saveTokens(response.data ?? {});
      } catch {
        return false;
      } finally {
        refreshing = null;
      }
    })();
  }

  return refreshing;
};

const invalidateAndRedirect = () => {
  void import("@/stores/authStore").then(({ useAuthStore }) => {
    useAuthStore().invalidateSession();

    void import("@/router").then(({ getAppRouter }) => {
      const router = getAppRouter();
      const current = router?.currentRoute.value;
      if (router && current && current.path !== ROUTES.LOGIN) {
        router.push({
          path: ROUTES.LOGIN,
          query: { redirect: current.fullPath },
        });
      }
    });
  });
};

const authFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  if (isAuthRequest(input)) {
    return rawFetch(input, init);
  }

  const headers = new Headers(init?.headers);
  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await rawFetch(input, {
    ...init,
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await tryRefresh();
  if (!refreshed) {
    invalidateAndRedirect();
    return response;
  }

  const newToken = getAuthToken();
  if (newToken) {
    headers.set("Authorization", `Bearer ${newToken}`);
  }

  return rawFetch(input, {
    ...init,
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
};

export const configureApi = () => {
  const backendUrl = import.meta.env.VITE_API_URL;

  if (!backendUrl) {
    console.error("VITE_API_URL is not defined in environment variables");
    throw new Error("API base URL is not configured");
  }

  defaults.baseUrl = backendUrl;
  defaults.fetch = authFetch;
};
