import { Trophy, Medal, Star, Zap } from 'lucide-react';

const achievements = [
  {
    icon: Trophy,
    title: 'Rank 1 - DravidianLangTech',
    organization: 'NAACL',
    description: 'Achieved top rank in political sentiment analysis competition for Tamil language',
  },
  {
    icon: Medal,
    title: 'Runner Up - DigiPay Pro Hackathon',
    organization: 'NCPI & IIT Bombay',
    description: 'Built privacy-preserving fraud detection system with decentralized architecture',
  },
  {
    icon: Star,
    title: 'Top 25 - ThingQbator Cohort 7',
    organization: 'Out of 1,200+ teams',
    description: 'Selected among top startups for AI-powered healthcare solutions',
  },
  {
    icon: Zap,
    title: 'Finalist - Health Hack',
    organization: 'VIT Bhopal & Johns Hopkins',
    description: 'Developed innovative healthcare AI solutions',
  },
  {
    icon: Trophy,
    title: 'Top 50 - IndustriAI',
    organization: 'IIT Madras',
    description: 'Recognized for industrial AI applications and innovations',
  },
  {
    icon: Medal,
    title: 'Non-Academic Achievement Award 2025',
    organization: 'Amrita Vishwa Vidyapeetham',
    description: 'University recognition for outstanding extracurricular achievements',
  },
];

const Achievements = () => {
  return (
    <section id="achievements" className="py-20 md:py-32 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Honors & <span className="sakura-text-gradient">Achievements</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Recognition and awards from competitions and organizations
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.title}
                className="sakura-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300 group"
              >
                <div className="p-3 rounded-xl bg-accent w-fit mb-4 group-hover:bg-primary/10 transition-colors">
                  <achievement.icon className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
                </div>

                <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
                <p className="text-primary text-sm font-medium mb-3">
                  {achievement.organization}
                </p>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Achievements;
