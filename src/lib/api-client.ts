const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:1121";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("sunrisers_token");
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    let message = "Something went wrong.";

    if (typeof data === "object" && data !== null && "message" in data) {
      message = String((data as { message?: unknown }).message);
    } else if (typeof data === "string" && data.trim()) {
      message = data;
    } else if (response.status === 401) {
      message = "Unauthorized. Please login again.";
    } else if (response.status === 403) {
      message = "You do not have permission to perform this action.";
    } else if (response.status === 404) {
      message = "Requested resource was not found.";
    }

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export const apiClient = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, {
      method: "GET",
    });
  },

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, {
      method: "DELETE",
    });
  },

  setToken(token: string): void {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem("sunrisers_token", token);
  },

  getToken(): string | null {
    return getAuthToken();
  },

  clearToken(): void {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem("sunrisers_token");
  },
};