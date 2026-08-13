import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Zap, Rocket } from 'lucide-react';
import { SectionHeader, Reveal } from './motion/Reveal';

const achievements = [
  {
    icon: Rocket,
    title: 'Top 500 — HackMIT 2025',
    organization: 'MIT',
    description: 'Selected globally as one of 500 students to participate',
  },
  {
    icon: Trophy,
    title: 'Rank 1 — DravidianLangTech',
    organization: 'NAACL',
    description: 'Top of 25 teams in the Tamil political sentiment analysis shared task',
  },
  {
    icon: Medal,
    title: 'Runner Up — DigiPay Pro Hackathon',
    organization: 'NCPI & IIT Bombay',
    description: 'Built privacy-preserving fraud detection system with decentralized architecture',
  },
  {
    icon: Star,
    title: 'Top 25 — ThingQbator Cohort 7',
    organization: 'Out of 1,200+ teams',
    description: 'Selected among top startups for AI-powered healthcare solutions',
  },
  {
    icon: Zap,
    title: 'Finalist — Health Hack',
    organization: 'VIT Bhopal & Johns Hopkins',
    description: 'Developed innovative healthcare AI solutions',
  },
  {
    icon: Trophy,
    title: 'Top 50 — IndustriAI',
    organization: 'IIT Madras',
    description: 'Recognized for industrial AI applications and innovations',
  },
  {
    icon: Medal,
    title: 'Perfect 10.0 SGPA + Non-Academic Achievement Award 2025',
    organization: 'Amrita Vishwa Vidyapeetham',
    description: 'Secured a 10.0/10.0 SGPA and university recognition for extracurricular achievement',
  },
];

const Achievements = () => {
  return (
    <section id="achievements" className="relative py-24 md:py-36">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="07 — Awards"
          title="Honors &"
          highlight="Achievements"
          subtitle="Recognition and awards from competitions and organizations"
        />

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="glass-card glow-border p-6 group hover:border-primary/30 transition-colors"
            >
              <div className="p-3 rounded-xl glass border border-primary/20 w-fit mb-4 group-hover:border-primary/40 transition-colors">
                <achievement.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              </div>

              <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
              <p className="text-primary text-sm font-medium mb-3">{achievement.organization}</p>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
