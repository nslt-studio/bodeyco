function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function initVideoControls(video, controls) {
  const playBtn     = controls.querySelector('#play');
  const muteBtn     = controls.querySelector('#mute');
  const indexEl     = controls.querySelector('[data-controls="index"]');
  const totalEl     = controls.querySelector('[data-controls="total"]');
  const progressEl  = controls.querySelector('#progress');
  const overEl      = progressEl?.querySelector('.progress.over');
  const indicatorEl = progressEl?.querySelector('.indicator');

  // Durée totale dès que les métadonnées sont disponibles
  const setTotal = () => {
    if (totalEl && video.duration) totalEl.textContent = formatTime(video.duration);
  };
  if (video.readyState >= 1) setTotal();
  else video.addEventListener('loadedmetadata', setTotal, { once: true });

  // Avancée fluide via requestAnimationFrame
  let rafId = null;

  const tick = () => {
    const pct = video.duration ? video.currentTime / video.duration : 0;
    if (indexEl)     indexEl.textContent    = formatTime(video.currentTime);
    if (overEl)      overEl.style.width     = `${pct * 100}%`;
    if (indicatorEl) indicatorEl.style.left = `${pct * 100}%`;
    rafId = requestAnimationFrame(tick);
  };

  const startRaf = () => { if (!rafId) rafId = requestAnimationFrame(tick); };
  const stopRaf  = () => { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } };

  video.addEventListener('play',   startRaf);
  video.addEventListener('pause',  stopRaf);
  video.addEventListener('ended',  stopRaf);
  video.addEventListener('seeking', () => { tick(); }); // mise à jour au seek même en pause

  if (!video.paused) startRaf();

  // Bouton Play / Pause
  const syncPlay = () => {
    if (playBtn) playBtn.textContent = video.paused ? 'Play' : 'Pause';
  };
  video.addEventListener('play',  syncPlay);
  video.addEventListener('pause', syncPlay);
  syncPlay();

  playBtn?.addEventListener('click', () => {
    video.paused ? video.play().catch(() => {}) : video.pause();
  });

  // Bouton Mute / Unmute
  const syncMute = () => {
    if (muteBtn) muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
  };
  video.addEventListener('volumechange', syncMute);
  syncMute();

  muteBtn?.addEventListener('click', () => { video.muted = !video.muted; });

  // Seek au clic dans la barre de progression
  progressEl?.addEventListener('click', (e) => {
    if (!video.duration) return;
    const rect = progressEl.getBoundingClientRect();
    video.currentTime = ((e.clientX - rect.left) / rect.width) * video.duration;
  });
}
