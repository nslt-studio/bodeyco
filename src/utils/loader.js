const INIT_DELAY = 450; // ms avant de commencer
const DUR        = 300; // ms pour chaque transition ease

export function initLoader() {
  const loader = document.querySelector('.loader');
  const h01    = loader?.querySelector('#headline01');
  const h02    = loader?.querySelector('#headline02');
  if (!loader || !h01 || !h02) return;

  document.body.style.overflow = 'hidden';

  const animIn = (el) => {
    el.style.transition = `opacity ${DUR}ms ease, transform ${DUR}ms ease`;
    el.style.opacity    = '1';
    el.style.transform  = 'translateY(0px)';
  };

  const animOut = (el) => {
    el.style.transition = `opacity ${DUR}ms ease`;
    el.style.opacity    = '0';
  };

  setTimeout(() => {

    animIn(h01);                              // h01 entre

    setTimeout(() => {
      animOut(h01);                           // h01 sort après 900ms d'affichage

      setTimeout(() => {
        animIn(h02);                          // h02 entre 600ms après la fin du fade out

        setTimeout(() => {
          animOut(h02);                       // h02 sort après 900ms d'affichage

          setTimeout(() => {
            loader.style.transition = `opacity ${DUR}ms ease`;
            loader.style.opacity    = '0';   // loader sort 600ms après la fin du fade out h02

            setTimeout(() => {
              loader.remove();
              document.body.style.overflow = '';
            }, DUR);

          }, DUR + 450);
        }, DUR + 750);
      }, DUR + 150);
    }, DUR + 750);

  }, INIT_DELAY);
}
