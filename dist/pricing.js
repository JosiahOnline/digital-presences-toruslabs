(() => {
  'use strict';
  const plans = {"t2": {"service": "digital", "name": "Digital Presence Management", "description": "Your website, Google presence and AI visibility — managed for you.", "annual": 649, "monthly": 749, "featured": true, "billingAnnual": "Billed monthly · 12-month contract", "billingMonthly": "Billed monthly · Cancel anytime", "termsAnnual": "No setup fee", "termsMonthly": "No setup fee"}};
  const amount = value => Number(value).toLocaleString('en-MY');
  const status = document.getElementById('pricing-status');
  function updatePrices(panel, mode, announce = false) {
    panel.dataset.billingMode = mode;
    const annual = mode === 'annual';
    panel.querySelectorAll('[data-billing-option]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.billingOption === mode));
    });
    panel.querySelectorAll('[data-plan]').forEach(card => {
      const id = card.dataset.plan;
      const plan = plans[id];
      const price = amount(plan[mode]);
      const billing = annual ? plan.billingAnnual : plan.billingMonthly;
      const terms = annual ? plan.termsAnnual : plan.termsMonthly;
      card.querySelector('[data-price]').textContent = price;
      card.querySelector('[data-billing]').textContent = billing;
      card.querySelector('[data-commitment]').textContent = terms;
      const link = card.querySelector('[data-plan-link]');
      if (link) {
        const selection = annual ? '12-month commitment, billed monthly' : 'Monthly option';
        const message = `Hi Torus, I’m interested in ${plan.name}. ${selection}, RM${price}/month. ${billing}. ${terms}. My business or website is:`;
        link.href = `https://wa.me/60175693237?text=${encodeURIComponent(message)}`;
      }
    });
    if (announce) status.textContent = `${annual ? 'Annual' : 'Monthly'} pricing selected for ${panel.querySelector('h3').textContent}.`;
  }
  document.querySelectorAll('[data-pricing-service]').forEach(panel => {
    panel.querySelectorAll('[data-billing-option]').forEach(button => {
      button.addEventListener('click', () => updatePrices(panel, button.dataset.billingOption, true));
    });
    updatePrices(panel, 'annual');
  });
})();
