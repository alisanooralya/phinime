import { apiFetch } from "../utils/fetcher";
import type {
  ApiResponse,
  AnimeListData,
  AnimeListParams,
  AnimeDetailData,
  PopularAnimeData,
  RecentAnimeData,
} from "../types";

/**
 * GET /api/anime/recent
 * Mengambil daftar anime yang baru diperbarui.
 */
export async function getRecentAnime(): Promise<ApiResponse<RecentAnimeData>> {
  return apiFetch<RecentAnimeData>("/api/anime/recent");
}

/**
 * GET /api/anime?page=1&status=ongoing&type=tv&order=update
 * Mengambil daftar anime dengan filter opsional.
 */
export async function getAnimeList(
  params: AnimeListParams = {},
): Promise<ApiResponse<AnimeListData>> {
  const { page = 1, status, type, order } = params;
  return apiFetch<AnimeListData>("/api/anime", { page, status, type, order });
}

/**
 * GET /api/anime/ongoing?page=1
 * Mengambil daftar anime yang sedang tayang (ongoing).
 *
 * @param page - halaman (default 1)
 */
export async function getOngoingAnime(
  page = 1,
): Promise<ApiResponse<AnimeListData>> {
  return apiFetch<AnimeListData>("/api/anime/ongoing", { page });
}

/**
 * GET /api/anime/popular
 * Mengambil anime populer (mingguan, bulanan, sepanjang masa).
 */
export async function getPopularAnime(): Promise<
  ApiResponse<PopularAnimeData>
> {
  return apiFetch<PopularAnimeData>("/api/anime/popular");
}

/**
 * GET /api/anime/:slug
 * Mengambil detail lengkap satu judul anime.
 *
 * @param slug - slug anime, contoh: "one-piece-subtitle-indonesia"
 */
export async function getAnimeDetail(
  slug: string,
): Promise<ApiResponse<AnimeDetailData>> {
  return apiFetch<AnimeDetailData>(`/api/anime/${slug}`);
}
