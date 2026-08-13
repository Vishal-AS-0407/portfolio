import { motion } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import { SectionHeader, Reveal } from './motion/Reveal';

const certifications = [
  {
    title: 'AI Engineer Agentic Track: The Complete Agent & MCP Course',
    issuer: 'Udemy',
    date: 'Dec 2025',
  },
  {
    title: 'The Complete Python Developer',
    issuer: 'DeepLearning.AI & Stanford',
    date: 'Oct 2023',
  },
  {
    title: 'Ethical Hacking Essentials (EHE)',
    issuer: 'EC-Council',
    date: 'Mar 2024',
  },
  {
    title: 'Python for Data Science, AI & Development',
    issuer: 'IBM',
    date: 'Dec 2025',
  },
  {
    title: 'The Complete Prompt Engineering for AI Bootcamp',
    issuer: 'Udemy',
    date: 'Nov 2025',
  },
  {
    title: 'Business Communication Skills: Business Writing & Grammar',
    issuer: 'Udemy',
    date: 'Dec 2025',
  },
];

const Certifications = () => {
  return (
    <section id="certifications" className="relative py-24 md:py-36">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="08 — Certifications"
          title="Professional"
          highlight="Certifications"
          subtitle="Professional certifications and courses completed"
        />

        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                whileHover={{ y: -4 }}
                className="glass-card glow-border p-5 flex items-start gap-4 hover:border-primary/30 transition-colors"
              >
                <div className="p-2.5 rounded-xl glass border border-primary/20 flex-shrink-0">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{cert.title}</h3>
                  <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                  <p className="text-xs text-primary mt-1 font-mono">{cert.date}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="text-center mt-8">
              <a
                href="https://www.linkedin.com/in/vishal-a-s04/details/certifications/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-border/50 hover:border-primary/40 hover:text-primary transition-colors text-sm"
              >
                View all certifications on LinkedIn
                <ExternalLink size={14} />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Certifications;
