import { motion } from 'framer-motion';
import { Brain, Target, Zap } from 'lucide-react';
import { SectionHeader, Reveal } from './motion/Reveal';

const stats = [
  { value: '7+', label: 'Major Projects', icon: Zap },
  { value: '3', label: 'Publications', icon: Brain },
  { value: '2', label: 'Patents Filed', icon: Target },
];

const About = () => {
  return (
    <section id="about" className="relative py-24 md:py-36">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="01 — About"
          title="About"
          highlight="Me"
          subtitle="Building AI systems that solve real-world problems"
        />

        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="glass-card glow-border p-8 md:p-12 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />

              <div className="relative space-y-6">
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="text-xl md:text-2xl leading-relaxed text-foreground/90 font-light"
                >
                  I build{' '}
                  <span className="gradient-text font-medium">AI systems</span> that solve
                  real world problems — not just classroom ones. From healthcare automation
                  to speech and language intelligence, I enjoy taking ideas from{' '}
                  <span className="text-primary">research papers to working products</span>.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-lg leading-relaxed text-muted-foreground"
                >
                  My work spans machine learning, deep learning, NLP, and scalable backend
                  systems. I focus heavily on data quality, model explainability, and
                  deployment-ready solutions rather than just accuracy numbers.
                </motion.p>
              </div>
            </div>
          </Reveal>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-8">
            {stats.map((stat, i) => (
                <Reveal key={stat.label} delay={i * 0.1}>
                  <div className="glass-card p-6 text-center group hover:border-primary/30 transition-colors">
                    <stat.icon className="w-6 h-6 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
