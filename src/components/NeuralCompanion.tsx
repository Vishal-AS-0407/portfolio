import { useEffect, useRef, useState } from 'react';

interface CompanionState {
  mood: 'idle' | 'curious' | 'thinking' | 'excited' | 'burst';
  section: string;
}

export default function NeuralCompanion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<CompanionState>({ mood: 'idle', section: '' });
  const [tooltip, setTooltip] = useState<string | null>(null);
  const clickCountRef = useRef(0);
  const burstRef = useRef(0);
  const konamiRef = useRef<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let width = (canvas.width = 120);
    let height = (canvas.height = 120);

    const target = { x: window.innerWidth - 80, y: window.innerHeight - 80 };
    const pos = { x: target.x, y: target.y };
    let pulsePhase = 0;
    let rotation = 0;

    const onMouseMove = (e: MouseEvent) => {
      // Companion follows cursor with delay — only when cursor is in lower-right quadrant
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 300) {
        target.x = e.clientX + 40;
        target.y = e.clientY + 40;
        stateRef.current.mood = 'curious';
      } else {
        target.x = window.innerWidth - 80;
        target.y = window.innerHeight - 80;
        if (stateRef.current.mood === 'curious') stateRef.current.mood = 'idle';
      }
    };

    const onClick = (e: MouseEvent) => {
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 60) {
        clickCountRef.current++;
        burstRef.current = 1;
        if (clickCountRef.current >= 5) {
          stateRef.current.mood = 'burst';
          setTooltip('Neural burst! You found an easter egg.');
          clickCountRef.current = 0;
          setTimeout(() => {
            setTooltip(null);
            stateRef.current.mood = 'idle';
          }, 3000);
        } else {
          stateRef.current.mood = 'excited';
          setTimeout(() => {
            if (stateRef.current.mood === 'excited') stateRef.current.mood = 'idle';
          }, 800);
        }
      }
    };

    const onScroll = () => {
      const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPct > 0.95) {
        stateRef.current.mood = 'thinking';
      }
    };

    // Konami code easter egg
    const onKey = (e: KeyboardEvent) => {
      konamiRef.current.push(e.key);
      if (konamiRef.current.length > 10) konamiRef.current.shift();
      const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
      if (konamiRef.current.join(',') === konami.join(',')) {
        stateRef.current.mood = 'burst';
        setTooltip('Konami code unlocked! Vishal appreciates your curiosity.');
        burstRef.current = 2;
        setTimeout(() => {
          setTooltip(null);
          stateRef.current.mood = 'idle';
        }, 4000);
        konamiRef.current = [];
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);

    let rafId: number;
    const animate = () => {
      pulsePhase += 0.03;
      rotation += 0.005 + (stateRef.current.mood === 'excited' ? 0.03 : 0);

      // Ease toward target
      pos.x += (target.x - pos.x) * 0.05;
      pos.y += (target.y - pos.y) * 0.05;

      canvas.style.transform = `translate(${pos.x - width / 2}px, ${pos.y - height / 2}px)`;

      ctx.clearRect(0, 0, width, height);

      const mood = stateRef.current.mood;
      const burst = burstRef.current;
      burstRef.current *= 0.95;

      const baseHue = mood === 'thinking' ? 30 : mood === 'excited' ? 15 : mood === 'burst' ? 350 : 172;
      const intensity = mood === 'excited' ? 1.5 : mood === 'burst' ? 2 : 1;
      const pulse = Math.sin(pulsePhase) * 0.15 + 0.85;

      const cx = width / 2;
      const cy = height / 2;
      const coreRadius = 18 * pulse * intensity;

      // Outer glow
      const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
      glowGradient.addColorStop(0, `hsla(${baseHue}, 80%, 60%, ${0.3 * intensity})`);
      glowGradient.addColorStop(0.5, `hsla(${baseHue}, 80%, 50%, ${0.1 * intensity})`);
      glowGradient.addColorStop(1, `hsla(${baseHue}, 80%, 50%, 0)`);
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, width, height);

      // Orbiting nodes
      const nodeCount = mood === 'thinking' ? 6 : 4;
      for (let i = 0; i < nodeCount; i++) {
        const angle = rotation + (i / nodeCount) * Math.PI * 2;
        const orbitRadius = 30 + Math.sin(pulsePhase + i) * 5;
        const nx = cx + Math.cos(angle) * orbitRadius;
        const ny = cy + Math.sin(angle) * orbitRadius;
        const nodeSize = 2 + Math.sin(pulsePhase * 2 + i) * 1;

        // Connection line
        ctx.strokeStyle = `hsla(${baseHue}, 70%, 55%, ${0.2 * pulse})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        // Node
        ctx.beginPath();
        ctx.arc(nx, ny, nodeSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${baseHue}, 80%, 65%, ${0.8 * pulse})`;
        ctx.fill();
      }

      // Core orb
      const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
      coreGradient.addColorStop(0, `hsla(${baseHue}, 90%, 75%, ${0.9 * pulse})`);
      coreGradient.addColorStop(0.5, `hsla(${baseHue}, 80%, 55%, ${0.6 * pulse})`);
      coreGradient.addColorStop(1, `hsla(${baseHue}, 80%, 45%, 0)`);
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Burst particles
      if (burst > 0.05) {
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const burstDist = (1 - burst) * 60;
          const bx = cx + Math.cos(angle) * burstDist;
          const by = cy + Math.sin(angle) * burstDist;
          ctx.beginPath();
          ctx.arc(bx, by, 2 * burst, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${baseHue + i * 10}, 80%, 65%, ${burst})`;
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 z-[60] pointer-events-none">
      <canvas
        ref={canvasRef}
        width={120}
        height={120}
        className="pointer-events-auto cursor-pointer transition-opacity"
        style={{ willChange: 'transform' }}
      />
      {tooltip && (
        <div
          className="fixed bottom-6 right-6 z-[61] glass-strong rounded-xl px-4 py-3 text-sm text-foreground/90 max-w-xs animate-fade-up"
          style={{ pointerEvents: 'none' }}
        >
          <span className="font-mono text-primary text-xs mr-2">AI:</span>
          {tooltip}
        </div>
      )}
    </div>
  );
}
