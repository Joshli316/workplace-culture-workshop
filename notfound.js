(function () {
  let saved = null;
  try { saved = localStorage.getItem('wcw_lang'); } catch (e) {}
  const isZh = saved !== 'en';
  document.body.classList.toggle('zh', isZh);
  document.documentElement.lang = isZh ? 'zh-Hans' : 'en';
})();
