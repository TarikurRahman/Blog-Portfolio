'use client';

import React, { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { mockDb } from '@/data/mockDb';
import { Project } from '@/data/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { ProjectDetailSkeleton } from '@/components/skeletons/PageSkeletons';
import OptimizedImage from '@/components/OptimizedImage';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const res = await fetch(`/api/projects/${id}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              setProject(json.data);
            }
          }
        } catch (err) {
          console.error('Failed to fetch project details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <ProjectDetailSkeleton />
        <Footer />
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navbar />
        <main className="flex-grow pt-32 pb-20 flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
          <p className="text-sm text-brand-text-muted mb-6">The project record you are searching for does not exist in local storage database.</p>
          <Link href="/projects">
            <Button variant="primary" size="md">
              Back to Projects
            </Button>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-32 pb-20 relative min-h-screen">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[95px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 md:px-8 relative z-10">
          
          {/* Back button */}
          <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-accent hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Projects Listing
          </Link>

          {/* Project Header section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-12">
            
            {/* Left title and badges */}
            <div className="md:col-span-8">
              <span className="px-3 py-1 bg-brand-accent/15 border border-brand-accent/25 rounded-full text-xs font-bold text-brand-accent uppercase tracking-wider mb-4 inline-block">
                {project.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
                {project.title}
              </h1>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-semibold bg-brand-card hover:bg-brand-card-light text-brand-text-muted px-2.5 py-1 rounded border border-brand-border-white">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right links and status */}
            <div className="md:col-span-4 bg-brand-card border border-brand-border-white p-5 rounded-2xl w-full flex flex-col gap-4">
              <div>
                <p className="text-[10px] text-brand-text-muted font-bold leading-none mb-1">PROJECT STATUS</p>
                <span className={`text-xs font-extrabold ${project.status === 'Completed' ? 'text-green-400' : 'text-amber-500'}`}>
                  {project.status}
                </span>
              </div>

              <div className="flex gap-2">
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="primary" size="sm" className="w-full text-xs gap-1.5 font-bold">
                    Live Demo <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-brand-card-light border border-brand-border-white hover:border-brand-accent rounded-xl text-brand-text-muted hover:text-brand-accent transition-all">
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Project Main visual banner */}
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-brand-border-white mb-12 shadow-2xl">
            <OptimizedImage
              src={project.image}
              alt={project.title}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover object-center"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            
            {/* Left side details */}
            <div className="md:col-span-7 space-y-8">
              
              {/* Overview block */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 tracking-tight border-l-3 border-brand-accent pl-3">
                  Project Overview
                </h2>
                <p className="text-xs md:text-sm text-brand-text-muted leading-relaxed">
                  {project.longDescription}
                </p>
              </div>

              {/* Challenge vs Solution grid */}
              <div className="grid grid-cols-1 gap-6">
                
                {/* Challenge */}
                <Card hoverEffect={false} className="border-l-4 border-l-red-500! p-5 bg-red-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
                    <h3 className="text-sm font-bold text-white">The Challenge</h3>
                  </div>
                  <p className="text-xs text-brand-text-muted leading-relaxed">{project.challenge}</p>
                </Card>

                {/* Solution */}
                <Card hoverEffect={false} className="border-l-4 border-l-green-500! p-5 bg-green-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4.5 h-4.5 text-green-400" />
                    <h3 className="text-sm font-bold text-white">The Solution</h3>
                  </div>
                  <p className="text-xs text-brand-text-muted leading-relaxed">{project.solution}</p>
                </Card>

              </div>

            </div>

            {/* Right side Key Features checklist */}
            <div className="md:col-span-5">
              <Card hoverEffect={false} className="p-6 border border-brand-border-white bg-brand-card-dark">
                <h3 className="text-base font-bold text-white mb-5 tracking-tight border-b border-brand-border-white pb-3">
                  Key Features
                </h3>
                <ul className="space-y-4">
                  {project.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-white/95">
                      <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                      <span className="leading-normal">{feat}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
