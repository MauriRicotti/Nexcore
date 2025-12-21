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

  // Funcionalidad para el botón "Ver Más Proyectos"
  const verMasBtn = document.getElementById('ver-mas-btn');
  if (verMasBtn) {
    verMasBtn.addEventListener('click', () => {
      const hiddenProjects = document.querySelectorAll('.hidden-project');
      hiddenProjects.forEach(project => {
        project.classList.add('visible');
      });
      // Opcional: ocultar el botón después de hacer clic
      verMasBtn.style.display = 'none';
    });
  }

  // Animación de la sección de contacto
  if (window.gsap) {
    // Animar título y subtitle
    gsap.from('.contact-section .section-title', {
      opacity: 0,
      y: 40,
      duration: 0.8,
      scrollTrigger: {
        trigger: '#contact',
        start: 'top 70%'
      }
    });

    gsap.from('.contact-section .section-subtitle', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: 0.2,
      scrollTrigger: {
        trigger: '#contact',
        start: 'top 70%'
      }
    });
  }

  // Validación y manejo del formulario de contacto
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Obtener datos del formulario
      const formData = new FormData(this);
      
      // Cambiar texto del botón
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '✓ Mensaje Enviado';
      submitBtn.disabled = true;
      
      // Aquí iría la lógica para enviar el formulario
      // Por ahora, solo resetear después de 2 segundos
      setTimeout(() => {
        this.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 2000);
    });
  }

  // Inicializar mapa de Leaflet
  const initMap = () => {
    const mapElement = document.getElementById('map');
    if (mapElement && window.L) {
      // Coordenadas de Buenos Aires, Argentina
      const buenosAires = [-34.6037, -58.3816];
      
      // Crear mapa
      const map = L.map('map', {
        zoomControl: true,
        dragging: true,
        scrollWheelZoom: true
      }).setView(buenosAires, 13);
      
      // Agregar capa de tiles (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);
      
      // Agregar marcador en Buenos Aires
      const marker = L.marker(buenosAires, {
        title: 'Buenos Aires, Argentina'
      }).addTo(map);
      
      // Popup del marcador
      marker.bindPopup('<strong>Buenos Aires</strong><br>Argentina', {
        className: 'custom-popup'
      }).openPopup();
      
      // Estilo personalizado para Leaflet
      const style = document.createElement('style');
      style.textContent = `
        .leaflet-container {
          background-color: #0f0f0f !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background-color: rgba(40, 88, 172, 0.95) !important;
          border-radius: 8px;
          border: 1px solid var(--color-primario) !important;
        }
        .custom-popup .leaflet-popup-content {
          color: white;
          font-size: 0.85rem;
          font-family: Montserrat, sans-serif;
          margin: 6px;
        }
        .custom-popup .leaflet-popup-tip {
          background-color: rgba(40, 88, 172, 0.95) !important;
        }
        .leaflet-marker-icon {
          filter: hue-rotate(200deg) brightness(1.1);
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Iniciar mapa cuando el documento esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }


});