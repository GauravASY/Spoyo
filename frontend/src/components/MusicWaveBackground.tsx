import { useEffect, useRef } from 'react';

const BAR_WIDTH = 3;
const BAR_GAP = 5;

interface BarState {
  phase: number;
  freq: number;
  amp: number;
  seed: number;
}

export function MusicWaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let bars: BarState[] = [];
    let rafId = 0;
    let t = 0;

    const buildBars = () => {
      const count = Math.ceil(W / (BAR_WIDTH + BAR_GAP)) + 2;
      bars = Array.from({ length: count }, (_, i) => ({
        phase: (i * 0.18) + Math.random() * Math.PI * 2,
        freq: 0.6 + Math.random() * 0.8,
        amp: 0.55 + Math.random() * 0.45,
        seed: Math.random() * 1000,
      }));
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildBars();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.018;

      const maxH = Math.min(H * 0.5, 420);
      const baseY = H - 8;

      for (let i = 0; i < bars.length; i++) {
        const b = bars[i];
        const x = i * (BAR_WIDTH + BAR_GAP);

        const s1 = Math.sin(t * 1.15 * b.freq + b.phase);
        const s2 = Math.sin(t * 0.55 - i * 0.06 + b.seed) * 0.65;
        const s3 = Math.sin(t * 2.4 + i * 0.22) * 0.35;
        const s4 = Math.sin(t * 0.22 + i * 0.015) * 0.8;

        let v = (s1 + s2 + s3 + s4) / 2.8;
        v = (v + 1) / 2;
        v = Math.pow(v, 1.6) * b.amp;

        const h = Math.max(4, maxH * (0.04 + v * 0.96));

        // Main gradient body — subtle violet→cyan→green fade from top to bottom
        const grad = ctx.createLinearGradient(0, baseY - h, 0, baseY);
        grad.addColorStop(0, 'rgba(189, 147, 249, 0)');
        grad.addColorStop(0.25, 'rgba(189, 147, 249, 0.06)');
        grad.addColorStop(0.55, 'rgba(94, 234, 212, 0.14)');
        grad.addColorStop(0.85, 'rgba(52, 211, 153, 0.26)');
        grad.addColorStop(1, 'rgba(232, 200, 66, 0.42)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, baseY - h, BAR_WIDTH, h);

        // Top cap highlight
        ctx.fillStyle = `rgba(244, 234, 200, ${0.45 + v * 0.4})`;
        ctx.fillRect(x, baseY - h, BAR_WIDTH, 1.2);

        // Reflected glow (mirrored short bar below the baseline for that "stage" feel)
        const refH = h * 0.14;
        const refGrad = ctx.createLinearGradient(0, baseY, 0, baseY + refH);
        refGrad.addColorStop(0, 'rgba(232, 200, 66, 0.18)');
        refGrad.addColorStop(1, 'rgba(232, 200, 66, 0)');
        ctx.fillStyle = refGrad;
        ctx.fillRect(x, baseY, BAR_WIDTH, refH);
      }

      // Thin luminous baseline stripe
      const baseGrad = ctx.createLinearGradient(0, 0, W, 0);
      baseGrad.addColorStop(0, 'rgba(189, 147, 249, 0)');
      baseGrad.addColorStop(0.25, 'rgba(94, 234, 212, 0.28)');
      baseGrad.addColorStop(0.5, 'rgba(232, 200, 66, 0.45)');
      baseGrad.addColorStop(0.75, 'rgba(52, 211, 153, 0.28)');
      baseGrad.addColorStop(1, 'rgba(189, 147, 249, 0)');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, baseY + 1, W, 1);

      rafId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
