import { apiClient, MAX_PAGE_SIZE, PageResponse } from "@/lib/api-client";

export const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

// Backend stores tshirtSize as a free string (max 10); the UI offers these sizes.
export type TshirtSize = (typeof TSHIRT_SIZES)[number];

/** Backend enum RegistrationPaymentStatus. */
export type PaymentStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "PAID"
  | "VERIFIED"
  | "REFUNDED";

/** Backend enum RegistrationStatus. */
export type RegistrationStatus = "ACTIVE" | "CANCELLED";

/** Backend enum RegistrationSource. */
export type RegistrationSource = "APP" | "ADMIN_MANUAL";

/** Payment statuses that allow activity submission / leaderboard entry (backend rule). */
export const PARTICIPATION_ALLOWED: PaymentStatus[] = [
  "PAID",
  "VERIFIED",
  "NOT_REQUIRED",
];

export interface CreateEventRegistrationRequest {
  eventId: number;
  tshirtSize: TshirtSize;
}

export interface CreateChallengeRegistrationRequest {
  challengeId: number;
  categoryId: number;
  tshirtSize: TshirtSize;
}

/** Exact backend RegistrationResponse DTO. */
export interface RegistrationResponse {
  id: number;
  challengeId: number | null;
  challengeTitle: string | null;
  categoryId: number | null;
  categoryName: string | null;
  eventId: number | null;
  eventTitle: string | null;
  tshirtSize: string | null;
  paymentStatus: PaymentStatus;
  /** Fee for this registration (set when registering, even before payment). */
  feePaid: number | null;
  registrationSource: RegistrationSource | null;
  registrationStatus: RegistrationStatus;
  registeredAt: string | null;
  /** Who registered (admin views; also present on the user's own list). */
  userName: string | null;
  userEmail: string | null;
}

export interface AdminRegistrationFilters {
  userId?: number;
  eventId?: number;
  challengeId?: number;
  paymentStatus?: PaymentStatus;
  registrationStatus?: RegistrationStatus;
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

/** Admin: GET /api/admin/registrations always returns a PageResponse. */
export async function getAdminRegistrations(
  filters: AdminRegistrationFilters = {},
  page = 0,
  size = MAX_PAGE_SIZE
): Promise<PageResponse<RegistrationResponse>> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value != null && value !== "") {
      params.set(key, String(value));
    }
  });

  params.set("page", String(page));
  params.set("size", String(size));

  return apiClient.get<PageResponse<RegistrationResponse>>(
    `/api/admin/registrations?${params.toString()}`
  );
}

export async function cancelAdminRegistration(
  registrationId: number
): Promise<RegistrationResponse> {
  return apiClient.put<RegistrationResponse>(
    `/api/admin/registrations/${registrationId}/cancel`
  );
}
