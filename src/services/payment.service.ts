import { apiClient } from "@/lib/api-client";

export interface CreatePaymentOrderResponse {
  razorpayOrderId: string;
  razorpayKeyId: string;
  amountInPaise: number;
  currency: string;
}

export interface VerifyPaymentRequest {
  registrationId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  registrationId: number;
  paymentStatus: string;
}

export async function createPaymentOrder(
  registrationId: number
): Promise<CreatePaymentOrderResponse> {
  return apiClient.post<CreatePaymentOrderResponse>(
    `/api/payments/create-order/${registrationId}`,
    {}
  );
}

export async function verifyPayment(
  data: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> {
  return apiClient.post<VerifyPaymentResponse>(
    "/api/payments/verify",
    data
  );
}