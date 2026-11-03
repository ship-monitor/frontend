import api from "@/api";
import type { AxiosResponse } from "axios";
import { Result, Unit } from "true-myth";
import { problemDetails } from "@/utils/problem";
import { clearAuthToken, setAuthToken } from "@/utils/authToken";

const NETWORK_ERROR = "Не удалось связаться с сервером";

const isOkStatus = (status: number) => status >= 200 && status < 300;

type LoginResponse = {
  success?: boolean;
  token?: string;
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

  const token = response.data?.token;
  if (response.data?.success !== true || !token) {
    return Result.err("Неверный ответ сервера авторизации");
  }

  setAuthToken(token);
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
  clearAuthToken();
  return Result.ok(Unit);
};
