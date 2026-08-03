import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { GraduationCap, Calendar, Award } from 'lucide-react';
import { SectionHeader, Reveal } from './motion/Reveal';

const coursework = [
  'Machine Learning',
  'Deep Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Data Structures',
  'Algorithms',
  'Database Systems',
  'Cloud Computing',
];

const Education = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start center', 'end center'],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section id="education" className="relative py-24 md:py-36">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="02 — Education"
          title="Academic"
          highlight="Summary"
          subtitle="My educational journey and academic achievements"
        />

        <div className="max-w-4xl mx-auto" ref={ref}>
          <Reveal>
            <div className="glass-card glow-border p-6 md:p-10 relative overflow-hidden">
              {/* Progress line */}
              <div className="absolute left-10 md:left-14 top-0 bottom-0 w-px bg-border/40">
                <motion.div
                  className="w-full bg-gradient-to-b from-primary to-accent"
                  style={{ height: lineHeight }}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-6 pl-16 md:pl-20">
                <div className="flex-shrink-0 absolute left-2 md:left-6 top-6">
                  <div className="w-12 h-12 rounded-2xl glass-strong flex items-center justify-center border border-primary/20">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-1">
                      Amrita School of Engineering
                    </h3>
                    <p className="text-lg text-primary font-medium">
                      Amrita Vishwa Vidyapeetham, Coimbatore, India
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground glass px-3 py-1.5 rounded-full text-sm">
                      <Calendar size={14} />
                      <span>2022 — 2026</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground glass px-3 py-1.5 rounded-full text-sm">
                      <Award size={14} />
                      <span className="font-semibold text-foreground">CGPA: 8.29</span>
                    </div>
                  </div>

                  <div className="glass rounded-xl p-4 border border-primary/15">
                    <p className="text-lg font-medium text-foreground">B.Tech in Computer Science and Engineering</p>
                    <p className="text-primary font-semibold">Specialization: Artificial Intelligence</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="font-semibold text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Key Coursework
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {coursework.map((course, i) => (
                        <motion.span
                          key={course}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="px-3 py-1.5 text-sm rounded-full glass border border-border/50 hover:border-primary/30 hover:text-primary transition-colors cursor-default"
                        >
                          {course}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Education;
