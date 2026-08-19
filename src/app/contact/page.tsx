'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, Send, Github, Linkedin, Twitter, Facebook } from 'lucide-react';
import { mockDb } from '@/data/mockDb';
import { useToast } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Card from '@/components/Card';
import SectionHeading from '@/components/SectionHeading';

const defaults = {
  title: "Let's Build Something Amazing",
  subtitle: "Fill out the contact form or reach out through social channels. I usually respond within 12 hours.",
  introText: "Have a project in mind, need a developer, or want to discuss architectures? Drop me a message and I will reply as soon as possible.",
  email: "contact@tarikur.dev",
  phone: "+880 1700 000000",
  location: "Dhaka, Bangladesh",
  availabilityText: "Open for Freelance & Contracts",
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  twitterUrl: "https://twitter.com",
  formNameLabel: "Your Name",
  formNamePlaceholder: "John Doe",
  formEmailLabel: "Email Address",
  formEmailPlaceholder: "you@example.com",
  formSubjectLabel: "Subject",
  formSubjectPlaceholder: "Project Inquiry / Job Opportunity",
  formMessageLabel: "Your Message",
  formMessagePlaceholder: "Describe your project goals or detail your query here...",
  successMessage: "Your message has been sent successfully!",
};

export default function ContactPage() {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [settings, setSettings] = useState<any>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/contact/settings');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setSettings(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch contact settings:', err);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const data = settings || defaults;

  const contactInfo = [
    { id: 1, label: 'Email', value: data.email, icon: Mail, color: 'text-brand-accent' },
    { id: 2, label: 'Phone', value: data.phone, icon: Phone, color: 'text-blue-400' },
    { id: 3, label: 'Location', value: data.location, icon: MapPin, color: 'text-green-400' },
    { id: 4, label: 'Availability', value: data.availabilityText, icon: Calendar, color: 'text-amber-500' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      showToast('Please fill out all the fields.', 'error');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast(data.successMessage || 'Your message has been sent successfully!', 'success');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        showToast(json.message || 'Failed to submit message.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to submit message.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <SectionHeading
            badge="Get In Touch"
            title={data.title}
            subtitle={data.subtitle}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Contact details */}
            <div className="lg:col-span-5 space-y-4">
              {data.introText && (
                <Card hoverEffect={false} className="p-5 border border-brand-border-white bg-brand-card-dark/20 text-xs text-brand-text-muted leading-relaxed">
                  {data.introText}
                </Card>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {contactInfo.map((info, idx) => {
                  const Icon = info.icon;
                  return (
                    <motion.div
                      key={info.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card hoverEffect className="p-5 flex items-center gap-4 border border-brand-border-white">
                        <div className={`p-3 bg-brand-card-light rounded-xl ${info.color} border border-brand-border-white`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-brand-text-muted leading-none font-medium mb-1.5">{info.label}</p>
                          <p className="text-xs font-bold text-white tracking-tight">{info.value}</p>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Social boxes */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card hoverEffect className="p-5 flex flex-col gap-4 border border-brand-border-white">
                  <h4 className="text-xs font-bold text-white tracking-tight">Connect with me</h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    <a
                      href={data.githubUrl || "https://github.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-brand-card-light border border-brand-border-white hover:border-brand-accent text-brand-text-muted hover:text-brand-accent rounded-xl transition-all flex items-center gap-2 text-xs font-semibold"
                    >
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                    <a
                      href={data.linkedinUrl || "https://linkedin.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-brand-card-light border border-brand-border-white hover:border-brand-accent text-brand-text-muted hover:text-brand-accent rounded-xl transition-all flex items-center gap-2 text-xs font-semibold"
                    >
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </a>
                    <a
                      href={data.twitterUrl || "https://twitter.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-brand-card-light border border-brand-border-white hover:border-brand-accent text-brand-text-muted hover:text-brand-accent rounded-xl transition-all flex items-center gap-2 text-xs font-semibold"
                    >
                      <Twitter className="w-4 h-4" /> Twitter
                    </a>
                    <a
                      href="https://www.facebook.com/tarikurrahman/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-brand-card-light border border-brand-border-white hover:border-brand-accent text-brand-text-muted hover:text-brand-accent rounded-xl transition-all flex items-center gap-2 text-xs font-semibold"
                    >
                      <Facebook className="w-4 h-4" /> Facebook
                    </a>
                    <a
                      href="https://wa.me/8801633003462"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-brand-card-light border border-brand-border-white hover:border-brand-accent text-brand-text-muted hover:text-brand-accent rounded-xl transition-all flex items-center gap-2 text-xs font-semibold"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4">
                        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                      </svg> WhatsApp
                    </a>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Right Column: Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-7"
            >
              <Card hoverEffect={false} className="p-6 md:p-8 border border-brand-border">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/90">{data.formNameLabel}</label>
                      <input
                        type="text"
                        placeholder={data.formNamePlaceholder}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                        required
                      />
                    </div>
                    {/* Email input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/90">{data.formEmailLabel}</label>
                      <input
                        type="email"
                        placeholder={data.formEmailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Subject input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/90">{data.formSubjectLabel}</label>
                    <input
                      type="text"
                      placeholder={data.formSubjectPlaceholder}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                      required
                    />
                  </div>

                  {/* Message input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/90">{data.formMessageLabel}</label>
                    <textarea
                      placeholder={data.formMessagePlaceholder}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-bold py-3 text-xs tracking-wide uppercase"
                    isLoading={isSubmitting}
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    Send Message
                  </Button>
                </form>
              </Card>
            </motion.div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
