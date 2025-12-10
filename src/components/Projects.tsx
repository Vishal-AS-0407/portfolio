import { ExternalLink, Github, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const projects = [
  {
    title: 'VEGA',
    description: 'Personalized career guidance system using Firecrawl + Serper for job aggregation, and Multi Agentic RAG pipelines with Groq for bias-free, context-aware guidance. Features resume builder with 96% ATS pass rate.',
    tech: ['LangChain', 'CrewAI', 'Groq', 'Firecrawl', 'MCP', 'Selenium'],
    highlights: ['96% ATS pass rate', 'Multi-agent memory architecture', 'Personalized roadmaps'],
    link: '#',
    github: '#',
    featured: true,
  },
  {
    title: 'Decentralized Fraud Detection',
    description: 'Privacy-preserving fraud detection system for NCPI using Federated Learning and Homomorphic Encryption. Includes VQA-based customer care chatbot with multilingual voice support.',
    tech: ['PyTorch', 'Scikit-learn', 'CKKS', 'Federated Learning'],
    highlights: ['99% accuracy', '3ms inference time', 'Privacy-preserving'],
    github: 'https://github.com/Vishal-AS-0407',
    featured: true,
  },
  {
    title: 'Qubit - Green Finance System',
    description: 'Multi-agent system analyzing project PDFs, supply chain, climate, and economic data for ESG metrics. Novel 15×3 SDG Impact Matrix covering 15 UN SDGs.',
    tech: ['Serper', 'Agentic AI', 'Constraint Optimization'],
    highlights: ['15 UN SDGs coverage', 'ESG evaluation', 'Investment framework'],
    github: 'https://github.com/Vishal-AS-0407',
    featured: true,
  },
  {
    title: 'Memora',
    description: 'Domain-wise hierarchical memory for LLMs that tags conversations by topic and retrieves relevant slices. Achieved 14.3% → 1.4% hallucination reduction.',
    tech: ['LlamaIndex', 'Pinecone', 'Redis', 'Semantic Caching'],
    highlights: ['91% hallucination reduction', '60% token reduction', '35% latency cut'],
    github: 'https://github.com/Vishal-AS-0407',
  },
  {
    title: 'Why My Baby is Crying',
    description: 'Real-time infant care assistant detecting cry reasons using ensemble signal-processing model. Tracks cry patterns, feeding times, and sleep cycles.',
    tech: ['Keras', 'Librosa', 'Scipy', 'Streamlit', 'Gemini', 'MLOps'],
    highlights: ['98% accuracy', '0.5ms inference', 'LIME/SHAP explainability'],
    link: '#',
  },
  {
    title: 'Mental Health Analysis',
    description: 'Multimodal EEG analysis system combining VAD and ERP for real-time brain wave interpretation with explainable cognitive state tracking.',
    tech: ['Signal Processing', 'EEG', 'Transformers', 'RAG', 'GPT'],
    highlights: ['97% accuracy', '9.7ms inference', 'Dual-agent LLM pipeline'],
    github: 'https://github.com/Vishal-AS-0407',
  },
  {
    title: 'WISP',
    description: 'GenAI-driven Wildlife Species Identification + Explainability pipeline for rare species detection from camera-trap images. Multi-agent system for threat maps.',
    tech: ['OpenCV', 'Captum', 'Timm', 'Docker', 'CrewAI'],
    highlights: ['95% test accuracy', '30% inference optimization', 'Auto PDF reports'],
    github: 'https://github.com/Vishal-AS-0407',
  },
];

const Projects = () => {
  return (
    <section id="projects" className="py-20 md:py-32 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Featured <span className="sakura-text-gradient">Projects</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            A selection of projects showcasing my work in AI and machine learning
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div
                key={project.title}
                className={`sakura-card rounded-2xl p-6 flex flex-col hover:scale-[1.02] transition-transform duration-300 ${
                  project.featured ? 'ring-2 ring-primary/20' : ''
                }`}
              >
                {project.featured && (
                  <div className="flex items-center gap-1 text-xs text-primary font-medium mb-3">
                    <Sparkles size={12} />
                    Featured Project
                  </div>
                )}

                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.highlights.map((highlight) => (
                    <Badge
                      key={highlight}
                      variant="secondary"
                      className="text-xs bg-accent text-accent-foreground"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3 mt-auto pt-4 border-t border-border/50">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github size={16} />
                      Code
                    </a>
                  )}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink size={16} />
                      Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
