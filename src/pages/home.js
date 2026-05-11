import { pad, animateIndex } from '../utils/counter.js';
import { initVideoControls } from '../utils/video-controls.js';
import { destroyLenis } from '../utils/lenis.js';

export function initHome() {
  destroyLenis();
  initSelectedAspectRatios();
  initScrollCounter();
  initSelectedControls();
}

function initSelectedControls() {
  document.querySelectorAll('.selected-item').forEach((item) => {
    const video    = item.querySelector('video');
    const controls = item.querySelector('.controls');
    if (!video || !controls) return;
    controls.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
    initVideoControls(video, controls);
  });
}

// ─── Aspect ratio ────────────────────────────────────────────────────────────

function initSelectedAspectRatios() {
  document.querySelectorAll('.selected-item').forEach((item) => {
    const target = item.querySelector('.selected-video-inner');
    const video  = target?.querySelector('video');
    if (!target || !video) return;

    const apply = () => {
      if (video.videoWidth && video.videoHeight) {
        target.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
      }
    };

    if (video.readyState >= 1) {
      apply();
    } else {
      video.addEventListener('loadedmetadata', apply, { once: true });
    }
  });
}

// ─── Scroll counter ───────────────────────────────────────────────────────────

function getClosestIndex(items) {
  const midY = window.innerHeight / 2;
  let closest = 0, minDist = Infinity;
  items.forEach((item, i) => {
    const rect = item.getBoundingClientRect();
    const dist = Math.abs(rect.top + rect.height / 2 - midY);
    if (dist < minDist) { minDist = dist; closest = i; }
  });
  return closest;
}

function initScrollCounter() {
  const indexEl = document.querySelector('#index');
  const totalEl = document.querySelector('#total');
  const items   = [...document.querySelectorAll('.selected-item')];

  if (!indexEl || !totalEl || !items.length) return;

  totalEl.textContent = pad(items.length);
  indexEl.textContent = pad(1);

  let currentIndex = 0;

  function loadVideosFrom(fromIndex, count = 4) {
    for (let i = fromIndex; i < Math.min(fromIndex + count, items.length); i++) {
      const video = items[i].querySelector('video');
      if (video?.dataset.src && !video.getAttribute('src')) {
        video.src = video.dataset.src;
      }
    }
  }

  function setActiveVideo(newIndex) {
    items.forEach((item, i) => {
      const video = item.querySelector('video');
      if (!video) return;
      if (i === newIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }

  function goTo(newIndex) {
    if (newIndex === currentIndex) return;
    const direction = newIndex > currentIndex ? 1 : -1;
    currentIndex = newIndex;
    animateIndex(indexEl, newIndex + 1, direction);
    loadVideosFrom(newIndex);
    setActiveVideo(newIndex);
  }

  loadVideosFrom(0);
  setActiveVideo(0);

  // Live updates during scroll: pick the most visible entry in each batch
  const observer = new IntersectionObserver(
    (entries) => {
      const best = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (best) goTo(items.indexOf(best.target));
    },
    { threshold: [0.5, 1.0] }
  );

  items.forEach((item) => observer.observe(item));

  // scrollend = filet de sécurité : corrige toujours la valeur finale
  const scrollTarget = document.querySelector('.selected-list') ?? window;
  scrollTarget.addEventListener('scrollend', () => {
    goTo(getClosestIndex(items));
  }, { passive: true });
}
