import { apiClient } from "@/lib/api-client";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  profilePhotoUrl?: string | null;
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

/**
 * Register a new user.
 *
 * POST /api/auth/register
 */
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

/**
 * Login existing user.
 *
 * POST /api/auth/login
 */
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

/**
 * Login using Google ID token.
 *
 * POST /api/auth/google
 */
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

/**
 * Get currently authenticated user's profile.
 *
 * GET /api/users/me
 */
export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>("/api/users/me");
}

/**
 * Logout the current frontend session.
 */
export function logoutUser(): void {
  apiClient.clearToken();
}