// Notebook — mark active nav link based on current URL
(function () {
  const links = document.querySelectorAll('[data-nav-link]');
  if (!links.length) return;
  const stripTrail = (p) => (p === '/' ? '/' : p.replace(/\/+$/, ''));
  const current = stripTrail(window.location.pathname.replace(/\/index\.html$/, '/'));
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    let path;
    try { path = new URL(href, window.location.origin).pathname; }
    catch (e) { return; }
    path = stripTrail(path);
    if (path === '/') return;
    if (current === path || current.startsWith(path + '/')) {
      link.classList.add('is-active');
    }
  });
})();

// Notebook — soft entrance + scroll reveals
(function () {
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  // Stagger reveals
  document.querySelectorAll('[data-reveal-stagger]').forEach((wrap) => {
    const items = Array.from(wrap.children);
    if (!items.length) return;
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: 'power2.out',
      stagger: 0.07,
      scrollTrigger: { trigger: wrap, start: 'top 88%' },
    });
  });

  // Single reveal
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.95,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // Hero entrance — only on home
  const heroTitle = document.querySelector('[data-hero-title]');
  if (heroTitle) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('[data-hero-eyebrow]', { opacity: 0, y: 14, duration: 0.6 })
      .from('[data-hero-title]', { opacity: 0, y: 22, duration: 0.9 }, '-=0.35')
      .from('[data-hero-sub]', { opacity: 0, y: 18, duration: 0.7 }, '-=0.55')
      .from('[data-hero-ctas] > *', { opacity: 0, y: 14, duration: 0.55, stagger: 0.08 }, '-=0.5')
      .from('[data-hero-portrait]', { opacity: 0, scale: 0.96, duration: 1.0 }, '-=0.95');
  }
})();
