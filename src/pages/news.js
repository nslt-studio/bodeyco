import { initViewportVideos } from '../utils/viewport-video.js';
import { initVimeo } from '../utils/vimeo.js';

export function initNews() {
  initViewportVideos();
  return initVimeo({ aspectRatioTarget: '.grid-video' });
}
