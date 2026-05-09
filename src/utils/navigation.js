export function updateCurrentLinks() {
  const currentPath = window.location.pathname;

  document.querySelectorAll('a[href]').forEach((link) => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    if (linkPath === currentPath) {
      link.classList.add('w--current');
    } else {
      link.classList.remove('w--current');
    }
  });
}
