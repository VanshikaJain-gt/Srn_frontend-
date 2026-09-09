import { apiClient } from "@/lib/api-client";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  profilePhotoUrl?: string | null;
  passwordSet?: boolean;
  stravaConnected?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export async function registerUser(
  data: RegisterRequest
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/api/auth/register",
    data
  );

  apiClient.setToken(response.token);

  return response;
}

export async function loginUser(
  data: LoginRequest
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/api/auth/login",
    data
  );

  apiClient.setToken(response.token);

  return response;
}

export async function loginWithGoogle(
  data: GoogleLoginRequest
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/api/auth/google",
    data
  );

  apiClient.setToken(response.token);

  return response;
}

export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>("/api/users/me");
}

export async function changePassword(
  data: ChangePasswordRequest
): Promise<void> {
  await apiClient.put<void>("/api/users/me/password", data);
}

export function logoutUser(): void {
  apiClient.clearToken();
}