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

  // ========== Mobile Menu System ==========
  class MobileMenuController {
    constructor() {
      this.navToggle = document.querySelector('.nav-toggle');
      this.mobileMenu = document.getElementById('mobile-menu');
      this.backdrop = null;
      this.savedScrollY = 0;
      this.isOpen = false;
      this.resizeHandler = null;

      if (this.navToggle && this.mobileMenu) {
        this.init();
      }
    }

    init() {
      // Toggle button click
      this.navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      // Links inside menu - use event delegation
      this.mobileMenu.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (link) {
          this.handleLinkClick(e, link);
        }
      });

      // ESC key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Prevent menu interactions from closing on internal clicks
      this.mobileMenu.addEventListener('click', (e) => e.stopPropagation());

      // Close when clicking backdrop
      document.addEventListener('click', () => {
        if (this.isOpen && this.backdrop) {
          this.close();
        }
      });
    }

    createBackdrop() {
      const backdrop = document.createElement('div');
      backdrop.className = 'mobile-backdrop';
      
      // Insert before mobile menu in DOM
      if (this.mobileMenu.parentNode) {
        this.mobileMenu.parentNode.insertBefore(backdrop, this.mobileMenu);
      } else {
        document.body.appendChild(backdrop);
      }

      // Position backdrop left edge at panel width
      const updateBackdropPosition = () => {
        try {
          const panelWidth = this.mobileMenu.offsetWidth || 
                           this.mobileMenu.getBoundingClientRect().width;
          backdrop.style.left = panelWidth + 'px';
        } catch (err) {
          backdrop.style.left = '70vw';
        }
      };

      updateBackdropPosition();

      // Handle resize events
      this.resizeHandler = () => updateBackdropPosition();
      window.addEventListener('resize', this.resizeHandler);

      // Trigger animation
      requestAnimationFrame(() => backdrop.classList.add('is-open'));

      return backdrop;
    }

    removeBackdrop() {
      if (!this.backdrop) return;

      this.backdrop.classList.remove('is-open');
      
      // Cleanup resize listener
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
        this.resizeHandler = null;
      }

      // Remove after transition
      setTimeout(() => {
        if (this.backdrop && this.backdrop.parentNode) {
          this.backdrop.parentNode.removeChild(this.backdrop);
        }
        this.backdrop = null;
      }, 120);
    }

    open() {
      if (this.isOpen) return;

      // Save scroll position
      this.savedScrollY = window.scrollY || window.pageYOffset;

      // Lock scroll
      try {
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.savedScrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
      } catch (err) {
        // ignore
      }

      // Update states
      this.isOpen = true;
      this.mobileMenu.classList.add('is-open');
      this.mobileMenu.setAttribute('aria-hidden', 'false');
      this.navToggle.setAttribute('aria-expanded', 'true');

      // Create backdrop
      this.backdrop = this.createBackdrop();
    }

    close(shouldRestoreScroll = true) {
      if (!this.isOpen) return;

      // Update states
      this.isOpen = false;
      this.mobileMenu.classList.remove('is-open');
      this.mobileMenu.setAttribute('aria-hidden', 'true');
      this.navToggle.setAttribute('aria-expanded', 'false');

      // Restore scroll position BEFORE unlocking (important!)
      try {
        window.scrollTo(0, this.savedScrollY);
      } catch (err) {
        // ignore
      }

      // Unlock scroll
      try {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
      } catch (err) {
        // ignore
      }

      // Remove backdrop
      this.removeBackdrop();

      // Focus toggle button
      try {
        this.navToggle.focus({ preventScroll: true });
      } catch (err) {
        this.navToggle.focus();
      }
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    handleLinkClick(e, link) {
      const href = link.getAttribute('href');
      
      if (href && href.startsWith('#')) {
        e.preventDefault();
        this.close();

        // Scroll to target after menu closes
        const target = document.querySelector(href);
        if (target) {
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth' });
          }, 120);
        }
      } else {
        // External link - just close the menu
        this.close();
      }
    }
  }

  // Initialize mobile menu
  new MobileMenuController();

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