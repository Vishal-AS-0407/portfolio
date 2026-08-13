import { motion } from 'framer-motion';
import { Crown, Trophy, Target, Globe, Bike, Disc, Feather } from 'lucide-react';
import { SectionHeader, Reveal } from './motion/Reveal';

const sports = [
  { name: 'Skating', icon: Bike },
  { name: 'Badminton', icon: Feather },
  { name: 'Football', icon: Disc },
];

const stats = [
  { icon: Globe, value: '100+', label: 'Tournaments Competed', sub: 'International, National, State & Domestic' },
  { icon: Target, value: '50+', label: 'Tournament Wins', sub: 'Across various competitions' },
  { icon: Trophy, value: 'Bronze', label: 'State Selection', sub: 'Championship Medalist' },
];

const Extracurricular = () => {
  return (
    <section id="extracurricular" className="relative py-24 md:py-36">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="10 — Extracurricular"
          title="Beyond"
          highlight="Academics"
          subtitle="Interests and activities outside of professional work"
        />

        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="glass-card glow-border p-8 md:p-10 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl glass border border-accent/20">
                  <Crown className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Chess</h3>
                  <p className="text-primary font-medium">International FIDE-Rated Player</p>
                </div>
              </div>

              <p className="text-lg text-muted-foreground mb-8">
                A passionate chess player with extensive competitive experience at multiple levels.
                Chess has been instrumental in developing my strategic thinking and problem-solving abilities.
              </p>

              <div className="grid sm:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-xl p-5 text-center group hover:border-primary/30 transition-colors"
                  >
                    <stat.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                    <p className="text-sm text-foreground/80">{stat.label}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{stat.sub}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="glass-card p-6 md:p-8">
              <h3 className="text-xl font-bold mb-4">Other Sports I Play</h3>
              <div className="flex flex-wrap gap-4">
                {sports.map((sport) => (
                  <div
                    key={sport.name}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-border/40 hover:border-primary/30 transition-colors"
                  >
                    <sport.icon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{sport.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Extracurricular;
