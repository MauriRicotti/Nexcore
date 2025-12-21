document.addEventListener('DOMContentLoaded', () => {
  // GSAP + ScrollTrigger: intro animations and scroll reveals
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);

    // prevent flash: set initial states via GSAP
    gsap.set([".site-header", ".hero-title .big", ".hero-sub", ".hero-ctas a", ".hero-right", ".hero-feats .feat"], { opacity: 0, y: 20 });

    const tl = gsap.timeline({ defaults: { duration: 0.8, ease: 'power3.out' } });
    tl.to('.site-header', { y: 0, opacity: 1, duration: 0.5 })
      .to('.hero-title .big', { opacity: 1, y: 0, stagger: 0.08 }, '-=0.3')
      .to('.hero-sub', { opacity: 1, y: 0 }, '-=0.55')
      .to('.hero-ctas a', { opacity: 1, y: 0, stagger: 0.12 }, '-=0.45')
      .to('.hero-feats .feat', { opacity: 1, y: 0, stagger: 0.12, duration: 0.6 }, '-=0.5')
      .to('.hero-right', { opacity: 1, y: 0, scale: 1 }, '-=0.7');

    // Scroll reveal for "nosotros"
    gsap.from('#nosotros .nosotros-left', {
      opacity: 0,
      y: 30,
      duration: 0.9,
      scrollTrigger: { trigger: '#nosotros', start: 'top 80%' }
    });
    gsap.from('#nosotros .nosotros-right .card', {
      opacity: 0,
      y: 30,
      duration: 0.9,
      stagger: 0.15,
      scrollTrigger: { trigger: '#nosotros', start: 'top 80%' }
    });
  }

  const up = document.querySelector('.floating-up');

  if (up) {
    // smooth scroll to top
    up.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // show/hide based on scroll using class for animated transitions
    const toggleUp = () => {
      if (window.scrollY > 220) {
        up.classList.add('is-visible');
      } else {
        up.classList.remove('is-visible');
      }
    };

    toggleUp();
    window.addEventListener('scroll', toggleUp);
  }

  // Set CSS --vh and --header-h variables to avoid mobile viewport 100vh issues
  const setViewportVars = () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    const header = document.querySelector('.site-header');
    const headerH = header ? header.getBoundingClientRect().height : 72;
    document.documentElement.style.setProperty('--header-h', `${headerH}px`);
  };
  setViewportVars();
  window.addEventListener('resize', setViewportVars);
  window.addEventListener('orientationchange', setViewportVars);

  // Smooth anchor link scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#' || href === '') return; // allow top anchors
      if (href && href.startsWith('#')) {
        // If the mobile menu panel is open, let the mobile-specific handler
        // manage closing and scrolling (it will perform scroll after close).
        const mobileMenuEl = document.getElementById('mobile-menu');
        if (mobileMenuEl && mobileMenuEl.classList.contains('is-open')) {
          return;
        }

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Mobile menu toggle and accessibility
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (navToggle && mobileMenu) {
    let backdropEl = null;
    let _savedScrollY = 0;

    const createBackdrop = () => {
      const b = document.createElement('div');
      b.className = 'mobile-backdrop';
      // insert BEFORE the mobile menu so the panel stays visually above the backdrop
      if (mobileMenu && mobileMenu.parentNode) mobileMenu.parentNode.insertBefore(b, mobileMenu);
      else document.body.appendChild(b);

      // set left to the panel width so it doesn't cover the panel
      const setLeft = () => {
        try {
          const w = mobileMenu.offsetWidth || mobileMenu.getBoundingClientRect().width;
          b.style.left = w + 'px';
        } catch (err) {
          b.style.left = '70vw';
        }
      };
      setLeft();

      // update on resize while open
      const onResize = () => { if (mobileMenu.classList.contains('is-open')) setLeft(); };
      window.addEventListener('resize', onResize);

      // trigger transition
      requestAnimationFrame(() => b.classList.add('is-open'));
      b.addEventListener('click', closeMenu);
      b._cleanup = () => { window.removeEventListener('resize', onResize); };
      return b;
    };

    const openMenu = () => {
      // prevent page from jumping by locking scroll while preserving position
      _savedScrollY = window.scrollY || window.pageYOffset;
      try {
        document.body.style.position = 'fixed';
        document.body.style.top = `-${_savedScrollY}px`;
        document.body.style.width = '100%';
      } catch (err) {
        // ignore
      }
      mobileMenu.classList.add('is-open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Cerrar menú');
      backdropEl = createBackdrop();
      // focus first link for accessibility without scrolling the document
      const firstLink = mobileMenu.querySelector('a');
      if (firstLink) {
        try { firstLink.focus({ preventScroll: true }); }
        catch (err) { firstLink.focus(); }
      }
    };

    const closeMenu = () => {
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menú');
      // restore scroll locking state and return to previous scroll position
      try {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      } catch (err) {
        // ignore
      }
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (backdropEl) {
        backdropEl.classList.remove('is-open');
        if (typeof backdropEl._cleanup === 'function') backdropEl._cleanup();
        // remove after transition
        setTimeout(() => {
          if (backdropEl && backdropEl.parentNode) backdropEl.parentNode.removeChild(backdropEl);
          backdropEl = null;
        }, 240);
      }
      // restore previous scroll position
      try { window.scrollTo(0, _savedScrollY); } catch (err) { /* ignore */ }
      try { navToggle.focus({ preventScroll: true }); } catch (err) { navToggle.focus(); }
    };

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeMenu(); else openMenu();
    });

    // Close when clicking a link inside the mobile menu
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        // If it's an internal anchor, prevent default, close menu and then
        // perform a smooth scroll after closing so document scrolling works
        // (we remove `overflow: hidden` when closing the menu).
        if (href && href.startsWith('#')) {
          e.preventDefault();
          closeMenu();
          const target = document.querySelector(href);
          if (target) {
            // small timeout to ensure body scroll is re-enabled
            setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 40);
          }
        } else {
          closeMenu();
        }
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });
  }

  // Small accessibility: whatsapp anchor opens in new tab (handled by anchor attributes)

  // Barra de progreso de scroll: actualiza el ancho según el porcentaje desplazado
  (function initScrollProgress(){
    const progressEl = document.getElementById('scroll-progress');
    if (!progressEl) return;

    let ticking = false;

    const update = () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressEl.style.width = Math.min(100, Math.max(0, pct)) + '%';
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    // Init and listeners
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { requestAnimationFrame(update); });
  })();
});