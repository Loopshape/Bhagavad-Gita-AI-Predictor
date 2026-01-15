
import React, { useEffect, useRef } from 'react';

const AkashicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = document.getElementById('akashic-bg') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number, height: number;
    let particles: { x: number; y: number; z: number; size: number; speed: number }[] = [];

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      particles = Array.from({ length: 150 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 1000,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1
      }));
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 8, 0.15)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.z -= p.speed * 5;
        if (p.z <= 0) p.z = 1000;

        const k = 128 / p.z;
        const px = (p.x - width / 2) * k + width / 2;
        const py = (p.y - height / 2) * k + height / 2;
        const size = p.size * k;

        const opacity = Math.min(1, (1000 - p.z) / 800);
        ctx.fillStyle = `rgba(0, 242, 255, ${opacity * 0.4})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby points
        ctx.strokeStyle = `rgba(255, 0, 255, ${opacity * 0.05})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(width/2, height/2);
        ctx.stroke();
      });

      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    init();
    animate();

    return () => window.removeEventListener('resize', init);
  }, []);

  return null;
};

export default AkashicBackground;
