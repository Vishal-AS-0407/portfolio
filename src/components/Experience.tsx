import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Briefcase, Calendar, CircleCheck as CheckCircle2 } from 'lucide-react';
import { SectionHeader, Reveal } from './motion/Reveal';

const experiences = [
  {
    title: 'AI Developer',
    company: 'NASSCOM Foundation',
    period: 'July 2024 – February 2025',
    highlights: [
      'Co-led the team and collaborated with mentors and investors to refine app features',
      'Achieved 90%+ positive feedback in 20-user closed beta on Play Store',
      'Built AI-powered Medical App NurtureSync (Funded by Cisco) achieving 95% health-insight accuracy on tablet images & medical reports with drug compatibility analyser',
      'Optimized OCR+NLP pipeline to cut processing time by 35% and built medical community platform',
      'Developed end-to-end real-time voice bot with ASR-LLM-TTS pipeline, speaker verification across 9 Indian languages',
      'Fine-tuned models for chronic disease queries and speech emotion recognition',
    ],
  },
  {
    title: 'Freelance Product Developer',
    company: 'Independent Consultant',
    period: 'July 2025 – Present',
    highlights: [
      'Consulting for 3 major textile manufacturers (SS Garments, Janshi Text, Barath Garments) in Tiruppur',
      'Building multi-source trend analysis platform integrating Google Trends, e-commerce data, and social media for real-time market insights',
      'Developing agentic AI system powered by mathematical reasoning and GRPO RL fine-tuned VQA model with Tamil language support',
      'Creating cloth cutting optimization solutions to minimize fabric waste for mass production',
      'Building B2B wholesale marketplace with multilingual voice assistant',
      'Fine-tuning computer vision models for Indian traditional dress classification and automated product cataloging',
    ],
  },
];

const Experience = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start center', 'end center'],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section id="experience" className="relative py-24 md:py-36">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="04 — Experience"
          title="Work"
          highlight="Experience"
          subtitle="Professional experience and internships"
        />

        <div className="max-w-4xl mx-auto" ref={ref}>
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border/40 -translate-x-1/2">
            <motion.div
              className="w-full bg-gradient-to-b from-primary to-accent"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <div
                key={exp.title}
                className={`relative flex flex-col md:flex-row gap-8 ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background -translate-x-1/2 mt-1 z-10"
                  style={{ boxShadow: '0 0 12px hsl(172 80% 55% / 0.5)' }}
                />

                {/* Content */}
                <Reveal
                  delay={0.1}
                  className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="glass-card glow-border p-6 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl glass border border-primary/20">
                        <Briefcase className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar size={14} />
                        {exp.period}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-1">{exp.title}</h3>
                    <p className="text-primary font-medium mb-4">{exp.company}</p>

                    <ul className="space-y-2">
                      {exp.highlights.map((highlight, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          className="flex gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </Reveal>

                {/* Empty space for alignment */}
                <div className="hidden md:block md:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
