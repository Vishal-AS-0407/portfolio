import { ChevronDown, MapPin, Sparkles } from 'lucide-react';
import profilePhoto from '@/assets/profile-photo.jpg';
import sakuraHeroBg from '@/assets/sakura-hero-bg.png';

const Hero = () => {
  const scrollToAbout = () => {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 sakura-gradient" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${sakuraHeroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Profile Image */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl">
              <img
                src={profilePhoto}
                alt="Vishal A S"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-card rounded-full p-3 shadow-lg border border-border/50">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center lg:text-left max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-sm text-muted-foreground mb-6 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <MapPin size={14} className="text-primary" />
              Coimbatore, Tamil Nadu, India
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              Hi, I'm{' '}
              <span className="sakura-text-gradient">Vishal A S</span>
            </h1>

            <p
              className="text-xl md:text-2xl text-foreground/80 mb-6 animate-fade-in"
              style={{ animationDelay: '0.5s' }}
            >
              AI Developer & ML Engineer
            </p>

            <p
              className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.6s' }}
            >
              Transforming ideas into intelligent solutions. B.Tech in Computer Science
              (AI) at Amrita Vishwa Vidyapeetham. Passionate about Deep Learning, LLMs,
              Computer Vision, and building AI-powered applications that make a difference.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in"
              style={{ animationDelay: '0.7s' }}
            >
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity shadow-lg"
              >
                View My Projects
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-card border border-border text-foreground font-medium hover:bg-accent transition-colors"
              >
                Get In Touch
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToAbout}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors animate-bounce"
        >
          <span className="text-sm">Scroll</span>
          <ChevronDown size={20} />
        </button>
      </div>
    </section>
  );
};

export default Hero;
