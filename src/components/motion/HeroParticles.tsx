"use client";

import { useEffect, useRef } from "react";

/**
 * Atmospheric Golden Embers & Holy Light Particles.
 * Drifts gentle sacred embers upward in the Hero section, giving an altar of prayer / prophetic fire atmosphere.
 * Runs on a lightweight canvas with zero lag and automatically adjusts to screen size.
 */
export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 600);

    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener("resize", onResize);

    // Particle definition
    type Particle = {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
      maxOpacity: number;
      pulseSpeed: number;
      color: string;
    };

    const particleCount = Math.min(Math.floor(width / 35), 45);
    const colors = [
      "rgba(217, 190, 134,", // gold-soft
      "rgba(176, 128, 58,",  // gold
      "rgba(242, 236, 224,", // parchment
      "rgba(230, 181, 102,", // warm ember gold
    ];

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      speedY: Math.random() * 0.45 + 0.2,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.6 + 0.1,
      maxOpacity: Math.random() * 0.6 + 0.3,
      pulseSpeed: Math.random() * 0.015 + 0.005,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let tick = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x += Math.sin((tick + i * 20) * 0.015) * 0.35 + p.speedX;

        // Pulse opacity
        p.opacity += Math.sin(tick * p.pulseSpeed) * 0.01;
        const currentOpacity = Math.max(0.05, Math.min(p.maxOpacity, p.opacity));

        // Recycle when out of bounds
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw soft glowing particle
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.5);
        gradient.addColorStop(0, `${p.color} ${currentOpacity})`);
        gradient.addColorStop(0.5, `${p.color} ${currentOpacity * 0.4})`);
        gradient.addColorStop(1, `${p.color} 0)`);

        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-80"
      aria-hidden="true"
    />
  );
}
