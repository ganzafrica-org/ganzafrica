/**
 * Real public holidays from Nager.Date (https://date.nager.at) — no more static seed data. A
 * country needs a mapped ISO code below to get live holidays; an employee whose home_country
 * isn't mapped simply has none (no fabricated "universal" fallback).
 */
import { Logger } from "@/config";

const logger = new Logger("HolidaysApiService");
const NAGER_BASE = "https://date.nager.at/api/v3/PublicHolidays";

// employees.home_country is free text (e.g. "Rwanda"); Nager.Date needs an ISO 3166-1 alpha-2
// code. Extend as the org gets employees in more countries.
const COUNTRY_CODES: Record<string, string> = {
  Rwanda: "RW",
};

export function countryCode(country: string): string | null {
  return COUNTRY_CODES[country] ?? null;
}

export interface PublicHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  country: string; // the free-text country name (matches employees.home_country), not the ISO code
}

type CacheEntry = { fetchedAt: number; holidays: PublicHoliday[] };
const cache = new Map<string, CacheEntry>();
// Real calendar data changes rarely (only near a lunar-holiday announcement) — a day's staleness
// is fine and avoids hitting Nager.Date on every leave request / calendar load.
const TTL_MS = 24 * 60 * 60 * 1000;

async function fetchYear(year: number, country: string): Promise<PublicHoliday[]> {
  const code = countryCode(country);
  if (!code) return [];

  const key = `${year}:${code}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) return cached.holidays;

  try {
    const res = await fetch(`${NAGER_BASE}/${year}/${code}`);
    if (!res.ok) {
      logger.warn(`Nager.Date returned ${res.status} for ${key}`);
      return cached?.holidays ?? [];
    }
    const rows = (await res.json()) as { date: string; name: string }[];
    const holidays = rows.map((r) => ({ date: r.date, name: r.name, country }));
    cache.set(key, { fetchedAt: Date.now(), holidays });
    return holidays;
  } catch (err) {
    // A flaky external API must never break leave submission or the calendar — fall back to
    // whatever's cached (even if stale), or empty if nothing's ever been fetched.
    logger.error(`Nager.Date fetch failed for ${key}`, err as Error);
    return cached?.holidays ?? [];
  }
}

/** All public holidays for `country` within [from, to] — spans a year boundary correctly by
 *  fetching every calendar year the range touches. */
export async function publicHolidaysInRange(
  country: string,
  from: Date,
  to: Date,
): Promise<PublicHoliday[]> {
  const years: number[] = [];
  for (let y = from.getUTCFullYear(); y <= to.getUTCFullYear(); y++) years.push(y);

  const perYear = await Promise.all(years.map((y) => fetchYear(y, country)));
  const all = perYear.flat();
  const fromIso = from.toISOString().slice(0, 10);
  const toIso = to.toISOString().slice(0, 10);
  return all.filter((h) => h.date >= fromIso && h.date <= toIso);
}

/** All public holidays for `country` in one calendar year — the calendar display's granularity. */
export async function publicHolidaysForYear(
  country: string,
  year: number,
): Promise<PublicHoliday[]> {
  return fetchYear(year, country);
}
