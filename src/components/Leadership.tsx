import { Users, Calendar, Crown } from 'lucide-react';

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
    <section id="leadership" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Leadership <span className="sakura-text-gradient">Roles</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Positions of responsibility and organizational involvement
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {roles.map((role, index) => (
              <div
                key={role.title}
                className="sakura-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-accent">
                    <Crown className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar size={14} />
                    {role.period}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-1">{role.title}</h3>
                <p className="text-primary font-medium mb-3">{role.organization}</p>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leadership;
