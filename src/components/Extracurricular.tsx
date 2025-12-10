import { Crown, Trophy, Target, Globe, Bike, CircleDot, Disc, Feather } from 'lucide-react';

const sports = [
  { name: 'Skating', icon: Bike },
  { name: 'Badminton', icon: Feather },
  { name: 'Football', icon: Disc },
];

const Extracurricular = () => {
  return (
    <section id="extracurricular" className="py-20 md:py-32 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Beyond <span className="sakura-text-gradient">Academics</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Interests and activities outside of professional work
          </p>

          <div className="sakura-card rounded-2xl p-6 md:p-10 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-accent">
                <Crown className="w-8 h-8 text-accent-foreground" />
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
              <div className="glass-card rounded-xl p-5 text-center">
                <div className="flex justify-center mb-3">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">100+</div>
                <p className="text-sm text-muted-foreground">
                  Tournaments Competed<br />
                  <span className="text-xs">(International, National, State & Domestic)</span>
                </p>
              </div>

              <div className="glass-card rounded-xl p-5 text-center">
                <div className="flex justify-center mb-3">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">50+</div>
                <p className="text-sm text-muted-foreground">
                  Tournament Wins<br />
                  <span className="text-xs">Across various competitions</span>
                </p>
              </div>

              <div className="glass-card rounded-xl p-5 text-center">
                <div className="flex justify-center mb-3">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">Bronze</div>
                <p className="text-sm text-muted-foreground">
                  State Selection<br />
                  <span className="text-xs">Championship Medalist</span>
                </p>
              </div>
            </div>
          </div>

          {/* Other Sports */}
          <div className="sakura-card rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold mb-4">Other Sports I Play</h3>
            <div className="flex flex-wrap gap-4">
              {sports.map((sport) => (
                <div
                  key={sport.name}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/50"
                >
                  <sport.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{sport.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Extracurricular;
