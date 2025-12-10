import { Award, ExternalLink } from 'lucide-react';

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
    date: 'Dex 2025',
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
    <section id="certifications" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="sakura-text-gradient">Certifications</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Professional certifications and courses completed
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {certifications.map((cert, index) => (
              <div
                key={cert.title}
                className="sakura-card rounded-xl p-5 flex items-start gap-4"
              >
                <div className="p-2 rounded-lg bg-accent flex-shrink-0">
                  <Award className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{cert.title}</h3>
                  <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                  <p className="text-xs text-primary mt-1">{cert.date}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.linkedin.com/in/vishal-a-s04/details/certifications/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <span>View all certifications on LinkedIn</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Certifications;
