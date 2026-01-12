document.addEventListener('DOMContentLoaded', () => {
  // GSAP + ScrollTrigger: intro animations and scroll reveals
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);

    // prevent flash: set initial states via GSAP
    gsap.set([".site-header", ".hero-title .big", ".hero-sub", ".hero-ctas a", ".hero-feats .feat"], { opacity: 0, y: 20 });
    gsap.set(".hero-right", { opacity: 0, y: 30, scale: 0.85 });

    const tl = gsap.timeline({ defaults: { duration: 0.8, ease: 'power3.out' } });
    tl.to('.site-header', { y: 0, opacity: 1, duration: 0.5 })
      .to('.hero-right', { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'back.out(1.2)' }, 0.2)
      .to('.hero-title .big', { opacity: 1, y: 0, stagger: 0.08 }, '-=0.6')
      .to('.hero-sub', { opacity: 1, y: 0 }, '-=0.55')
      .to('.hero-ctas a', { opacity: 1, y: 0, stagger: 0.12 }, '-=0.45')
      .to('.hero-feats .feat', { opacity: 1, y: 0, stagger: 0.12, duration: 0.6 }, '-=0.5');

    // Scroll reveal for "nosotros"
    gsap.from('#nosotros .nosotros-left', {
      opacity: 0,
      y: 30,
      duration: 0.4,
      scrollTrigger: { trigger: '#nosotros', start: 'top 75%' }
    });
    gsap.from('#nosotros .nosotros-right .card', {
      opacity: 0,
      y: 30,
      duration: 0.4,
      stagger: 0.1,
      scrollTrigger: { trigger: '#nosotros', start: 'top 75%' }
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

  // Handle scroll indicator visibility
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    const toggleScrollIndicator = () => {
      if (window.scrollY > 200) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
      } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.pointerEvents = 'auto';
      }
    };
    
    scrollIndicator.style.transition = 'opacity 300ms ease';
    toggleScrollIndicator();
    window.addEventListener('scroll', toggleScrollIndicator);
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

  /* ========== Mobile Menu System ==========
  // COMENTADO PARA IMPLEMENTAR DESDE 0
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

      // Unlock scroll FIRST
      try {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
      } catch (err) {
        // ignore
      }

      // Then restore scroll position if needed
      if (shouldRestoreScroll) {
        try {
          window.scrollTo(0, this.savedScrollY);
        } catch (err) {
          // ignore
        }
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
        
        const target = document.querySelector(href);
        
        // Close menu and unlock scroll without restoring position
        this.isOpen = false;
        this.mobileMenu.classList.remove('is-open');
        this.mobileMenu.setAttribute('aria-hidden', 'true');
        this.navToggle.setAttribute('aria-expanded', 'false');

        // Unlock scroll immediately
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

        // Scroll to target immediately
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }

        // Focus toggle button
        try {
          this.navToggle.focus({ preventScroll: true });
        } catch (err) {
          this.navToggle.focus();
        }
      } else {
        // External link - just close the menu normally
        this.close();
      }
    }
  }
  */ // FIN DE COMENTARIO - MOBILE MENU SYSTEM

  // Initialize mobile menu - NEW IMPLEMENTATION
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileBackdrop = document.querySelector('.mobile-backdrop');
  
  if (navToggle && mobileMenu) {
    // Helper function to close menu
    const closeMenu = () => {
      mobileMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      if (mobileBackdrop) {
        mobileBackdrop.classList.remove('is-open');
      }
      document.body.style.overflow = '';
    };

    // Helper function to open menu
    const openMenu = () => {
      mobileMenu.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      if (mobileBackdrop) {
        mobileBackdrop.classList.add('is-open');
      }
      document.body.style.overflow = 'hidden';
    };

    // Toggle menu open/close
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileMenu.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Gesture support: swipe to open/close menu
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const SWIPE_THRESHOLD = 50; // Minimum distance for swipe (pixels)
    const ANGLE_THRESHOLD = 30; // Maximum angle from horizontal (degrees)

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const distance = Math.abs(deltaX);
      const verticalDistance = Math.abs(deltaY);
      
      // Check if swipe is primarily horizontal
      const angle = Math.atan2(verticalDistance, distance) * (180 / Math.PI);
      
      if (angle < ANGLE_THRESHOLD && distance > SWIPE_THRESHOLD) {
        const isMenuOpen = mobileMenu.classList.contains('is-open');
        
        // Swipe right (open menu) - from left edge
        if (deltaX > 0 && touchStartX < 50 && !isMenuOpen) {
          openMenu();
        }
        // Swipe left (close menu) - while menu is open
        else if (deltaX < 0 && isMenuOpen) {
          closeMenu();
        }
      }
    }, { passive: true });

    // Close menu when clicking a link
    mobileMenu.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        const href = link.getAttribute('href');
        closeMenu();
        
        // Scroll to target
        const target = document.querySelector(href);
        if (target) {
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }
      }
    });

    // Close menu when clicking backdrop
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
      });
    }

    // Close menu when clicking outside of it
    document.addEventListener('click', (e) => {
      const isMenuOpen = mobileMenu.classList.contains('is-open');
      const isClickInside = mobileMenu.contains(e.target) || navToggle.contains(e.target);
      
      if (isMenuOpen && !isClickInside) {
        closeMenu();
      }
    });

    // Close menu on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
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

  // Funcionalidad para el botón "Ver Más/Menos Proyectos"
  const toggleProjectsBtn = document.getElementById('toggle-projects-btn');
  if (toggleProjectsBtn) {
    let isExpanded = false;
    
    toggleProjectsBtn.addEventListener('click', () => {
      const hiddenProjects = document.querySelectorAll('.hidden-project');
      isExpanded = !isExpanded;
      
      if (isExpanded) {
        // Mostrar proyectos
        hiddenProjects.forEach(project => {
          project.classList.remove('hiding');
          project.classList.add('visible');
        });
      } else {
        // Ocultar proyectos con animación
        hiddenProjects.forEach(project => {
          project.classList.add('hiding');
          project.classList.remove('visible');
          
          // Esperar a que termine la animación antes de cambiar display
          project.addEventListener('animationend', () => {
            project.classList.remove('hiding');
          }, { once: true });
        });
      }
      
      // Cambiar texto del botón
      if (isExpanded) {
        toggleProjectsBtn.textContent = 'Ver Menos Proyectos';
        toggleProjectsBtn.removeAttribute('data-i18n');
      } else {
        toggleProjectsBtn.setAttribute('data-i18n', 'proyectos.verMasBtn');
        // Retranslate if i18next is available
        if (window.i18next && window.i18next.changeLanguage) {
          const currentLang = window.i18next.language || 'es';
          const translation = window.i18next.t('proyectos.verMasBtn');
          toggleProjectsBtn.textContent = translation;
        } else {
          toggleProjectsBtn.textContent = 'Ver Más Proyectos';
        }
        
        // Scroll a la sección de proyectos cuando se colapsan
        const proyectosSection = document.getElementById('proyectos');
        if (proyectosSection) {
          setTimeout(() => {
            proyectosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 200);
        }
      }
    });
  }

  // Animación de títulos y subtítulos en múltiples secciones
  if (window.gsap) {
    // Configuración de secciones con sus selectores específicos
    const animatedSections = [
      { id: '#servicios', titleClass: '.servicios-title', subtitleClass: '.servicios-sub' },
      { id: '#testimonios', titleClass: '.testimonios-title', subtitleClass: '.testimonios-sub' },
      { id: '#faq', titleClass: '.faq-title', subtitleClass: '.faq-sub' },
      { id: '#pagos', titleClass: '.section-title', subtitleClass: '.section-subtitle' },
      { id: '#contact', titleClass: '.section-title', subtitleClass: '.section-subtitle' }
    ];
    
    animatedSections.forEach(section => {
      const titleEl = document.querySelector(`${section.id} ${section.titleClass}`);
      const subtitleEl = document.querySelector(`${section.id} ${section.subtitleClass}`);
      
      if (titleEl) {
        gsap.from(titleEl, {
          opacity: 0,
          y: 40,
          duration: 0.5,
          scrollTrigger: {
            trigger: section.id,
            start: 'top 65%'
          }
        });
      }
      
      if (subtitleEl) {
        gsap.from(subtitleEl, {
          opacity: 0,
          y: 30,
          duration: 0.5,
          delay: 0.1,
          scrollTrigger: {
            trigger: section.id,
            start: 'top 65%'
          }
        });
      }
    });

    // Animación de cards en múltiples secciones
    const cardAnimations = [
      { selector: '.card:not(.card-1):not(.card-2):not(.card-3):not(.card-4)', section: '#nosotros' },
      { selector: '.proceso-card', section: '#proceso' },
      { selector: '.servicio-card', section: '#servicios' },
      { selector: '.comparativa-card', section: '#por-que-nosotros' },
      { selector: '.testimonial-card', section: '#testimonios' },
      { selector: '.proyectos-inner', section: '#proyectos' },
      { selector: '.accordion-item', section: '#faq' },
      { selector: '.info-card', section: '#contact' },
      { selector: '.payment-card', section: '#pagos' }
    ];

    cardAnimations.forEach(animation => {
      gsap.utils.toArray(animation.selector).forEach((card, index) => {
        gsap.from(card, {
          opacity: 0,
          y: 30,
          duration: 0.4,
          delay: index * 0.08,
          scrollTrigger: {
            trigger: card,
            start: 'top 75%'
          }
        });
      });
    });
  }

  // Validación y manejo del formulario de contacto
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const formData = new FormData(this);
      const nombre = (formData.get('nombre') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const telefono = (formData.get('telefono') || '').toString().trim();
      const asunto = (formData.get('asunto') || '').toString().trim();
      let servicio = (formData.get('servicio') || '').toString().trim();
      const servicioEl = document.getElementById('servicio');
      if (servicioEl && servicioEl.options && servicioEl.selectedIndex >= 0) {
        const selectedText = (servicioEl.options[servicioEl.selectedIndex].text || '').toString().trim();
        if (selectedText && selectedText.toLowerCase() !== 'selecciona un servicio') {
          servicio = selectedText;
        }
      }
      const mensaje = (formData.get('mensaje') || '').toString().trim();

      // Número destino (sin signos ni espacios): +54 11 4194 8773 -> 541141948773
      const whatsappNumber = '541141948773';

      // Construir texto en español, con salto de línea URL-encoded
      let text = '';
      if (nombre) text += `Hola, soy ${nombre}.`;
      if (asunto) text += `\nAsunto: ${asunto}`;
      if (servicio) text += `\nServicio: ${servicio}`;
      if (telefono) text += `\nTeléfono: ${telefono}`;
      if (email) text += `\nEmail: ${email}`;
      if (mensaje) text += `\n\nMensaje:\n${mensaje}`;
      if (!text) text = 'Hola, quiero consultar sobre un proyecto.';

      const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

      // Abrir WhatsApp en nueva pestaña/ventana (en móvil el usuario será redirigido a la app)
      try {
        window.open(waUrl, '_blank');
      } catch (err) {
        window.location.href = waUrl;
      }

      // Feedback rápido al usuario
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.textContent = 'Abriendo WhatsApp...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
        this.reset();
      }, 1400);
    });
  }

  // Inicializar mapa de Leaflet
  const initMap = () => {
    const mapElement = document.getElementById('map');
    if (mapElement && window.L) {
      // Coordenadas de Florencio Varela, Buenos Aires, Argentina
      const florencioVarela = [-34.7633, -58.2923];
      
      // Crear mapa
      const map = L.map('map', {
        zoomControl: true,
        dragging: true,
        scrollWheelZoom: true
      }).setView(florencioVarela, 14);
      
      // Agregar capa de tiles mejorada (Stamen Terrain o OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);
      
      // Crear icono personalizado para Nexcore
      const nexcoreIcon = L.divIcon({
        className: 'nexcore-marker',
        html: `
          <div class="marker-icon" style="background: linear-gradient(135deg, #006341, #17b169); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 4px 12px rgba(0, 99, 65, 0.4); border: 3px solid white;">
            <i class="bi bi-building" style="font-size: 24px;"></i>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48]
      });
      
      // Agregar marcador en Florencio Varela
      const marker = L.marker(florencioVarela, {
        title: 'Nexcore - Florencio Varela',
        icon: nexcoreIcon
      }).addTo(map);
      
      // Popup del marcador mejorado
      marker.bindPopup(`
        <div style="text-align: center;">
          <strong style="font-size: 16px; color: white;">NEXCORE</strong>
          <br>
          <span style="font-size: 14px; color: #bdbdbd;">Florencio Varela</span>
          <br>
          <span style="font-size: 12px; color: #17b169;">Buenos Aires, Argentina</span>
          <br>
          <a href="https://wa.me/541141948773" target="_blank" rel="noopener noreferrer" style="color: #17b169; text-decoration: none; font-weight: 600; font-size: 12px; margin-top: 8px; display: inline-block;">Contactar</a>
        </div>
      `, {
        className: 'custom-popup',
        maxWidth: 280
      }).openPopup();
      
      // Estilo personalizado para Leaflet mejorado
      const style = document.createElement('style');
      style.textContent = `
        .leaflet-container {
          background-color: #0f0f0f !important;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 99, 65, 0.1);
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          background: linear-gradient(135deg, rgba(15, 15, 15, 0.98), rgba(7, 8, 12, 0.98)) !important;
          border-radius: 12px;
          border: 1px solid rgba(0, 99, 65, 0.5) !important;
          box-shadow: 0 8px 32px rgba(0, 99, 65, 0.2) !important;
          padding: 0 !important;
        }
        
        .custom-popup .leaflet-popup-content {
          color: white;
          font-size: 0.85rem;
          font-family: Montserrat, sans-serif;
          margin: 12px !important;
          padding: 0 !important;
        }
        
        .custom-popup .leaflet-popup-tip {
          background: rgba(15, 15, 15, 0.98) !important;
          border: 1px solid rgba(0, 99, 65, 0.5) !important;
        }
        
        .leaflet-marker-icon {
          filter: drop-shadow(0 4px 8px rgba(0, 99, 65, 0.3));
        }
        
        .leaflet-zoom-control {
          border: 1px solid var(--color-primario) !important;
          background: rgba(15, 15, 15, 0.9) !important;
          border-radius: 6px !important;
        }
        
        .leaflet-control-zoom-in, .leaflet-control-zoom-out {
          color: var(--color-primario) !important;
          background: transparent !important;
          border: none !important;
          font-weight: bold !important;
          font-size: 18px !important;
          transition: all 300ms ease !important;
        }
        
        .leaflet-control-zoom-in:hover, .leaflet-control-zoom-out:hover {
          background: var(--color-primario) !important;
          color: white !important;
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

  // ========== CURSOR PERSONALIZADO CON ESTELA ==========
  // Detectar si el dispositivo es táctil/móvil
  const isTouchDevice = () => {
    return (
      (typeof window !== 'undefined' &&
        ('ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          navigator.msMaxTouchPoints > 0)) ||
      window.matchMedia('(hover: none) and (pointer: coarse)').matches
    );
  };
  
  // Solo activar cursor personalizado si no es un dispositivo táctil
  // DESHABILITADO: No activar cursor personalizado (usar cursor normal)
  if (!isTouchDevice() && false) {
    // Obtener o crear elemento custom cursor
    let customCursor = document.getElementById('custom-cursor');
    if (!customCursor) {
      customCursor = document.createElement('div');
      customCursor.id = 'custom-cursor';
      customCursor.className = 'custom-cursor';
      document.body.appendChild(customCursor);
    }
    
    // Crear canvas para la estela
    const canvas = document.createElement('canvas');
    canvas.id = 'cursor-trail-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9998';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Variables para la estela
    const trails = [];
    let mouseX = 0;
    let mouseY = 0;
    const MAX_TRAILS = 30; // Reducido de 50 para mejor rendimiento
    const TRAIL_DISTANCE = 8; // Aumentado de 5 para menos puntos

    // Ocultar cursor por defecto
    document.body.style.cursor = 'none';

    // Redimensionar canvas al cambiar ventana
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    // Seguimiento del cursor y creación de estela
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Actualizar posición del cursor personalizado
      customCursor.style.left = mouseX + 'px';
      customCursor.style.top = mouseY + 'px';

      // Agregar puntos a la estela cada ciertos píxeles
      const lastTrail = trails[trails.length - 1];
      if (!lastTrail || Math.hypot(mouseX - lastTrail.x, mouseY - lastTrail.y) > TRAIL_DISTANCE) {
        trails.push({
          x: mouseX,
          y: mouseY,
          life: 1.0
        });

        // Limitar cantidad de puntos
        if (trails.length > MAX_TRAILS) {
          trails.shift();
        }
      }
    });

    // Animar la estela - optimizado
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Actualizar y dibujar trails
      for (let i = 0; i < trails.length; i++) {
        const trail = trails[i];
        trail.life -= 0.03;

        if (trail.life <= 0) {
          trails.splice(i, 1);
          i--;
          continue;
        }

        // Usar fillStyle simple en lugar de gradiente para mejor rendimiento
        const alpha = trail.life * 0.6;
        ctx.fillStyle = `rgba(40, 89, 172, ${alpha})`;
        ctx.beginPath();
        const size = 6 * trail.life;
        ctx.arc(trail.x, trail.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    animate();

    // Hacer el cursor más grande al pasar sobre elementos interactivos
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .btn');

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        customCursor.classList.add('active');
        el.style.cursor = 'none';
      });

      el.addEventListener('mouseleave', () => {
        customCursor.classList.remove('active');
        el.style.cursor = 'none';
      });
    });

    // Efecto de click en el cursor
    document.addEventListener('mousedown', () => {
      customCursor.classList.add('click');
      
      // Remover la clase después de la animación
      setTimeout(() => {
        customCursor.classList.remove('click');
      }, 600);
    });

    // Restaurar cursor normal al salir de la ventana
    document.addEventListener('mouseleave', () => {
      document.body.style.cursor = 'auto';
    });

    document.addEventListener('mouseenter', () => {
      document.body.style.cursor = 'none';
    });
  }

});

// ========== i18next MULTI-IDIOMA ==========
Promise.all([
  fetch('locales/es.json').then(res => res.json()),
  fetch('locales/en.json').then(res => res.json())
]).then(([esData, enData]) => {
  i18next.use(i18nextBrowserLanguageDetector).init({
    fallbackLng: 'es',
    debug: false,
    resources: {
      es: { translation: esData },
      en: { translation: enData }
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  }, function(err, t) {
    if (err) return console.log('i18next error:', err);
    
    // Actualizar UI con idioma inicial
    updateLanguageUI();
    translatePage();
  });

  // Event listeners para botones de idioma - dentro del Promise
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      const currentLang = i18next.language.split('-')[0];
      
      // Evitar cambio si ya estamos en ese idioma
      if (currentLang === lang) return;
      
      // Iniciar animación de blur
      document.body.classList.add('language-switching');
      
      // Cambiar idioma a mitad de la animación (300ms)
      setTimeout(() => {
        i18next.changeLanguage(lang, (err, t) => {
          if (err) return console.log('Error changing language:', err);
          updateLanguageUI();
          translatePage();
          
          // Limpiar clase después de la animación completa (300ms más)
          setTimeout(() => {
            document.body.classList.remove('language-switching');
          }, 300);
        });
      }, 300);
    });
  });
}).catch(err => console.log('Error loading translations:', err));

// Función para cambiar el mockup según el idioma
function updateMockupImage() {
  const mockupImg = document.getElementById('hero-mockup-img');
  if (!mockupImg) return;
  
  const currentLang = i18next.language.split('-')[0];
  
  if (currentLang === 'en') {
    mockupImg.src = 'assets/Mockup laptop ingles verde.webp';
  } else {
    mockupImg.src = 'assets/Mockup laptop español verde.webp';
  }
}

// Función para traducir la página
function translatePage() {
  const t = i18next.t;
  
  // Cambiar mockup según idioma
  updateMockupImage();
  
  // Navbar
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const text = t(key);
      // Usar innerHTML para títulos que contienen HTML con color
      if (key === 'servicios.title' || key === 'proceso.title' || key === 'nosotros.title' || key === 'por-que-nosotros.title') {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    }
  });
  
  // Traducir placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      el.placeholder = t(key);
    }
  });
  
  // Actualizar aria-labels y otros atributos
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const attr = el.getAttribute('data-i18n-attr');
    const key = el.getAttribute('data-i18n-key');
    if (attr && key) {
      el.setAttribute(attr, t(key));
    }
  });
}

// Actualizar estado visual de los botones de idioma
function updateLanguageUI() {
  const currentLang = i18next.language.split('-')[0];
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === currentLang) {
      btn.classList.add('active');
    }
  });
}

// ========== COOKIE CONSENT MANAGEMENT ==========
class CookieConsent {
  constructor() {
    this.banner = document.getElementById('cookie-banner');
    this.acceptAllBtn = document.getElementById('cookie-accept-all');
    this.rejectBtn = document.getElementById('cookie-reject');
    this.storageKey = 'nexcore-cookies-consent';
    
    if (this.banner) {
      this.init();
    }
  }

  init() {
    // Check if user has already made a choice
    if (!this.hasConsent()) {
      // Show banner after a short delay
      setTimeout(() => this.show(), 1000);
    }

    // Event listeners
    this.acceptAllBtn?.addEventListener('click', () => this.acceptAll());
    this.rejectBtn?.addEventListener('click', () => this.reject());
  }

  hasConsent() {
    return localStorage.getItem(this.storageKey);
  }

  show() {
    this.banner.classList.add('show');
  }

  hide() {
    this.banner.classList.remove('show');
  }

  acceptAll() {
    const consent = {
      accepted: true,
      timestamp: new Date().toISOString(),
      categories: {
        necessary: true,
        analytics: true,
        marketing: true
      }
    };
    localStorage.setItem(this.storageKey, JSON.stringify(consent));
    this.hide();
    this.loadAnalytics();
  }

  reject() {
    const consent = {
      accepted: false,
      timestamp: new Date().toISOString(),
      categories: {
        necessary: true,
        analytics: false,
        marketing: false
      }
    };
    localStorage.setItem(this.storageKey, JSON.stringify(consent));
    this.hide();
  }

  loadAnalytics() {
    // Load Google Analytics or other tracking scripts here
    // Example: loadGoogleAnalytics();
  }
}

// Initialize Cookie Consent on page load
document.addEventListener('DOMContentLoaded', () => {
  new CookieConsent();
});
// ========== DONATION MODAL MANAGEMENT ==========
class DonationModal {
  constructor() {
    this.modal = document.getElementById('donation-modal');
    this.openBtns = document.querySelectorAll('[id^="btn-donate"]');
    this.closeBtn = document.querySelector('.donation-modal-close');
    
    if (this.modal && this.openBtns.length > 0) {
      this.init();
    }
  }

  init() {
    this.openBtns.forEach(btn => {
      btn.addEventListener('click', () => this.open());
    });
    
    this.closeBtn?.addEventListener('click', () => this.close());
    
    // Close modal when clicking outside
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  open() {
    this.modal.classList.add('show');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.remove('show');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Mouse tracking glow effect for service cards, testimonial cards, payment cards and project cards
const initCardMouseTracking = () => {
  const cards = document.querySelectorAll('.servicio-card, .comparativa-card, .testimonial-card, .payment-card, .proyectos-inner');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update the ::after pseudo-element position
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
    
    card.addEventListener('mouseleave', () => {
      // Reset position when mouse leaves
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    });
  });
};

// Make project cards clickable
const initProjectCardClickHandler = () => {
  const projectCards = document.querySelectorAll('.proyectos-inner[data-href]');
  
  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Prevent default if clicking on a link
      if (e.target.tagName === 'A') return;
      
      const href = card.getAttribute('data-href');
      const target = card.getAttribute('data-target') || '_self';
      
      if (href && href !== '#') {
        window.open(href, target);
      }
    });
    
    // Improve keyboard accessibility
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const href = card.getAttribute('data-href');
        const target = card.getAttribute('data-target') || '_self';
        
        if (href && href !== '#') {
          window.open(href, target);
        }
      }
    });
  });
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initCardMouseTracking();
  initProjectCardClickHandler();
});

// Reinitialize when new content is loaded (if applicable)
window.addEventListener('load', () => {
  initCardMouseTracking();
  initProjectCardClickHandler();
});

// Initialize Donation Modal on page load
document.addEventListener('DOMContentLoaded', () => {
  new DonationModal();
});

// ========== TESTIMONIOS SLIDER ==========
class TestimoniosSlider {
  constructor() {
    this.slider = document.querySelector('.testimonios-slider');
    this.cards = document.querySelectorAll('.testimonios-slider .testimonial-card');
    this.prevBtn = document.getElementById('testimonios-prev');
    this.nextBtn = document.getElementById('testimonios-next');
    this.dotsContainer = document.getElementById('testimonios-dots');
    
    if (!this.slider || !this.cards.length) {
      console.warn('Slider elements not found');
      return;
    }
    
    this.currentIndex = 0;
    this.cardsPerView = this.getCardsPerView();
    this.totalSlides = Math.ceil(this.cards.length / this.cardsPerView);
    this.dots = [];
    
    this.init();
  }
  
  getCardsPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }
  
  init() {
    this.createDots();
    this.attachEventListeners();
    this.updateView();
    
    // Actualizar en resize
    window.addEventListener('resize', () => {
      const newCardsPerView = this.getCardsPerView();
      if (newCardsPerView !== this.cardsPerView) {
        this.cardsPerView = newCardsPerView;
        this.totalSlides = Math.ceil(this.cards.length / this.cardsPerView);
        this.currentIndex = Math.min(this.currentIndex, this.totalSlides - 1);
        this.createDots();
        this.updateView();
      }
    });
  }
  
  createDots() {
    this.dotsContainer.innerHTML = '';
    this.dots = [];
    
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Ir a slide ${i + 1}`);
      dot.type = 'button';
      dot.addEventListener('click', () => this.goToSlide(i));
      this.dotsContainer.appendChild(dot);
      this.dots.push(dot);
    }
  }
  
  attachEventListeners() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }
  }
  
  updateView() {
    // Calcular el desplazamiento considerando el ancho de la tarjeta + gap
    const wrapperWidth = this.slider.parentElement.offsetWidth;
    const cardWidth = this.cards[0].offsetWidth;
    const gap = 24; // px, el mismo del CSS
    const offset = -this.currentIndex * (cardWidth + gap);
    
    this.slider.style.transform = `translateX(${offset}px)`;
    
    // Actualizar dots
    this.dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentIndex);
    });
    
    // Actualizar estado de botones
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0;
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentIndex === this.totalSlides - 1;
    }
  }
  
  next() {
    if (this.currentIndex < this.totalSlides - 1) {
      this.currentIndex++;
      this.updateView();
    }
  }
  
  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateView();
    }
  }
  
  goToSlide(index) {
    this.currentIndex = Math.max(0, Math.min(index, this.totalSlides - 1));
    this.updateView();
  }
}

// Inicializar slider de testimonios cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new TestimoniosSlider();
});