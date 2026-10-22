'use client';

import React, { useEffect, useRef } from 'react';

export default function LiquidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with smooth damping
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 280,
      velocity: 0
    };

    // Ambient floating fluid nodes matching the cosmic aurora palette
    const fluidBlobs = [
      {
        x: width * 0.2,
        y: height * 0.25,
        radius: 380,
        vx: 0.45,
        vy: 0.28,
        color: 'rgba(124, 58, 237, 0.28)' // Electric Violet
      },
      {
        x: width * 0.8,
        y: height * 0.65,
        radius: 400,
        vx: -0.4,
        vy: -0.35,
        color: 'rgba(6, 182, 212, 0.25)' // Cyber Cyan
      },
      {
        x: width * 0.5,
        y: height * 0.85,
        radius: 360,
        vx: 0.32,
        vy: -0.42,
        color: 'rgba(236, 72, 153, 0.24)' // Hot Magenta
      },
      {
        x: width * 0.85,
        y: height * 0.15,
        radius: 320,
        vx: -0.28,
        vy: 0.38,
        color: 'rgba(79, 70, 229, 0.26)' // Cosmic Indigo
      },
      {
        x: width * 0.15,
        y: height * 0.75,
        radius: 300,
        vx: 0.35,
        vy: -0.25,
        color: 'rgba(245, 158, 11, 0.18)' // Aurora Amber
      }
    ];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    let prevMouseX = mouse.x;
    let prevMouseY = mouse.y;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      mouse.velocity = Math.min(Math.sqrt(dx * dx + dy * dy), 40);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    // Animation Loop with smooth fluid simulation
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth lerp mouse toward target
      mouse.x += (mouse.targetX - mouse.x) * 0.07;
      mouse.y += (mouse.targetY - mouse.y) * 0.07;
      mouse.velocity *= 0.92;

      // Update & render ambient liquid blobs
      fluidBlobs.forEach((blob) => {
        blob.x += blob.vx;
        blob.y += blob.vy;

        // Bounce gently off borders
        if (blob.x < -100 || blob.x > width + 100) blob.vx *= -1;
        if (blob.y < -100 || blob.y > height + 100) blob.vy *= -1;

        // Subtle pull toward mouse
        const dx = mouse.x - blob.x;
        const dy = mouse.y - blob.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 600) {
          blob.x += (dx / dist) * 0.4;
          blob.y += (dy / dist) * 0.4;
        }

        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.radius
        );
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(0.6, blob.color.replace(/[\d\.]+\)$/, '0.08)'));
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render the primary interactive liquid light following the mouse
      const dynamicRadius = mouse.radius + mouse.velocity * 3.5;
      const mouseGlow = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        dynamicRadius
      );
      // Vibrant iridescent liquid core
      mouseGlow.addColorStop(0, 'rgba(6, 182, 212, 0.42)'); // Cyber Cyan core
      mouseGlow.addColorStop(0.35, 'rgba(124, 58, 237, 0.32)'); // Electric Violet
      mouseGlow.addColorStop(0.7, 'rgba(236, 72, 153, 0.22)'); // Hot Magenta
      mouseGlow.addColorStop(1, 'rgba(8, 11, 22, 0)');

      ctx.fillStyle = mouseGlow;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, dynamicRadius, 0, Math.PI * 2);
      ctx.fill();

      // Additional intense spotlight beam right at cursor
      const cursorSpotlight = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        90
      );
      cursorSpotlight.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      cursorSpotlight.addColorStop(0.5, 'rgba(125, 211, 252, 0.25)');
      cursorSpotlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = cursorSpotlight;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 90, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic interactive canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-90 transition-opacity"
      />

      {/* Glassmorphic backdrop blur so text and cards float crisp and ultra-readable */}
      <div className="absolute inset-0 backdrop-blur-[60px] bg-slate-50/70" />

      {/* Subtle liquid mesh grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px]"
      />
    </div>
  );
}
