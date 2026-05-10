export function initViewportVideos(scope = document) {
  const videos = [...scope.querySelectorAll('video')];
  if (!videos.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.5 }
  );

  videos.forEach((video) => observer.observe(video));
}
