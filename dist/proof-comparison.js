(() => {
  'use strict';
  const stage = document.querySelector('.proof-stage');
  if (!stage) return;
  const snapshots = {
    before: { score: '54', grade: 'Grade C', mentions: '8', visibility: '53', content: '41', scoreGainLabel: 'Before score', visibilityGainLabel: 'Before score', contentGainLabel: 'Before score', schema: '22', technical: '73', trust: '78', geo: '57', aeo: '45', local: '45', business: '81', schemaChange: 'Before score', technicalChange: 'Before score', trustChange: 'Before score', geoChange: 'Before score', aeoChange: 'Before score', localChange: 'Before score', businessChange: 'Before score' },
    after: { score: '81', grade: 'Grade A', mentions: '11', visibility: '73', content: '84', scoreGainLabel: '+27 score points', visibilityGainLabel: '+20 percentage points', contentGainLabel: '+43 score points', schema: '91', technical: '98', trust: '91', geo: '85', aeo: '58', local: '100', business: '90', schemaChange: '+69 score points', technicalChange: '+25 score points', trustChange: '+13 score points', geoChange: '+28 score points', aeoChange: '+13 score points', localChange: '+55 score points', businessChange: '+9 score points' }
  };
  const buttons = [...stage.querySelectorAll('[data-snapshot-option]')];
  const status = document.getElementById('proof-status');
  buttons.forEach(button => button.addEventListener('click', () => {
    const name = button.dataset.snapshotOption;
    if (stage.dataset.snapshot === name) return;
    const data = snapshots[name];
    stage.dataset.snapshot = name;
    buttons.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    stage.querySelectorAll('[data-proof-field]').forEach(field => {
      field.textContent = data[field.dataset.proofField];
    });
    stage.querySelectorAll('[data-proof-gauge]').forEach(gauge => {
      gauge.setAttribute('stroke-dasharray', `${data[gauge.dataset.proofGauge]} 100`);
    });
    stage.querySelectorAll('[data-proof-score]').forEach(bar => {
      bar.style.width = `${data[bar.dataset.proofScore]}%`;
    });
    const categories = ` Additional scores out of 100: Schema ${data.schema}; Technical ${data.technical}; Trust and E-E-A-T ${data.trust}; AI Readiness GEO ${data.geo}; AEO ${data.aeo}; Local SEO ${data.local}; Google Business ${data.business}.`;
    const gains = name === 'after' ? ' Improvements: 27 score points, 20 percentage points in AI visibility, and 43 content score points.' : ' This is the baseline for the comparison.';
    status.textContent = `${name === 'after' ? 'After' : 'Before'} audit: Torus score ${data.score} percent, ${data.grade}; AI visibility ${data.visibility} percent, mentioned in ${data.mentions} of 15 tested answers; content score ${data.content} percent.${gains}${categories}`;
  }));
  stage.querySelector('.proof-switch').hidden = false;
})();
