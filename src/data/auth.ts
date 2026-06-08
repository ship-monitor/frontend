import api from "@/api";
import type { AxiosResponse } from "axios";

type LoginResult =
  | false
  | {
      token: string;
      refreshToken: string;
      user: {
        id: string;
        email: string;
      };
    };

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
      console.warn("Authenticvation failed:", response.data.details);
      return false;
    }

    return {
      refreshToken: response.data.refreshToken,
      token: response.data.token,
      user: response.data.user,
    };
  } catch (e) {
    console.error("Login request failed", e);
    return false;
  }
};
