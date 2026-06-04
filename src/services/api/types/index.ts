export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  cache?: boolean;
  message: string;
}

// ─── Common ─────────────────────────────────────────────────

export interface AnimeCard {
  title: string;
  slug: string;
  poster: string;
  score: number;
  type: string;
  status: string | null;
  year: number;
}

export interface SlugName {
  name: string;
  slug: string;
}

// ─── Genres ─────────────────────────────────────────────────

export interface Genre {
  name: string;
  slug: string;
  count: number;
  letter: string;
}

export interface GenresData {
  totalGenres: number;
  totalAnime: number;
  genres: Genre[];
}

// ─── Genre Detail ────────────────────────────────────────────

export interface GenreDetailData {
  title: string;
  slug: string;
  totalAnime: number;
  currentPage: number;
  lastPage: number;
  anime: AnimeCard[];
}

// ─── Anime List ──────────────────────────────────────────────

export interface AnimeListParams {
  page?: number;
  status?: "ongoing" | "completed" | "upcoming";
  type?: "tv" | "movie" | "ova" | "ona" | "special";
  order?: "update" | "title" | "score";
}

export interface AnimeListData {
  totalAnime: number;
  currentPage: number;
  lastPage: number;
  anime: AnimeCard[];
}

// ─── Ongoing / Popular ───────────────────────────────────────

export interface PopularAnimeItem {
  rank: number;
  title: string;
  slug: string;
  endpoint: string;
  url_sumber: string;
  thumbnail: string;
  score: string;
  type: string;
  status: string;
  viewCount: number;
}

export interface PopularAnimeData {
  mingguan: PopularAnimeItem[];
  bulanan: PopularAnimeItem[];
  sepanjangMasa: PopularAnimeItem[];
}

// ─── Anime Detail ────────────────────────────────────────────

export interface EpisodeRef {
  title: string;
  slug: string;
  episodeNumber: number;
}

export interface AnimeDetailData {
  title: string;
  slug: string;
  poster: string;
  score: number;
  type: string;
  status: string;
  year: number;
  duration: string | null;
  season: string | null;
  studio: string | null;
  synopsis: string;
  genres: SlugName[];
  directors: SlugName[];
  cast: SlugName[];
  totalEpisodes: number;
  episodes: EpisodeRef[];
  batchDownloads: unknown[];
  relatedAnime: { title: string; slug: string; poster: string }[];
}

// ─── Episode Detail ──────────────────────────────────────────

export interface StreamingMirror {
  id: number;
  serverName: string;
  embedUrl: string;
  embedType: string;
  quality: string;
}

export interface DownloadLink {
  quality: string;
  label: string;
  url: string;
}

export interface OtherEpisode {
  title: string;
  slug: string;
  episodeNumber: number;
}

export interface EpisodeDetailData {
  title: string;
  slug: string;
  episodeNumber: number;
  episodeId: number;
  anime: { title: string; slug: string };
  streamingMirrors: StreamingMirror[];
  downloadLinks: DownloadLink[];
  prevEpisode: { slug: string; url: string } | null;
  nextEpisode: { slug: string; url: string } | null;
  otherEpisodes: OtherEpisode[];
  genres: SlugName[];
}

// ─── Schedule ────────────────────────────────────────────────

export type ScheduleDay =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun"
  | "random"
  | "libur"
  | "hiatus"
  | "end";

export interface ScheduleAnimeItem {
  title: string;
  slug: string;
  time: string;
  type: string;
}

export interface ScheduleDayData {
  day: string;
  anime: ScheduleAnimeItem[];
}

export type ScheduleData = {
  schedule: Record<ScheduleDay, ScheduleDayData>;
};

// ─── Search ──────────────────────────────────────────────────

export interface SearchResult {
  id: number;
  title: string;
  slug: string;
  poster: string;
  type: string;
  status: string;
  year: number;
  score: number;
  viewCount: number;
}

export interface SearchData {
  query: string;
  totalResults: number;
  results: SearchResult[];
}
