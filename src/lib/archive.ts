// Loads one JSON file per conference year from src/content/en/archive/.
export interface Abstract {
  slug: string;
  placeholder?: boolean;
  title: string;
  authors: string;
  school: string;
  abstract: string;
  slidesUrl?: string;
}
export interface Winner { place: number; label?: string; placeholder?: boolean; title: string; team: string }
export interface Year {
  year: string;
  theme: string;
  themePlaceholder?: boolean;
  winners: Winner[];
  abstracts: Abstract[];
  emptyTitle?: string;
  emptyMeta?: string;
}

const files = import.meta.glob<{ default: Year }>('../content/en/archive/*.json', { eager: true });

export const years: Year[] = Object.values(files)
  .map((m) => m.default)
  .sort((a, b) => Number(b.year) - Number(a.year));

// Default tab: the most recent year that has abstracts.
export const defaultYear = (years.find((y) => y.abstracts.length > 0) ?? years[0]).year;

export const placeLabel = (n: number) => (n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`) + ' place';
