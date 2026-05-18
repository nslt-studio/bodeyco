const TOKEN = '9ff93b89b511a2c2376adf57000a2c24';

function breakpoint() {
  const mobile = window.innerWidth < 992;
  return {
    rendition:   mobile ? '720p' : '1080p',
    targetWidth: mobile ? 640   : 960,
  };
}

async function fetchAssets(ids, rendition, targetWidth) {
  const results = await Promise.allSettled(
    ids.map(id =>
      fetch(`https://api.vimeo.com/videos/${id}?fields=pictures,files,width,height`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      })
        .then(r => r.ok ? r.json().then(data => ({ id, data })) : { id, data: {} })
        .catch(() => ({ id, data: {} }))
    )
  );

  const cache = {};
  results.forEach(result => {
    if (result.status !== 'fulfilled') return;
    const { id, data } = result.value;

    const sizes    = data.pictures?.sizes ?? [];
    const bestSize = sizes.find(s => s.width >= targetWidth) ?? sizes[sizes.length - 1];

    const files = data.files ?? [];
    const file  = files.find(f => f.rendition === rendition)
               ?? files.find(f => f.quality   === 'hd')
               ?? files[0];

    cache[id] = {
      poster:      bestSize?.link ?? '',
      videoWidth:  data.width     ?? 0,
      videoHeight: data.height    ?? 0,
      mp4:         file?.link     ?? '',
    };
  });

  return cache;
}

export async function initVimeo({ aspectRatioTarget = null } = {}) {
  const wrappers = [...document.querySelectorAll('[data-vimeo]')];
  if (!wrappers.length) return;

  const { rendition, targetWidth } = breakpoint();
  const ids   = [...new Set(wrappers.map(el => el.dataset.vimeo).filter(Boolean))];
  const cache = await fetchAssets(ids, rendition, targetWidth);

  // Ratios + posters immédiatement sur tous les wrappers dès la réponse API
  wrappers.forEach(wrapper => {
    const assets = cache[wrapper.dataset.vimeo];
    if (!assets) return;

    if (aspectRatioTarget !== null && assets.videoWidth && assets.videoHeight) {
      const ratio = `${assets.videoWidth} / ${assets.videoHeight}`;
      const arEl  = wrapper.closest(aspectRatioTarget) ?? wrapper.querySelector(aspectRatioTarget);
      if (arEl) arEl.style.aspectRatio = ratio;
    }

    const img = wrapper.querySelector('img.video-poster');
    if (img && assets.poster) img.src = assets.poster;
  });

  // Lazy-load vidéo au scroll
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const wrapper = entry.target;
      const assets  = cache[wrapper.dataset.vimeo];
      if (!assets) return;

      const source = wrapper.querySelector('video source[data-src]');

      if (source && assets.mp4 && !source.getAttribute('src')) {
        const video = source.closest('video');
        source.src = assets.mp4;
        video.load();
        video.play().catch(() => {});
      }

      obs.unobserve(wrapper);
    });
  }, { rootMargin: '300px' });

  wrappers.forEach(el => observer.observe(el));
}
