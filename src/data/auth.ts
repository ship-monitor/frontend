import api from "@/api";
import type { AxiosResponse } from "axios";
import { Result } from "true-myth";

type AuthUser = {
  id: string;
  email: string;
};

type LoginResult = Result<{ user: AuthUser }, string>;
type RegisterResult = Result<void, string>;

const errorDetails = (data: unknown, fallback: string): string => {
  if (data && typeof data === "object" && "details" in data) {
    const details = (data as { details?: unknown }).details;
    if (typeof details === "string" && details.length > 0) return details;
  }
  return fallback;
};

export const login = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  try {
    const response: AxiosResponse<
      { user: AuthUser } | { details: string }
    > = await api.post("/api/auth/login", {
      email,
      password,
    });

    if (response.status >= 200 && response.status < 300 && "user" in response.data) {
      return Result.ok({ user: response.data.user });
    }

    return Result.err(errorDetails(response.data, "Неверный логин или пароль"));
  } catch (e) {
    return Result.err("Не удалось выполнить вход: " + e);
  }
};

export const register = async (
  email: string,
  password: string,
  name: string
): Promise<RegisterResult> => {
  try {
    // Бэкенд возвращает 201 Created без тела и НЕ авторизует пользователя.
    const response: AxiosResponse<{ details?: string } | undefined> =
      await api.post("/api/auth/register", {
        email,
        password,
        name,
      });

    if (response.status >= 200 && response.status < 300) {
      return Result.ok(undefined);
    }

    return Result.err(errorDetails(response.data, "Не удалось зарегистрироваться"));
  } catch (e) {
    return Result.err("Не удалось выполнить регистрацию: " + e);
  }
};

export const logout = async (): Promise<Result<void, string>> => {
  try {
    await api.post("/api/auth/logout");
    return Result.ok(undefined);
  } catch (e) {
    return Result.err("logout request failed: " + e);
  }
};
