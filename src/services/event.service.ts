import { apiClient } from "@/lib/api-client";

/** Backend enum EventStatus. */
export type EventStatus =
  | "UPCOMING"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

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

/** Without query params the backend returns a plain list (not a page). */
export async function getEvents(): Promise<EventResponse[]> {
  return apiClient.get<EventResponse[]>("/api/events");
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
