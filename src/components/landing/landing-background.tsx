"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  opacitySpeed: number;
}

/**
 * Premium dark background for the landing page.
 * Renders a canvas with:
 *  - Deep space dark base
 *  - Soft radial nebula glows (CSS, no canvas)
 *  - Animated star particles (canvas)
 *  - Subtle perspective grid lines (canvas)
 */
export function LandingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 140;

    function resize() {
      if (!canvas) return;
      canvas.width = document.documentElement.clientWidth;
      canvas.height = document.documentElement.clientHeight;
    }

    function initParticles() {
      if (!canvas) return;
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.6 + 0.2,
          speedX: (Math.random() - 0.5) * 0.18,
          speedY: (Math.random() - 0.5) * 0.18,
          opacity: Math.random() * 0.7 + 0.15,
          opacitySpeed: (Math.random() - 0.5) * 0.004,
        });
      }
    }

    function drawGrid() {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      // Perspective grid — lines converge toward a vanishing point at center-bottom
      const vx = w / 2;
      const vy = h * 0.72;
      const cols = 14;
      const rows = 10;

      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.028)";
      ctx.lineWidth = 0.8;

      // Vertical (perspective) lines
      for (let i = 0; i <= cols; i++) {
        const t = i / cols;
        const startX = t * w;
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(vx + (startX - vx) * 0.05, vy);
        ctx.stroke();
      }

      // Horizontal lines (evenly spaced, fading toward vanishing point)
      for (let j = 1; j <= rows; j++) {
        const t = j / rows;
        // exponential spacing — denser near vanishing point
        const y = vy - vy * Math.pow(t, 1.6);
        const xLeft = vx + (0 - vx) * t;
        const xRight = vx + (w - vx) * t;
        ctx.beginPath();
        ctx.moveTo(xLeft, y);
        ctx.lineTo(xRight, y);
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawParticles() {
      if (!canvas || !ctx) return;
      for (const p of particles) {
        // Twinkle
        p.opacity += p.opacitySpeed;
        if (p.opacity > 0.85 || p.opacity < 0.05) p.opacitySpeed *= -1;

        // Move
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity.toFixed(3)})`;
        ctx.fill();
      }
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      drawParticles();
      animId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();

    const handleResize = () => {
      resize();
      initParticles();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden w-full h-full"
      aria-hidden
    >
      {/* Deep space base */}
      <div className="absolute inset-0 bg-[oklch(0.09_0_0)]" />

      {/* Nebula glows — radial gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 15% 20%, oklch(0.28 0.06 265 / 0.22) 0%, transparent 70%),
            radial-gradient(ellipse 55% 45% at 85% 75%, oklch(0.25 0.05 300 / 0.18) 0%, transparent 65%),
            radial-gradient(ellipse 40% 35% at 60% 10%, oklch(0.22 0.04 240 / 0.14) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 30% 85%, oklch(0.20 0.03 280 / 0.12) 0%, transparent 55%)
          `,
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, oklch(0.06 0 0 / 0.7) 100%)",
        }}
      />

      {/* Canvas: stars + grid */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
