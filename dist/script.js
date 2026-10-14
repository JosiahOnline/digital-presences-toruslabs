(() => {
  'use strict';
  const message = 'Hi Torus, I’d like help with my website and digital presence. My business or website is:';
  document.querySelectorAll('.whatsapp-link').forEach(link => {
    link.href = `https://wa.me/60175693237?text=${encodeURIComponent(message)}`;
  });

  const sections = [...document.querySelectorAll('main > section')];
  const guideLinks = [...document.querySelectorAll('[data-guide]')];
  const header = document.querySelector('.site-header');
  const presence = document.getElementById('presence');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;
  function updateGuide() {
    // Activate each section as it enters the reading area.
    const readingLine = Math.max(header.offsetHeight + 90, innerHeight * .65);
    const inMotionStory = !reducedMotion.matches && !document.body.classList.contains('is-static-story');
    document.body.classList.toggle('is-in-story', inMotionStory && presence.getBoundingClientRect().top > readingLine);
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= readingLine) active = section;
    }
    guideLinks.forEach(link => {
      if (link.dataset.guide === active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
      const linkBounds = link.getBoundingClientRect();
      const midpoint = linkBounds.top + linkBounds.height / 2;
      const behind = sections.find(section => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= midpoint && bounds.bottom > midpoint;
      });
      link.dataset.tone = behind ? behind.dataset.tone : 'light';
    });
    ticking = false;
  }
  function scheduleUpdate() {
    if (!ticking) { requestAnimationFrame(updateGuide); ticking = true; }
  }
  window.addEventListener('scroll', scheduleUpdate, {passive: true});
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', updateGuide);
  reducedMotion.addEventListener('change', scheduleUpdate);
  document.querySelectorAll('details').forEach(details => details.addEventListener('toggle', scheduleUpdate));
  updateGuide();
})();

// Keep the brand available on upward scrolling without covering downward reading.
(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  let previousY = Math.max(0, window.scrollY);
  let accumulated = 0;
  let lastDirection = 0;
  let userStarted = false;
  let queued = false;
  const show = () => root.classList.remove('header-is-hidden');
  function updateHeader() {
    queued = false;
    const y = Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - innerHeight));
    const delta = y - previousY;
    previousY = y;
    if (!userStarted) return;
    if (y < 24) { show(); accumulated = 0; return; }
    if (Math.abs(delta) < .5) return;
    const direction = Math.sign(delta);
    if (direction !== lastDirection) accumulated = 0;
    lastDirection = direction;
    accumulated += Math.abs(delta);
    if (direction < 0 && accumulated >= 8) show();
    if (direction > 0 && accumulated >= 16 && y > header.offsetHeight) root.classList.add('header-is-hidden');
  }
  ['wheel', 'touchmove', 'pointerdown'].forEach(event => window.addEventListener(event, () => { userStarted = true; }, {passive:true}));
  window.addEventListener('keydown', event => {
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) userStarted = true;
  });
  window.addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(updateHeader); }
  }, {passive:true});
  header.addEventListener('focusin', () => { show(); accumulated = 0; });
  window.addEventListener('pageshow', () => { previousY = Math.max(0, window.scrollY); accumulated = 0; show(); });
})();
