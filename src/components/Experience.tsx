import { Briefcase, Calendar, CheckCircle2 } from 'lucide-react';

const experiences = [
  {
    title: 'AI Developer',
    company: 'NASSCOM Foundation',
    period: 'July 2024 – February 2025',
    highlights: [
      'Co-led the team and collaborated with mentors and investors to refine app features',
      'Achieved 90%+ positive feedback in 20-user closed beta on Play Store',
      'Built AI-powered Medical App NurtureSync (Funded by Cisco) achieving 95% health-insight accuracy on tablet images & medical reports with drug compatibility analyser',
      'Optimized OCR+NLP pipeline to cut processing time by 35% and built medical community platform',
      'Developed end-to-end real-time voice bot with ASR-LLM-TTS pipeline, speaker verification across 9 Indian languages',
      'Fine-tuned models for chronic disease queries and speech emotion recognition',
    ],
  },
  {
    title: 'Freelance Product Developer',
    company: 'Independent Consultant',
    period: 'July 2025 – Present',
    highlights: [
      'Consulting for 3 major textile manufacturers (SS Garments, Janshi Text, Barath Garments) in Tiruppur',
      'Building multi-source trend analysis platform integrating Google Trends, e-commerce data, and social media for real-time market insights',
      'Developing agentic AI system powered by mathematical reasoning and GRPO RL fine-tuned VQA model with Tamil language support',
      'Creating cloth cutting optimization solutions to minimize fabric waste for mass production',
      'Building B2B wholesale marketplace with multilingual voice assistant',
      'Fine-tuning computer vision models for Indian traditional dress classification and automated product cataloging',
    ],
  },
];

const Experience = () => {
  return (
    <section id="experience" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Work <span className="sakura-text-gradient">Experience</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Professional experience and internships
          </p>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border transform md:-translate-x-px" />

            <div className="space-y-12">
              {experiences.map((exp, index) => (
                <div
                  key={exp.title}
                  className={`relative flex flex-col md:flex-row gap-8 ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background transform -translate-x-1.5 md:-translate-x-2 mt-1" />

                  {/* Content */}
                  <div className={`ml-8 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="sakura-card rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-accent">
                          <Briefcase className="w-4 h-4 text-accent-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar size={14} />
                          {exp.period}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-1">{exp.title}</h3>
                      <p className="text-primary font-medium mb-4">{exp.company}</p>

                      <ul className="space-y-2">
                        {exp.highlights.map((highlight, i) => (
                          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Empty space for alignment */}
                  <div className="hidden md:block md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
