import { apiFetch } from "../utils/fetcher";
import type { ApiResponse, ScheduleData, ScheduleDay } from "../types";

/**
 * GET /api/schedule
 * Mengambil jadwal tayang anime untuk setiap hari dalam seminggu.
 */
export async function getSchedule(): Promise<ApiResponse<ScheduleData>> {
  return apiFetch<ScheduleData>("/api/schedule");
}

/**
 * Helper: mengambil jadwal satu hari tertentu.
 *
 * @param day - kunci hari: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"
 */
export async function getScheduleByDay(day: ScheduleDay) {
  const res = await getSchedule();
  return res.data.schedule[day] ?? null;
}
