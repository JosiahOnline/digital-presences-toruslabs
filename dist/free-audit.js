(() => {
  'use strict';
  const form = document.getElementById('digital-audit-form');
  if (!form) return;
  const input = document.getElementById('audit-website');
  const status = document.getElementById('audit-form-status');

  function websiteAddress(value) {
    const text = value.trim();
    if (!text || /\s/.test(text)) return null;
    try {
      const url = new URL(/^https?:\/\//i.test(text) ? text : 'https://' + text);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port) return null;
      const host = url.hostname;
      const labels = host.split('.');
      if (host.length > 253 || labels.length < 2 || !labels.every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) return null;
      if (!/^(?:[a-z]{2,63}|xn--[a-z0-9-]+)$/i.test(labels[labels.length - 1])) return null;
      // This is a website-wide audit: omit paths, fragments and query strings.
      return url.origin;
    } catch { return null; }
  }

  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    status.textContent = '';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const website = websiteAddress(input.value);
    if (!website) {
      input.setAttribute('aria-invalid', 'true');
      status.textContent = 'Please enter a website address, such as yourbusiness.com.my.';
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    const message = `Hi Torus, I’d like to request a Free Digital Audit for my website: ${website}`;
    const destination = 'https://wa.me/60175693237?text=' + encodeURIComponent(message);
    // No website value or other visitor input is included in this event.
    document.dispatchEvent(new CustomEvent('torus:audit-whatsapp'));
    status.textContent = 'Opening WhatsApp. Send the prefilled message to request your free audit.';
    window.location.assign(destination);
  });
})();
