// @ts-check
import { defineConfig } from 'astro/config';

// Set SITE_URL to the live address (e.g. https://scpec.ca) when you deploy,
// so Open Graph images and canonical links use the right domain.
export default defineConfig({
  site: process.env.SITE_URL || 'https://scpec.netlify.app',
  // For GitHub Pages without a custom domain, also set BASE_PATH=/repo-name
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
