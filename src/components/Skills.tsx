import { 
  Brain, 
  Code, 
  Database, 
  Cloud, 
  Cpu, 
  Layers 
} from 'lucide-react';

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
    <section id="skills" className="py-20 md:py-32 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Technical <span className="sakura-text-gradient">Skills</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Technologies and tools I work with
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillCategories.map((category, index) => (
              <div
                key={category.title}
                className="sakura-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-accent">
                    <category.icon className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">{category.title}</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 text-sm rounded-lg bg-secondary/50 text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
