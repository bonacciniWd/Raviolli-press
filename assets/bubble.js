// bubble.js (ES module)
// exporta a função e auto-inicializa containers com data-bubbles
export function createBubbles(container, count = 128) {
  if (!container) return;
  // evita recriar se já tiver bolhas
  if (container.dataset._bubblesInitialized) return;
  container.dataset._bubblesInitialized = "1";

  for (let i = 0; i < count; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const size = 2 + Math.random() * 4;       // rem
    const distance = 6 + Math.random() * 4;   // rem
    const position = -5 + Math.random() * 110; // %
    const time = 2 + Math.random() * 2;       // s
    const delay = -1 * (2 + Math.random() * 2); // s

    bubble.style.setProperty('--size', `${size}rem`);
    bubble.style.setProperty('--distance', `${distance}rem`);
    bubble.style.setProperty('--position', `${position}%`);
    bubble.style.setProperty('--time', `${time}s`);
    bubble.style.setProperty('--delay', `${delay}s`);

    container.appendChild(bubble);
  }
}

// Auto-init when module loads (after DOM ready)
function initAll() {
  const nodes = document.querySelectorAll('.footer-section [data-bubbles]');
  nodes.forEach((container) => {
    const n = parseInt(container.dataset.bubbles, 10) || 128;
    createBubbles(container, n);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
