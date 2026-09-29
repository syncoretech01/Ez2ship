import { useEffect, useRef } from 'react';
import { deviceTier, prefersReducedMotion } from '../lib/env';

/**
 * 2D particle field of flowing "routes": particles stream left→right along
 * noise-bent lanes and are pushed aside by the cursor like a magnet.
 */
export function FlowField({ className = '', color = '143, 161, 255', accent = '243, 240, 234' }: { className?: string; color?: string; accent?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = prefersReducedMotion();
    const tier = deviceTier();
    const N = tier === 'low' ? 520 : tier === 'mid' ? 900 : 1400;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    const mouse = { x: -1e4, y: -1e4, on: 0 };

    type P = { x: number; y: number; v: number; lane: number; life: number; hot: boolean };
    const ps: P[] = [];
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (p?: P, anywhere = false): P => {
      const q = p ?? ({} as P);
      q.lane = Math.random();
      q.x = anywhere ? Math.random() * w : -20 - Math.random() * 200;
      q.y = q.lane * h;
      q.v = 0.6 + Math.random() * 1.8;
      q.life = 0;
      q.hot = Math.random() < 0.06;
      return q;
    };
    resize();
    for (let i = 0; i < N; i++) ps.push(spawn(undefined, true));

    const field = (x: number, y: number, t: number) =>
      Math.sin(x * 0.0035 + t * 0.4) * 0.6 + Math.sin(y * 0.006 - t * 0.3 + x * 0.001) * 0.4;

    let t = 0;
    const step = () => {
      t += 0.016;
      ctx.fillStyle = 'rgba(11, 23, 51, 0.16)';
      ctx.fillRect(0, 0, w, h);
      mouse.on += ((mouse.x > -1e3 ? 1 : 0) - mouse.on) * 0.06;
      ctx.lineCap = 'round';
      for (const p of ps) {
        const a = field(p.x, p.y, t);
        let vx = p.v * 2.2;
        let vy = a * 0.9 + (p.lane * h - p.y) * 0.004;
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 32000) {
          const f = (1 - d2 / 32000) * 6 * mouse.on;
          const d = Math.sqrt(d2) || 1;
          vx += (dx / d) * f;
          vy += (dy / d) * f;
        }
        const x0 = p.x;
        const y0 = p.y;
        p.x += vx;
        p.y += vy;
        p.life++;
        ctx.strokeStyle = p.hot ? `rgba(${accent}, 0.9)` : `rgba(${color}, ${0.25 + p.v * 0.18})`;
        ctx.lineWidth = p.hot ? 1.6 : 1;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        if (p.x > w + 20 || p.y < -40 || p.y > h + 40) spawn(p);
      }
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (visible) step();
    };

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -1e4;
      mouse.y = -1e4;
    };
    const host = canvas.parentElement!;
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', resize);

    if (reduced) {
      // One static frame of long route lines.
      ctx.fillStyle = 'rgb(11, 23, 51)';
      ctx.fillRect(0, 0, w, h);
      for (let k = 0; k < 90; k++) step();
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', resize);
    };
  }, [color, accent]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
