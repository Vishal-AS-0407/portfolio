import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, y = 40, className = '' }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxProps {
  children: ReactNode;
  offset?: number;
  className?: string;
}

export function Parallax({ children, offset = 50, className = '' }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

interface SectionHeaderProps {
  label: string;
  title: string;
  highlight: string;
  subtitle?: string;
}

export function SectionHeader({ label, title, highlight, subtitle }: SectionHeaderProps) {
  return (
    <div className="text-center mb-16">
      <Reveal>
        <span className="section-label">{label}</span>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-3 mb-4 text-balance">
          {title} <span className="gradient-text">{highlight}</span>
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.2}>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
