import type { APIRoute } from 'astro';
import site from '../content/en/site.json';

// Calendar file for "Add to calendar (.ics)" on the Program page.
const stamp = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d+/, '');

export const GET: APIRoute = () => {
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SCPEC//Conference 2027//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:scpec-${site.year}@seguincpec`,
    `DTSTAMP:${stamp('2026-11-01T00:00:00Z')}`,
    `DTSTART:${stamp(site.eventStartUtc)}`,
    `DTEND:${stamp(site.eventEndUtc)}`,
    `SUMMARY:SCPEC ${site.year} · ${site.fullName}`,
    'DESCRIPTION:Free\\, online on Zoom. The Zoom link is emailed to registered attendees.',
    'LOCATION:Online (Zoom)',
    `URL:${site.instagram}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
