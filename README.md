# SCPEC website

Astro static site for the Séguin Canadian POCUS Education Conference. Built from the designs in `../design/`.

## Run it locally

```
npm install
npm run dev        # http://localhost:4321
npm run build      # production files in dist/
npm run preview    # serve dist/ to check the build
```

## Edit content (no code needed)

Everything that changes each year is a JSON file in `src/content/en/`:

| File | What it holds |
|---|---|
| `site.json` | Registration links, dates, theme, email, Instagram, template/sponsorship links, newsletter endpoint, school list |
| `agenda.json` | Program times (minutes after midnight Eastern) and the time zones |
| `speakers.json` | Keynote, workshop mentors, judges (headshots go in `src/assets/headshots/`) |
| `team.json` | Leadership, regional reps, advisor |
| `faq.json` | FAQ questions and answers |
| `archive/<year>.json` | Winners and abstracts for one year. Each abstract gets its own page at `/archive/<year>/<slug>` |
| `updates.json` | "Where are they now" project updates |

Add a new year by copying an archive file and changing `year`. French later: add `src/content/fr/` with the same files.

## Placeholders still to replace

Anything still unconfirmed carries a `data-placeholder` attribute in the HTML. To list them on the built site, run
`grep -o 'data-placeholder="[^"]*"' -r dist | sort | uniq -c`.

- Register / team registration links (`site.json`, set the `...IsPlaceholder` flags to `false` when real)
- Speakers, headshots, judges (`speakers.json`)
- Prizes: hidden on the Case Competition page (`SHOW_PRIZES` in `src/pages/case-competition.astro`)
- Run-of-show times (`agenda.json`, set `provisional` to `false`)
- 2021–2025 winners, themes and abstracts (`archive/*.json`)
- Ryan Séguin tribute wording (Home and About pages)
- Recordings answer (`faq.json`)
- Abstract/slide templates, sponsorship PDF, newsletter endpoint (`site.json`)

## Logo

The real logo (white version) is in `src/assets/logo/`: `scpec-logo.png` is the full lockup (used in the footer) and
`scpec-mark.png` is the leaf + probe only (header, on a navy tile). Favicons in `public/` were generated from the mark.

## Deploy

Netlify: connect the repo, it reads `netlify.toml` (build `npm run build`, publish `dist`).
GitHub Pages: `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
Set the `SITE_URL` environment variable to the live address so share previews use the right domain.
