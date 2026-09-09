import { apiClient } from "@/lib/api-client";
import {
  Challenge,
  ChallengeStatus,
  CategoryType,
  ActivityType,
} from "@/services/challenge.service";

export interface AdminCategoryRequest {
  id?: number;
  name: string;
  categoryType: CategoryType;
  targetKm: number | null;
  maxDurationMinutes: number | null;
  minDaysForFinisher: number | null;
  fee: number;
  activityType: ActivityType;
  minDistancePerActivityKm: number;
  maxPaceMinPerKm: number;
}

export interface ChallengeRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  stravaCaptionTag: string;
  categories: AdminCategoryRequest[];
}

export async function createAdminChallenge(
  data: ChallengeRequest
): Promise<Challenge> {
  return apiClient.post<Challenge>(
    "/api/admin/challenges",
    data
  );
}

export async function updateAdminChallenge(
  id: number,
  data: ChallengeRequest
): Promise<Challenge> {
  return apiClient.put<Challenge>(
    `/api/admin/challenges/${id}`,
    data
  );
}

export async function updateAdminChallengeStatus(
  id: number,
  status: ChallengeStatus
): Promise<Challenge> {
  return apiClient.put<Challenge>(
    `/api/admin/challenges/${id}/status?status=${encodeURIComponent(status)}`
  );
}

export async function deleteAdminChallenge(
  id: number
): Promise<void> {
  await apiClient.delete<void>(
    `/api/admin/challenges/${id}`
  );
}