import type { AuthProvider } from "@refinedev/core";

import { API_URL, REFRESH_STORAGE_KEY, TOKEN_STORAGE_KEY } from "@/config";

interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

interface MeResponse {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  account_id: string;
  account_name: string;
}

async function apiCall<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail ?? response.statusText);
  }
  return response.json() as Promise<T>;
}

function persistTokens(tokens: AuthResponse) {
  localStorage.setItem(TOKEN_STORAGE_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_STORAGE_KEY, tokens.refresh_token);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_STORAGE_KEY);
}

export const authProvider: AuthProvider = {
  async login({ email, password }) {
    try {
      const tokens = await apiCall<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      persistTokens(tokens);
      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "Login failed",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },

  async register({ email, password, full_name, account_name }) {
    try {
      const tokens = await apiCall<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, full_name, account_name }),
      });
      persistTokens(tokens);
      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "Registration failed",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },

  async logout() {
    clearTokens();
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  async check() {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      return { authenticated: false, redirectTo: "/login" };
    }
    try {
      await apiCall<MeResponse>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { authenticated: true };
    } catch {
      clearTokens();
      return { authenticated: false, redirectTo: "/login" };
    }
  },

  async getIdentity() {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return null;
    try {
      return await apiCall<MeResponse>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      return null;
    }
  },

  async onError(error) {
    if (error?.statusCode === 401 || error?.status === 401) {
      clearTokens();
      return { logout: true, redirectTo: "/login" };
    }
    return {};
  },
};

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}
