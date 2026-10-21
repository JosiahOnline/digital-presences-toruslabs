(() => {
  'use strict';
  // Public identifiers, not credentials. Local previews and Vercel preview URLs
  // are excluded so development visits do not inflate the production reports.
  const productionHosts = new Set([
    'digital-presence.toruslabs.my',
    'torus-virtual-human-partner.josiahsoh.chatgpt.site'
  ]);
  if (!productionHosts.has(location.hostname) || window.torusAnalyticsLoaded) return;
  window.torusAnalyticsLoaded = true;
  const measurementId = 'G-QG2PF4R7XE';
  const clarityId = 'z0k8cdui58';
  const metaPixelId = '2555957918204878';

  function loadScript(id, src) {
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
  loadScript('torus-google-tag', 'https://www.googletagmanager.com/gtag/js?id=' + measurementId);
  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  loadScript('torus-clarity-tag', 'https://www.clarity.ms/tag/' + clarityId);

  if (!window.fbq) {
    const fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = window._fbq || fbq;
  }
  window.fbq('init', metaPixelId);
  // Scope events to Torus's dataset if another pixel is introduced later.
  window.fbq('trackSingle', metaPixelId, 'PageView');
  loadScript('torus-meta-pixel', 'https://connect.facebook.net/en_US/fbevents.js');

  // Only fixed UI labels go into our custom events. Do not send enquiry text,
  // phone numbers, names, or the WhatsApp URL/query string as event parameters.
  function track(name, parameters, clarityEvent = name) {
    try {
      window.gtag('event', name, {send_to: measurementId, transport_type: 'beacon', ...parameters});
    } catch { /* Tracking must never interrupt the landing page. */ }
    try { window.clarity('event', clarityEvent); } catch { /* Same for Clarity. */ }
  }

  // The audit form emits this only after website validation. The submitted
  // website stays in the WhatsApp handoff and is never an analytics parameter.
  document.addEventListener('torus:audit-whatsapp', () => {
    const parameters = {button_name: 'free_digital_audit', section_id: 'audit', billing_option: 'not_selected'};
    track('whatsapp_click', parameters, 'whatsapp_free_digital_audit');
    try {
      window.fbq('trackSingleCustom', metaPixelId, 'WhatsAppClick', parameters);
    } catch { /* Keep the form working if Meta tracking is blocked. */ }
  });

  document.addEventListener('click', event => {
    const control = event.target.closest?.('a, button');
    if (!control) return;
    const sectionId = control.closest('main > section')?.id || 'navigation';
    if (control.matches('.whatsapp-link, .plan-enquiry, .new-website-enquiry')) {
      const placement = control.closest('.mobile-enquiry') ? 'mobile_sticky'
        : control.matches('.plan-enquiry') ? 'pricing_subscribe'
        : control.matches('.new-website-enquiry') ? 'new_website_enquiry' : 'contact';
      const billing = control.closest('[data-pricing-service]')?.dataset.billingMode || 'not_selected';
      track('whatsapp_click', {button_name: placement, section_id: sectionId, billing_option: billing}, 'whatsapp_' + placement);
      try {
        // A click is intent to open WhatsApp, not a completed lead or sale.
        window.fbq('trackSingleCustom', metaPixelId, 'WhatsAppClick', {
          button_name: placement, section_id: sectionId, billing_option: billing
        });
      } catch { /* The link must work even when Meta tracking is blocked. */ }
    } else if (control.dataset.billingOption) {
      track('billing_option_click', {billing_option: control.dataset.billingOption, section_id: sectionId}, 'billing_' + control.dataset.billingOption);
    } else if (control.dataset.snapshotOption) {
      track('audit_snapshot_click', {snapshot: control.dataset.snapshotOption, section_id: sectionId}, 'audit_' + control.dataset.snapshotOption);
    } else if (control.matches('a[href^="#"]')) {
      const target = control.getAttribute('href').slice(1);
      track('navigation_click', {section_id: target, button_name: control.closest('.journey-guide') ? 'journey_guide' : 'back_to_top'});
    } else if (control.id === 'read-story') {
      track('story_fallback_click', {section_id: 'problem'});
    }
  });

  // A section counts as viewed after at least one second with a meaningful
  // part of it visible. This works even for the unusually tall pinned hero.
  const sections = [...document.querySelectorAll('main > section[id]')];
  const seenSections = new Set();
  const sectionTimers = new Map();
  const seenDepths = new Set();
  const seenStages = new Set();
  const canvas = document.getElementById('story-canvas');
  const stages = ['customer_search', 'business_missing', 'owner_workload', 'seo_aeo_geo', 'take_care_of_this'];
  let stageTimer, pendingStage = -1, queued = false;

  function visible(element) {
    if (document.hidden || !element || !element.getClientRects().length) return false;
    const rect = element.getBoundingClientRect();
    const overlap = Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0);
    return rect.height > 0 && overlap >= Math.min(rect.height, innerHeight * .25);
  }
  function currentStage() {
    if (!visible(canvas)) return -1;
    const time = Number(canvas.dataset.frameTime);
    if (!Number.isFinite(time) || canvas.dataset.frameTime === undefined) return -1;
    return time > 27.6 ? 4 : Math.min(3, Math.floor(time / 7.5));
  }
  function checkStage() {
    const stage = currentStage();
    if (stage === pendingStage) return;
    clearTimeout(stageTimer);
    pendingStage = stage;
    if (stage < 0 || seenStages.has(stage)) return;
    stageTimer = setTimeout(() => {
      if (currentStage() !== stage || seenStages.has(stage)) return;
      seenStages.add(stage);
      track('hero_stage_view', {stage_name: stages[stage], section_id: 'problem'}, 'hero_' + stages[stage]);
    }, 500);
  }
  function checkViewport() {
    queued = false;
    sections.forEach(section => {
      if (seenSections.has(section.id)) return;
      if (!visible(section)) {
        clearTimeout(sectionTimers.get(section.id));
        sectionTimers.delete(section.id);
      } else if (!sectionTimers.has(section.id)) {
        sectionTimers.set(section.id, setTimeout(() => {
          sectionTimers.delete(section.id);
          if (!visible(section) || seenSections.has(section.id)) return;
          seenSections.add(section.id);
          track('section_view', {section_id: section.id}, 'view_' + section.id);
        }, 1000));
      }
    });
    checkStage();
    if (document.hidden || scrollY <= 0) return;
    const distance = document.documentElement.scrollHeight - innerHeight;
    if (distance <= 0) return;
    const depth = Math.min(100, Math.max(0, scrollY / distance * 100));
    [25, 50, 75, 90, 100].forEach(percent => {
      if (depth + .1 < percent || seenDepths.has(percent)) return;
      seenDepths.add(percent);
      track('scroll_depth', {scroll_percent: percent}, 'scroll_' + percent);
    });
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(checkViewport);
  }
  if (canvas && 'MutationObserver' in window) {
    new MutationObserver(checkStage).observe(canvas, {attributes: true, attributeFilter: ['data-frame-time']});
  }
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      sectionTimers.forEach(clearTimeout);
      sectionTimers.clear();
      clearTimeout(stageTimer);
      pendingStage = -1;
    }
    schedule();
  });
  schedule();
})();
