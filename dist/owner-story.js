(() => {
  'use strict';
  const video = document.getElementById('owner-story-video');
  const scrollStory = document.getElementById('scroll-story');
  const header = document.querySelector('.site-header');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const useFrames = matchMedia('(max-width:760px)').matches || /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const title = document.getElementById('mobile-story-title');
  const description = document.getElementById('mobile-story-description');
  const terms = document.getElementById('mobile-story-terms');
  const cue = document.querySelector('.story-cue');
  const cueLabel = cue.querySelector('span');
  const loadStatus = document.getElementById('story-load-status');
  const errorMessage = document.getElementById('story-error');
  const canvas = document.getElementById('story-canvas');
  if (useFrames) { canvas.width = 640; canvas.height = 360; video.hidden = true; }
  const context = canvas.getContext('2d', {alpha:false});
  const frame = document.querySelector('.story-frame');
  const dialogueLayer = document.querySelector('.story-dialogue-layer');
  const dialogue = document.getElementById('owner-dialogue');
  frame.dataset.renderMode = useFrames ? 'frames' : 'video';
  const framePlayer = useFrames ? new window.TorusScrollFrames(canvas, {onReady:videoReady, onDraw:showFrame, onError:showStoryError}) : null;
  // Match the overlay to the contained video, including any letterboxing.
  function sizeDialogue() {
    const scale = Math.min(frame.clientWidth / 1280, frame.clientHeight / 720);
    dialogueLayer.style.width = `${1280 * scale}px`;
    dialogueLayer.style.height = `${720 * scale}px`;
  }
  new ResizeObserver(sizeDialogue).observe(frame);
  sizeDialogue();
  const scenes = [
    ['Someone is looking for exactly what you do.', '“What is the best air cond service provider in Klang Valley?”'],
    ['Other businesses show up. Yours doesn’t.', 'In this example, three providers appear. Your business is missing.'],
    ['“We do good work. So why aren’t we showing up?”', 'And there are still customers to reply to, team questions and a business to run.'],
    ['“SEO. AEO. GEO. I already have a business to run.”', 'Search Engine Optimisation (SEO). Answer Engine Optimisation (AEO). Generative Engine Optimisation (GEO).'],
    ['“I just want someone to take care of this.”', 'Your business already asks enough of you.']
  ];
  let target = 0, queued = false, lastScene = -1, fallback = false, wasVisible = false;
  let loading, announcedReady = false;
  // The public static host does not serve byte ranges. A complete Blob lets the
  // browser seek locally, preserving the same scroll-driven animation everywhere.
  function loadStory() {
    if (reduced.matches || fallback || loading) return;
    frame.setAttribute('aria-busy', 'true');
    cueLabel.textContent = 'Loading story…';
    loadStatus.textContent = 'Loading the animated story.';
    if (useFrames) { loading = true; framePlayer.load(); return; }
    loading = (async () => {
      const response = await fetch(video.dataset.storySrc, {cache: 'force-cache'});
      if (!response.ok) throw new Error('Story download failed');
      const blob = await response.blob();
      if (!blob.size) throw new Error('Empty story video');
      video.src = URL.createObjectURL(new Blob([blob], {type: 'video/mp4'}));
      video.load();
    })().catch(showStoryError);
  }
  function showStoryError() {
    errorMessage.hidden = false;
    frame.setAttribute('aria-busy', 'false');
    cueLabel.textContent = 'Scroll';
    loadStatus.textContent = 'The animation could not load. Read the story instead.';
  }
  function videoReady() {
    frame.setAttribute('aria-busy', 'false');
    cueLabel.textContent = 'Scroll';
    if (!announcedReady) {
      loadStatus.textContent = 'Story ready. Scroll to explore.';
      announcedReady = true;
    }
    paintFrame();
    schedule();
  }
  // Keep a decoded frame on the page even when the paused video compositor is released.
  function showFrame(time) {
    canvas.dataset.frameTime = time.toFixed(3);
    frame.classList.add('has-story-frame');
    const fadeIn = Math.max(0, Math.min(1, (time - 24.2) / .6));
    const fadeOut = Math.max(0, Math.min(1, 28.3 - time));
    dialogue.style.opacity = String(Math.min(fadeIn, fadeOut));
  }
  function paintFrame() {
    if (useFrames) { framePlayer.seek(target); return; }
    if (!context || video.readyState < 2 || video.seeking || !video.videoWidth) return;
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      showFrame(video.currentTime);
    } catch { /* The poster or previous frame stays visible until decoding catches up. */ }
  }
  function seek() {
    if (reduced.matches || fallback || !Number.isFinite(video.duration) || video.readyState < 1) return;
    if (!video.seeking && Math.abs(video.currentTime - target) > .025) video.currentTime = target;
  }
  function update() {
    queued = false;
    const hh = header.getBoundingClientRect().height;
    if (reduced.matches || fallback) return;
    const bounds = scrollStory.getBoundingClientRect();
    const visible = bounds.bottom > hh && bounds.top < innerHeight;
    if (visible && !wasVisible) paintFrame();
    wasVisible = visible;
    const distance = Math.max(1, scrollStory.offsetHeight - (innerHeight - hh));
    const progress = Math.max(0, Math.min(1, (hh - bounds.top) / distance));
    const duration = useFrames ? 30 : video.duration;
    if (Number.isFinite(duration)) target = Math.min(duration - .045, progress * (duration - .045));
    const scene = progress > .92 ? 4 : Math.min(3, Math.floor(progress * 4));
    if (scene !== lastScene) {
      title.textContent = scenes[scene][0];
      description.textContent = scenes[scene][1];
      description.hidden = scene === 3;
      terms.hidden = scene !== 3;
      lastScene = scene;
    }
    if (useFrames) framePlayer.seek(target); else seek();
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  video.addEventListener('loadedmetadata', () => { video.pause(); schedule(); });
  video.addEventListener('loadeddata', videoReady);
  video.addEventListener('seeked', () => {
    // Save the completed frame before seeking to the latest scroll position.
    paintFrame();
    if (Math.abs(video.currentTime - target) > .04) seek();
  });
  video.addEventListener('canplay', videoReady);
  video.addEventListener('error', showStoryError);
  document.getElementById('read-story').addEventListener('click', () => {
    fallback = true; video.pause(); framePlayer?.stop(); document.body.classList.add('is-static-story');
    document.getElementById('static-story').scrollIntoView(); schedule();
  });
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', () => { paintFrame(); schedule(); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { paintFrame(); schedule(); }
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) framePlayer?.stop();
    else if (useFrames && loading) framePlayer.load();
    loadStory(); schedule();
  });
  loadStory();
  schedule();
})();
