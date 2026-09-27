import { apiClient } from "@/lib/api-client";

export type ActivitySource = "MANUAL" | "STRAVA" | string;
export type ActivityStatus = "PENDING" | "VERIFIED" | "REJECTED" | string;

export interface ActivityResponse {
  id: number;
  registrationId?: number | null;
  challengeId?: number | null;
  challengeTitle?: string | null;
  activityDate: string;
  distanceKm: number;
  durationMinutes?: number | null;
  activityType?: string | null;
  source?: ActivitySource | null;
  status?: ActivityStatus | null;
  rejectionReason?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateManualActivityRequest {
  challengeId: number;
  activityDate: string;
  distanceKm: number;
  durationSec: number;
  activityType?: string | null;
}

export interface RejectActivityRequest {
  reason?: string;
}

/**
 * Spring Data pagination response used by the backend.
 */
export interface ActivityPageResponse {
  content: ActivityResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

/**
 * User: submit a manual activity.
 */
export async function createManualActivity(
  data: CreateManualActivityRequest
): Promise<ActivityResponse> {
  return apiClient.post<ActivityResponse>("/api/activities", data);
}

/**
 * User: current user's activity history.
 *
 * Supports both:
 * 1. Plain ActivityResponse[]
 * 2. Spring Page response
 */
export async function getMyActivities(): Promise<ActivityResponse[]> {
  const response = await apiClient.get<
    ActivityResponse[] | ActivityPageResponse
  >("/api/activities/me");

  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response?.content) ? response.content : [];
}

/**
 * User: activity details.
 */
export async function getActivityById(
  id: number
): Promise<ActivityResponse> {
  return apiClient.get<ActivityResponse>(`/api/activities/${id}`);
}

/**
 * Admin: all activities available for moderation.
 *
 * Backend returns a Spring Page.
 *
 * IMPORTANT:
 * Backend currently supports:
 *   sort=activityDate
 *
 * Do NOT use:
 *   sort=activityDate,desc
 */
export async function getAdminActivities(): Promise<ActivityResponse[]> {
  const response = await apiClient.get<
    ActivityResponse[] | ActivityPageResponse
  >("/api/admin/activities?page=0&size=20&sort=activityDate");

  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response?.content) ? response.content : [];
}

/**
 * Admin: verify a submitted activity.
 */
export async function verifyActivity(
  id: number
): Promise<ActivityResponse> {
  return apiClient.put<ActivityResponse>(
    `/api/admin/activities/${id}/verify`
  );
}

/**
 * Admin: reject a submitted activity.
 */
export async function rejectActivity(
  id: number,
  data: RejectActivityRequest = {}
): Promise<ActivityResponse> {
  return apiClient.put<ActivityResponse>(
    `/api/admin/activities/${id}/reject`,
    data
  );
}