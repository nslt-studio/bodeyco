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

// ── Turnstile ─────────────────────────────────────────────────────────────────
// Intercept turnstile.render() as early as possible to capture the sitekey.
// Webflow calls render() on initial load — we grab the sitekey from that call
// and reuse it after Swup navigations where Webflow no longer re-renders.

let _tsKey = '';

function patchTurnstile(ts) {
  if (!ts || ts._patched) return;
  const orig = ts.render;
  ts.render = function (container, opts) {
    if (opts?.sitekey && !_tsKey) _tsKey = opts.sitekey;
    return orig.apply(ts, arguments);
  };
  ts._patched = true;
}

// Patch immediately if already loaded, otherwise intercept the setter
if (window.turnstile) {
  patchTurnstile(window.turnstile);
} else {
  Object.defineProperty(window, 'turnstile', {
    configurable: true,
    enumerable: true,
    set(val) {
      Object.defineProperty(window, 'turnstile', { configurable: true, enumerable: true, writable: true, value: val });
      patchTurnstile(val);
    },
  });
}

function ensureTurnstileTokens() {
  if (!window.turnstile || !_tsKey) return;

  document.querySelectorAll('.page-transition form[data-name]').forEach((form) => {
    let inp = form.querySelector('input[name="cf-turnstile-response"]');
    if (inp?.value) return;

    // Recreate the hidden input that Webflow.destroy() removed
    if (!inp) {
      inp = document.createElement('input');
      inp.type = 'hidden';
      inp.name = 'cf-turnstile-response';
      form.appendChild(inp);
    }

    const refForm = form;
    const refInp = inp;
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:300px;height:65px;';
    document.body.appendChild(el);

    try {
      window.turnstile.render(el, {
        sitekey: _tsKey,
        callback(token) {
          const target = refForm.querySelector('input[name="cf-turnstile-response"]') || refInp;
          target.value = token;
        },
      });
    } catch {}
  });
}

// XHR last-resort: if the hidden input is still empty at submit time,
// try to pull the token from any widget Webflow.ready() may have rendered
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
        let token = '';
        try { token = window.turnstile.getResponse() || ''; } catch {}
        if (!token) {
          document.querySelectorAll('iframe[id^="cf-chl-widget-"]').forEach((f) => {
            if (!token) { try { token = window.turnstile.getResponse(f.id) || ''; } catch {} }
          });
        }
        if (token) body += '&fields%5Bcf-turnstile-response%5D=' + encodeURIComponent(token);
      }
    }
    return origSend.apply(this, [body]);
  };
})();

// ── Swup ──────────────────────────────────────────────────────────────────────

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
  if (newPageId) document.documentElement.setAttribute('data-wf-page', newPageId);

  if (window.Webflow) {
    window.Webflow.destroy();
    window.Webflow.ready();
    requestAnimationFrame(() => {
      document.querySelectorAll('[type="submit"]:disabled').forEach((btn) => { btn.disabled = false; });
    });
  }

  setTimeout(ensureTurnstileTokens, 800);
});

swup.hooks.on('link:click', (visit) => {
  const href = visit.to.url;
  if (!href) return;
  const targetPath = new URL(href, window.location.origin).pathname;
  document.querySelectorAll('a[href]').forEach((link) => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    if (linkPath === targetPath) link.classList.add('w--current');
    else link.classList.remove('w--current');
  });
});
