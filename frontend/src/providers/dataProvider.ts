import type { DataProvider } from "@refinedev/core";

import { API_URL } from "@/config";
import { getAuthToken } from "@/providers/authProvider";

interface FastApiError {
  detail?: string | Array<{ msg: string }>;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    let detail: string = response.statusText;
    try {
      const body: FastApiError = await response.json();
      if (typeof body.detail === "string") {
        detail = body.detail;
      } else if (Array.isArray(body.detail)) {
        detail = body.detail.map((d) => d.msg).join(", ");
      }
    } catch {
      // body wasn't JSON
    }
    const err = new Error(detail) as Error & { statusCode?: number };
    err.statusCode = response.status;
    throw err;
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const dataProvider: DataProvider = {
  getApiUrl: () => API_URL,

  async getList({ resource, filters }) {
    const params = new URLSearchParams();
    filters?.forEach((filter) => {
      if ("field" in filter && filter.value !== undefined && filter.value !== null) {
        params.append(filter.field, String(filter.value));
      }
    });
    const qs = params.toString() ? `?${params.toString()}` : "";
    const items = await request<unknown[]>(`/${resource}${qs}`);
    return {
      data: items as never,
      total: items.length,
    };
  },

  async getOne({ resource, id }) {
    const item = await request<unknown>(`/${resource}/${id}`);
    return { data: item as never };
  },

  async create({ resource, variables }) {
    const item = await request<unknown>(`/${resource}`, {
      method: "POST",
      body: JSON.stringify(variables),
    });
    return { data: item as never };
  },

  async update({ resource, id, variables }) {
    const item = await request<unknown>(`/${resource}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(variables),
    });
    return { data: item as never };
  },

  async deleteOne({ resource, id }) {
    await request<void>(`/${resource}/${id}`, { method: "DELETE" });
    return { data: { id } as never };
  },

  async custom({ url, method, payload, headers }) {
    const init: RequestInit = {
      method: (method ?? "get").toUpperCase(),
      headers: headers as HeadersInit,
    };
    if (payload !== undefined) {
      init.body = JSON.stringify(payload);
    }
    const data = await request<unknown>(url, init);
    return { data: data as never };
  },
};
