import Lenis from 'lenis';

let lenis = null;
let rafId = null;

export function initLenis() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  if (lenis) { lenis.destroy(); lenis = null; }

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
