import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Linkedin, Github, MapPin, Send, GraduationCap, FlaskConical, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SectionHeader, Reveal } from './motion/Reveal';

const contactLinks = [
  { icon: Mail, label: 'Email', value: 'vishal.as04@outlook.com', href: 'mailto:vishal.as04@outlook.com' },
  { icon: Linkedin, label: 'LinkedIn', value: 'in/vishal-a-s04', href: 'https://www.linkedin.com/in/vishal-a-s04/' },
  { icon: Github, label: 'GitHub', value: 'Vishal-AS-0407', href: 'https://github.com/Vishal-AS-0407' },
  { icon: GraduationCap, label: 'Google Scholar', value: 'View Publications', href: 'https://scholar.google.com/citations?user=fPK6EDAAAAAJ&hl=en' },
  { icon: FlaskConical, label: 'ResearchGate', value: 'Research Profile', href: 'https://www.researchgate.net/profile/Vishal-A-S-3' },
];

type Status = 'idle' | 'sending' | 'success' | 'error';

const Contact = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setStatus('sending');
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: name.trim() || null,
        email: email.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
      });

      if (error) throw error;

      setStatus('success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error('Contact form error:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section id="contact" className="relative py-24 md:py-36">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="12 — Contact"
          title="Get In"
          highlight="Touch"
          subtitle="I'm always open to discussing new projects, opportunities, or collaborations"
        />

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <Reveal>
            <div className="glass-card glow-border p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6">Let's Connect</h3>
              <div className="space-y-4">
                {contactLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group"
                  >
                    <div className="p-3 rounded-xl glass border border-border/40 group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors">
                      <link.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{link.label}</p>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {link.value}
                      </p>
                    </div>
                  </a>
                ))}

                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl glass border border-border/40">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">Coimbatore, Tamil Nadu, India</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Contact Form */}
          <Reveal delay={0.1}>
            <div className="glass-card glow-border p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Name <span className="text-muted-foreground/50">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl glass border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Email <span className="text-muted-foreground/50">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl glass border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Subject <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Project Collaboration"
                    className="w-full px-4 py-3 rounded-xl glass border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Message <span className="text-primary">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hi Vishal, I'd like to discuss..."
                    className="w-full px-4 py-3 rounded-xl glass border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none text-foreground placeholder:text-muted-foreground/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending' || status === 'success'}
                  className="w-full rounded-xl bg-primary text-primary-foreground font-medium py-3 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <AnimatePresence mode="wait">
                    {status === 'idle' && (
                      <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message
                      </motion.span>
                    )}
                    {status === 'sending' && (
                      <motion.span key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </motion.span>
                    )}
                    {status === 'success' && (
                      <motion.span key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Message Sent!
                      </motion.span>
                    )}
                    {status === 'error' && (
                      <motion.span key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Failed to Send
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
