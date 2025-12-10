import { GraduationCap, Calendar, Award } from 'lucide-react';

const Education = () => {
  return (
    <section id="education" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Academic <span className="sakura-text-gradient">Summary</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            My educational journey and academic achievements
          </p>

          <div className="sakura-card rounded-2xl p-6 md:p-10">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center">
                  <GraduationCap className="w-10 h-10 text-accent-foreground" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  Amrita School of Engineering
                </h3>
                <p className="text-lg text-primary font-medium mb-3">
                  Amrita Vishwa Vidyapeetham, Coimbatore, India
                </p>

                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={16} />
                    <span>2022 - 2026</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award size={16} />
                    <span className="font-semibold text-foreground">CGPA: 8.29</span>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4 mb-4">
                  <p className="text-lg font-medium">
                    B.Tech in Computer Science and Engineering
                  </p>
                  <p className="text-primary font-semibold">
                    Specialization: Artificial Intelligence
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Key Coursework
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Machine Learning',
                      'Deep Learning',
                      'Natural Language Processing',
                      'Computer Vision',
                      'Data Structures',
                      'Algorithms',
                      'Database Systems',
                      'Cloud Computing',
                    ].map((course) => (
                      <span
                        key={course}
                        className="px-3 py-1 text-sm rounded-full bg-accent text-accent-foreground"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;
