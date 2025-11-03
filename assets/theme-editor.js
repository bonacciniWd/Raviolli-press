function hideProductModal() {
  const productModal = document.querySelectorAll('product-modal[open]');
  productModal && productModal.forEach((modal) => modal.hide());
}

document.addEventListener('shopify:block:select', function (event) {
  hideProductModal();
  const blockSelectedIsSlide = event.target.classList.contains('slideshow__slide');
  if (!blockSelectedIsSlide) return;

  const parentSlideshowComponent = event.target.closest('slideshow-component');
  parentSlideshowComponent.pause();

  setTimeout(function () {
    parentSlideshowComponent.slider.scrollTo({
      left: event.target.offsetLeft,
    });
  }, 200);
});

document.addEventListener('shopify:block:deselect', function (event) {
  const blockDeselectedIsSlide = event.target.classList.contains('slideshow__slide');
  if (!blockDeselectedIsSlide) return;
  const parentSlideshowComponent = event.target.closest('slideshow-component');
  if (parentSlideshowComponent.autoplayButtonIsSetToPlay) parentSlideshowComponent.play();
});

document.addEventListener('shopify:section:load', () => {
  hideProductModal();
  const zoomOnHoverScript = document.querySelector('[id^=EnableZoomOnHover]');
  if (!zoomOnHoverScript) return;
  if (zoomOnHoverScript) {
    const newScriptTag = document.createElement('script');
    newScriptTag.src = zoomOnHoverScript.src;
    zoomOnHoverScript.parentNode.replaceChild(newScriptTag, zoomOnHoverScript);
  }
});

document.addEventListener('shopify:section:unload', (event) => {
  document.querySelectorAll(`[data-section="${event.detail.sectionId}"]`).forEach((element) => {
    element.remove();
    document.body.classList.remove('overflow-hidden');
  });
});

document.addEventListener('shopify:section:reorder', () => hideProductModal());

document.addEventListener('shopify:section:select', () => hideProductModal());

document.addEventListener('shopify:section:deselect', () => hideProductModal());

document.addEventListener('shopify:inspector:activate', () => hideProductModal());

document.addEventListener('shopify:inspector:deactivate', () => hideProductModal());


// Popup First Visit Functionality
function checkFirstVisit() {
  // Verifica se o usuário já visitou o site
  const hasVisited = localStorage.getItem('hasVisited');
  const dontShowAgain = localStorage.getItem('dontShowAgain');
  
  // Se nunca visitou E não marcou "não mostrar novamente"
  if (!hasVisited && !dontShowAgain) {
    // Pequeno delay para garantir que a página carregou
    setTimeout(() => {
      const popup = document.getElementById('first-visit-popup');
      if (popup) {
        popup.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Previne scroll
      }
    }, 2000); // 2 segundos após o carregamento
  }
}

function closePopup() {
  const popup = document.getElementById('first-visit-popup');
  const dontShowCheckbox = document.getElementById('dont-show-again');
  
  if (popup) {
    popup.style.display = 'none';
    document.body.style.overflow = ''; // Restaura scroll
    
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
    document.body.style.overflow = ''; // Restaura scroll
    
    // Marca para nunca mais mostrar
    localStorage.setItem('hasVisited', 'true');
    localStorage.setItem('dontShowAgain', 'true');
  }
}

// Fechar popup clicando no overlay
document.addEventListener('DOMContentLoaded', function() {
  const popup = document.getElementById('first-visit-popup');
  
  if (popup) {
    popup.addEventListener('click', function(e) {
      if (e.target.classList.contains('popup-overlay')) {
        closePopup();
      }
    });
    
    // Fechar com ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && popup.style.display === 'block') {
        closePopup();
      }
    });
  }
  
  // Inicializar verificação
  checkFirstVisit();
});

// Função para resetar (útil para testes)
function resetPopup() {
  localStorage.removeItem('hasVisited');
  localStorage.removeItem('dontShowAgain');
  console.log('Popup resetado - será mostrado na próxima visita');
}