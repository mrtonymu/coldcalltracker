const MYT_OFFSET_MS = 8 * 60 * 60 * 1000; // UTC+8

/** Convert datetime-local input ("2026-03-13T15:00") → ISO with MYT offset */
export function mytLocalToISO(localValue: string): string {
  return `${localValue}:00+08:00`;
}

/** Convert ISO string from DB → datetime-local input value in MYT */
export function isoToMytLocal(isoString: string): string {
  const mytMs = new Date(isoString).getTime() + MYT_OFFSET_MS;
  return new Date(mytMs).toISOString().slice(0, 16);
}

/** Format ISO string as human-readable MYT datetime */
export function formatMYT(isoString: string): string {
  return new Date(isoString).toLocaleString("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Get today's MYT date range as ISO strings for Supabase queries */
export function getMytTodayRange(): { start: string; end: string } {
  const mytMs = Date.now() + MYT_OFFSET_MS;
  const mytToday = new Date(mytMs).toISOString().split("T")[0];
  return {
    start: `${mytToday}T00:00:00+08:00`,
    end: `${mytToday}T23:59:59+08:00`,
  };
}
