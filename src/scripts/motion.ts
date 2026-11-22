// Scroll reveal + count-up. All movement is CSS (src/styles/motion.css); this only marks blocks
// with data-revealed="up|pop|side" once, when they come into view, and counts numbers up.
// The selectors here must match the hidden list in motion.css.

const REVEAL_GROUPS: Record<'up' | 'pop' | 'side', string> = {
  up: [
    '.section-head', '.agenda-head', '.judged-head', '.runs-head', '.reps-head',
    'main section > h2', 'main section > .container > h2',
    '.why-copy > .stack', '.why-text > p', '.ch-text > p',
    '.tribute', '.soon', '.cta', '.cc-teaser', '.join', '.now', '.partner', '.keynote', '.agenda', '.accordion',
    '.winners-card', '.abs-list > li', '.update', '.stat-inner', '.fq-main > .stack', '.extras > *', '.pub', '.tm-top',
  ].join(','),
  pop: [
    '.program-grid > *', '.pillars > *', '.glance > *', '.criteria > *', '.runs-grid > *', '.people > *',
    '.judge-grid > *', '.grid-340 > *', '.grid-320 > *', '.winners > *', '.workshops > *', '.join-steps > li',
    '.timeline > li', '.stats > .stat', '.mosaic > *',
  ].join(','),
  side: ['.why-img', '.ch-img'].join(','),
};

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target) || reduced) return;
  const suffix = el.dataset.suffix ?? '';
  const node = el.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  const duration = 1400;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 4);
    node.textContent = `${Math.round(target * eased)}${suffix}`;
    if (t < 1) requestAnimationFrame(step);
  };
  node.textContent = `0${suffix}`;
  requestAnimationFrame(step);
}

function init() {
  (window as unknown as { __motion?: boolean }).__motion = true;
  const targets = new Map<Element, string>();
  for (const [kind, selector] of Object.entries(REVEAL_GROUPS)) {
    document.querySelectorAll(selector).forEach((el) => { if (!targets.has(el)) targets.set(el, kind); });
  }
  // Cascade siblings: index among revealed siblings in the same parent (capped).
  const counters = new Map<Element, number>();
  targets.forEach((_, el) => {
    const parent = el.parentElement;
    if (!parent) return;
    const i = counters.get(parent) ?? 0;
    counters.set(parent, i + 1);
    (el as HTMLElement).style.setProperty('--reveal-i', String(Math.min(i, 6)));
  });

  const reveal = (el: Element) => {
    if (!(el instanceof HTMLElement) || el.hasAttribute('data-revealed')) return;
    el.dataset.revealed = targets.get(el) ?? 'up';
    el.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
    if (el.matches('[data-count]')) countUp(el);
  };

  if (!('IntersectionObserver' in window)) { targets.forEach((_, el) => reveal(el)); return; }

  // The observer reports every target once right after observe(). If it never reports
  // (very old engines, some embedded webviews), show everything rather than leave blocks hidden.
  let alive = false;
  setTimeout(() => { if (!alive) targets.forEach((_, el) => reveal(el)); }, 2000);

  const io = new IntersectionObserver((entries) => {
    alive = true;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      reveal(entry.target);
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  targets.forEach((_, el) => io.observe(el));

  // Count-ups that aren't inside a revealed block.
  const countIo = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target as HTMLElement;
      if (!el.closest('[data-revealed]') && !el.dataset.counted) { el.dataset.counted = ''; countUp(el); }
      countIo.unobserve(el);
    }
  }, { threshold: 0.5 });
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    if (![...targets.keys()].some((t) => t.contains(el))) countIo.observe(el);
  });
}

init();
