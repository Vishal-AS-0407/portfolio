import { Tv, Flower2, ExternalLink } from 'lucide-react';

const Hobbies = () => {
  return (
    <section id="hobbies" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            My <span className="sakura-text-gradient">Hobbies</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Things I enjoy doing in my free time
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Anime */}
            <div className="sakura-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-accent">
                  <Tv className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold">Anime Enthusiast</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Love watching anime in my downtime. From action-packed shonen to thought-provoking
                seinen, anime has been a constant source of entertainment and inspiration.
              </p>
              <a
                href="https://myanimelist.net/profile/Eren_D_Yeager"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <span>Check my MyAnimeList</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Gardening */}
            <div className="sakura-card rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-accent">
                  <Flower2 className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold">Gardening</h3>
              </div>
              <p className="text-muted-foreground">
                I maintain a rooftop garden at home where I grow flowers, vegetables, and fruits.
                There's something peaceful about nurturing plants and watching them grow it's a
                great way to disconnect from screens and connect with nature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hobbies;
