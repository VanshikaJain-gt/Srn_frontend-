import { apiClient } from "@/lib/api-client";

export type ActivitySource = "MANUAL" | "STRAVA" | string;
export type ActivityStatus = "PENDING" | "VERIFIED" | "REJECTED";

/** Exact response contract returned by the Spring Boot ActivityResponse DTO. */
export interface ActivityResponse {
  id: number;
  userId: number;
  challengeId: number;
  challengeTitle?: string | null;
  stravaActivityId?: string | null;
  source?: ActivitySource | null;
  distanceKm: number;
  durationSec: number;
  activityDate: string;
  caption?: string | null;
  captionValid?: boolean | null;
  verified?: boolean | null;
  rejectionReason?: string | null;
  syncedAt?: string | null;
}

/** Exact request contract accepted by POST /api/activities. */
export interface CreateManualActivityRequest {
  challengeId: number;
  distanceKm: number;
  durationSec: number;
  activityDate: string;
  caption?: string | null;
}

export interface RejectActivityRequest {
  reason: string;
}

export interface ActivityPageResponse {
  content: ActivityResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export function getActivityStatus(activity: ActivityResponse): ActivityStatus {
  if (activity.verified === true) return "VERIFIED";
  if (activity.rejectionReason) return "REJECTED";
  return "PENDING";
}

export function getDurationMinutes(activity: ActivityResponse): number {
  return Math.round(activity.durationSec / 60);
}

export async function createManualActivity(
  data: CreateManualActivityRequest
): Promise<ActivityResponse> {
  return apiClient.post<ActivityResponse>("/api/activities", data);
}

export async function getMyActivities(): Promise<ActivityResponse[]> {
  const response = await apiClient.get<
    ActivityResponse[] | ActivityPageResponse
  >("/api/activities/me");

  return Array.isArray(response) ? response : response.content ?? [];
}

export async function getActivityById(id: number): Promise<ActivityResponse> {
  return apiClient.get<ActivityResponse>(`/api/activities/${id}`);
}

export async function getAdminActivities(): Promise<ActivityResponse[]> {
  const response = await apiClient.get<ActivityPageResponse>(
    "/api/admin/activities?page=0&size=20&sort=activityDate"
  );

  return response.content ?? [];
}

export async function verifyActivity(id: number): Promise<ActivityResponse> {
  return apiClient.put<ActivityResponse>(`/api/admin/activities/${id}/verify`);
}

export async function rejectActivity(
  id: number,
  data: RejectActivityRequest
): Promise<ActivityResponse> {
  return apiClient.put<ActivityResponse>(
    `/api/admin/activities/${id}/reject`,
    data
  );
}
