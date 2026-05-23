(function () {
  'use strict';

  function toggleLang() {
    const isZh = document.body.classList.toggle('zh');
    try { localStorage.setItem('wcw_lang', isZh ? 'zh' : 'en'); } catch (e) {}
    document.documentElement.lang = isZh ? 'zh-CN' : 'en';
    document.getElementById('langToggle').textContent = isZh ? '中文' : 'EN';
  }

  (function initLang() {
    let saved = null;
    try { saved = localStorage.getItem('wcw_lang'); } catch (e) {}
    const isZh = saved !== 'en';
    document.body.classList.toggle('zh', isZh);
    document.documentElement.lang = isZh ? 'zh-CN' : 'en';
    document.getElementById('langToggle').textContent = isZh ? '中文' : 'EN';
  })();

  // Delegated actions
  const ACTIONS = {
    'toggle-lang': toggleLang,
    'print': function () { window.print(); },
  };
  document.addEventListener('click', function (e) {
    const t = e.target.closest('[data-action]');
    if (t) {
      const fn = ACTIONS[t.dataset.action];
      if (fn) fn();
    }
  });

  try {
    new QRCode(document.getElementById('qr-top'), {
      text: 'https://workplace-culture-workshop.pages.dev',
      width: 100,
      height: 100,
      colorDark: '#9f1239',
      colorLight: '#ffffff'
    });
  } catch (e) {
    const el = document.getElementById('qr-top');
    if (el) el.textContent = 'workplace-culture-workshop.pages.dev';
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
})();
