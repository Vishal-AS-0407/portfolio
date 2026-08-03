import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ExternalLink, Github, Sparkles, ChevronRight } from 'lucide-react';
import { SectionHeader, Reveal } from './motion/Reveal';

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
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section id="projects" className="relative py-24 md:py-36">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="05 — Projects"
          title="Featured"
          highlight="Projects"
          subtitle="A selection of projects showcasing my work in AI and machine learning"
        />

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
              onClick={() => setSelected(index)}
              className={`glass-card glow-border p-6 flex flex-col cursor-pointer group hover:border-primary/30 transition-colors ${
                project.featured ? 'ring-1 ring-primary/20' : ''
              }`}
            >
              {project.featured && (
                <div className="flex items-center gap-1 text-xs text-primary font-medium mb-3">
                  <Sparkles size={12} />
                  Featured Project
                </div>
              )}

              <h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all">
                {project.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent border border-accent/20"
                  >
                    {highlight}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 text-xs rounded glass border border-border/40 text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex gap-3 mt-auto pt-4 border-t border-border/30">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
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
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink size={16} />
                    Demo
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong glow-border rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  {projects[selected].featured && (
                    <div className="flex items-center gap-1 text-xs text-primary font-medium mb-2">
                      <Sparkles size={12} />
                      Featured Project
                    </div>
                  )}
                  <h3 className="text-2xl font-bold">{projects[selected].title}</h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 rounded-full glass hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronRight size={20} className="rotate-45" />
                </button>
              </div>

              <p className="text-muted-foreground mb-6">{projects[selected].description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {projects[selected].highlights.map((h) => (
                  <span key={h} className="px-3 py-1 text-xs rounded-full bg-accent/10 text-accent border border-accent/20">
                    {h}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {projects[selected].tech.map((tech) => (
                  <span key={tech} className="px-2.5 py-1 text-xs rounded glass border border-border/40 text-muted-foreground">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex gap-4">
                {projects[selected].github && (
                  <a
                    href={projects[selected].github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-border/50 hover:border-primary/40 hover:text-primary transition-colors text-sm"
                  >
                    <Github size={16} />
                    View Code
                  </a>
                )}
                {projects[selected].link && (
                  <a
                    href={projects[selected].link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink size={16} />
                    Live Demo
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;
