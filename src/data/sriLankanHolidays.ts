// Sri Lankan public holidays & Poya (full moon) days, used to highlight the
// Upcoming Events calendar on the home page.
//
// Poya days and Good Friday are computed deterministically (see
// src/utils/sriLankanCalendar.ts) — full moons and Easter don't need a
// yearly lookup. Fixed-date public holidays are listed below per year.
//
// Islamic holidays (Eid-ul-Fitr, Eid-ul-Adha, Milad-un-Nabi) and Hindu
// holidays (Deepavali, Maha Sivarathri) can't be computed the same way —
// their local observance date depends on moon-sighting announcements /
// regional almanac conventions that can shift by a day from any calculated
// estimate. The 2025 dates below match the published Sri Lanka holiday
// calendar; 2026 dates are estimated (Islamic dates projected ~11 days
// earlier than 2025 per the lunar year, Hindu dates from the standard
// Hindu lunisolar calendar) and should be cross-checked against the
// official Government Gazette once it's published — treat them as
// provisional. 2027 isn't estimated yet; add it here once close enough to
// project with reasonable confidence.

import { getPoyaDays, getGoodFriday } from "@/utils/sriLankanCalendar";

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: "public" | "poya";
}

const YEARS = [2025, 2026, 2027];

function fixedHolidaysForYear(year: number): Holiday[] {
  return [
    { date: `${year}-01-01`, name: "New Year's Day", type: "public" },
    { date: `${year}-02-04`, name: "Independence Day", type: "public" },
    {
      date: `${year}-04-13`,
      name: "Sinhala & Tamil New Year Eve",
      type: "public",
    },
    {
      date: `${year}-04-14`,
      name: "Sinhala & Tamil New Year Day",
      type: "public",
    },
    { date: `${year}-05-01`, name: "May Day", type: "public" },
    { date: getGoodFriday(year), name: "Good Friday", type: "public" },
    { date: `${year}-12-25`, name: "Christmas Day", type: "public" },
  ];
}

// Moon-sighting / lunisolar holidays — add each year's confirmed dates here.
const ANNOUNCED_HOLIDAYS: Holiday[] = [
  // ── 2025 (matches published calendar) ──────────────────────────────────
  { date: "2025-02-26", name: "Maha Sivarathri Day", type: "public" },
  { date: "2025-03-31", name: "Id-Ul-Fitr", type: "public" },
  { date: "2025-06-07", name: "Id-Ul-Alha", type: "public" },
  { date: "2025-09-05", name: "Milad-Un-Nabi", type: "public" },
  { date: "2025-10-20", name: "Deepavali Festival Day", type: "public" },

  // ── 2026 (provisional — verify against the official gazette) ──────────
  { date: "2026-02-15", name: "Maha Sivarathri Day", type: "public" },
  { date: "2026-03-20", name: "Id-Ul-Fitr", type: "public" },
  { date: "2026-05-27", name: "Id-Ul-Alha", type: "public" },
  { date: "2026-08-25", name: "Milad-Un-Nabi", type: "public" },
  { date: "2026-11-08", name: "Deepavali Festival Day", type: "public" },
];

export const SRI_LANKAN_HOLIDAYS: Holiday[] = YEARS.flatMap((year) => [
  ...fixedHolidaysForYear(year),
  ...getPoyaDays(year).map(
    (p): Holiday => ({ date: p.date, name: p.name, type: "poya" }),
  ),
]).concat(ANNOUNCED_HOLIDAYS);

export function getHoliday(dateStr: string): Holiday | undefined {
  return SRI_LANKAN_HOLIDAYS.find((h) => h.date === dateStr);
}
