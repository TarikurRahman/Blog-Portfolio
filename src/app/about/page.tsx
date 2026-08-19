'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Award, Users, Coffee, Flame, Download, Send, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';
import { mockDb } from '@/data/mockDb';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Card from '@/components/Card';
import SectionHeading from '@/components/SectionHeading';
import OptimizedImage from '@/components/OptimizedImage';

export default function AboutPage() {
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [pageMedia, setPageMedia] = useState<any>(null);
  const [education, setEducation] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setSiteSettings(json.data);
          }
        }

        const mediaRes = await fetch('/api/site-media');
        if (mediaRes.ok) {
          const mediaJson = await mediaRes.json();
          if (mediaJson.success) {
            setPageMedia(mediaJson.data);
          }
        }

        const eduRes = await fetch('/api/education');
        if (eduRes.ok) {
          const eduJson = await eduRes.json();
          if (eduJson.success && eduJson.data && eduJson.data.length > 0) {
            setEducation(eduJson.data);
          } else {
            setEducation([
              {
                id: 'ed1',
                degree: 'B.Sc. in Computer Science',
                institution: 'Global University of Technology',
                duration: '2017 - 2021',
                description: 'Specialized in Software Engineering, Database Systems, Web Architectures, and completed key projects on compiler design.'
              },
              {
                id: 'ed2',
                degree: 'Professional Web Design & Optimization Certified',
                institution: 'W3C Academy',
                duration: '2022',
                description: 'Rigorous coursework on advanced CSS, layout responsiveness, network bundle optimization, and Core Web Vitals algorithms.'
              }
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch about data:', err);
      }
    };
    fetchData();
  }, []);

  const aboutTitle = siteSettings?.aboutTitle || "Building Modern Web Experiences";
  const aboutBio = siteSettings?.aboutBio || "I am a frontend developer who loves translating complex ideas into elegant, responsive digital solutions.";
  const aboutDescription = siteSettings?.aboutDescription || "With professional expertise in React, Next.js, Shopify Liquid custom templating, and Bubble.io workflows, I build applications that excel in speed, UX, and SEO. I am dedicated to writing clean, maintainable code that scales.";

  const stats = [
    { id: 1, label: 'Projects Completed', value: '50+', icon: Award, color: 'text-brand-accent' },
    { id: 2, label: 'Happy Clients', value: '40+', icon: Users, color: 'text-blue-400' },
    { id: 3, label: 'Cups of Coffee', value: '1000+', icon: Coffee, color: 'text-amber-500' },
    { id: 4, label: 'Dedication', value: '100%', icon: Flame, color: 'text-red-500' }
  ];

  return (
    <>
      <Navbar />
      
      {/* Bio Banner */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        {/* Glows */}
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left bio text */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <span className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-accent bg-brand-accent/10 border border-brand-accent/20 rounded-full mb-3">
                {siteSettings?.aboutBadge || "About Me"}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-5">
                {aboutTitle}
              </h1>
              <p className="text-sm md:text-base text-white/90 font-medium mb-4 leading-relaxed">
                {aboutBio}
              </p>
              <p className="text-xs md:text-sm text-brand-text-muted mb-8 leading-relaxed">
                {aboutDescription}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button variant="primary" size="md" rightIcon={<Send className="w-4 h-4" />}>
                    Get In Touch
                  </Button>
                </Link>
                <a href="/nafij-resume.pdf" download="Tarikur_Rahman_Resume.pdf">
                  <Button variant="secondary" size="md" leftIcon={<Download className="w-4 h-4" />}>
                    Download CV
                  </Button>
                </a>
              </div>
            </div>

            {/* Right side Visual Widget with Floating icons */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-72 h-80 md:w-80 md:h-96 rounded-3xl overflow-hidden border border-brand-accent/20 bg-brand-card glow-accent p-1 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-card-dark to-brand-card-light pointer-events-none" />
                
                {/* Visual Avatar Placeholder */}
                <OptimizedImage
                  src={pageMedia?.aboutHeroImageUrl || "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&q=80"}
                  alt="Tarikur Creative Office"
                  fill
                  sizes="(max-width: 768px) 100vw, 385px"
                  className="object-cover rounded-2xl opacity-85 hover:scale-103 transition-transform duration-500"
                />
              </div>

              {/* Floating Widget boxes */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                className="absolute top-10 -left-6 bg-brand-card/90 border border-brand-border px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2"
              >
                <Award className="w-4.5 h-4.5 text-brand-accent" />
                <span className="text-xs font-bold text-white whitespace-nowrap">Speed Architect</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-10 -right-6 bg-brand-card/90 border border-brand-border px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2"
              >
                <Flame className="w-4.5 h-4.5 text-orange-500" />
                <span className="text-xs font-bold text-white whitespace-nowrap">Problem Solver</span>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Cards Section */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card hoverEffect key={stat.id} className="text-center p-6 md:p-8 flex flex-col items-center">
                  <div className={`p-3 bg-brand-card-light rounded-2xl mb-4 ${stat.color} border border-brand-border-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{stat.value}</span>
                  <span className="text-xs text-brand-text-muted font-medium mt-1">{stat.label}</span>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Experience & Education Section */}
      <section className="py-20 relative bg-brand-card-dark/45 border-y border-brand-border-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left side: Education */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="p-2 bg-brand-accent/15 border border-brand-accent/25 rounded-xl text-brand-accent">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Education & Certificates</h2>
              </div>

              <div className="space-y-6">
                {education.map((ed) => (
                  <Card hoverEffect key={ed.id} className="relative p-5">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-accent/15 text-brand-accent rounded border border-brand-accent/20 w-fit mb-2 block">
                      {ed.duration}
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-white tracking-tight mb-1">{ed.degree}</h3>
                    <p className="text-[11px] text-brand-text-muted font-medium mb-3">{ed.institution}</p>
                    <p className="text-xs text-brand-text-muted leading-relaxed">{ed.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right side: Experience overview */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="p-2 bg-blue-500/15 border border-blue-500/25 rounded-xl text-blue-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Specialty Industries</h2>
              </div>

              <div className="space-y-6">
                <Card hoverEffect className="p-5">
                  <h3 className="text-sm md:text-base font-bold text-white mb-2">SaaS & Custom Admin Portals</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed mb-3">
                    Configuring database rules, authentication hooks, stripe subscriptions, and admin control panels. Translating complex business actions into automated visual states.
                  </p>
                  <span className="text-[9px] font-bold text-brand-accent">BUBBLE.IO / NEXT.JS / STRIPE</span>
                </Card>

                <Card hoverEffect className="p-5">
                  <h3 className="text-sm md:text-base font-bold text-white mb-2">Commerce Conversion Enhancements</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed mb-3">
                    Building section presets, liquid template schemas, AJAX carts, quick-buys, and loading speed boosters, helping brands sell more products.
                  </p>
                  <span className="text-[9px] font-bold text-brand-accent">SHOPIFY / LIQUID / WEB PERFORMANCE</span>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Mission Banner Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <div className="relative rounded-3xl overflow-hidden border border-brand-border-white p-8 md:p-12 lg:p-16 bg-brand-card">
            {/* Visual background image glow */}
            <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: `url('${pageMedia?.aboutBottomBannerImageUrl || "/bannerimg-DAerhh9n.jpeg"}')` }} />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-brand-card to-brand-card-dark pointer-events-none" />

            <div className="relative z-10 max-w-2xl flex flex-col items-start text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-2">My Core Mission</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                Engineering Digital Tools That Empower Businesses and Accelerate Growth
              </h2>
              <p className="text-xs md:text-sm text-brand-text-muted leading-relaxed mb-8">
                I believe that page layouts should load instantly, interfaces should feel alive and smooth to navigate, and coding codebases must remain modular and clean. My goal is to deliver software that doesn't just meet specifications, but wows users and scales seamlessly.
              </p>
              <Link href="/contact">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Let's Discuss Your Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
