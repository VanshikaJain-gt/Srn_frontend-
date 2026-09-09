import { apiClient } from "@/lib/api-client";

export type TshirtSize =
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL";

export type PaymentStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "PAID"
  | "VERIFIED";

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
  createdAt?: string | null;
}

export async function registerForChallenge(
  data: CreateChallengeRegistrationRequest
): Promise<RegistrationResponse> {
  return apiClient.post<RegistrationResponse>(
    "/api/registrations",
    data
  );
}

export async function getMyRegistrations(): Promise<
  RegistrationResponse[]
> {
  return apiClient.get<RegistrationResponse[]>(
    "/api/registrations/me"
  );
}