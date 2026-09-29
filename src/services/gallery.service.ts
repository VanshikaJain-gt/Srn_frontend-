import { apiClient } from "@/lib/api-client";

export interface GalleryResponse {
  id: number;
  eventId: number;
  imageUrl: string;
  caption: string;
  category: string;
  published: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateGalleryRequest {
  eventId: number;
  imageUrl: string;
  caption: string;
  category: string;
  published: boolean;
}

export interface UpdateGalleryRequest {
  eventId: number;
  imageUrl: string;
  caption: string;
  category: string;
  published: boolean;
}

interface GalleryPageResponse {
  content: GalleryResponse[];
  totalElements?: number;
  totalPages?: number;
  page?: number;
  size?: number;
}

/**
 * Admin: Get all gallery items.
 */
export async function getAdminGallery(): Promise<GalleryResponse[]> {
  const response = await apiClient.get<
    GalleryResponse[] | GalleryPageResponse
  >("/api/admin/gallery");

  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response?.content) ? response.content : [];
}

/**
 * Public: Get published gallery items.
 */
export async function getPublicGallery(): Promise<GalleryResponse[]> {
  const response = await apiClient.get<
    GalleryResponse[] | GalleryPageResponse
  >("/api/gallery");

  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response?.content) ? response.content : [];
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