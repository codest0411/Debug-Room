'use client';

import { useEffect, useRef } from 'react';

export function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; size: number;
    }[] = [];

    let mouse = { x: 0, y: 0 };
    let animFrame: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
      // Spawn particles on mouse move
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: mouse.x + (Math.random() - 0.5) * 10,
          y: mouse.y + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 2 - 1,
          life: 1,
          maxLife: 0.5 + Math.random() * 0.5,
          size: 1 + Math.random() * 2,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.016 / p.maxLife;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${alpha * 0.6})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00FF88';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animFrame = requestAnimationFrame(draw);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
}
