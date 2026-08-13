import { useEffect, useState } from 'react';

const bootLines = [
  'Initializing neural network...',
  'Loading synaptic connections...',
  'Calibrating particle field...',
  'Awakening AI companion...',
  'Rendering experience...',
];

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 8 + 2;
        if (next >= 100) {
          clearInterval(interval);
          setExiting(true);
          setTimeout(onComplete, 800);
          return 100;
        }
        return next;
      });
    }, 80);

    const lineInterval = setInterval(() => {
      setLineIndex((prev) => Math.min(prev + 1, bootLines.length - 1));
    }, 400);

    return () => {
      clearInterval(interval);
      clearInterval(lineInterval);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-background transition-opacity duration-700 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center px-4">
        {/* Animated orb */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-primary/30 animate-pulse-glow" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary to-accent animate-float" />
          <div className="absolute inset-0 rounded-full border border-primary/30 animate-spin-slow" />
        </div>

        {/* Boot text */}
        <div className="font-mono text-xs text-muted-foreground h-5 mb-6">
          {bootLines[lineIndex]}
        </div>

        {/* Progress bar */}
        <div className="w-64 mx-auto h-px bg-border/50 overflow-hidden rounded-full">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="font-mono text-xs text-muted-foreground/60 mt-2">
          {Math.floor(progress)}%
        </div>
      </div>
    </div>
  );
}
