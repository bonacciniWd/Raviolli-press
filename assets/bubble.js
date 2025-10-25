// bubble.js
document.addEventListener('DOMContentLoaded', function() {
  const bubblesContainer = document.querySelector('.footer .bubbles');
  if (!bubblesContainer) return;

  const bubbleCount = 128;
  for (let i = 0; i < bubbleCount; i++) {
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

    bubblesContainer.appendChild(bubble);
  }
});
