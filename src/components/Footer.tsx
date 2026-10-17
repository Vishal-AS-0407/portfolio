import { Github, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative py-12 border-t border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Designed & built with</span>
            <Heart size={14} className="text-primary fill-primary" />
            <span>by Vishal A S</span>
          </div>

          <div className="flex items-center gap-3">
            {[
              { icon: Github, label: 'GitHub', href: 'https://github.com/Vishal-AS-0407' },
              { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/vishal-a-s04/' },
              { icon: Mail, label: 'Email', href: 'mailto:vishalpersonal04@gmail.com' },
            ].map((link, i) => (
              <a
                key={i}
                href={link.href}
                aria-label={link.label}
                target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl glass border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              >
                <link.icon size={18} aria-hidden />
              </a>
            ))}
          </div>

          <p className="text-sm text-muted-foreground font-mono">
            © {new Date().getFullYear()} Vishal A S
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
