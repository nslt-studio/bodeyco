import { getLenis } from '../utils/lenis.js';

export function initProjects() {
  initViewToggle();
  initIndexHover();
  initLazyVideos();
}

const STAGGER   = 20;  // ms entre chaque item
const ITEM_DUR  = 220; // ms de la transition opacity

function initViewToggle() {
  const overviewBtn = document.querySelector('#overview');
  const indexBtn    = document.querySelector('#index');
  if (!overviewBtn || !indexBtn) return;

  overviewBtn.addEventListener('click', () => {
    if (!overviewBtn.classList.contains('active')) {
      overviewBtn.classList.add('active');
      indexBtn.classList.remove('active');
      showOverview();
    }
  });

  indexBtn.addEventListener('click', () => {
    if (!indexBtn.classList.contains('active')) {
      indexBtn.classList.add('active');
      overviewBtn.classList.remove('active');
      showIndex();
    }
  });
}

function getItems() {
  return {
    gridItems:  [...document.querySelectorAll('.grid-list .grid-item')],
    indexItems: [...document.querySelectorAll('.index-list .index-item')],
  };
}

function showIndex() {
  const { gridItems, indexItems } = getItems();
  const indexDiv = document.querySelector('.index');
  if (indexDiv) indexDiv.style.pointerEvents = 'auto';

  // Masquage instantané de la grid
  gridItems.forEach((el) => {
    el.style.transition    = 'none';
    el.style.opacity       = '0.05';
    el.style.pointerEvents = 'none';
  });

  // Stagger in des index-items
  indexItems.forEach((el, i) => {
    el.style.transition    = 'none';
    el.style.opacity       = '0';
    el.style.pointerEvents = 'none';

    setTimeout(() => {
      el.style.transition    = `opacity ${ITEM_DUR}ms ease`;
      el.style.opacity       = '1';
      el.style.pointerEvents = 'auto';
    }, i * STAGGER);
  });
}

function showOverview() {
  const { gridItems, indexItems } = getItems();
  const indexDiv = document.querySelector('.index');
  if (indexDiv) indexDiv.style.pointerEvents = 'none';

  // Stagger out des index-items
  indexItems.forEach((el, i) => {
    setTimeout(() => {
      el.style.transition    = `opacity ${ITEM_DUR}ms ease`;
      el.style.opacity       = '0';
      el.style.pointerEvents = 'none';
    }, i * STAGGER);
  });

  // Ouverture de la grid une fois le stagger out terminé
  const delay = (indexItems.length - 1) * STAGGER + ITEM_DUR;
  setTimeout(() => {
    gridItems.forEach((el) => {
      el.style.transition    = `opacity ${ITEM_DUR}ms ease`;
      el.style.opacity       = '1';
      el.style.pointerEvents = 'auto';
    });
  }, delay);
}

function initIndexHover() {
  const indexItems = [...document.querySelectorAll('.index-list .index-item')];

  indexItems.forEach((indexItem) => {
    const key      = indexItem.dataset.index;
    const gridItem = document.querySelector(`.grid-list .grid-item[data-grid="${key}"]`);
    if (!gridItem) return;

    indexItem.addEventListener('mouseenter', () => {
      gridItem.style.transition = `opacity ${ITEM_DUR}ms ease`;
      gridItem.style.opacity    = '1';
      getLenis()?.scrollTo(gridItem, { offset: 0, lerp: 0.08 });
    });

    indexItem.addEventListener('mouseleave', () => {
      gridItem.style.transition = `opacity ${ITEM_DUR}ms ease`;
      gridItem.style.opacity    = '0.05';
    });
  });
}

function initLazyVideos() {
  const videos = [...document.querySelectorAll('video[data-src]')];
  if (!videos.length) return;

  // Load src when video enters viewport + 500px
  const loadObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const video = entry.target;
        video.src = video.dataset.src;
        loadObserver.unobserve(video);
        if (video.dataset.shouldPlay) {
          video.play().catch(() => {});
        }
      });
    },
    { rootMargin: '500px 0px' }
  );

  // Play/pause based on actual viewport visibility
  const playObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.dataset.shouldPlay = '1';
          if (video.src) video.play().catch(() => {});
        } else {
          delete video.dataset.shouldPlay;
          video.pause();
        }
      });
    },
    { threshold: 0.5 }
  );

  videos.forEach((video) => {
    loadObserver.observe(video);
    playObserver.observe(video);
  });
}
