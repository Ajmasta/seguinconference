// Builds internal links that respect the deploy base path (needed for GitHub Pages project sites).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path: string): string {
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}` || '/';
}

// Formats minutes-after-midnight as h:mm on a 12-hour clock (no AM/PM, matching the design).
export function fmtTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m < 10 ? '0' + m : m}`;
}
