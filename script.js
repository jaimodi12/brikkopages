(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Hero slider: autoplay, arrows, dots, swipe, pause on hover/hidden tab
  const hero = $('.hero'), slides = $$('.hero-slide'), dots = $$('.dot');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, timer;
  const show = i => {
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, n) => { s.classList.toggle('active', n === cur); s.setAttribute('aria-hidden', n !== cur); });
    dots.forEach((d, n) => { d.classList.toggle('active', n === cur); d.setAttribute('aria-current', n === cur); });
  };
  const stop = () => clearInterval(timer);
  const play = () => { stop(); if (!reduce) timer = setInterval(() => show(cur + 1), 6000); };
  const go = i => { show(i); play(); };
  $('.next').addEventListener('click', () => go(cur + 1));
  $('.prev').addEventListener('click', () => go(cur - 1));
  dots.forEach(d => d.addEventListener('click', () => go(+d.dataset.slide)));
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', play);
  let x0 = null;
  hero.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : play());
  show(0); play();

  // Mobile menu
  const menu = $('.menu-toggle'), nav = $('.main-nav');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('.main-nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('resize', () => innerWidth > 820 && setMenu(false));

  // FAQ accordion
  $$('.faq-question').forEach(q => q.addEventListener('click', () => {
    const item = q.closest('.faq-item'), open = !item.classList.contains('open');
    $$('.faq-item').forEach(i => {
      i.classList.remove('open');
      $('.faq-question', i).setAttribute('aria-expanded', 'false');
    });
    item.classList.toggle('open', open);
    q.setAttribute('aria-expanded', open);
  }));

  // Quote modal (preselects the service, traps focus, restores focus on close)
  const modal = $('#quoteModal'), form = $('#quoteForm'), ok = $('.form-success');
  let opener = null;
  const open = btn => {
    opener = btn;
    form.hidden = false; ok.hidden = true;
    if (btn.dataset.service) form.service.value = btn.dataset.service;
    modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => form.name.focus(), 30);
  };
  const close = () => {
    modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    opener && opener.focus();
  };
  $$('.quote-btn').forEach(b => b.addEventListener('click', () => { setMenu(false); open(b); }));
  $('.modal-close').addEventListener('click', close);
  modal.addEventListener('click', e => e.target === modal && close());
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('show')) return;
    if (e.key === 'Escape') return close();
    if (e.key === 'Tab') {
      const f = $$('button,input,select,textarea,[href]', modal).filter(el => !el.hidden && el.offsetParent);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    // TODO: send new FormData(form) to your backend or a form service
    form.hidden = true; ok.hidden = false; form.reset();
  });

  // Newsletter
  $('.newsletter').addEventListener('submit', e => {
    e.preventDefault();
    $('.nl-msg').textContent = 'Thanks for subscribing to Brikko.';
    e.currentTarget.reset();
  });

  $('#year').textContent = new Date().getFullYear();
})();
