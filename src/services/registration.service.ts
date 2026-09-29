import { apiClient } from "@/lib/api-client";

export type TshirtSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type PaymentStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "PAID"
  | "VERIFIED"
  | string;

export type RegistrationStatus = "ACTIVE" | "CANCELLED" | "COMPLETED" | string;

export interface CreateEventRegistrationRequest {
  eventId: number;
  tshirtSize: TshirtSize;
}

export interface CreateChallengeRegistrationRequest {
  challengeId: number;
  categoryId: number;
  tshirtSize: TshirtSize;
}

export interface RegistrationResponse {
  id: number;
  challengeId?: number | null;
  challengeTitle?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  eventId?: number | null;
  eventTitle?: string | null;
  tshirtSize?: TshirtSize | null;
  paymentStatus: PaymentStatus;
  amount?: number | null;
  feePaid?: number | null;
  registrationSource?: string | null;
  registrationStatus?: RegistrationStatus | null;
  registeredAt?: string | null;
  createdAt?: string | null;
}

export async function registerForEvent(
  data: CreateEventRegistrationRequest
): Promise<RegistrationResponse> {
  return apiClient.post<RegistrationResponse>("/api/registrations", data);
}

export async function registerForChallenge(
  data: CreateChallengeRegistrationRequest
): Promise<RegistrationResponse> {
  return apiClient.post<RegistrationResponse>("/api/registrations", data);
}

export async function getMyRegistrations(): Promise<RegistrationResponse[]> {
  return apiClient.get<RegistrationResponse[]>("/api/registrations/me");
}


export async function cancelMyRegistration(
  registrationId: number
): Promise<RegistrationResponse> {
  return apiClient.put<RegistrationResponse>(
    `/api/registrations/${registrationId}/cancel`
  );
}

export async function cancelAdminRegistration(
  registrationId: number
): Promise<RegistrationResponse> {
  return apiClient.put<RegistrationResponse>(
    `/api/admin/registrations/${registrationId}/cancel`
  );
}
