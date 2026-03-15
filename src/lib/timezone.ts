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

/** Get the current MYT date string (YYYY-MM-DD) */
export function getMytDateStr(): string {
  const mytMs = Date.now() + MYT_OFFSET_MS;
  return new Date(mytMs).toISOString().split("T")[0];
}

/** Get today's MYT date range as ISO strings for Supabase queries */
export function getMytTodayRange(): { start: string; end: string } {
  const mytToday = getMytDateStr();
  return {
    start: `${mytToday}T00:00:00+08:00`,
    end: `${mytToday}T23:59:59+08:00`,
  };
}

/** Get the day of week (0=Sun) for a MYT date string (YYYY-MM-DD) */
export function getMytDayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  // Use UTC noon to avoid any DST/timezone shifts
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}

/** Get a MYT date string offset by N days from a base date string */
export function offsetMytDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12));
  return dt.toISOString().split("T")[0];
}
