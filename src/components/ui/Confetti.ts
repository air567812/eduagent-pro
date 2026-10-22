// Canvas-based lightweight zero-dependency confetti celebration engine

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  shape: 'rect' | 'circle';
  opacity: number;
}

const COSMIC_COLORS = [
  '#7C3AED', // Electric Violet
  '#EC4899', // Hot Magenta
  '#06B6D4', // Cyber Cyan
  '#F59E0B', // Neon Amber
  '#10B981', // Emerald Mint
  '#6366F1', // Indigo
  '#F43F5E', // Rose
  '#38BDF8'  // Sky
];

export function triggerConfetti(options?: {
  particleCount?: number;
  durationMs?: number;
  originY?: number;
}) {
  if (typeof window === 'undefined') return;

  const count = options?.particleCount || 140;
  const duration = options?.durationMs || 3500;
  const originY = options?.originY ?? 0.6;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const startX = window.innerWidth / 2;
  const startY = window.innerHeight * originY;

  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 7 + Math.random() * 14;
    particles.push({
      x: startX + (Math.random() - 0.5) * 40,
      y: startY + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
      vy: Math.sin(angle) * speed * (0.8 + Math.random() * 0.4) - 6,
      size: 6 + Math.random() * 6,
      color: COSMIC_COLORS[Math.floor(Math.random() * COSMIC_COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      wobble: Math.random() * 10,
      wobbleSpeed: 0.05 + Math.random() * 0.08,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
      opacity: 1
    });
  }

  const startTime = performance.now();
  let animationFrameId: number;

  function render(now: number) {
    if (!ctx) return;
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Gravity
      p.vx *= 0.985; // Drag
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;

      if (progress > 0.6) {
        p.opacity = Math.max(0, 1 - (progress - 0.6) / 0.4);
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);

      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        const w = p.size * Math.cos(p.wobble);
        const h = p.size * 1.5;
        ctx.fillRect(-w / 2, -h / 2, Math.abs(w), h);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
    }
  }

  animationFrameId = requestAnimationFrame(render);
}
