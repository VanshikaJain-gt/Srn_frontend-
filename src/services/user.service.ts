import { apiClient } from "@/lib/api-client";

export type UserRole = "USER" | "ADMIN" | string;
export type AuthProvider = "LOCAL" | "GOOGLE" | string;

export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  role: UserRole;
  authProvider: AuthProvider;
  profilePhotoUrl: string | null;
  stravaConnected: boolean;
  passwordSet: boolean;
  createdAt: string | null;
}

export interface AdminUserListResponse {
  totalUsers: number;
  users: AdminUserResponse[];
}

export async function getAdminUsers(): Promise<AdminUserListResponse> {
  const response = await apiClient.get<AdminUserListResponse | AdminUserResponse[]>(
    "/api/admin/users"
  );

  // Backend currently returns { totalUsers, users }.
  // Keep this fallback so the page remains tolerant if the API ever returns a plain array.
  if (Array.isArray(response)) {
    return {
      totalUsers: response.length,
      users: response,
    };
  }

  return {
    totalUsers: Number(response?.totalUsers ?? response?.users?.length ?? 0),
    users: Array.isArray(response?.users) ? response.users : [],
  };
}

export async function getAdminUserById(id: number): Promise<AdminUserResponse> {
  return apiClient.get<AdminUserResponse>(`/api/admin/users/${id}`);
}
