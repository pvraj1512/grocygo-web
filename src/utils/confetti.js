// Lightweight, zero-dependency Canvas Confetti Burst Utility
export function fireConfetti(options = {}) {
  const count = options.count || 60;
  const defaults = {
    origin: { x: 0.5, y: 0.6 },
    spread: 70,
    startVelocity: 35,
    colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#FF6B6B', '#14B8A6']
  };

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const particles = [];
  const startX = window.innerWidth * (options.origin?.x || defaults.origin.x);
  const startY = window.innerHeight * (options.origin?.y || defaults.origin.y);

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI / 180) * (Math.random() * (options.spread || defaults.spread) - (options.spread || defaults.spread) / 2 - 90);
    const velocity = (options.startVelocity || defaults.startVelocity) * (0.6 + Math.random() * 0.8);
    const color = defaults.colors[Math.floor(Math.random() * defaults.colors.length)];
    
    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      size: 5 + Math.random() * 5,
      color,
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 15,
      alpha: 1,
      gravity: 0.45 + Math.random() * 0.2,
      shape: Math.random() > 0.4 ? 'rect' : 'circle'
    });
  }

  let animationFrame;
  const startTime = Date.now();
  const duration = 2200; // ms

  function animate() {
    const elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      return;
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rotation += p.vRotation;
      p.alpha = Math.max(0, 1 - (elapsed / duration));

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    animationFrame = requestAnimationFrame(animate);
  }

  animate();
}
export default fireConfetti;
