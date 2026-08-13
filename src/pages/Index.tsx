import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';
import LoadingScreen from '@/components/LoadingScreen';
import AmbientBackground from '@/components/AmbientBackground';
import NeuralCompanion from '@/components/NeuralCompanion';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Education from '@/components/Education';
import Skills from '@/components/Skills';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Research from '@/components/Research';
import Achievements from '@/components/Achievements';
import Certifications from '@/components/Certifications';
import Leadership from '@/components/Leadership';
import Extracurricular from '@/components/Extracurricular';
import Hobbies from '@/components/Hobbies';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import NewSiteBanner from '@/components/NewSiteBanner';

const Index = () => {
  const [loading, setLoading] = useState(true);
  useSmoothScroll();

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [loading]);

  return (
    <div className="relative min-h-screen">
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <AmbientBackground />
      <NeuralCompanion />

      <div className="noise-overlay" />

      <Navbar />

      <main className="relative z-10">
        <Hero />
        <About />
        <Education />
        <Skills />
        <Experience />
        <Projects />
        <Research />
        <Achievements />
        <Certifications />
        <Leadership />
        <Extracurricular />
        <Hobbies />
        <Contact />
      </main>

      <Footer />
      <NewSiteBanner />
    </div>
  );
};

export default Index;
