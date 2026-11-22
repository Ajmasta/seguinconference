// Shared time-zone logic for the Home and Program pages.
//
// The visitor's zone is detected from the browser. A manual choice is saved in localStorage
// ("scpec-tz") and used on every page until they switch back to automatic.
//
// Canadian zones use FIXED offsets for the conference date instead of the browser's time-zone
// database, because several provinces changed their rules in 2026 and older browsers don't know:
//   - B.C. (and Yukon) are on permanent UTC-7 since March 2026.
//   - Alberta stays on UTC-6 year-round from November 2026 (same as Saskatchewan in winter).
//   - Manitoba announced year-round daylight time (UTC-5, same as Eastern) in September 2026.
// Check these before each edition and update OFFSETS below if anything changes.

export interface Zone { id: string; label: string; suffix: string; offset: number; title: string }

// Offsets in minutes from UTC on the conference date (January 9).
export const ZONES: Zone[] = [
  { id: 'PT', label: 'Pacific', suffix: 'Pacific', offset: -420, title: 'B.C. and Yukon' },
  { id: 'AB', label: 'Alberta/Sask.', suffix: 'Alberta/Sask.', offset: -360, title: 'Alberta, Saskatchewan and the N.W.T.' },
  { id: 'ET', label: 'Eastern', suffix: 'EST', offset: -300, title: 'Ontario, Quebec and Manitoba' },
  { id: 'AT', label: 'Atlantic', suffix: 'AST', offset: -240, title: 'N.B., N.S., P.E.I. and Labrador' },
  { id: 'NT', label: 'Newfoundland', suffix: 'NST', offset: -210, title: 'Newfoundland' },
];

// Canadian IANA zones mapped to the zone they follow on the conference date.
const CANADA: Record<string, string> = {
  'America/Vancouver': 'PT', 'America/Whitehorse': 'PT', 'America/Dawson': 'PT', 'America/Dawson_Creek': 'PT',
  'America/Fort_Nelson': 'PT', 'America/Creston': 'PT',
  'America/Edmonton': 'AB', 'America/Yellowknife': 'AB', 'America/Inuvik': 'AB', 'America/Cambridge_Bay': 'AB',
  'America/Regina': 'AB', 'America/Swift_Current': 'AB',
  'America/Winnipeg': 'ET', 'America/Toronto': 'ET', 'America/Montreal': 'ET', 'America/Nipigon': 'ET',
  'America/Thunder_Bay': 'ET', 'America/Iqaluit': 'ET', 'America/Atikokan': 'ET', 'America/Rainy_River': 'ET',
  'America/Halifax': 'AT', 'America/Moncton': 'AT', 'America/Glace_Bay': 'AT', 'America/Goose_Bay': 'AT',
  'America/Blanc-Sablon': 'AT',
  'America/St_Johns': 'NT',
};

const KEY = 'scpec-tz';
export const EVENT = 'scpec-tz-change';

export type Selection = { kind: 'zone'; zone: Zone; auto: boolean } | { kind: 'iana'; iana: string; auto: true };

export function detectedIana(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Toronto'; } catch { return 'America/Toronto'; }
}
export function savedId(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
export const zoneById = (id: string | null) => ZONES.find((z) => z.id === id);

// The visitor's detected zone: a Canadian zone if they're in Canada, otherwise their own IANA zone.
export function detected(): Selection {
  const iana = detectedIana();
  const z = zoneById(CANADA[iana] ?? null);
  return z ? { kind: 'zone', zone: z, auto: true } : { kind: 'iana', iana, auto: true };
}
export function current(): Selection {
  const z = zoneById(savedId());
  return z ? { kind: 'zone', zone: z, auto: false } : detected();
}
// Pass a zone id to save a choice, or null to go back to automatic detection.
export function choose(id: string | null) {
  try { id ? localStorage.setItem(KEY, id) : localStorage.removeItem(KEY); } catch {}
  window.dispatchEvent(new CustomEvent(EVENT));
}

interface Wall { year: number; month: number; day: number; weekday: string; hour: number; minute: number }
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function wall(ms: number, sel: Selection): Wall {
  if (sel.kind === 'zone') {
    const d = new Date(ms + sel.zone.offset * 60000);
    return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate(), weekday: DAYS[d.getUTCDay()], hour: d.getUTCHours(), minute: d.getUTCMinutes() };
  }
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone: sel.iana, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'long', hour: 'numeric', minute: 'numeric',
  }).formatToParts(new Date(ms));
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? '';
  return { year: +g('year'), month: +g('month') - 1, day: +g('day'), weekday: g('weekday'), hour: +g('hour') % 24, minute: +g('minute') };
}

export function suffix(ms: number, sel: Selection): string {
  if (sel.kind === 'zone') return sel.zone.suffix;
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: sel.iana, timeZoneName: 'short' })
      .formatToParts(new Date(ms)).find((x) => x.type === 'timeZoneName')?.value ?? '';
  } catch { return ''; }
}

const h12 = (h: number) => (h % 12 === 0 ? 12 : h % 12);
const ampm = (h: number) => (h < 12 ? 'AM' : 'PM');

// "1–4 PM" / "11 AM–2 PM" / "2:30–5:30 PM"
export function compactRange(a: number, b: number, sel: Selection): string {
  const x = wall(a, sel), y = wall(b, sel);
  const t = (w: Wall) => `${h12(w.hour)}${w.minute ? ':' + String(w.minute).padStart(2, '0') : ''}`;
  return ampm(x.hour) === ampm(y.hour) ? `${t(x)}–${t(y)} ${ampm(y.hour)}` : `${t(x)} ${ampm(x.hour)}–${t(y)} ${ampm(y.hour)}`;
}

// "1:00–1:10" (agenda style, no AM/PM)
export function clockRange(a: number, b: number, sel: Selection): string {
  const t = (w: Wall) => `${h12(w.hour)}:${String(w.minute).padStart(2, '0')}`;
  return `${t(wall(a, sel))}–${t(wall(b, sel))}`;
}

export function dayParts(ms: number, sel: Selection) {
  const w = wall(ms, sel);
  return { day: String(w.day).padStart(2, '0'), month: MONTHS[w.month], weekday: w.weekday };
}

export function selectionName(sel: Selection): string {
  return sel.kind === 'zone' ? sel.zone.label : cityName(sel.iana);
}
export function cityName(iana: string): string {
  return (iana.split('/').pop() || iana).replace(/_/g, ' ');
}
