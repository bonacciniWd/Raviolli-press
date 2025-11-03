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

// First Visit Popup Functionality
class FirstVisitPopup {
  constructor() {
    this.storageKey = 'first_visit_ack_v1';
    this.currentStep = 1;
    this.totalSteps = 3;
    this.init();
  }

  init() {
    this.checkFirstVisit();
    this.bindEvents();
  }

  checkFirstVisit() {
    try {
      const seen = localStorage.getItem(this.storageKey);
      if (!seen) {
        // Pequeno delay para carregamento da página
        setTimeout(() => this.showPopup(), 1000);
      }
    } catch (error) {
      console.log('Error checking first visit:', error);
    }
  }

  showPopup() {
    const popup = document.getElementById('first-visit-popup');
    if (popup) {
      popup.style.display = 'block';
      document.body.style.overflow = 'hidden';
      this.showStep(1);
    }
  }

  showStep(stepNumber) {
    // Esconde todos os steps
    document.querySelectorAll('.popup-step').forEach(step => {
      step.style.display = 'none';
    });

    // Mostra o step atual
    const currentStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (currentStep) {
      currentStep.style.display = 'block';
    }

    // Atualiza indicadores de progresso
    this.updateProgressDots(stepNumber);

    // Atualiza botões de navegação
    this.updateNavigationButtons(stepNumber);

    this.currentStep = stepNumber;
  }

  updateProgressDots(stepNumber) {
    document.querySelectorAll('.progress-dot').forEach(dot => {
      const dotStep = parseInt(dot.getAttribute('data-step'));
      if (dotStep === stepNumber) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  updateNavigationButtons(stepNumber) {
    const backBtn = document.querySelector('.btn-back');
    const nextBtn = document.querySelector('.btn-next');
    const finishBtn = document.querySelector('.btn-finish');

    // Botão Voltar
    if (backBtn) {
      backBtn.style.display = stepNumber > 1 ? 'block' : 'none';
    }

    // Botões Avançar/Concluir
    if (nextBtn && finishBtn) {
      if (stepNumber === this.totalSteps) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'block';
      } else {
        nextBtn.style.display = 'block';
        finishBtn.style.display = 'none';
      }
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.showStep(this.currentStep + 1);
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.showStep(this.currentStep - 1);
    }
  }

  closePopup() {
    const popup = document.getElementById('first-visit-popup');
    if (popup) {
      popup.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  finishPopup() {
    try {
      localStorage.setItem(this.storageKey, '1');
    } catch (error) {
      console.log('Error saving to localStorage:', error);
    }
    this.closePopup();
  }

  bindEvents() {
    // Bind dos dots de progresso
    document.querySelectorAll('.progress-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const stepNumber = parseInt(dot.getAttribute('data-step'));
        this.showStep(stepNumber);
      });
    });
  }
}

// Funções globais para os botões
function nextStep() {
  if (window.firstVisitPopup) {
    window.firstVisitPopup.nextStep();
  }
}

function previousStep() {
  if (window.firstVisitPopup) {
    window.firstVisitPopup.previousStep();
  }
}

function closePopup() {
  if (window.firstVisitPopup) {
    window.firstVisitPopup.closePopup();
  }
}

function finishPopup() {
  if (window.firstVisitPopup) {
    window.firstVisitPopup.finishPopup();
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  window.firstVisitPopup = new FirstVisitPopup();
});

// Função para resetar (testes)
function resetFirstVisitPopup() {
  try {
    localStorage.removeItem('first_visit_ack_v1');
    console.log('Popup resetado - será mostrado na próxima visita');
  } catch (error) {
    console.log('Error resetting popup:', error);
  }
}