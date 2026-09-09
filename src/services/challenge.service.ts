import { apiClient } from "@/lib/api-client";

export type ChallengeStatus =
  | "UPCOMING"
  | "ACTIVE"
  | "RESULTS_PENDING"
  | "COMPLETED";

export type CategoryType =
  | "DISTANCE_TARGET"
  | "PACE_DURATION";

export type ActivityType =
  | "RUN"
  | "WALK"
  | "RIDE";

export interface ChallengeCategory {
  id: number;
  name: string;
  categoryType: CategoryType;
  targetKm: number | null;
  maxDurationMinutes: number | null;
  minDaysForFinisher: number | null;
  fee: number | null;
  activityType: ActivityType | null;
  minDistancePerActivityKm: number | null;
  maxPaceMinPerKm: number | null;
}

export interface Challenge {
  id: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  stravaCaptionTag: string | null;
  status: ChallengeStatus;
  categories: ChallengeCategory[];
}

export async function getChallenges(): Promise<Challenge[]> {
  return apiClient.get<Challenge[]>("/api/challenges");
}

export async function getChallengeById(
  id: number
): Promise<Challenge> {
  return apiClient.get<Challenge>(`/api/challenges/${id}`);
}