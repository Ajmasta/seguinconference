// Decides which sections have confirmed content. Anything still marked "placeholder" in the JSON files
// stays hidden (and out of the menus) until it's confirmed, so the live site never shows [brackets].
import speakers from '../content/en/speakers.json';
import { years } from './archive';

export const confirmed = <T extends { placeholder?: boolean }>(items: T[]) => items.filter((i) => !i.placeholder);

export const hasSpeakers =
  !speakers.keynote.placeholder || confirmed(speakers.people).length > 0 || confirmed(speakers.judges).length > 0;

export const hasArchive = years.some((y) => y.abstracts.length > 0 || y.winners.length > 0);
