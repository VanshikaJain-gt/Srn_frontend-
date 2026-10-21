import { apiClient, MAX_PAGE_SIZE, PageResponse } from "@/lib/api-client";

/** Backend enum ActivitySource. */
export type ActivitySource = "MANUAL" | "STRAVA";
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
  /** Who submitted the activity. */
  userName?: string | null;
  /** Proof link or screenshot URL; null for activities logged before proof was required. */
  proofUrl?: string | null;
}

/** Exact request contract accepted by POST /api/activities. */
export interface CreateManualActivityRequest {
  challengeId: number;
  distanceKm: number;
  durationSec: number;
  activityDate: string;
  caption?: string | null;
  /** Required: http(s) link to the run or uploaded screenshot URL (max 1000 chars). */
  proofUrl: string;
}

export interface RejectActivityRequest {
  reason: string;
}

export type ActivityPageResponse = PageResponse<ActivityResponse>;

export function getActivityStatus(activity: ActivityResponse): ActivityStatus {
  if (activity.verified === true) return "VERIFIED";
  if (activity.rejectionReason) return "REJECTED";
  return "PENDING";
}

/**
 * The URL if it is an absolute http(s) URL, otherwise null. Use before
 * rendering a user-supplied URL as a link (blocks javascript:, data: etc.).
 */
export function safeHttpUrl(value?: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export function getDurationMinutes(activity: ActivityResponse): number {
  return Math.round(activity.durationSec / 60);
}

export async function createManualActivity(
  data: CreateManualActivityRequest
): Promise<ActivityResponse> {
  return apiClient.post<ActivityResponse>("/api/activities", data);
}

/** GET /api/activities/me returns a plain list. */
export async function getMyActivities(): Promise<ActivityResponse[]> {
  return apiClient.get<ActivityResponse[]>("/api/activities/me");
}

export async function getActivityById(id: number): Promise<ActivityResponse> {
  return apiClient.get<ActivityResponse>(`/api/activities/${id}`);
}

/**
 * Admin: newest activities first (backend sorts DESC). Loads the largest page
 * the backend allows; older activities beyond that are not shown.
 */
export async function getAdminActivities(): Promise<ActivityPageResponse> {
  return apiClient.get<ActivityPageResponse>(
    `/api/admin/activities?page=0&size=${MAX_PAGE_SIZE}&sort=activityDate`
  );
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
