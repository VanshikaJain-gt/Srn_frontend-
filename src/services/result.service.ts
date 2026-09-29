import { apiClient } from "@/lib/api-client";

export type AwardType =
  | "CATEGORY_WINNER"
  | "FINISHER"
  | "SPECIAL_RECOGNITION";

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  profilePhotoUrl?: string | null;
  totalVerifiedKm: number;
  activityCount: number;
  activeDays: number;
}

export interface WinnerResponse {
  id: number;
  challengeId: number;
  categoryId?: number | null;
  categoryName?: string | null;
  name: string;
  profilePhotoUrl?: string | null;
  rank?: number | null;
  awardType: AwardType;
  awardNote?: string | null;
  announcedAt?: string | null;
}

export interface WinnerRequest {
  challengeId: number;
  categoryId?: number | null;
  userId: number;
  rank?: number | null;
  awardType: AwardType;
  awardNote?: string | null;
}

/**
 * Public: get the automatically calculated leaderboard
 * for a challenge.
 */
export async function getChallengeLeaderboard(
  challengeId: number
): Promise<LeaderboardEntry[]> {
  return apiClient.get<LeaderboardEntry[]>(
    `/api/challenges/${challengeId}/leaderboard`
  );
}

/**
 * Public: get the final admin-decided winners
 * for a challenge.
 */
export async function getChallengeWinners(
  challengeId: number
): Promise<WinnerResponse[]> {
  return apiClient.get<WinnerResponse[]>(
    `/api/challenges/${challengeId}/winners`
  );
}

/**
 * Admin: create a final winner entry.
 */
export async function createWinner(
  data: WinnerRequest
): Promise<WinnerResponse> {
  return apiClient.post<WinnerResponse>("/api/admin/winners", data);
}

/**
 * Admin: update a winner entry.
 */
export async function updateWinner(
  id: number,
  data: WinnerRequest
): Promise<WinnerResponse> {
  return apiClient.put<WinnerResponse>(`/api/admin/winners/${id}`, data);
}

/**
 * Admin: delete a winner entry.
 */
export async function deleteWinner(id: number): Promise<void> {
  await apiClient.delete<void>(`/api/admin/winners/${id}`);
}
