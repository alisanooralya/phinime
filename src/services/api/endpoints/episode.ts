import { apiFetch } from "../utils/fetcher";
import type { ApiResponse, EpisodeDetailData } from "../types";

/**
 * GET /api/episode/:slug
 * Mengambil detail episode: link streaming & download per kualitas.
 *
 * @param slug - slug episode, contoh: "one-piece-episode-1100-subtitle-indonesia"
 */
export async function getEpisodeDetail(
  slug: string,
): Promise<ApiResponse<EpisodeDetailData>> {
  return apiFetch<EpisodeDetailData>(`/api/episode/${slug}`);
}
