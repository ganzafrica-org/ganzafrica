/**
 * Seeds Rwanda's official public holiday calendar into hr_org_holidays (country: "Rwanda").
 * No live holiday API exists, so this is static data, extended each year as needed. Idempotent —
 * the (date, country) unique index makes a re-run a no-op for dates already present.
 *
 *   pnpm db:seed:holidays
 *
 * Fixed-date holidays are generated for 2026-2028 since they never move. The two lunar-observed
 * ones (Eid al-Fitr, Eid al-Adha) are seeded as 2026 ESTIMATES ONLY — their exact Gregorian date
 * is confirmed only close to the date by moon sighting, so treat these as a starting point, not
 * an authoritative source. HR corrects/extends them year to year via Settings > Leave's holiday
 * calendar UI once each is officially announced.
 */
import { db } from "../src/db/client";
import { hr_org_holidays } from "../src/db/schema";
import { Logger } from "../src/config";

const logger = new Logger("SeedRwandaHolidays");
const COUNTRY = "Rwanda";
const YEARS = [2026, 2027, 2028];

/** Rwanda observes Umuganura (Harvest Day) on the first Friday of August each year. */
function firstFridayOfAugust(year: number): string {
  const d = new Date(Date.UTC(year, 7, 1)); // August is month index 7
  const FRIDAY = 5;
  d.setUTCDate(d.getUTCDate() + ((FRIDAY - d.getUTCDay() + 7) % 7));
  return d.toISOString().slice(0, 10);
}

const FIXED_DATE_HOLIDAYS: { month: number; day: number; name: string }[] = [
  { month: 1, day: 1, name: "New Year's Day" },
  { month: 2, day: 1, name: "Heroes' Day" },
  { month: 4, day: 7, name: "Genocide Memorial Day" },
  { month: 5, day: 1, name: "Labour Day" },
  { month: 7, day: 1, name: "Independence Day" },
  { month: 7, day: 4, name: "Liberation Day" },
  { month: 8, day: 15, name: "Assumption Day" },
  { month: 12, day: 25, name: "Christmas Day" },
  { month: 12, day: 26, name: "Boxing Day" },
];

// Lunar-observed — 2026 estimates only, not authoritative. See file doc above.
const LUNAR_HOLIDAY_ESTIMATES_2026 = [
  { date: "2026-03-20", name: "Eid al-Fitr (estimated)" },
  { date: "2026-05-27", name: "Eid al-Adha (estimated)" },
];

function buildRows(): { date: string; name: string; country: string }[] {
  const rows: { date: string; name: string; country: string }[] = [];

  for (const year of YEARS) {
    for (const h of FIXED_DATE_HOLIDAYS) {
      const date = `${year}-${String(h.month).padStart(2, "0")}-${String(h.day).padStart(2, "0")}`;
      rows.push({ date, name: h.name, country: COUNTRY });
    }
    rows.push({
      date: firstFridayOfAugust(year),
      name: "Umuganura (Harvest Day)",
      country: COUNTRY,
    });
  }

  for (const h of LUNAR_HOLIDAY_ESTIMATES_2026) {
    rows.push({ date: h.date, name: h.name, country: COUNTRY });
  }

  return rows;
}

async function main() {
  const rows = buildRows();
  const inserted = await db.insert(hr_org_holidays).values(rows).onConflictDoNothing().returning();
  logger.info(
    `Rwanda holidays: ${inserted.length} added, ${rows.length - inserted.length} already present`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error("Rwanda holiday seed failed", error);
    process.exit(1);
  });
