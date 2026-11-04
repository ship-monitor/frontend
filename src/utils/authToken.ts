import safeStorage from "@/utils/storage";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";

export const getAuthToken = (): string | null => {
  const token = safeStorage.getItem(TOKEN_KEY);
  return token && token.length > 0 ? token : null;
};

export const setAuthToken = (token: string) => {
  safeStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  safeStorage.removeItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  const token = safeStorage.getItem(REFRESH_TOKEN_KEY);
  return token && token.length > 0 ? token : null;
};

export const setRefreshToken = (token: string) => {
  safeStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearRefreshToken = () => {
  safeStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const clearAuthTokens = () => {
  clearAuthToken();
  clearRefreshToken();
};
