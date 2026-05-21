(function () {
  'use strict';

  const TOTAL = 13;
  const INTERACTIVE = [5, 10];

  const SECTION_LABELS = {
    1:  '',
    2:  '议程 · Agenda',
    3:  '期望 · Expectations',
    4:  '期望 · Expectations',
    5:  '互动 · Activity',
    6:  '关系 · Relationships',
    7:  '沟通 · Communication',
    8:  '期望 · Expectations',
    9:  '沟通 · Communication',
    10: '互动 · Quiz',
    11: '文化对比 · Culture',
    12: 'CSC 服务',
    13: '资源 · Resources',
  };

  let cur = 1;

  // ── Language toggle ──────────────────────────────────
  function toggleLang() {
    const isZh = document.body.classList.toggle('zh');
    try { localStorage.setItem('wcw_lang', isZh ? 'zh' : 'en'); } catch (e) {}
    document.documentElement.lang = isZh ? 'zh-Hans' : 'en';
    document.getElementById('langToggle').textContent = isZh ? '中文' : 'EN';
  }

  (function initLang() {
    let saved = null;
    try { saved = localStorage.getItem('wcw_lang'); } catch (e) {}
    const isZh = saved !== 'en';
    document.body.classList.toggle('zh', isZh);
    document.documentElement.lang = isZh ? 'zh-Hans' : 'en';
    document.getElementById('langToggle').textContent = isZh ? '中文' : 'EN';
  })();

  // ── Reveal state ─────────────────────────────────────
  function isRevealed(n) {
    const el = document.getElementById('slide-' + n);
    if (!el) return false;
    if (n === 10) return el.dataset.phase === 'done';
    return el.dataset.phase === 'answer';
  }

  function revealActivity() {
    const slide = document.getElementById('slide-5');
    slide.dataset.phase = 'answer';
    document.getElementById('choice-A').classList.add('wrong');
    document.getElementById('choice-B').classList.add('wrong');
    document.getElementById('choice-C').classList.add('correct');
    document.getElementById('activity-answer-5').style.display = 'block';
    document.getElementById('reveal-btn-5').disabled = true;
    document.getElementById('nextBtn').disabled = false;
  }

  function revealQ1() {
    const slide = document.getElementById('slide-10');
    slide.dataset.phase = 'q2';
    document.getElementById('q1-answer').style.display = 'block';
    document.getElementById('q2-block').style.display = 'block';
    document.getElementById('reveal-btn-q1').disabled = true;
  }

  function revealQ2() {
    const slide = document.getElementById('slide-10');
    slide.dataset.phase = 'done';
    document.getElementById('q2-answer').style.display = 'block';
    document.getElementById('reveal-btn-q2').disabled = true;
    document.getElementById('nextBtn').disabled = false;
  }

  // ── Navigation ───────────────────────────────────────
  function showSlide(n) {
    document.querySelectorAll('.slide').forEach((s, i) => {
      s.classList.toggle('active', i + 1 === n);
    });
    document.getElementById('slideCounter').textContent = n + ' / ' + TOTAL;
    document.getElementById('sectionLabel').textContent = SECTION_LABELS[n] || '';

    const dots = document.getElementById('progressDots');
    dots.innerHTML = Array.from({ length: TOTAL }, (_, i) => {
      const cls = i + 1 === n ? 'active' : i + 1 < n ? 'done' : '';
      return '<span class="dot ' + cls + '" aria-hidden="true"></span>';
    }).join('');

    document.querySelectorAll('.slide [tabindex="-1"]').forEach(el => el.removeAttribute('tabindex'));
    const heading = document.querySelector('#slide-' + n + ' h1, #slide-' + n + ' h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }

    document.getElementById('prevBtn').disabled = (n === 1);
    document.getElementById('nextBtn').disabled = (n === TOTAL) || (INTERACTIVE.includes(n) && !isRevealed(n));
  }

  function nextSlide() {
    if (INTERACTIVE.includes(cur) && !isRevealed(cur)) return;
    if (cur < TOTAL) { cur++; showSlide(cur); }
  }

  function prevSlide() {
    if (cur > 1) { cur--; showSlide(cur); }
  }

  function goHome() {
    cur = 1; showSlide(1);
  }

  // ── Delegated action handler (replaces inline onclick) ─
  const ACTIONS = {
    'toggle-lang': toggleLang,
    'prev-slide': prevSlide,
    'next-slide': nextSlide,
    'home': goHome,
    'reveal-activity': revealActivity,
    'reveal-q1': revealQ1,
    'reveal-q2': revealQ2,
  };

  document.addEventListener('click', function (e) {
    const t = e.target.closest('[data-action]');
    if (t) {
      const fn = ACTIONS[t.dataset.action];
      if (fn) fn();
    }
  });

  // ── Slide-area click advances (when not on an action element) ─
  document.getElementById('slidesArea').addEventListener('click', function (e) {
    if (e.target.closest('a, button, [data-action]')) return;
    nextSlide();
  });

  // ── Keyboard navigation ──────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault(); nextSlide();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault(); prevSlide();
    }
  });

  // ── Date on title slide ──────────────────────────────
  (function () {
    const now = new Date();
    document.getElementById('dateLine').textContent =
      now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日';
  })();

  // ── QR code (slide 13) ───────────────────────────────
  try {
    new QRCode(document.getElementById('qr-container'), {
      text: 'https://workplace-culture-workshop.pages.dev/resources',
      width: 148,
      height: 148,
      colorDark: '#9f1239',
      colorLight: '#fff8f3'
    });
  } catch (e) {
    const el = document.getElementById('qr-container');
    if (el) el.textContent = 'workplace-culture-workshop.pages.dev/resources';
  }

  // ── Service Worker ───────────────────────────────────
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }

  showSlide(1);
})();
