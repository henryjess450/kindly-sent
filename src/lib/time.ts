// Time zone maths without a date library. A card is stored as the sender's
// local date + time + IANA zone, and the exact UTC instant it should go out.

function offsetMs(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/** "2026-12-25" + "08:00" in "America/Vancouver" -> UTC milliseconds. */
export function zonedToUtc(date: string, time: string, timeZone: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const naive = Date.UTC(y, m - 1, d, hh, mm);
  // Two passes settle the offset across daylight saving changes.
  let guess = naive - offsetMs(naive, timeZone);
  guess = naive - offsetMs(guess, timeZone);
  return guess;
}

export function isValidZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Same month and day next year. Feb 29 falls back to Feb 28. */
export function nextYearDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const ny = y + 1;
  const leap = (ny % 4 === 0 && ny % 100 !== 0) || ny % 400 === 0;
  const day = m === 2 && d === 29 && !leap ? 28 : d;
  return `${ny}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatWhen(utcMs: number, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(utcMs));
}

/** UTC milliseconds -> the local "YYYY-MM-DD" and "HH:MM" in a zone. */
export function utcToLocal(utcMs: number, timeZone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(utcMs));
  const g = (t: string) => parts.find((p) => p.type === t)!.value;
  return { date: `${g("year")}-${g("month")}-${g("day")}`, time: `${g("hour")}:${g("minute")}` };
}

export function formatShort(utcMs: number, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(utcMs));
}
