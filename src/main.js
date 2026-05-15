import Swup from 'swup';
import { initHome } from './pages/home.js';
import { initProjects } from './pages/projects.js';
import { initProjectsDetails } from './pages/projects-details.js';
import { initNews } from './pages/news.js';
import { initNewsDetails } from './pages/news-details.js';
import { initMedia } from './utils/media.js';
import { updateCurrentLinks } from './utils/navigation.js';
import { initLoader } from './utils/loader.js';
import { initClock } from './utils/clock.js';
import { initLenis } from './utils/lenis.js';

const PAGE_INIT = {
  home: initHome,
  projects: initProjects,
  'projects-details': initProjectsDetails,
  news: initNews,
  'news-details': initNewsDetails,
};

function getPageName() {
  return document.querySelector('.page-transition')?.dataset.swup;
}

function initPage() {
  const page = getPageName();
  if (page && PAGE_INIT[page]) {
    PAGE_INIT[page]();
  }
}

const swup = new Swup({
  containers: ['.page-transition'],
  animationSelector: '.page-transition',
});

initLenis();
initLoader();
initPage();
initMedia();
initClock();
updateCurrentLinks();

swup.hooks.on('page:view', () => {
  initLenis();
  initPage();
  initMedia();
  initClock();
  updateCurrentLinks();
});

