import { motion } from 'framer-motion';
import { BookOpen, FileText, Award, ExternalLink } from 'lucide-react';
import { SectionHeader, Reveal } from './motion/Reveal';

const publications = [
  {
    title: 'Multiclass Political Sentiment Analysis in Tamil X (Twitter) Comments',
    subtitle: 'Leveraging Feature Fusion of IndicBERTv2 and Lexical Representations',
    conference: 'ACL (A* Conference)',
    event: 'Synapse@DravidianLangTech 2025 · macro-F1 0.3773 · pp. 716–720',
    achievement: 'Rank 1 Winner — 1st of 25 teams',
    link: 'https://aclanthology.org/2025.dravidianlangtech-1.122/',
  },
  {
    title: 'Single-Modality Emotion Detection',
    subtitle: 'EEG-Based Feature Engineering and Interpretability',
    conference: 'ICBSII 2025 · IEEE',
    event: 'First author · DREAMER dataset · 98.6 / 96.6 / 95.7 VAD · 9.78 ms',
    achievement: 'Best Paper Award',
    link: 'https://doi.org/10.1109/ICBSII65145.2025.11013139',
  },
  {
    title: 'From Vision to Reasoning',
    subtitle: 'A Bilingual Fine-Tuning Approach for Vision-Language Models on Mathematical Reasoning Tasks',
    conference: 'ICICC',
    status: 'Under Review',
  },
];

const patents = [
  {
    title: 'Nalam AI',
    applicationNo: '202541065699',
    description: 'A personalized medicine compatibility checker that analyzes medical reports to provide insights and recommendations tailored to individual health profiles.',
  },
  {
    title: 'Claire',
    applicationNo: '202541092811',
    description: 'An AI-powered trend analysis system integrating Google Trends, Reddit, e-commerce data, and statistical modeling to provide actionable fashion insights for manufacturers.',
  },
];

const Research = () => {
  return (
    <section id="research" className="relative py-24 md:py-36">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="06 — Research"
          title="Research &"
          highlight="Publications"
          subtitle="Academic contributions and intellectual property"
        />

        <div className="max-w-5xl mx-auto">
          {/* Publications */}
          <div className="mb-16">
            <Reveal>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Publications
              </h3>
            </Reveal>

            <div className="space-y-4">
              {publications.map((pub, index) => (
                <motion.div
                  key={pub.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="glass-card glow-border p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 text-xs rounded-full glass border border-border/50 text-muted-foreground">
                          {pub.conference}
                        </span>
                        {pub.achievement && (
                          <span className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                            <Award size={12} />
                            {pub.achievement}
                          </span>
                        )}
                        {pub.status && (
                          <span className="px-2.5 py-1 text-xs rounded-full bg-accent/10 text-accent border border-accent/20">
                            {pub.status}
                          </span>
                        )}
                      </div>

                      <h4 className="font-semibold text-lg mb-1">{pub.title}</h4>
                      <p className="text-muted-foreground text-sm mb-2">{pub.subtitle}</p>
                      {pub.event && (
                        <p className="text-xs text-muted-foreground/70 font-mono">{pub.event}</p>
                      )}
                    </div>

                    {pub.link && (
                      <a
                        href={pub.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink size={14} />
                        Paper
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Patents */}
          <Reveal>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Patents
            </h3>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {patents.map((patent, index) => (
              <motion.div
                key={patent.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass-card glow-border p-6 hover:border-primary/30 transition-colors"
              >
                <span className="inline-block px-2.5 py-1 text-xs rounded-full glass border border-border/50 text-muted-foreground mb-3 font-mono">
                  App: {patent.applicationNo}
                </span>
                <h4 className="font-semibold text-lg mb-2">{patent.title}</h4>
                <p className="text-sm text-muted-foreground">{patent.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Research;
