import Lenis from 'lenis';

// Le CSS officiel de Lenis n'est jamais chargé sur ce site (le bundle esbuild
// ne l'injecterait pas de toute façon). Sans lui : html garde le height:100%
// du reset Webflow, donc le ResizeObserver interne de Lenis (qui observe
// document.documentElement) ne se déclenche jamais quand le contenu grandit
// (vidéos/images chargées après coup) — d'où le scroll qui se bloque avant le
// bas de la page. Et .lenis-stopped n'a aucun effet, donc stop()/start() ne
// bloque pas réellement le scroll natif. On injecte ces règles à la main.
function injectLenisStyles() {
  if (document.getElementById('lenis-styles')) return;
  const style = document.createElement('style');
  style.id = 'lenis-styles';
  style.textContent = `
    html.lenis, html.lenis body { height: auto; }
    .lenis:not(.lenis-autoToggle).lenis-stopped { overflow: clip; }
    .lenis.lenis-smooth iframe { pointer-events: none; }
  `;
  document.head.appendChild(style);
}

let lenis = null;
let rafId = null;

export function initLenis() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  if (lenis) { lenis.destroy(); lenis = null; }

  injectLenisStyles();
  lenis = new Lenis();

  function raf(time) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }

  rafId = requestAnimationFrame(raf);
}

export function getLenis() {
  return lenis;
}

export function destroyLenis() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  if (lenis) { lenis.destroy(); lenis = null; }
}
