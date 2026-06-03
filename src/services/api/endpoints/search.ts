import { apiFetch } from "../utils/fetcher";
import type { ApiResponse, SearchData } from "../types";

/**
 * GET /api/search?q=query
 * Mencari anime berdasarkan kata kunci.
 *
 * @param query - kata kunci pencarian, contoh: "one piece"
 */
export async function searchAnime(
  query: string,
): Promise<ApiResponse<SearchData>> {
  if (!query.trim()) throw new Error("Query pencarian tidak boleh kosong.");
  return apiFetch<SearchData>("/api/search", { q: query });
}
