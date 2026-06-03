import { supabase } from "@/lib/supabase";

export async function saveSearchHistory(
  userId: string,
  query: string,
): Promise<void> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return;

  const { data } = await supabase
    .from("search_history")
    .upsert(
      { user_id: userId, query: trimmedQuery },
      { onConflict: "user_id,query", ignoreDuplicates: false },
    )
    .select()
    .single();

  return data;
}

export async function getSearchHistory(
  userId: string,
  limit = 10,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("search_history")
    .select("query")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => row.query);
}

export async function clearSearchHistory(userId: string): Promise<void> {
  await supabase.from("search_history").delete().eq("user_id", userId);
}

export async function deleteSearchHistoryItem(
  userId: string,
  query: string,
): Promise<void> {
  await supabase
    .from("search_history")
    .delete()
    .eq("user_id", userId)
    .eq("query", query);
}
