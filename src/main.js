import Swup from 'swup';
import { initHome } from './pages/home.js';
import { initProjects } from './pages/projects.js';
import { initProjectsDetails } from './pages/projects-details.js';
import { initMedia } from './utils/media.js';
import { updateCurrentLinks } from './utils/navigation.js';
import { initLoader } from './utils/loader.js';

const PAGE_INIT = {
  home: initHome,
  projects: initProjects,
  'projects-details': initProjectsDetails,
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
});

initLoader();
initPage();
initMedia();
updateCurrentLinks();

swup.hooks.on('page:view', () => {
  initPage();
  initMedia();
  updateCurrentLinks();
});
