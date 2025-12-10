import { useState, useEffect } from 'react';
import { Menu, X, Github, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Education', href: '#education' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Research', href: '#research' },
  { label: 'Achievements', href: '#achievements' },
  { label: 'Contact', href: '#contact' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-card/95 backdrop-blur-md shadow-lg border-b border-border/50'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a
            href="#"
            className="font-serif text-xl md:text-2xl font-semibold text-primary hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Vishal A S
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-lg hover:bg-accent/50"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Social Links - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href="https://github.com/Vishal-AS-0407"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-foreground/70 hover:text-primary transition-colors rounded-full hover:bg-accent/50"
            >
              <Github size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/vishal-a-s04/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-foreground/70 hover:text-primary transition-colors rounded-full hover:bg-accent/50"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="mailto:vishal.as04@outlook.com"
              className="p-2 text-foreground/70 hover:text-primary transition-colors rounded-full hover:bg-accent/50"
            >
              <Mail size={20} />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 bg-card/95 backdrop-blur-md">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-accent/50 transition-colors text-left rounded-lg"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/30 px-4">
              <a
                href="https://github.com/Vishal-AS-0407"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                <Github size={22} />
              </a>
              <a
                href="https://www.linkedin.com/in/vishal-a-s04/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                <Linkedin size={22} />
              </a>
              <a
                href="mailto:vishal.as04@outlook.com"
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                <Mail size={22} />
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
