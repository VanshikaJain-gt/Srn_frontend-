import { apiClient } from "@/lib/api-client";

export type EventStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" | string;

export interface EventResponse {
  id: number;
  title: string;
  description?: string | null;
  eventDate: string;
  location?: string | null;
  bannerImageUrl?: string | null;
  registrationFee: number;
  status: EventStatus;
  isExternal: boolean;
  organizerName?: string | null;
  externalRegistrationUrl?: string | null;
}

export async function getEvents(): Promise<EventResponse[]> {
  return apiClient.get<EventResponse[]>("/api/events");
}

export async function getEventById(id: number): Promise<EventResponse> {
  return apiClient.get<EventResponse>(`/api/events/${id}`);
}
