import { motion } from 'framer-motion';
import { Tv, Flower2, ExternalLink } from 'lucide-react';
import { SectionHeader, Reveal } from './motion/Reveal';

const hobbies = [
  {
    icon: Tv,
    title: 'Anime Enthusiast',
    description: 'Love watching anime in my downtime. From action-packed shonen to thought-provoking seinen, anime has been a constant source of entertainment and inspiration.',
    link: {
      label: 'Check my MyAnimeList',
      url: 'https://myanimelist.net/profile/Eren_D_Yeager',
    },
  },
  {
    icon: Flower2,
    title: 'Gardening',
    description: 'I maintain a rooftop garden at home where I grow flowers, vegetables, and fruits. There is something peaceful about nurturing plants and watching them grow — it is a great way to disconnect from screens and connect with nature.',
  },
];

const Hobbies = () => {
  return (
    <section id="hobbies" className="relative py-24 md:py-36">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="11 — Hobbies"
          title="Personal"
          highlight="Interests"
          subtitle="Things I enjoy doing in my free time"
        />

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {hobbies.map((hobby, index) => (
            <motion.div
              key={hobby.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass-card glow-border p-6 md:p-8 group hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl glass border border-primary/20 group-hover:border-primary/40 transition-colors">
                  <hobby.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold">{hobby.title}</h3>
              </div>
              <p className="text-muted-foreground mb-4">{hobby.description}</p>
              {hobby.link && (
                <a
                  href={hobby.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <span>{hobby.link.label}</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hobbies;
