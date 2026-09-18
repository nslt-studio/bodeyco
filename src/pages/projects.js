import { getLenis } from '../utils/lenis.js';
import { initViewportVideos } from '../utils/viewport-video.js';
import { initVimeo } from '../utils/vimeo.js';

export function initProjects() {
  initViewToggle();
  initIndexHover();
  initViewportVideos();
  return initVimeo({ aspectRatioTarget: '.grid-video' });
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
      if (window.innerWidth >= 992) {
        getLenis()?.scrollTo(gridItem, { offset: 0, lerp: 0.08 });
      }
    });

    indexItem.addEventListener('mouseleave', () => {
      gridItem.style.transition = `opacity ${ITEM_DUR}ms ease`;
      gridItem.style.opacity    = '0.05';
    });
  });
}
