import { useEffect, useRef, useCallback } from 'react';

export default function ParticleCanvas({ particleCount = 40 }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  // Adjust particle count for mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const actualCount = isMobile ? Math.floor(particleCount / 2) : particleCount;

  const createParticle = useCallback((canvas) => {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 1.5 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -0.15 - Math.random() * 0.25, // Gentle upward drift
      opacity: 0.2 + Math.random() * 0.4,
      twinkleSpeed: 0.01 + Math.random() * 0.02,
      twinklePhase: Math.random() * Math.PI * 2,
    };
  }, []);

  const initParticles = useCallback((canvas) => {
    particlesRef.current = [];
    for (let i = 0; i < actualCount; i++) {
      particlesRef.current.push(createParticle(canvas));
    }
  }, [actualCount, createParticle]);

  const updateParticle = useCallback((particle, canvas, deltaTime) => {
    // Update position
    particle.x += particle.speedX * deltaTime;
    particle.y += particle.speedY * deltaTime;

    // Update twinkle
    particle.twinklePhase += particle.twinkleSpeed * deltaTime;

    // Wrap around edges
    if (particle.y < -10) {
      particle.y = canvas.height + 10;
      particle.x = Math.random() * canvas.width;
    }
    if (particle.x < -10) particle.x = canvas.width + 10;
    if (particle.x > canvas.width + 10) particle.x = -10;
  }, []);

  const drawParticle = useCallback((ctx, particle) => {
    const twinkle = 0.5 + 0.5 * Math.sin(particle.twinklePhase);
    const alpha = particle.opacity * twinkle;

    // Gold color with varying alpha
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);

    // Create gradient for glow effect
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size * 2
    );
    gradient.addColorStop(0, `rgba(212, 175, 55, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(212, 175, 55, ${alpha * 0.5})`);
    gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');

    ctx.fillStyle = gradient;
    ctx.fill();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let lastTime = performance.now();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (particlesRef.current.length === 0) {
        initParticles(canvas);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const animate = (currentTime) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16, 3); // Cap delta to prevent jumps
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        updateParticle(particle, canvas, deltaTime);
        drawParticle(ctx, particle);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initParticles, updateParticle, drawParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
