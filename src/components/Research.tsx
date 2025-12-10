import { BookOpen, FileText, Award, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const publications = [
  {
    title: 'Multiclass Political Sentiment Analysis in Tamil X (Twitter) Comments',
    subtitle: 'Leveraging Feature Fusion of IndicBERTv2 and Lexical Representations',
    conference: 'ACL (A* Conference)',
    event: 'Synapse@DravidianLangTech 2025',
    type: 'paper',
    achievement: 'Rank 1 Winner',
    link: '#',
  },
  {
    title: 'Single-Modality Emotion Detection',
    subtitle: 'EEG-Based Feature Engineering and Interpretability',
    conference: 'ICBSII',
    type: 'paper',
    achievement: 'Best Paper Award',
    link: '#',
  },
  {
    title: 'From Vision to Reasoning',
    subtitle: 'A Bilingual Fine-Tuning Approach for Vision-Language Models on Mathematical Reasoning Tasks',
    conference: 'ICICC',
    type: 'paper',
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
    <section id="research" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Research & <span className="sakura-text-gradient">Publications</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Academic contributions and intellectual property
          </p>

          {/* Publications */}
          <div className="mb-16">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Publications
            </h3>

            <div className="space-y-4">
              {publications.map((pub, index) => (
                <div
                  key={pub.title}
                  className="sakura-card rounded-xl p-6 hover:scale-[1.01] transition-transform"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {pub.conference}
                        </Badge>
                        {pub.achievement && (
                          <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                            <Award size={12} className="mr-1" />
                            {pub.achievement}
                          </Badge>
                        )}
                        {pub.status && (
                          <Badge variant="secondary" className="text-xs">
                            {pub.status}
                          </Badge>
                        )}
                      </div>

                      <h4 className="font-semibold text-lg mb-1">{pub.title}</h4>
                      <p className="text-muted-foreground text-sm mb-2">{pub.subtitle}</p>
                      {pub.event && (
                        <p className="text-xs text-muted-foreground">{pub.event}</p>
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
                </div>
              ))}
            </div>
          </div>

          {/* Patents */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Patents
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {patents.map((patent) => (
                <div
                  key={patent.title}
                  className="sakura-card rounded-xl p-6"
                >
                  <Badge variant="outline" className="text-xs mb-3">
                    Application No: {patent.applicationNo}
                  </Badge>
                  <h4 className="font-semibold text-lg mb-2">{patent.title}</h4>
                  <p className="text-sm text-muted-foreground">{patent.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Research;
