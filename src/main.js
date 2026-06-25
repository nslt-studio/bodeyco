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

// Inject missing Turnstile token into Webflow form XHR submissions
(function () {
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (m, url) {
    this._xhrUrl = url;
    return origOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function (body) {
    if (typeof this._xhrUrl === 'string' && this._xhrUrl.includes('/api/v1/form') && typeof body === 'string') {
      if (!body.includes('cf-turnstile-response') && window.turnstile) {
        try {
          const token = window.turnstile.getResponse() || '';
          if (token) {
            body = body + '&fields%5Bcf-turnstile-response%5D=' + encodeURIComponent(token);
          }
        } catch {}
      }
    }
    return origSend.apply(this, [body]);
  };
})();

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

swup.hooks.on('visit:start', () => {
  if (window.turnstile) {
    document.querySelectorAll('iframe[id^="cf-chl-widget-"]').forEach((iframe) => {
      try { window.turnstile.remove(iframe.id); } catch {}
    });
  }
});

swup.hooks.on('page:view', () => {
  initLenis();
  initPage();
  initMedia();
  initClock();
  updateCurrentLinks();

  const newPageId = document.querySelector('.page-transition [data-wf-page-id]')?.getAttribute('data-wf-page-id');
  if (newPageId) {
    document.documentElement.setAttribute('data-wf-page', newPageId);
  }

  if (window.Webflow) {
    window.Webflow.destroy();
    window.Webflow.ready();
    requestAnimationFrame(() => {
      document.querySelectorAll('[type="submit"]:disabled').forEach((btn) => {
        btn.disabled = false;
      });
    });
  }

});

swup.hooks.on('link:click', (visit) => {
  const href = visit.to.url;
  if (!href) return;
  const targetPath = new URL(href, window.location.origin).pathname;
  document.querySelectorAll('a[href]').forEach((link) => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    if (linkPath === targetPath) {
      link.classList.add('w--current');
    } else {
      link.classList.remove('w--current');
    }
  });
});
