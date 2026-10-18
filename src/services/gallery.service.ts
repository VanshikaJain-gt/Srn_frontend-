import { apiClient, MAX_PAGE_SIZE, PageResponse } from "@/lib/api-client";

/** Exact backend GalleryResponse DTO. */
export interface GalleryResponse {
  id: number;
  eventId: number | null;
  imageUrl: string;
  caption: string | null;
  category: string | null;
  published: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** Backend GalleryRequest: only imageUrl is required. */
export interface GalleryRequest {
  eventId: number | null;
  imageUrl: string;
  caption: string | null;
  category: string | null;
  published: boolean;
}

export type CreateGalleryRequest = GalleryRequest;
export type UpdateGalleryRequest = GalleryRequest;

/**
 * Admin: GET /api/admin/gallery always returns a PageResponse.
 * Loads the largest page the backend allows.
 */
export async function getAdminGallery(): Promise<GalleryResponse[]> {
  const response = await apiClient.get<PageResponse<GalleryResponse>>(
    `/api/admin/gallery?page=0&size=${MAX_PAGE_SIZE}`
  );

  return response.content ?? [];
}

/**
 * Public: without page/size the backend returns a plain list of published items.
 */
export async function getPublicGallery(): Promise<GalleryResponse[]> {
  return apiClient.get<GalleryResponse[]>("/api/gallery");
}

/**
 * Admin: Create gallery item.
 */
export async function createGallery(
  data: CreateGalleryRequest
): Promise<GalleryResponse> {
  return apiClient.post<GalleryResponse>("/api/admin/gallery", data);
}

/**
 * Admin: Update gallery item.
 */
export async function updateGallery(
  id: number,
  data: UpdateGalleryRequest
): Promise<GalleryResponse> {
  return apiClient.put<GalleryResponse>(
    `/api/admin/gallery/${id}`,
    data
  );
}

/**
 * Admin: Delete gallery item.
 */
export async function deleteGallery(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/gallery/${id}`);
}