const DUR = 150;

export function pad(n) {
  return String(n).padStart(3, '0');
}

export function animateIndex(el, newValue, direction) {
  if (el.dataset.animating) {
    clearTimeout(Number(el.dataset.timeoutId));
    delete el.dataset.animating;
  }

  const outY = direction > 0 ? '-40%' : '40%';
  const inY  = direction > 0 ?  '40%' : '-40%';

  el.dataset.animating = '1';

  el.style.transition = `opacity ${DUR}ms ease, transform ${DUR}ms ease`;
  el.style.opacity    = '0';
  el.style.transform  = `translateY(${outY})`;

  const id = setTimeout(() => {
    el.textContent      = pad(newValue);
    el.style.transition = 'none';
    el.style.transform  = `translateY(${inY})`;

    el.offsetHeight;

    el.style.transition = `opacity ${DUR}ms ease, transform ${DUR}ms ease`;
    el.style.opacity    = '1';
    el.style.transform  = 'translateY(0)';

    delete el.dataset.animating;
    delete el.dataset.timeoutId;
  }, DUR);

  el.dataset.timeoutId = String(id);
}
