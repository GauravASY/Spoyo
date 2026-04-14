import { useEffect, useRef } from 'react';

type ColorType = 'amber' | 'white' | 'green' | 'orange';

interface Particle {
  x: number;
  y: number;
  vy: number;
  r: number;
  maxOpacity: number;
  color: ColorType;
  oPhase: number;   // oscillation phase offset
  oFreq: number;    // oscillation frequency
  oAmp: number;     // oscillation amplitude
  ox: number;       // origin x (center of oscillation)
}

const PALETTE: Record<ColorType, string> = {
  amber:  '191, 220, 54',
  white:  '235, 232, 216',
  green:  '191, 220, 54',
  orange: '255, 97, 76',
};

function pickColor(): ColorType {
  const r = Math.random();
  if (r < 0.46) return 'white';
  if (r < 0.76) return 'amber';
  if (r < 0.89) return 'green';
  return 'orange';
}

function spawnParticle(W: number, H: number, inView = false): Particle {
  const color = pickColor();

  const r = color === 'white'
    ? Math.random() * 0.7 + 0.3
    : Math.random() * 1.5 + 0.6;

  const maxOpacity = color === 'white'
    ? Math.random() * 0.07 + 0.02
    : color === 'amber'
    ? Math.random() * 0.38 + 0.14
    : Math.random() * 0.18 + 0.06;

  const ox = Math.random() * W;
  const y = inView
    ? Math.random() * H
    : H + r + Math.random() * 320;

  return {
    x: ox,
    y,
    vy: -(Math.random() * 0.22 + 0.06),
    r,
    maxOpacity,
    color,
    oPhase: Math.random() * Math.PI * 2,
    oFreq: Math.random() * 0.007 + 0.003,
    oAmp: Math.random() * 2.0 + 0.5,
    ox,
  };
}

function getOpacity(p: Particle, H: number): number {
  const fadeIn  = H * 0.14;
  const fadeOut = H * 0.11;
  if (p.y > H - fadeIn)  return p.maxOpacity * (1 - (p.y - (H - fadeIn)) / fadeIn);
  if (p.y < fadeOut)     return p.maxOpacity * (p.y / fadeOut);
  return p.maxOpacity;
}

const TOTAL = 88;

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1;
    let particles: Particle[] = [];
    let rafId = 0;
    let tick = 0;

    const resize = () => {
      W   = window.innerWidth;
      H   = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      resize();
      // Seed: 58% start in-view so the effect is immediate on load
      particles = Array.from({ length: TOTAL }, (_, i) =>
        spawnParticle(W, H, i < Math.floor(TOTAL * 0.58))
      );
    };

    const drawParticle = (p: Particle) => {
      const opacity = getOpacity(p, H);
      if (opacity <= 0.005) return;

      const rgb = PALETTE[p.color];

      // Glow halo — amber particles (and slightly green/orange)
      if (p.color === 'amber' && p.r >= 1.0) {
        const haloR = p.r * 6;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloR);
        grad.addColorStop(0,   `rgba(${rgb}, ${opacity * 0.55})`);
        grad.addColorStop(0.3, `rgba(${rgb}, ${opacity * 0.18})`);
        grad.addColorStop(1,   `rgba(${rgb}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      } else if ((p.color === 'green' || p.color === 'orange') && p.r >= 0.9) {
        const haloR = p.r * 4.5;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloR);
        grad.addColorStop(0,  `rgba(${rgb}, ${opacity * 0.38})`);
        grad.addColorStop(1,  `rgba(${rgb}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Core dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb}, ${opacity})`;
      ctx.fill();
    };

    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      tick++;

      for (const p of particles) {
        p.y  += p.vy;
        p.x   = p.ox + Math.sin(tick * p.oFreq + p.oPhase) * p.oAmp;

        // Respawn when fully above canvas
        if (p.y < -p.r * 6) {
          Object.assign(p, spawnParticle(W, H, false));
        }

        drawParticle(p);
      }

      rafId = requestAnimationFrame(frame);
    };

    init();
    frame();

    const onResize = () => {
      resize();
      particles = particles.map(p =>
        p.ox > W ? spawnParticle(W, H, true) : p
      );
    };

    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
