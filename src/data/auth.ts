import api from "@/api";
import type { AxiosResponse } from "axios";
import { Result } from "true-myth";

type LoginResult = Result<
  {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
    };
  },
  string
>;

export const login = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  try {
    const response: AxiosResponse<
      | {
          token: string;
          refreshToken: string;
          user: { id: string; email: string };
        }
      | { details: string }
    > = await api.post("/api/auth/login", {
      email,
      password,
    });
    if ("details" in response.data) {
      return Result.err("authentication failed: " + response.data.details);
    }

    return Result.ok({
      refreshToken: response.data.refreshToken,
      token: response.data.token,
      user: response.data.user,
    });
  } catch (e) {
    return Result.err("login request failed: " + e);
  }
};
