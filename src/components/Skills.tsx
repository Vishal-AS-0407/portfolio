import { motion } from 'framer-motion';
import { Brain, Code, Database, Cloud, Layers, Cpu } from 'lucide-react';
import { SectionHeader, Reveal } from './motion/Reveal';

const skillCategories = [
  {
    title: 'AI & Machine Learning',
    icon: Brain,
    skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenCV', 'Hugging Face', 'LangChain', 'CrewAI'],
  },
  {
    title: 'Programming Languages',
    icon: Code,
    skills: ['Python', 'Java', 'SQL', 'JavaScript', 'TypeScript'],
  },
  {
    title: 'Databases',
    icon: Database,
    skills: ['MongoDB', 'MySQL', 'PostgreSQL', 'Firebase', 'Neo4j', 'Pinecone', 'Redis'],
  },
  {
    title: 'Cloud & DevOps',
    icon: Cloud,
    skills: ['Azure', 'Docker', 'Git', 'GitHub Actions', 'MLOps'],
  },
  {
    title: 'Frameworks',
    icon: Layers,
    skills: ['React', 'FastAPI', 'Streamlit', 'Flutter', 'LlamaIndex'],
  },
  {
    title: 'Areas of Interest',
    icon: Cpu,
    skills: ['Deep Learning', 'LLMs', 'GenAI', 'Computer Vision', 'Signal Processing', 'Agentic Systems'],
  },
];

const Skills = () => {
  return (
    <section id="skills" className="relative py-24 md:py-36">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="03 — Skills"
          title="Technical"
          highlight="Skills"
          subtitle="Technologies and tools I work with"
        />

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="glass-card glow-border p-6 group hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-2xl glass-strong border border-primary/20 group-hover:border-primary/40 transition-colors">
                  <category.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-semibold text-lg">{category.title}</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, i) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 + i * 0.03 }}
                    className="px-3 py-1.5 text-sm rounded-full glass border border-border/40 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all cursor-default"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
