import { useLocalStorage, computedAsync } from "@vueuse/core";
import type { AxiosInstance } from "axios";
import { ref } from "vue";
import { Result } from "true-myth";
import Maybe from "true-myth/maybe";
const AUTH_TOKEN_KEY = "token";
const AUTH_REFRESH_TOKEN_KEY = "refreshToken";

const httpClient = ref<AxiosInstance | null>(null);
export const setupClient = (client: AxiosInstance) => {
  httpClient.value = client;
};

const tokenStore = useLocalStorage(AUTH_TOKEN_KEY, "");
const refreshTokenStore = useLocalStorage(AUTH_REFRESH_TOKEN_KEY, "");

export const getToken = (): string => tokenStore.value;

export const logout = () => {
  tokenStore.value = "";
  refreshTokenStore.value = "";
};
const validate = (token: string): Maybe<string> => {
  const parseResult = parseToken(token);
  if (parseResult.isErr) {
    return Maybe.just("parse error: " + parseResult.error);
  }

  if (tokenExpired(parseResult.value)) {
    return Maybe.just(
      "token expired: " +
        parseResult.value.payload.exp * 1000 +
        " now: " +
        Date.now()
    );
  }

  return Maybe.nothing();
};

const checkAuth = async (): Promise<boolean> => {
  let validationError = validate(tokenStore.value);
  if (validationError.isJust) {
    console.error("token invalid: " + validationError.value);
  }

  validationError = validate(tokenStore.value);
  if (validationError.isJust) {
    console.error("refresh token invalid: " + validationError.value);
    return await handleRefresh();
  }

  return true;
};

/**
 * @returns Returns true if refresh tokens successfully.
 */
export const handleRefresh = async (): Promise<boolean> => {
  const validationError = validate(refreshTokenStore.value);
  if (validationError.isJust) {
    console.error(
      "Invalid refresh token" + validationError.value + ", aborting refreshing"
    );
    return false;
  }

  if (!httpClient.value) {
    console.error("HTTP client isn't setup, aborting refreshing");
    return false;
  }

  const response = await httpClient.value.post(
    "/api/auth/refresh",
    { refreshToken: refreshTokenStore.value },
    { validateStatus: () => true }
  );

  if (!response.data) {
    console.error("Response body is empty, aborting refreshing");
    return false;
  }

  if (response.status === 200) {
    const { token, refreshToken: newRefreshToken } = response.data;
    setAuthState(token, newRefreshToken);
    return true;
  } else {
    const { details } = response.data;
    console.error("Failed refresh token: " + details);
    return false;
  }
};

export const setAuthState = (token: string, refreshToken: string) => {
  console.debug("Setting auth state");
  const authToken = parseToken(token);
  if (authToken.isErr) {
    console.error("bad token: " + authToken.error);
    return;
  }

  const authRefreshToken = parseToken(refreshToken);
  if (authRefreshToken.isErr) {
    console.error("bad refresh token: " + authRefreshToken.error);
    return;
  }

  tokenStore.value = token;
  refreshTokenStore.value = refreshToken;
  console.debug("Auth state set successfully");
};

type TokenPayload = { userId: string; exp: number; email: string };
type TokenData = {
  payload: TokenPayload;
};

const tokenExpired = (token: TokenData): boolean =>
  token.payload.exp * 1000 < Date.now();

const parseToken = (token: string): Result<TokenData, string> => {
  try {
    const [, payloadString] = token.split(".");
    if (!payloadString) return Result.err("token format invalid");

    const payload = JSON.parse(atob(payloadString)) as TokenPayload;

    const data: TokenData = { payload };
    return Result.ok(data);
  } catch (e) {
    return Result.err("token format invalid: " + e);
  }
};

export const isAuthenticated = computedAsync(async () => await checkAuth());
