import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Github, Linkedin, Mail, Sparkles, ArrowUpRight } from 'lucide-react';
import { useScrollProgress, useActiveSection } from '@/hooks/use-scroll-progress';
import { NEW_SITE_URL } from '@/lib/site';

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Research', href: '#research' },
  { label: 'Awards', href: '#achievements' },
  { label: 'Contact', href: '#contact' },
];

const sectionIds = navItems.map((n) => n.href.slice(1));

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const progress = useScrollProgress();
  const active = useActiveSection(sectionIds);

  const scrollToSection = (href: string) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="glass-strong border-b border-border/40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Logo */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="font-display text-xl md:text-2xl font-bold tracking-tight group"
              >
                <span className="gradient-text">Vishal</span>
                <span className="text-foreground/80 ml-1.5">A S</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary ml-1 animate-pulse-glow" />
              </button>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => scrollToSection(item.href)}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                      active === item.href.slice(1)
                        ? 'text-primary'
                        : 'text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    {item.label}
                    {active === item.href.slice(1) && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Social Links */}
              <div className="hidden lg:flex items-center gap-1">
                <a
                  href={NEW_SITE_URL}
                  className="group mr-2 flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5
                             px-3 py-1.5 text-xs font-medium hover:bg-primary/10 hover:border-primary/40 transition-colors"
                >
                  <Sparkles size={12} className="text-primary" />
                  <span className="gradient-text">The over-engineered version</span>
                  <ArrowUpRight
                    size={12}
                    className="text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
                {[
                  { icon: Github, href: 'https://github.com/Vishal-AS-0407' },
                  { icon: Linkedin, href: 'https://www.linkedin.com/in/vishal-a-s04/' },
                  { icon: Mail, href: 'mailto:vishalpersonal04@gmail.com' },
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-foreground/50 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                  >
                    <link.icon size={18} />
                  </a>
                ))}
              </div>

              {/* Mobile Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 text-foreground/70 hover:text-primary transition-colors"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Scroll progress bar */}
          <div className="h-px bg-border/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-primary to-accent transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 lg:hidden glass-strong border-b border-border/40"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col gap-1">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => scrollToSection(item.href)}
                    className={`px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors ${
                      active === item.href.slice(1)
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                    }`}
                  >
                    {item.label}
                  </motion.button>
                ))}
                <a
                  href={NEW_SITE_URL}
                  onClick={() => setIsOpen(false)}
                  className="mt-2 flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm font-medium"
                >
                  <Sparkles size={14} className="text-primary shrink-0" />
                  <span className="gradient-text">The over-engineered version</span>
                  <ArrowUpRight size={14} className="text-primary ml-auto shrink-0" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
