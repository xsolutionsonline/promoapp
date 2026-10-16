// Función para manejar el menú móvil
function handleMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const overlay = document.getElementById('overlay');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
  
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
  
  if (overlay) {
    overlay.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
  
  // Cerrar menú al hacer clic en enlaces de navegación móvil
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// Función para el desplazamiento suave al hacer clic en enlaces de anclaje
function handleSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // 80px de offset para el header
          behavior: 'smooth'
        });
      }
    });
  });
}

// Función para revelar elementos cuando se scrollea
function handleScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-slide-up, .reveal-slide-left, .reveal-slide-right');
  
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const revealPoint = 150; // px desde el borde inferior de la ventana
    
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      
      if (elementTop < windowHeight - revealPoint) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    });
  };
  
  window.addEventListener('scroll', revealOnScroll);
  
  // Ejecutar una vez al cargar la página
  revealOnScroll();
}

// Normaliza un teléfono argentino al formato +549 + 10 dígitos (código de área + número).
// Si el usuario no puso código de país, se lo agrega (+54 9). Si ya lo puso, no lo duplica.
// Si la cantidad de dígitos no coincide con el formato esperado, no se puede normalizar.
function normalizeArgentinePhone(rawValue) {
  const digits = (rawValue || '').replace(/\D/g, '');
  let local = digits;

  if (local.startsWith('54')) {
    local = local.slice(2);
    if (local.startsWith('9')) {
      local = local.slice(1);
    }
  } else if (local.length === 11 && local.startsWith('9')) {
    local = local.slice(1);
  }

  const isValid = local.length === 10;

  return {
    value: isValid ? ('+549' + local) : rawValue,
    isValid: isValid
  };
}

// Valida y normaliza el teléfono de un formulario de pedido (principal o popup)
function wirePhoneValidation(phoneInput, errorEl) {
  if (!phoneInput) return () => true;

  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'form-error';
    phoneInput.insertAdjacentElement('afterend', errorEl);
  }

  return () => {
    if (!phoneInput.value.trim()) return true;

    const result = normalizeArgentinePhone(phoneInput.value);

    if (result.isValid) {
      phoneInput.value = result.value;
      errorEl.textContent = '';
      phoneInput.classList.remove('form-control-invalid');
      return true;
    }

    errorEl.textContent = 'Verifica tu número: deben ser 10 dígitos después del +54 9 (código de área + número). Ej: 11 1234-1234.';
    phoneInput.classList.add('form-control-invalid');
    return false;
  };
}

// Función para validar/normalizar un formulario de pedido antes de enviarlo (principal y popup)
function handleOrderForm(formId) {
  const form = document.getElementById(formId);

  if (!form) return;

  const phoneInput = form.querySelector('[name="phone"]');
  const phoneError = form.querySelector('#phone-error, [data-field="phone"]');
  const validatePhone = wirePhoneValidation(phoneInput, phoneError);

  if (phoneInput) {
    phoneInput.addEventListener('blur', validatePhone);
  }

  form.addEventListener('submit', (e) => {
    if (!validatePhone()) {
      e.preventDefault();
    }
  });
}

// Función para el popup de intento de salida (exit intent)
function handleExitIntent() {
  const popup = document.getElementById('exit-popup');

  if (!popup) return;

  const closeBtn = document.getElementById('exit-popup-close');
  const STORAGE_KEY = 'megasteel_exit_popup_shown';

  let shown = false;

  try {
    shown = sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch (e) {}

  const showPopup = () => {
    if (shown) return;

    shown = true;
    popup.classList.add('show');

    if (typeof updateTrafficReferrerFields === 'function') {
      updateTrafficReferrerFields();
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {}
  };

  const hidePopup = () => {
    popup.classList.remove('show');
  };

  if (closeBtn) closeBtn.addEventListener('click', hidePopup);

  popup.addEventListener('click', (e) => {
    if (e.target === popup) hidePopup();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('show')) hidePopup();
  });

  if (shown) return;

  // Desktop: el mouse sale por la parte superior de la ventana (hacia la barra de pestañas/URL)
  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget && e.clientY <= 0) {
      showPopup();
    }
  });

  // Mobile: intercepta el botón "atrás" una vez para mostrar el popup en su lugar
  history.pushState({ exitPopup: true }, '');

  window.addEventListener('popstate', () => {
    if (!shown) {
      showPopup();
      history.pushState({ exitPopup: true }, '');
    }
  });
}

// Inicializar todas las funciones cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  handleMobileMenu();
  handleSmoothScroll();
  handleScrollReveal();
  handleOrderForm('contact-form');
  handleOrderForm('exit-popup-form');
  handleExitIntent();
});