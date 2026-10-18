import { apiClient, PageResponse } from "@/lib/api-client";

export type { PageResponse };

/** Backend enum PaymentMode. */
export type PaymentMode = "RAZORPAY" | "UPI" | "PAYTM" | "CASH" | "OTHER";

/** Backend enum PaymentStatusEnum. */
export type PaymentRecordStatus = "SUBMITTED" | "VERIFIED" | "REJECTED" | "REFUNDED";

export interface CreatePaymentOrderResponse {
  razorpayOrderId: string;
  razorpayKeyId: string;
  amountInPaise: number;
  currency: string;
  registrationId: number;
}

export interface VerifyPaymentRequest {
  registrationId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentResponse {
  id: number;
  registrationId: number;
  amount: number;
  mode: PaymentMode;
  status: PaymentRecordStatus;
  txnReference?: string | null;
  verifiedAt?: string | null;
  refundedAt?: string | null;
  refundReference?: string | null;
  refundNote?: string | null;
}

export interface ManualPaymentRequest {
  registrationId: number;
  mode: PaymentMode;
  txnReference?: string;
  screenshotUrl?: string;
}

export interface RefundRequest {
  refundReference?: string;
  note?: string;
}

export async function createPaymentOrder(
  registrationId: number
): Promise<CreatePaymentOrderResponse> {
  return apiClient.post<CreatePaymentOrderResponse>(
    `/api/payments/create-order/${registrationId}`
  );
}

export async function verifyPayment(
  data: VerifyPaymentRequest
): Promise<PaymentResponse> {
  return apiClient.post<PaymentResponse>(
    "/api/payments/verify",
    data
  );
}

/** GET /api/payments/me returns a plain list. */
export async function getMyPayments(): Promise<PaymentResponse[]> {
  return apiClient.get<PaymentResponse[]>("/api/payments/me");
}

export async function createManualPayment(
  data: ManualPaymentRequest
): Promise<PaymentResponse> {
  return apiClient.post<PaymentResponse>(
    "/api/admin/payments/manual",
    data
  );
}

export async function getAdminPayments(
  page = 0,
  size = 20,
  status?: string,
  registrationId?: number,
  eventId?: number,
  challengeId?: number
): Promise<PageResponse<PaymentResponse>> {
  const params = new URLSearchParams();

  if (status && status !== "ALL") {
    params.set("status", status);
  }

  if (registrationId) {
    params.set("registrationId", String(registrationId));
  }

  if (eventId) {
    params.set("eventId", String(eventId));
  }

  if (challengeId) {
    params.set("challengeId", String(challengeId));
  }

  params.set("page", String(page));
  params.set("size", String(size));

  return apiClient.get<PageResponse<PaymentResponse>>(
    `/api/admin/payments?${params.toString()}`
  );
}

export async function refundPayment(
  paymentId: number,
  data: RefundRequest = {}
): Promise<PaymentResponse> {
  return apiClient.post<PaymentResponse>(
    `/api/admin/payments/${paymentId}/refund`,
    data
  );
}

export async function refundRegistration(
  registrationId: number,
  data: RefundRequest = {}
): Promise<PaymentResponse> {
  return apiClient.post<PaymentResponse>(
    `/api/admin/registrations/${registrationId}/refund`,
    data
  );
}
