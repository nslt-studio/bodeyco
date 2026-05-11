import EmblaCarousel from 'embla-carousel';
import { pad, animateIndex } from '../utils/counter.js';
import { initVideoControls } from '../utils/video-controls.js';
import { getLenis } from '../utils/lenis.js';

export function initProjectsDetails() {
  initEmbla();
  initMoreButton();
  initCursor();
}

function initCursor() {
  const cursor  = document.querySelector('.cursor');
  const prevBtn = document.querySelector('.embla__prev');
  const nextBtn = document.querySelector('.embla__next');
  if (!cursor || !prevBtn || !nextBtn) return;

  cursor.style.transition = 'opacity 150ms ease';
  cursor.style.opacity    = '0';

  const move = (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top  = `${e.clientY}px`;
  };

  const show = (text, e) => {
    cursor.textContent = text;
    move(e);
    cursor.style.opacity = '1';
  };

  const hide = () => { cursor.style.opacity = '0'; };

  prevBtn.addEventListener('mouseenter', (e) => show('Prev', e));
  prevBtn.addEventListener('mousemove',  move);
  prevBtn.addEventListener('mouseleave', hide);

  nextBtn.addEventListener('mouseenter', (e) => show('Next', e));
  nextBtn.addEventListener('mousemove',  move);
  nextBtn.addEventListener('mouseleave', hide);
}

// ─── Embla ────────────────────────────────────────────────────────────────────

function initEmbla() {
  const viewport = document.querySelector('.embla__viewport');
  if (!viewport) return;

  const embla   = EmblaCarousel(viewport, { loop: true });
  const slides  = embla.slideNodes();
  const prevBtn = document.querySelector('.embla__prev');
  const nextBtn = document.querySelector('.embla__next');
  const indexEl = document.querySelector('#index');
  const totalEl = document.querySelector('#total');

  // État initial : première slide visible, les autres cachées
  slides.forEach((slide, i) => {
    slide.style.transition = 'none';
    slide.style.opacity    = i === 0 ? '1' : '0';
  });

  if (totalEl) totalEl.textContent = pad(slides.length);
  if (indexEl) indexEl.textContent = pad(1);

  let direction = 1;

  embla.on('select', () => {
    const selected = embla.selectedScrollSnap();

    slides.forEach((slide, i) => {
      slide.style.transition = 'opacity 150ms ease';
      slide.style.opacity    = i === selected ? '1' : '0';
    });

    if (indexEl) animateIndex(indexEl, selected + 1, direction);
    setActiveVideo(slides, selected);
  });

  function fadeTo(action, dir) {
    direction = dir;
    const current = embla.selectedScrollSnap();
    slides[current].style.transition = 'opacity 150ms ease';
    slides[current].style.opacity    = '0';
    setTimeout(action, 150);
  }

  if (slides.length <= 1) {
    if (prevBtn) prevBtn.style.visibility = 'hidden';
    if (nextBtn) nextBtn.style.visibility = 'hidden';
  } else {
    prevBtn?.addEventListener('click', () => fadeTo(() => embla.scrollPrev(true), -1));
    nextBtn?.addEventListener('click', () => fadeTo(() => embla.scrollNext(true),  1));
  }

  initSlideVideos(slides);
  setActiveVideo(slides, 0);

  slides.forEach((slide) => {
    const video    = slide.querySelector('video');
    const controls = slide.querySelector('.controls');
    if (video && controls) initVideoControls(video, controls);
  });
}

// ─── Vidéos dans les slides ───────────────────────────────────────────────────

function initSlideVideos(slides) {
  slides.forEach((slide) => {
    const container = slide.querySelector('.embla-video');
    if (!container) return;
    const video = container.querySelector('video');
    if (!video) return;

    const apply = () => {
      if (video.videoWidth && video.videoHeight) {
        container.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
      }
    };

    if (video.readyState >= 1) apply();
    else video.addEventListener('loadedmetadata', apply, { once: true });
  });
}

function setActiveVideo(slides, activeIndex) {
  slides.forEach((slide, i) => {
    const video = slide.querySelector('.embla-video video');
    if (!video) return;
    if (i === activeIndex) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}

// ─── More / Less scroll ───────────────────────────────────────────────────────

function initMoreButton() {
  const moreBtn      = document.querySelector('#more');
  const aboutSection = document.querySelector('#about');

  if (!moreBtn || !aboutSection) return;

  let onAbout = false;
  moreBtn.textContent = 'More';

  moreBtn.addEventListener('click', () => {
    if (onAbout) {
      getLenis()?.scrollTo(0);
    } else {
      getLenis()?.scrollTo(aboutSection);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target !== aboutSection) return;
        onAbout = entry.isIntersecting;
        moreBtn.textContent = onAbout ? 'Less' : 'More';
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(aboutSection);
}
