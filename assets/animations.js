const SCROLL_ANIMATION_TRIGGER_CLASSNAME = 'scroll-trigger';
const SCROLL_ANIMATION_OFFSCREEN_CLASSNAME = 'scroll-trigger--offscreen';
const SCROLL_ZOOM_IN_TRIGGER_CLASSNAME = 'animate--zoom-in';
const SCROLL_ANIMATION_CANCEL_CLASSNAME = 'scroll-trigger--cancel';

// Scroll in animation logic
function onIntersection(elements, observer) {
  elements.forEach((element, index) => {
    if (element.isIntersecting) {
      const elementTarget = element.target;
      if (elementTarget.classList.contains(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME)) {
        elementTarget.classList.remove(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
        if (elementTarget.hasAttribute('data-cascade'))
          elementTarget.setAttribute('style', `--animation-order: ${index};`);
      }
      observer.unobserve(elementTarget);
    } else {
      element.target.classList.add(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
      element.target.classList.remove(SCROLL_ANIMATION_CANCEL_CLASSNAME);
    }
  });
}

function initializeScrollAnimationTrigger(rootEl = document, isDesignModeEvent = false) {
  const animationTriggerElements = Array.from(rootEl.getElementsByClassName(SCROLL_ANIMATION_TRIGGER_CLASSNAME));
  if (animationTriggerElements.length === 0) return;

  if (isDesignModeEvent) {
    animationTriggerElements.forEach((element) => {
      element.classList.add('scroll-trigger--design-mode');
    });
    return;
  }

  const observer = new IntersectionObserver(onIntersection, {
    rootMargin: '0px 0px -50px 0px',
  });
  animationTriggerElements.forEach((element) => observer.observe(element));
}

// Zoom in animation logic
function initializeScrollZoomAnimationTrigger() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const animationTriggerElements = Array.from(document.getElementsByClassName(SCROLL_ZOOM_IN_TRIGGER_CLASSNAME));

  if (animationTriggerElements.length === 0) return;

  const scaleAmount = 0.2 / 100;

  animationTriggerElements.forEach((element) => {
    let elementIsVisible = false;
    const observer = new IntersectionObserver((elements) => {
      elements.forEach((entry) => {
        elementIsVisible = entry.isIntersecting;
      });
    });
    observer.observe(element);

    element.style.setProperty('--zoom-in-ratio', 1 + scaleAmount * percentageSeen(element));

    window.addEventListener(
      'scroll',
      throttle(() => {
        if (!elementIsVisible) return;

        element.style.setProperty('--zoom-in-ratio', 1 + scaleAmount * percentageSeen(element));
      }),
      { passive: true }
    );
  });
}

function percentageSeen(element) {
  const viewportHeight = window.innerHeight;
  const scrollY = window.scrollY;
  const elementPositionY = element.getBoundingClientRect().top + scrollY;
  const elementHeight = element.offsetHeight;

  if (elementPositionY > scrollY + viewportHeight) {
    // If we haven't reached the image yet
    return 0;
  } else if (elementPositionY + elementHeight < scrollY) {
    // If we've completely scrolled past the image
    return 100;
  }

  // When the image is in the viewport
  const distance = scrollY + viewportHeight - elementPositionY;
  let percentage = distance / ((viewportHeight + elementHeight) / 100);
  return Math.round(percentage);
}

window.addEventListener('DOMContentLoaded', () => {
  initializeScrollAnimationTrigger();
  initializeScrollZoomAnimationTrigger();
});

if (Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => initializeScrollAnimationTrigger(event.target, true));
  document.addEventListener('shopify:section:reorder', () => initializeScrollAnimationTrigger(document, true));
}

// Popup First Visit Functionality
function checkFirstVisit() {
  // Verifica se o popup está ativo nas configurações
  const popupEnabled = {{ settings.popup_enabled | default: 'false' }};
  
  if (!popupEnabled) return;

  // Verifica se o usuário já visitou o site
  const hasVisited = localStorage.getItem('hasVisited');
  const dontShowAgain = localStorage.getItem('dontShowAgain');
  
  // Se nunca visitou E não marcou "não mostrar novamente"
  if (!hasVisited && !dontShowAgain) {
    // Pega o delay das configurações
    const delay = {{ settings.popup_delay | default: 2 }} * 1000;
    
    setTimeout(() => {
      const popup = document.getElementById('first-visit-popup');
      if (popup) {
        popup.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Adiciona classe de animação baseada na configuração
        const animation = '{{ settings.popup_animation }}';
        const content = popup.querySelector('.popup-content');
        if (content) {
          content.classList.add(`popup-animation-${animation}`);
        }
      }
    }, delay);
  }
}

function closePopup() {
  const popup = document.getElementById('first-visit-popup');
  const dontShowCheckbox = document.getElementById('dont-show-again');
  
  if (popup) {
    popup.style.display = 'none';
    document.body.style.overflow = '';
    
    // Marca que já visitou
    localStorage.setItem('hasVisited', 'true');
    
    // Se marcou "não mostrar novamente", salva essa preferência
    if (dontShowCheckbox && dontShowCheckbox.checked) {
      localStorage.setItem('dontShowAgain', 'true');
    }
  }
}

function closePopupForever() {
  const popup = document.getElementById('first-visit-popup');
  
  if (popup) {
    popup.style.display = 'none';
    document.body.style.overflow = '';
    
    // Marca para nunca mais mostrar
    localStorage.setItem('hasVisited', 'true');
    localStorage.setItem('dontShowAgain', 'true');
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  const popup = document.getElementById('first-visit-popup');
  
  if (popup) {
    // Fechar clicando no overlay
    popup.addEventListener('click', function(e) {
      if (e.target.classList.contains('popup-overlay')) {
        closePopup();
      }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && popup.style.display === 'block') {
        closePopup();
      }
    });
  }
  
  // Inicializar
  checkFirstVisit();
});

// Função para resetar (testes)
function resetPopup() {
  localStorage.removeItem('hasVisited');
  localStorage.removeItem('dontShowAgain');
  console.log('Popup resetado - será mostrado na próxima visita');
}

// Expor funções globalmente para uso em buttons
window.closePopup = closePopup;
window.closePopupForever = closePopupForever;
window.resetPopup = resetPopup;