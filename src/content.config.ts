// Content for this site lives as plain JSON files in src/content/en/ and is imported directly by the pages.
// This collection is declared only so Astro does not warn about the folder; the pages don't query it.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
  en: defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/content/en' }) }),
};
