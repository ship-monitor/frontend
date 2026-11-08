import { loginUser, refreshToken as refreshTokenOp, registerUser } from "@/api";
import { Result, Unit } from "true-myth";
import { problemDetails } from "@/utils/problem";
import {
  clearAuthTokens,
  getRefreshToken,
  setAuthToken,
  setRefreshToken,
} from "@/utils/authToken";

const NETWORK_ERROR = "Не удалось связаться с сервером";

const errorData = (response: { status: number }): unknown =>
  "data" in response ? (response as { data?: unknown }).data : undefined;

const saveTokens = (data: unknown, requireRefreshToken: boolean): boolean => {
  const record =
    data && typeof data === "object"
      ? (data as Record<string, unknown>)
      : {};
  const token = record["token"];
  if (record["success"] !== true || typeof token !== "string" || !token) {
    return false;
  }
  const refresh = record["refreshToken"];
  if (requireRefreshToken && (typeof refresh !== "string" || !refresh)) {
    return false;
  }

  setAuthToken(token);
  if (typeof refresh === "string" && refresh) {
    setRefreshToken(refresh);
  }
  return true;
};

export const login = async (
  email: string,
  password: string
): Promise<Result<Unit, string>> => {
  let response;
  try {
    response = await loginUser({ email, password });
  } catch {
    return Result.err(NETWORK_ERROR);
  }

  if (response.status === 401) {
    return Result.err(
      problemDetails(errorData(response), "Неверный логин или пароль")
    );
  }
  if (response.status !== 200) {
    return Result.err(problemDetails(errorData(response), "Не удалось выполнить вход"));
  }

  if (!saveTokens(response.data, false)) {
    return Result.err("Неверный ответ сервера авторизации");
  }
  return Result.ok(Unit);
};

export const register = async (
  email: string,
  password: string,
  name: string
): Promise<Result<Unit, string>> => {
  let response;
  try {
    response = await registerUser({ email, password, name });
  } catch {
    return Result.err(NETWORK_ERROR);
  }

  if (response.status !== 201) {
    return Result.err(
      problemDetails(errorData(response), "Не удалось зарегистрироваться")
    );
  }
  return Result.ok(Unit);
};

// В API v2 нет серверного logout — сессия сбрасывается только на клиенте.
export const logout = async (): Promise<Result<Unit, string>> => {
  clearAuthTokens();
  return Result.ok(Unit);
};

export const refreshSession = async (): Promise<Result<Unit, string>> => {
  const current = getRefreshToken();
  if (!current) return Result.err("Нет refresh-токена");

  let response;
  try {
    response = await refreshTokenOp({ refreshToken: current });
  } catch {
    return Result.err(NETWORK_ERROR);
  }

  if (response.status !== 200) {
    return Result.err(
      problemDetails(errorData(response), "Не удалось обновить сессию")
    );
  }

  if (!saveTokens(response.data, true)) {
    return Result.err("Неверный ответ обновления сессии");
  }
  return Result.ok(Unit);
};
