document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const navLinks = mainNav ? Array.from(mainNav.querySelectorAll('a')) : [];

  function isOpen() {
    return mainNav && mainNav.classList.contains('open');
  }

  function setMenuOpen(open) {
    if (!menuToggle || !mainNav) return;
    const state = Boolean(open);
    menuToggle.setAttribute('aria-expanded', String(state));
    mainNav.classList.toggle('open', state);
  }

  // Alternar através do botão
  if (menuToggle) {
    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenuOpen(!isOpen());
    });
  }

  // Fechar menu ao clicar fora
  document.addEventListener('click', function (e) {
    if (!isOpen()) return;
    const target = e.target;
    if (menuToggle && (menuToggle === target || menuToggle.contains(target))) return;
    if (mainNav && (mainNav === target || mainNav.contains(target))) return;
    setMenuOpen(false);
  });

  // Fechar com a tecla Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) setMenuOpen(false);
  });

  // Rolagem suave para links internos e fechar o menu móvel após clique
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setMenuOpen(false);
        // Atualiza o hash da URL sem pular
        history.replaceState(null, '', href);
      }
    });
  });

  // Highlight active nav link based on scroll position
  const sections = navLinks
    .map((a) => (a.hash ? document.querySelector(a.hash) : null))
    .filter(Boolean);

  function throttle(fn, wait) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  // Atualiza o link ativo na navegação conforme a rolagem
  function updateActiveLink() {
    if (sections.length === 0) return;
    const threshold = window.innerHeight / 3;
    let current = sections[0];
    for (const s of sections) {
      const rect = s.getBoundingClientRect();
      if (rect.top <= threshold) current = s;
    }
    navLinks.forEach((link) => {
      if (!link.hash) return;
      link.classList.toggle('active', current && link.hash === `#${current.id}`);
    });
  }

  window.addEventListener('scroll', throttle(updateActiveLink, 150));
  window.addEventListener('resize', throttle(updateActiveLink, 250));
  // initial call
  updateActiveLink();

  // Garante que o menu seja fechado ao aumentar a largura da janela
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) setMenuOpen(false);
  });
});

/* Scroll reveal (IntersectionObserver) and simple parallax */
(function () {
  // Revela elementos com a classe .reveal
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && reveals.length) {
    const obs = new IntersectionObserver(
      function (entries) {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            const delay = el.dataset.delay;
            if (delay) el.style.transitionDelay = delay;
            el.classList.add('visible');
            // If you want one-time reveal, unobserve
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach((r) => obs.observe(r));
  } else {
    // Fallback: torna visível imediatamente
    reveals.forEach((r) => r.classList.add('visible'));
  }

  // Parallax simples para elementos com .parallax e data-speed (ex.: 0.2)
  const parallaxEls = Array.from(document.querySelectorAll('.parallax'));
  if (parallaxEls.length) {
    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY || window.pageYOffset;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 0.2;
        const offset = el.offsetTop;
        const y = (scrollY - offset) * speed;
        el.style.transform = `translate3d(0, ${y}px, 0)`;
      });
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // initial
    updateParallax();
  }
})();
