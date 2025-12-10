const About = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            About <span className="sakura-text-gradient">Me</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Building AI systems that solve real-world problems
          </p>

          <div className="glass-card rounded-2xl p-6 md:p-10">
            <p className="text-lg leading-relaxed text-foreground/90 mb-6">
              I build AI systems that solve real-world problems—not just classroom ones.
              From healthcare automation to speech and language intelligence, I enjoy taking
              ideas from research papers to working products.
            </p>
            <p className="text-lg leading-relaxed text-foreground/90">
              My work spans machine learning, deep learning, NLP, and scalable backend systems.
              I focus heavily on data quality, model explainability, and deployment-ready solutions
              rather than just accuracy numbers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
