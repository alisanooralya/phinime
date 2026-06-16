import { errorBus } from "./errorBus";
import type { ApiResponse } from "../types";

export function getBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_BASE_URL;
  if (!url) {
    throw new Error(
      "❌  BASE_URL tidak ditemukan di environment variables.\n" +
        "   Pastikan file .env sudah berisi: BASE_URL=https://...\n" +
        "   dan sudah di-load (dotenv.config()) sebelum memanggil API.",
    );
  }
  return url.replace(/\/$/, "");
}

export async function apiFetch<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<ApiResponse<T>> {
  const base = getBaseUrl();

  const qs = params
    ? "?" +
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(
          ([k, v]) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
        )
        .join("&")
    : "";

  const url = `${base}${path}${qs}`;

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    if (res.status === 502 || res.status >= 500) {
      errorBus.emit(res.status);
    }
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}`);
  }

  const json: ApiResponse<T> = await res.json();

  if (!json.ok) {
    throw new Error(`API error: ${json.message} — ${url}`);
  }

  return json;
}
