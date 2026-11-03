import safeStorage from "@/utils/storage";

const TOKEN_KEY = "auth_token";

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
