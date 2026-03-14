import { supabase, Call } from "./supabase";
import { getMytTodayRange } from "./timezone";

export async function getCalls(
  search?: string,
  outcome?: string,
  minDuration?: number,
  recentMode?: boolean,
  followUpToday?: boolean,
  limit?: number
) {
  let query = supabase
    .from("calls")
    .select("*")
    .order(recentMode ? "updated_at" : "created_at", { ascending: !recentMode });

  if (search) {
    query = query.or(
      `contact_name.ilike.%${search}%,company.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }
  if (outcome) {
    if (outcome.includes(",")) {
      query = query.in("outcome", outcome.split(","));
    } else {
      query = query.eq("outcome", outcome);
    }
  }
  if (minDuration !== undefined) {
    query = query.gte("duration_seconds", minDuration);
  }
  if (followUpToday) {
    const { start, end } = getMytTodayRange();
    query = query.gte("follow_up_at", start).lte("follow_up_at", end);
  }
  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Call[];
}

export async function getCall(id: string) {
  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Call;
}

export async function createCall(call: Omit<Call, "id" | "created_at" | "updated_at">) {
  // If an outcome is already set on creation, mark called_at immediately
  const calledAt = call.outcome ? new Date().toISOString() : null;
  const { data, error } = await supabase
    .from("calls")
    .insert({ ...call, called_at: calledAt, attempt_count: call.outcome ? 1 : 0 })
    .select()
    .single();
  if (error) throw error;
  return data as Call;
}

export async function updateCall(id: string, call: Partial<Omit<Call, "id" | "created_at" | "updated_at">>) {
  const existing = await getCall(id);
  // Auto-set called_at the first time an outcome is recorded
  const shouldSetCalledAt = call.outcome && !existing.called_at;
  // Track outcome_updated_at on 2nd+ update (outcome has value and called_at already exists)
  const shouldSetOutcomeUpdated = call.outcome && existing.called_at;
  // Increment attempt_count whenever outcome has a value
  const newAttemptCount = call.outcome ? existing.attempt_count + 1 : existing.attempt_count;
  const { data, error } = await supabase
    .from("calls")
    .update({
      ...call,
      updated_at: new Date().toISOString(),
      attempt_count: newAttemptCount,
      ...(shouldSetCalledAt ? { called_at: new Date().toISOString() } : {}),
      ...(shouldSetOutcomeUpdated ? { outcome_updated_at: new Date().toISOString() } : {}),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Call;
}

export async function deleteCall(id: string) {
  const { error } = await supabase.from("calls").delete().eq("id", id);
  if (error) throw error;
}

export async function getSetting(key: string): Promise<string | null> {
  const { data } = await supabase.from("settings").select("value").eq("key", key).single();
  return data?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase.from("settings").upsert({ key, value });
  if (error) throw error;
}

export async function getDailyGoalData() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const [goalRes, qualifiedRes] = await Promise.all([
    supabase.from("settings").select("value").eq("key", "daily_goal").single(),
    supabase
      .from("calls")
      .select("id", { count: "exact" })
      .not("called_at", "is", null)
      .gte("called_at", todayStart)
      .gte("duration_seconds", 60),
  ]);

  return {
    goal: parseInt(goalRes.data?.value || "50", 10),
    current: qualifiedRes.count || 0,
  };
}

export async function getAnalyticsData(days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("calls")
    .select("called_at, outcome")
    .not("called_at", "is", null)
    .gte("called_at", since.toISOString());

  if (error) throw error;
  const calls = data || [];

  // Daily trend: fill every day with 0, then count
  const dailyMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    dailyMap.set(d.toISOString().split("T")[0], 0);
  }
  calls.forEach((c) => {
    const date = (c.called_at as string).split("T")[0];
    dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
  });
  const dailyTrend = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

  // Outcome distribution
  const outcomeMap: Record<string, number> = {};
  calls.forEach((c) => {
    if (c.outcome) outcomeMap[c.outcome] = (outcomeMap[c.outcome] || 0) + 1;
  });
  const outcomeDistribution = Object.entries(outcomeMap).map(([outcome, count]) => ({ outcome, count }));

  return { dailyTrend, outcomeDistribution };
}

export async function getMotivationData() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const NEGATIVE = ["no_answer", "voicemail", "not_interested"];
  const POSITIVE = ["interested", "callback", "closed"];

  const [recentRes, totalNegRes] = await Promise.all([
    supabase
      .from("calls")
      .select("called_at, outcome")
      .not("called_at", "is", null)
      .gte("called_at", thirtyDaysAgo.toISOString())
      .order("called_at", { ascending: true }),
    supabase
      .from("calls")
      .select("id", { count: "exact" })
      .not("called_at", "is", null)
      .in("outcome", NEGATIVE),
  ]);

  const calls = recentRes.data || [];
  const todayCalls = calls.filter((c) => (c.called_at as string) >= todayStart);
  const historicalCalls = calls.filter((c) => (c.called_at as string) < todayStart);

  // Today's negative ratio
  const todayNegative = todayCalls.filter((c) => NEGATIVE.includes(c.outcome)).length;
  const todayNegativeRatio = todayCalls.length > 0 ? todayNegative / todayCalls.length : 0;

  // Historical avg negative ratio (default 0.7 if no history)
  const histNegative = historicalCalls.filter((c) => NEGATIVE.includes(c.outcome)).length;
  const histAvgNegativeRatio = historicalCalls.length > 0 ? histNegative / historicalCalls.length : 0.7;

  // Consecutive negatives from end of today's calls
  const todayOutcomes = todayCalls.map((c) => c.outcome as string).reverse();
  let consecutiveNegatives = 0;
  let consecutiveNoAnswer = 0;
  let consecutiveVoicemail = 0;
  for (const o of todayOutcomes) {
    if (NEGATIVE.includes(o)) consecutiveNegatives++;
    else break;
  }
  for (const o of todayOutcomes) {
    if (o === "no_answer") consecutiveNoAnswer++;
    else break;
  }
  for (const o of todayOutcomes) {
    if (o === "voicemail") consecutiveVoicemail++;
    else break;
  }

  // Resilience: most recent call is positive, 10+ of the 11 before it were negative
  let justBounced = false;
  if (todayOutcomes.length >= 11) {
    const mostRecent = todayOutcomes[0];
    const preceding = todayOutcomes.slice(1, 12);
    if (POSITIVE.includes(mostRecent) && preceding.filter((o) => NEGATIVE.includes(o)).length >= 10) {
      justBounced = true;
    }
  }

  return {
    consecutiveNegatives,
    consecutiveNoAnswer,
    consecutiveVoicemail,
    todayNegativeRatio,
    histAvgNegativeRatio,
    totalNegatives: totalNegRes.count || 0,
    todayCallCount: todayCalls.length,
    justBounced,
  };
}

export async function getAchievements(): Promise<{ key: string; unlocked_at: string }[]> {
  const { data } = await supabase.from("achievements").select("key, unlocked_at");
  return data || [];
}

export async function unlockAchievement(key: string): Promise<void> {
  await supabase.from("achievements").upsert({ key, unlocked_at: new Date().toISOString() }, { onConflict: "key", ignoreDuplicates: true });
}

export async function getTodayFollowUps(): Promise<Call[]> {
  const { start, end } = getMytTodayRange();
  const { data } = await supabase
    .from("calls")
    .select("*")
    .not("follow_up_at", "is", null)
    .gte("follow_up_at", start)
    .lte("follow_up_at", end)
    .order("follow_up_at", { ascending: true });
  return (data || []) as Call[];
}

export async function getExistingPhones(): Promise<Set<string>> {
  const { data } = await supabase.from("calls").select("phone").not("phone", "is", null);
  return new Set((data || []).map((r) => r.phone as string).filter(Boolean));
}

export async function getStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
  const { start: followStart, end: followEnd } = getMytTodayRange();

  const [todayRes, weekRes, allRes, followUpRes] = await Promise.all([
    supabase.from("calls").select("id", { count: "exact" }).not("called_at", "is", null).gte("called_at", todayStart),
    supabase.from("calls").select("id", { count: "exact" }).not("called_at", "is", null).gte("called_at", weekStart),
    supabase.from("calls").select("outcome").not("called_at", "is", null),
    supabase.from("calls").select("id", { count: "exact" }).not("follow_up_at", "is", null).gte("follow_up_at", followStart).lte("follow_up_at", followEnd),
  ]);

  const allCalls = allRes.data || [];
  const closedCount = allCalls.filter((c) => c.outcome === "closed" || c.outcome === "interested").length;
  const conversionRate = allCalls.length > 0 ? Math.round((closedCount / allCalls.length) * 100) : 0;

  return {
    callsToday: todayRes.count || 0,
    callsThisWeek: weekRes.count || 0,
    conversionRate,
    followUpsDue: followUpRes.count || 0,
  };
}
