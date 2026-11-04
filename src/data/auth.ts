import api from "@/api";
import type { AxiosResponse } from "axios";
import { Result, Unit } from "true-myth";
import { problemDetails } from "@/utils/problem";
import {
  clearAuthTokens,
  setAuthToken,
  setRefreshToken,
  getRefreshToken,
} from "@/utils/authToken";

const NETWORK_ERROR = "Не удалось связаться с сервером";

const isOkStatus = (status: number) => status >= 200 && status < 300;

type LoginResponse = {
  success?: boolean;
  token?: string;
  refreshToken?: string;
};

const saveTokens = (
  data: LoginResponse,
  requireRefreshToken: boolean
): boolean => {
  if (data.success !== true || !data.token) return false;
  if (requireRefreshToken && !data.refreshToken) return false;

  setAuthToken(data.token);
  if (data.refreshToken) setRefreshToken(data.refreshToken);
  return true;
};

export const login = async (
  email: string,
  password: string
): Promise<Result<Unit, string>> => {
  let response: AxiosResponse<LoginResponse>;
  try {
    response = await api.post("/api/v2/auth/login", { email, password });
  } catch {
    return Result.err(NETWORK_ERROR);
  }

  if (response.status === 401) {
    return Result.err(
      problemDetails(response.data, "Неверный логин или пароль")
    );
  }
  if (!isOkStatus(response.status)) {
    return Result.err(problemDetails(response.data, "Не удалось выполнить вход"));
  }

  if (!saveTokens(response.data ?? {}, false)) {
    return Result.err("Неверный ответ сервера авторизации");
  }
  return Result.ok(Unit);
};

export const register = async (
  email: string,
  password: string,
  name: string
): Promise<Result<Unit, string>> => {
  let response: AxiosResponse;
  try {
    response = await api.post("/api/v2/auth/register", {
      email,
      password,
      name,
    });
  } catch {
    return Result.err(NETWORK_ERROR);
  }

  if (!isOkStatus(response.status)) {
    return Result.err(
      problemDetails(response.data, "Не удалось зарегистрироваться")
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
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Result.err("Нет refresh-токена");

  let response: AxiosResponse<LoginResponse>;
  try {
    response = await api.post("/api/v2/auth/refresh", { refreshToken });
  } catch {
    return Result.err(NETWORK_ERROR);
  }

  if (!isOkStatus(response.status)) {
    return Result.err(
      problemDetails(response.data, "Не удалось обновить сессию")
    );
  }

  if (!saveTokens(response.data ?? {}, true)) {
    return Result.err("Неверный ответ обновления сессии");
  }
  return Result.ok(Unit);
};
