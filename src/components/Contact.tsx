import { Mail, Linkedin, Github, MapPin, Send, GraduationCap, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Contact = () => {
  return (
    <section id="contact" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Get In <span className="sakura-text-gradient">Touch</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            I'm always open to discussing new projects, opportunities, or collaborations
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="sakura-card rounded-2xl p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6">Let's Connect</h3>

              <div className="space-y-6">
                <a
                  href="mailto:vishal.as04@outlook.com"
                  className="flex items-center gap-4 group"
                >
                  <div className="p-3 rounded-xl bg-accent group-hover:bg-primary/10 transition-colors">
                    <Mail className="w-5 h-5 text-accent-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      vishal.as04@outlook.com
                    </p>
                  </div>
                </a>

                <a
                  href="https://www.linkedin.com/in/vishal-a-s04/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="p-3 rounded-xl bg-accent group-hover:bg-primary/10 transition-colors">
                    <Linkedin className="w-5 h-5 text-accent-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">LinkedIn</p>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      in/vishal-a-s04
                    </p>
                  </div>
                </a>

                <a
                  href="https://github.com/Vishal-AS-0407"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="p-3 rounded-xl bg-accent group-hover:bg-primary/10 transition-colors">
                    <Github className="w-5 h-5 text-accent-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GitHub</p>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      Vishal-AS-0407
                    </p>
                  </div>
                </a>

                <a
                  href="https://scholar.google.com/citations?user=fPK6EDAAAAAJ&hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="p-3 rounded-xl bg-accent group-hover:bg-primary/10 transition-colors">
                    <GraduationCap className="w-5 h-5 text-accent-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Google Scholar</p>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      View Publications
                    </p>
                  </div>
                </a>

                <a
                  href="https://www.researchgate.net/profile/Vishal-A-S-3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="p-3 rounded-xl bg-accent group-hover:bg-primary/10 transition-colors">
                    <FlaskConical className="w-5 h-5 text-accent-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ResearchGate</p>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      Research Profile
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-accent">
                    <MapPin className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">Coimbatore, Tamil Nadu, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Message */}
            <div className="sakura-card rounded-2xl p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6">Send a Message</h3>

              <form
                action="mailto:vishal.as04@outlook.com"
                method="get"
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Project Collaboration"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    name="body"
                    rows={4}
                    placeholder="Hi Vishal, I'd like to discuss..."
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl bg-primary text-primary-foreground hover:opacity-90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
