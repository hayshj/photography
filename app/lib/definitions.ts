export interface Image {
    id: string;
    url: string;
    title: string;
    description?: string;
    dateAdded: string;  // ISO 8601 date string
}
export interface Gallery {
    id: string;
    name: string;
    description?: string;
    images: Image[];
}
export interface User {
    id: string;
    username: string;
    email: string;
    profilePicture?: string; // URL or path to the profile image
}
export interface ApiResponse<T> {
    data: T;
    error?: string;
    message?: string;
}
export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}
export interface ImageMetadata {
    cameraModel?: string;
    lens?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: number;
    focalLength?: string;
}
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif'] as const;
export type ImageFileFormat = typeof SUPPORTED_IMAGE_FORMATS[number];
export type SortOrder = 'asc' | 'desc';
export interface SortOptions {
    field: 'title' | 'dateAdded' | 'popularity'; // Adjust fields based on your use case
    order: SortOrder;
}

export interface FilterOptions {
    query?: string; // Search query
    category?: string; // Filter by category if needed
}
export interface ErrorResponse {
    code: number;
    message: string;
}
export const DEFAULT_PAGE_SIZE = 20;
export const API_BASE_URL = 'https://your-api.com';
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
  