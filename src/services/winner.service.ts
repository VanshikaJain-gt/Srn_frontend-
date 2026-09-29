import { apiClient } from "@/lib/api-client";

export type AwardType =
  | "CATEGORY_WINNER"
  | "OVERALL_WINNER"
  | string;

export interface WinnerResponse {
  id: number;
  challengeId: number;
  categoryId?: number | null;
  categoryName?: string | null;
  name: string;
  profilePhotoUrl?: string | null;
  rank: number;
  awardType: AwardType;
  awardNote?: string | null;
  announcedAt?: string | null;
}

export interface CreateWinnerRequest {
  challengeId: number;
  categoryId: number;
  userId: number;
  rank: number;
  awardType: AwardType;
  awardNote?: string | null;
}

/**
 * Admin: create / announce a winner.
 */
export async function createWinner(
  data: CreateWinnerRequest
): Promise<WinnerResponse> {
  return apiClient.post<WinnerResponse>(
    "/api/admin/winners",
    data
  );
}

/**
 * Public/User: get winners for a challenge.
 */
export async function getChallengeWinners(
  challengeId: number
): Promise<WinnerResponse[]> {
  const response = await apiClient.get<WinnerResponse[]>(
    `/api/challenges/${challengeId}/winners`
  );

  return Array.isArray(response) ? response : [];
}

/**
 * Admin: update winner.
 *
 * PUT request body will be added once we confirm
 * the exact Swagger request schema for this endpoint.
 */
export async function updateWinner(
  id: number,
  data: Partial<CreateWinnerRequest>
): Promise<WinnerResponse> {
  return apiClient.put<WinnerResponse>(
    `/api/admin/winners/${id}`,
    data
  );
}

/**
 * Admin: delete winner.
 */
export async function deleteWinner(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/winners/${id}`);
}