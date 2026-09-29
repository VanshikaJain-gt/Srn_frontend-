import { apiClient } from "@/lib/api-client";

export type EventStatus =
  | "UPCOMING"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export interface EventResponse {
  id: number;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  location?: string | null;
  bannerImageUrl?: string | null;
  registrationFee?: number | null;
  status: EventStatus;
  isExternal: boolean;
  organizerName?: string | null;
  externalRegistrationUrl?: string | null;
}

export interface EventCreateRequest {
  title: string;
  description?: string | null;
  eventDate?: string | null;
  location?: string | null;
  bannerImageUrl?: string | null;
  isExternal: boolean;
  registrationFee?: number | null;
  organizerName?: string | null;
  externalRegistrationUrl?: string | null;
}

export interface EventUpdateRequest extends EventCreateRequest {
  status?: EventStatus | null;
}

export async function getEvents(): Promise<EventResponse[]> {
  const data = await apiClient.get<
    EventResponse[] | { content?: EventResponse[] }
  >("/api/events");

  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data.content) ? data.content : [];
}

export async function getEventById(id: number): Promise<EventResponse> {
  return apiClient.get<EventResponse>(`/api/events/${id}`);
}

export async function createAdminEvent(
  request: EventCreateRequest
): Promise<EventResponse> {
  return apiClient.post<EventResponse>("/api/admin/events", request);
}

export async function updateAdminEvent(
  id: number,
  request: EventUpdateRequest
): Promise<EventResponse> {
  return apiClient.put<EventResponse>(`/api/admin/events/${id}`, request);
}

export async function deleteAdminEvent(id: number): Promise<void> {
  await apiClient.delete<void>(`/api/admin/events/${id}`);
}
