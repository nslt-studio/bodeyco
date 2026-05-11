import { getLenis } from './lenis.js';

const INIT_DELAY   = 450;
const DUR          = 300;
const WORD_STAGGER = 60;

export function initLoader() {
  const loader   = document.querySelector('.loader');
  const headline = loader?.querySelector('#headline');
  if (!loader || !headline) return;

  getLenis()?.stop();

  const words = headline.textContent.trim().split(/\s+/);

  headline.innerHTML = words
    .map(w => `<span style="display:inline-block;opacity:0;transform:translateY(12px)">${w}</span>`)
    .join(' ');

  headline.style.opacity = '1';

  const spans = Array.from(headline.querySelectorAll('span'));

  setTimeout(() => {
    spans.forEach((span, i) => {
      setTimeout(() => {
        span.style.transition = `opacity ${DUR}ms ease, transform ${DUR}ms ease`;
        span.style.opacity    = '1';
        span.style.transform  = 'translateY(0px)';
      }, i * WORD_STAGGER);
    });

    const animInDone = (spans.length - 1) * WORD_STAGGER + DUR;

    setTimeout(() => {
      headline.style.transition = `opacity ${DUR}ms ease`;
      headline.style.opacity    = '0';

      setTimeout(() => {
        loader.style.transition = `opacity ${DUR}ms ease`;
        loader.style.opacity    = '0';

        setTimeout(() => {
          loader.remove();
          getLenis()?.start();
        }, DUR);
      }, DUR + 450);
    }, animInDone + 750);

  }, INIT_DELAY);
}
