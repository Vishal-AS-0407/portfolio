import { motion } from 'framer-motion';
import { Crown, Calendar } from 'lucide-react';
import { SectionHeader, Reveal } from './motion/Reveal';

const roles = [
  {
    title: 'Research and Development',
    organization: 'TENSOR Amrita',
    period: 'October 2024 - June 2025',
    description: 'Contributing to AI research initiatives and development projects within the university\'s premier technical club.',
  },
  {
    title: 'Public Relations',
    organization: 'ICEP 2024',
    period: 'December 2023 - February 2024',
    description: 'Managed communications and outreach for the International Conference on Engineering Practices.',
  },
];

const Leadership = () => {
  return (
    <section id="leadership" className="relative py-24 md:py-36">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="09 — Leadership"
          title="Leadership"
          highlight="Roles"
          subtitle="Positions of responsibility and organizational involvement"
        />

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass-card glow-border p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl glass border border-accent/20">
                  <Crown className="w-5 h-5 text-accent" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={14} />
                  {role.period}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-1">{role.title}</h3>
              <p className="text-primary font-medium mb-3">{role.organization}</p>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Leadership;
