const INIT_DELAY = 600; // ms avant de commencer
const STAGGER    = 20;  // ms entre chaque lettre
const DUR        = 300; // ms pour toutes les transitions

export function initLoader() {
  const loader   = document.querySelector('.loader');
  const headline = loader?.querySelector('#headline');
  if (!loader || !headline) return;

  document.body.style.overflow = 'hidden';

  // Découper le texte en spans par lettre
  const chars = [...headline.textContent];
  headline.innerHTML = '';

  const spans = chars.map((char) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? ' ' : char;
    span.style.cssText = `opacity:${char === ' ' ? '1' : '0'}; transition:opacity ${DUR}ms ease;`;
    headline.appendChild(span);
    return span;
  });

  setTimeout(() => {
    headline.style.opacity = '1';

    // Stagger in lettre par lettre
    let letterIdx = 0;
    spans.forEach((span, i) => {
      if (chars[i] === ' ') return;
      setTimeout(() => { span.style.opacity = '1'; }, letterIdx * STAGGER);
      letterIdx++;
    });

    const revealDone = (letterIdx - 1) * STAGGER + DUR;

    // Attente 600ms → fade out #headline → attente 600ms → fade out loader → remove
    setTimeout(() => {
      headline.style.transition = `opacity ${DUR}ms ease`;
      headline.style.opacity    = '0';

      setTimeout(() => {
        loader.style.transition = `opacity ${DUR}ms ease`;
        loader.style.opacity    = '0';

        setTimeout(() => {
          loader.remove();
          document.body.style.overflow = '';
        }, DUR);
      }, DUR + 300);
    }, revealDone + 600);

  }, INIT_DELAY);
}
