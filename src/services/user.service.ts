import { apiClient } from "@/lib/api-client";

export type UserRole = "USER" | "ADMIN";
export type AuthProvider = "LOCAL" | "GOOGLE";

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

/** Backend returns { totalUsers, users } (not a page). */
export async function getAdminUsers(): Promise<AdminUserListResponse> {
  return apiClient.get<AdminUserListResponse>("/api/admin/users");
}

export async function getAdminUserById(id: number): Promise<AdminUserResponse> {
  return apiClient.get<AdminUserResponse>(`/api/admin/users/${id}`);
}
