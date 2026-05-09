export function initMedia(scope = document) {
  scope.querySelectorAll('img').forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => { img.style.opacity = '1'; }, { once: true });
    }
  });

  scope.querySelectorAll('video').forEach((video) => {
    if (video.readyState >= 2) {
      video.style.opacity = '1';
    } else {
      video.addEventListener('loadeddata', () => { video.style.opacity = '1'; }, { once: true });
    }
  });
}
