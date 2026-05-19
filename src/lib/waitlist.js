import { supabase } from "../supabaseClient";

const COUNT_CACHE_KEY = "exfin_wl_count";
const COUNT_CACHE_TTL = 60_000; // 60s

export const waitlist = {
  async insert(row) {
    const { data, error } = await supabase
      .from("waitlist")
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    sessionStorage.removeItem(COUNT_CACHE_KEY);
    return data;
  },

  // Blind duplicate detection: attempt insert and catch UNIQUE violation.
  // Never pre-queries — prevents email enumeration.
  isDuplicateError(error) {
    return error?.code === "23505"; // Postgres unique_violation
  },

  async getAll() {
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("joined_at", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async deleteAll() {
    const { error } = await supabase.from("waitlist").delete().gte("id", 0);
    if (error) throw error;
    sessionStorage.removeItem(COUNT_CACHE_KEY);
  },

  async getCount() {
    const cached = sessionStorage.getItem(COUNT_CACHE_KEY);
    if (cached) {
      const { value, ts } = JSON.parse(cached);
      if (Date.now() - ts < COUNT_CACHE_TTL) return value;
    }
    const { data, error } = await supabase.rpc("get_waitlist_count");
    if (error) throw error;
    const value = data || 0;
    sessionStorage.setItem(COUNT_CACHE_KEY, JSON.stringify({ value, ts: Date.now() }));
    return value;
  },
};
