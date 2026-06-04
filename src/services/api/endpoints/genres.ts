import { apiFetch } from "../utils/fetcher";
import type { ApiResponse, GenresData, GenreDetailData } from "../types";

/**
 * GET /api/genres
 * Mengambil daftar semua genre beserta jumlah anime per genre.
 */
export async function getGenres(): Promise<ApiResponse<GenresData>> {
  return apiFetch<GenresData>("/api/genres");
}

/**
 * GET /api/genres/:slug?page=1
 * Mengambil daftar anime berdasarkan genre tertentu.
 *
 * @param slug  - slug genre, contoh: "action", "fantasy"
 * @param page  - halaman (default 1)
 */
export async function getGenreDetail(
  slug: string,
  page = 1,
): Promise<ApiResponse<GenreDetailData>> {
  return apiFetch<GenreDetailData>(`/api/genres/${slug}`, { page });
}
