export function triggerFlyToCart(
  sourceEl: HTMLElement | null,
  imageUrl: string,
  onArrive?: () => void
) {
  const cartBtn = document.getElementById('header-cart-btn');
  if (!cartBtn) {
    onArrive?.();
    return;
  }

  const targetRect = cartBtn.getBoundingClientRect();
  const startRect = sourceEl
    ? sourceEl.getBoundingClientRect()
    : {
        left: window.innerWidth / 2 - 30,
        top: window.innerHeight / 2 - 30,
        width: 60,
        height: 60
      };

  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;

  // Create flying thumbnail orb
  const flyer = document.createElement('div');
  flyer.className = 'fly-to-cart-orb';
  flyer.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: #ffffff;
    border: 2px solid #3b82f6;
    box-shadow: 0 12px 30px rgba(59, 130, 246, 0.65), 0 0 20px rgba(139, 92, 246, 0.5);
    z-index: 99999;
    pointer-events: none;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    will-change: transform, opacity;
  `;

  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.cssText = 'width: 100%; height: 100%; object-fit: contain; border-radius: 10px;';
  flyer.appendChild(img);
  document.body.appendChild(flyer);

  // Control point for parabolic arc (lifts higher than both start and end)
  const ctrlX = (startX + endX) / 2;
  const ctrlY = Math.min(startY, endY) - Math.max(140, Math.abs(endX - startX) * 0.28);

  const duration = 680; // ms
  const startTime = performance.now();

  function step(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    // Ease out cubic for snappy arrival
    const ease = 1 - Math.pow(1 - t, 2.4);

    // Quadratic Bezier curve: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    const inv = 1 - ease;
    const curX = inv * inv * startX + 2 * inv * ease * ctrlX + ease * ease * endX;
    const curY = inv * inv * startY + 2 * inv * ease * ctrlY + ease * ease * endY;
    const scale = 1 - ease * 0.68;
    const rot = ease * 360;

    flyer.style.transform = `translate3d(${curX - 32}px, ${curY - 32}px, 0) scale(${scale}) rotate(${rot}deg)`;
    flyer.style.opacity = `${1 - Math.pow(t, 4) * 0.3}`;

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      flyer.remove();
      // Shake cart button & burst micro-confetti sparkles
      if (cartBtn) {
        cartBtn.classList.remove('cart-shake-anim');
        void cartBtn.offsetWidth; // trigger reflow
        cartBtn.classList.add('cart-shake-anim');
      }
      spawnConfettiBurst(endX, endY);
      onArrive?.();
    }
  }

  requestAnimationFrame(step);
}

export function spawnConfettiBurst(x: number, y: number) {
  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#ffffff'];
  const count = 22;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('span');
    const color = colors[i % colors.length];
    const size = 5 + Math.random() * 6;
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const velocity = 45 + Math.random() * 65;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity - 15;

    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${i % 2 === 0 ? '50%' : '2px'};
      box-shadow: 0 0 8px ${color};
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s ease-out;
    `;
    document.body.appendChild(particle);

    requestAnimationFrame(() => {
      particle.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.2) rotate(${Math.random() * 260}deg)`;
      particle.style.opacity = '0';
    });

    setTimeout(() => {
      particle.remove();
    }, 680);
  }
}
