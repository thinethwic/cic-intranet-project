// Deterministic astronomical/calendrical calculations backing the Sri
// Lankan holiday highlighting on the Upcoming Events calendar.
//
// Poya days are full-moon days, so they can be computed directly from lunar
// cycle math rather than looked up — no yearly maintenance needed. Good
// Friday follows the standard Easter computus. Neither depends on a gazette.
//
// What this deliberately does NOT compute: Islamic holidays (Eid-ul-Fitr,
// Eid-ul-Adha, Milad-un-Nabi) and Hindu holidays (Deepavali, Maha
// Sivarathri) follow lunar/lunisolar calendars whose exact local observance
// depends on moon-sighting announcements or regional almanac conventions —
// approximating them risks being off by a day in a way that matters for
// religious observance. Add those manually once confirmed for the year (see
// ANNOUNCED_HOLIDAYS in sriLankanHolidays.ts).

const SYNODIC_MONTH_DAYS = 29.530588853;
// Reference full moon: 2000-01-21 04:41 UTC (a standard epoch used by lunar
// phase calculators), expressed as a Julian Day.
const KNOWN_FULL_MOON_JD = 2451564.696;
const SL_UTC_OFFSET_HOURS = 5.5;

const POYA_NAMES = [
  "Duruthu",
  "Navam",
  "Medin",
  "Bak",
  "Vesak",
  "Poson",
  "Esala",
  "Nikini",
  "Binara",
  "Vap",
  "Il",
  "Unduvap",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function julianDayFromUtcDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

// The calendar date (YYYY-MM-DD) that a Julian Day falls on in Sri Lanka
// Standard Time — i.e. the local day the full moon actually occurs on.
function slDateStringFromJd(jd: number): string {
  const utcMillis = (jd - 2440587.5) * 86400000;
  const slMillis = utcMillis + SL_UTC_OFFSET_HOURS * 3600 * 1000;
  const d = new Date(slMillis);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export interface PoyaDay {
  date: string; // YYYY-MM-DD, Sri Lanka local date
  name: string; // e.g. "Vesak Poya Day"
}

// All Poya (full moon) days that fall within the given calendar year, per
// Sri Lanka Standard Time. May occasionally include a 13th ("Adhi") Poya in
// a month, which happens naturally roughly once every 2-3 years.
export function getPoyaDays(year: number): PoyaDay[] {
  const yearStartJd = julianDayFromUtcDate(new Date(Date.UTC(year, 0, 1)));
  const yearEndJd = julianDayFromUtcDate(new Date(Date.UTC(year + 1, 0, 1)));

  const startCycle =
    Math.floor((yearStartJd - KNOWN_FULL_MOON_JD) / SYNODIC_MONTH_DAYS) - 1;

  const results: PoyaDay[] = [];
  const seenMonths = new Set<number>();
  let cycle = startCycle;

  while (true) {
    const jd = KNOWN_FULL_MOON_JD + cycle * SYNODIC_MONTH_DAYS;
    if (jd >= yearEndJd) break;

    if (jd >= yearStartJd) {
      const dateStr = slDateStringFromJd(jd);
      const month = Number(dateStr.slice(5, 7)) - 1;
      const isRepeat = seenMonths.has(month);
      seenMonths.add(month);
      results.push({
        date: dateStr,
        name: `${isRepeat ? "Adhi " : ""}${POYA_NAMES[month]} Poya Day`,
      });
    }

    cycle += 1;
  }

  return results;
}

// Easter Sunday via the standard (Anonymous Gregorian / Meeus) computus.
function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const monthDayNum = h + l - 7 * m + 114;
  const month = Math.floor(monthDayNum / 31); // 3 = March, 4 = April
  const day = (monthDayNum % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

export function getGoodFriday(year: number): string {
  const easter = getEasterSunday(year);
  const goodFriday = new Date(easter);
  goodFriday.setUTCDate(goodFriday.getUTCDate() - 2);
  return `${goodFriday.getUTCFullYear()}-${pad(goodFriday.getUTCMonth() + 1)}-${pad(goodFriday.getUTCDate())}`;
}
