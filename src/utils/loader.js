import { getLenis } from './lenis.js';

const INIT_DELAY   = 450;
const DUR          = 300;
const CHAR_STAGGER = 10;

export function initLoader() {
  const loader   = document.querySelector('.loader');
  const headline = loader?.querySelector('#headline');
  if (!loader || !headline) return;

  getLenis()?.stop();

  const chars = headline.textContent.trim().split('');

  headline.innerHTML = chars
    .map(c => c === ' '
      ? ' '
      : `<span style="display:inline-block;opacity:0;transform:translateY(6px)">${c}</span>`)
    .join('');

  headline.style.opacity = '1';

  const spans = Array.from(headline.querySelectorAll('span'));

  setTimeout(() => {
    spans.forEach((span, i) => {
      setTimeout(() => {
        span.style.transition = `opacity ${DUR}ms ease, transform ${DUR}ms ease`;
        span.style.opacity    = '1';
        span.style.transform  = 'translateY(0px)';
      }, i * CHAR_STAGGER);
    });

    const animInDone = (spans.length - 1) * CHAR_STAGGER + DUR;

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
