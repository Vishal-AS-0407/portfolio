import SakuraPetals from '@/components/SakuraPetals';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Education from '@/components/Education';
import Skills from '@/components/Skills';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Research from '@/components/Research';
import Achievements from '@/components/Achievements';
import Leadership from '@/components/Leadership';
import Extracurricular from '@/components/Extracurricular';
import Hobbies from '@/components/Hobbies';
import Certifications from '@/components/Certifications';
import Contact from '@/components/Contact';


const Index = () => {
  return (
    <div className="relative min-h-screen">
      <SakuraPetals />
      <Navbar />
      
      <main>
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

     
    </div>
  );
};

export default Index;
