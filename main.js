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
    mockupImg.src = 'assets/Mockup laptop ingles.webp';
  } else {
    mockupImg.src = 'assets/Mockup laptop hero2.webp';
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
      el.textContent = t(key);
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