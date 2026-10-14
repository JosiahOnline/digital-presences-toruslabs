(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 680px)');
  const stacked = matchMedia('(max-width: 800px)');
  const tagline = document.querySelector('.header-tagline');
  const typed = document.getElementById('tagline-typed');
  const words = ['Searchable', 'Understandable', 'Recommendable'];
  const fullTagline = words.join('.');
  let typingTimer;
  let phraseIndex = 0;
  let character = 0;
  let deleting = false;

  function typeNext() {
    if (document.hidden || reduced.matches) return;
    const phrase = mobile.matches ? words[phraseIndex] : fullTagline;
    character += deleting ? -1 : 1;
    typed.textContent = phrase.slice(0, character);
    let delay = deleting ? 28 : (mobile.matches ? 85 : 65);
    if (!deleting && character === phrase.length) {
      deleting = true;
      delay = mobile.matches ? 1700 : 2300;
    } else if (deleting && character === 0) {
      deleting = false;
      phraseIndex = mobile.matches ? (phraseIndex + 1) % words.length : 0;
      delay = 240;
    }
    typingTimer = setTimeout(typeNext, delay);
  }

  function startTyping() {
    clearTimeout(typingTimer);
    phraseIndex = 0;
    character = 0;
    deleting = false;
    tagline.classList.toggle('is-typing', !reduced.matches);
    if (reduced.matches || document.hidden) {
      typed.textContent = mobile.matches ? words[0] : fullTagline;
      return;
    }
    typed.textContent = '';
    typeNext();
  }

  mobile.addEventListener('change', startTyping);
  reduced.addEventListener('change', startTyping);
  document.addEventListener('visibilitychange', startTyping);
  startTyping();

  const pillars = document.querySelector('.solution-pillars');
  const cards = [...pillars.querySelectorAll('.solution-pillar')];
  const presence = document.getElementById('presence');
  const body = presence.querySelector('.solution-body');
  const inner = body.querySelector('.section-inner');
  const header = document.querySelector('.site-header');
  let scrollQueued = false;
  let pinned = false;
  let stageHeight = 0;
  let revealStart = 0;
  let segment = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => value * value * (3 - 2 * value);

  function setCardProgress(card, progress) {
    const visible = ease(clamp(progress));
    card.style.setProperty('--pillar-opacity', visible.toFixed(4));
    card.style.setProperty('--pillar-y', `${((1 - visible) * 36).toFixed(2)}px`);
  }

  function updatePillars() {
    scrollQueued = false;
    if (reduced.matches) {
      cards.forEach(card => setCardProgress(card, 1));
      return;
    }
    const headerHeight = header.getBoundingClientRect().height;
    if (pinned) {
      // Start only after the whole stage has reached the reading position.
      // Every card gets its own scroll segment; no timers or one-time state.
      const travel = headerHeight - presence.getBoundingClientRect().top;
      cards.forEach((card, index) => {
        const start = revealStart + index * segment;
        setCardProgress(card, (travel - start) / (segment * .8));
      });
    } else {
      const available = Math.max(1, innerHeight - headerHeight);
      const entryLine = headerHeight + available * .72;
      const groupTop = pillars.getBoundingClientRect().top;
      const firstOffset = cards[0].offsetTop;
      const cardTops = cards.map(card => groupTop + card.offsetTop - firstOffset);
      cards.forEach((card, index) => {
        // Stable layout offsets exclude the animated translation. Reveal later
        // and over more scroll, while leaving the full card readable on phones.
        const nextDistance = index < cards.length - 1
          ? cardTops[index + 1] - cardTops[index]
          : cards[index].offsetHeight + 34;
        const distance = Math.min(available * .46, nextDistance * .9);
        setCardProgress(card, (entryLine - cardTops[index]) / Math.max(1, distance));
      });
    }
  }

  function configurePillars() {
    // Measure the normal three-column content before deciding whether pinning
    // is safe. Short screens fall back to stacked, naturally scrolling cards.
    presence.classList.remove('presence-scroll-flow');
    stageHeight = Math.max(1, innerHeight - header.getBoundingClientRect().height);
    pinned = !reduced.matches && !stacked.matches && inner.offsetHeight + 48 <= stageHeight;
    if (pinned) {
      revealStart = stageHeight * .12;
      segment = Math.max(360, stageHeight * .65);
      const finalHold = stageHeight * .25;
      const travel = revealStart + segment * cards.length + finalHold;
      presence.style.setProperty('--presence-stage-height', `${stageHeight}px`);
      presence.style.setProperty('--presence-height', `${stageHeight + travel}px`);
      presence.classList.add('presence-scroll-pinned');
    } else {
      presence.classList.remove('presence-scroll-pinned');
      presence.style.removeProperty('--presence-height');
      presence.style.removeProperty('--presence-stage-height');
      if (!reduced.matches && !stacked.matches) presence.classList.add('presence-scroll-flow');
    }
    cards.forEach(card => setCardProgress(card, reduced.matches ? 1 : 0));
    pillars.classList.add('pillars-scroll-managed');
    updatePillars();
  }

  function schedulePillars() {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(updatePillars);
    }
  }
  window.addEventListener('scroll', schedulePillars, {passive:true});
  window.addEventListener('resize', configurePillars);
  window.addEventListener('load', configurePillars);
  window.addEventListener('pageshow', configurePillars);
  document.addEventListener('visibilitychange', schedulePillars);
  stacked.addEventListener('change', configurePillars);
  reduced.addEventListener('change', configurePillars);
  // Expanding the held section changes the position of anchors below it.
  // Restore an initial deep link after layout settles, unless the visitor acts.
  const initialHash = location.hash;
  const initialTarget = initialHash ? document.getElementById(initialHash.slice(1)) : null;
  let initialAnchorUntouched = true;
  ['wheel', 'touchmove', 'pointerdown', 'keydown'].forEach(event => {
    window.addEventListener(event, () => { initialAnchorUntouched = false; }, {once:true, passive:true});
  });
  const pageReady = document.readyState === 'complete' ? Promise.resolve()
    : new Promise(resolve => window.addEventListener('load', resolve, {once:true}));
  Promise.all([pageReady, document.fonts?.ready]).then(() => {
    configurePillars();
    requestAnimationFrame(() => {
      if (initialTarget && initialAnchorUntouched && location.hash === initialHash) {
        initialTarget.scrollIntoView({block:'start', behavior:'instant'});
      }
    });
  });
  configurePillars();
})();
