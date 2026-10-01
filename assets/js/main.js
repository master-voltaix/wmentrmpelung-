(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = [...document.querySelectorAll('.main-nav a')];
  const toTop = document.querySelector('.to-top');
  const mobileBar = document.querySelector('.mobile-bar');
  const heroBg = document.querySelector('.hero-bg');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero-Headline Wort für Wort einblenden
  const h1 = document.querySelector('.hero h1');
  if (h1 && !reduced) {
    let i = 0;
    h1.innerHTML = h1.innerHTML.split(/(<br>)/).map(part => part === '<br>' ? part :
      part.split(' ').filter(Boolean).map(w => `<span class="w"><span style="animation-delay:${0.35 + i++ * 0.08}s">${w}</span></span>`).join(' ')
    ).join('');
  }

  // Scroll: Header, Fortschritt, Nach-oben, Hero-Parallax
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 700);
    mobileBar.classList.toggle('show', y > 500);
    if (!reduced && y < innerHeight * 1.2) heroBg.style.translate = `0 ${Math.round(y * 0.3)}px`;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Mobile Navigation
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  navLinks.forEach(a => a.addEventListener('click', () => {
    header.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  // Aktiven Menüpunkt markieren
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href') === '#top' ? '.hero' : a.getAttribute('href')))
    .filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const i = sections.indexOf(e.target);
      navLinks.forEach((a, j) => a.classList.toggle('active', i === j));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  // Einblenden beim Scrollen (gestaffelt)
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const siblings = [...e.target.parentElement.children].filter(c => c.classList.contains('reveal'));
      e.target.style.transitionDelay = `${Math.min(Math.max(siblings.indexOf(e.target), 0), 5) * 110}ms`;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .reveal-line').forEach(el => io.observe(el));

  // Zähler
  const fmt = n => n.toLocaleString('de-DE');
  const counter = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, start = performance.now(), dur = 2000;
      const step = t => {
        const p = Math.min((t - start) / dur, 1);
        el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 4))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      counter.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => counter.observe(el));

  // Formulare (Demo – ohne Backend)
  document.querySelectorAll('form.booking').forEach(form => {
    const msg = form.querySelector('.form-msg');
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach(f => {
        const bad = f.type === 'checkbox' ? !f.checked : !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        f.classList.toggle('invalid', bad);
        if (bad) valid = false;
      });
      if (!valid) {
        msg.className = 'form-msg err';
        msg.textContent = 'Bitte füllen Sie alle Pflichtfelder korrekt aus.';
        return;
      }
      msg.className = 'form-msg ok';
      msg.textContent = 'Vielen Dank! Wir melden uns innerhalb von 2 Stunden bei Ihnen.';
      form.reset();
    });
    form.addEventListener('input', e => e.target.classList.remove('invalid'));
  });
})();
