'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, Lock, Clock, Award, CheckCircle, ChevronDown, 
  ArrowLeft, ArrowRight, BookOpen, Star, Sparkles, CheckSquare 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { LearnDashboardSkeleton } from '@/components/skeletons/PageSkeletons';
import { useAuth } from '@/context/AuthContext';

export default function LearnCourseDashboard() {
  const { courseSlug } = useParams() as { courseSlug: string };
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=/learn/${courseSlug}`);
      return;
    }

    if (courseSlug) {
      fetchLearningDashboard();
    }
  }, [courseSlug, user, isLoading]);

  const fetchLearningDashboard = async () => {
    try {
      const res = await fetch(`/api/learn/${courseSlug}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        if (json.data.curriculum && json.data.curriculum.length > 0) {
          setOpenModuleId(json.data.curriculum[0].id);
        }
      } else {
        setErrorMsg(json.message || 'Access denied.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to connect to student learning gateway.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <>
        <Navbar />
        <LearnDashboardSkeleton />
        <Footer />
      </>
    );
  }

  if (errorMsg) {
    return (
      <>
        <Navbar />
        <main className="flex-grow pt-32 pb-20 flex items-center justify-center bg-brand-bg min-h-screen text-left">
          <Card hoverEffect={false} className="max-w-md p-6 border border-brand-border-white/10 bg-brand-card-dark text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">Access Restrained</h1>
            <p className="text-xs text-brand-text-muted leading-relaxed">{errorMsg}</p>
            <div className="pt-4 flex flex-col gap-2">
              <Link href="/dashboard?tab=courses">
                <Button variant="primary" size="sm" className="w-full text-xs py-2">
                  My Courses Dashboard
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="secondary" size="sm" className="w-full text-xs py-2">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  if (!data) return null;

  const { course, progressPercentage, curriculum } = data;

  // Find first uncompleted lesson to "Continue Learning"
  let nextLessonLink = `/learn/${courseSlug}`;
  let foundNext = false;

  if (curriculum && curriculum.length > 0) {
    for (const mod of curriculum) {
      if (mod.lessons && mod.lessons.length > 0) {
        for (const les of mod.lessons) {
          if (!les.isCompleted) {
            nextLessonLink = `/learn/${courseSlug}/${les.slug}`;
            foundNext = true;
            break;
          }
        }
      }
      if (foundNext) break;
    }
    // If all completed, route to the first lesson
    if (!foundNext && curriculum[0].lessons && curriculum[0].lessons.length > 0) {
      nextLessonLink = `/learn/${courseSlug}/${curriculum[0].lessons[0].slug}`;
    }
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-32 pb-20 min-h-screen bg-brand-bg text-left relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          
          <Link href="/dashboard?tab=courses" className="inline-flex items-center gap-1.5 text-xs text-brand-text-muted hover:text-white font-bold mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Dashboard
          </Link>

          {/* Header Dashboard panel */}
          <div className="bg-gradient-to-tr from-brand-card to-brand-card-light p-6 border border-brand-border-white/5 rounded-2xl shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex gap-4 items-center self-start sm:self-auto text-left">
              <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 border border-brand-border-white bg-brand-card-dark">
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-brand-accent uppercase tracking-wider">Student portal</span>
                <h1 className="text-base font-bold text-white tracking-tight leading-snug truncate">{course.title}</h1>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="w-24 bg-brand-card-dark h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-accent h-full rounded-full" style={{ width: `${progressPercentage}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-white">{progressPercentage}% Completed</span>
                </div>
              </div>
            </div>
            
            <Link href={nextLessonLink} className="w-full sm:w-auto shrink-0">
              <Button variant="primary" size="md" className="w-full sm:w-auto font-bold py-2 px-6 text-xs flex justify-center gap-1.5" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {progressPercentage === 0 ? 'Start Learning' : 'Continue Learning'}
              </Button>
            </Link>
          </div>

          {/* Curriculum Accordion */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white tracking-tight border-l-2 border-brand-accent pl-2.5 mb-2">
              Course Structure
            </h3>

            <div className="space-y-3">
              {curriculum && curriculum.map((mod: any, idx: number) => {
                const isOpen = openModuleId === mod.id;

                return (
                  <div key={mod.id} className="border border-brand-border-white/10 rounded-xl bg-brand-card-dark/10 overflow-hidden">
                    <button
                      onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-brand-card-light/20 transition-all text-left cursor-pointer"
                    >
                      <div>
                        <span className="text-[9px] font-bold text-brand-accent uppercase tracking-wider">Module {idx + 1}</span>
                        <h4 className="text-xs font-bold text-white mt-0.5">{mod.title}</h4>
                        {mod.description && <p className="text-[10px] text-brand-text-muted mt-0.5">{mod.description}</p>}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-brand-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-brand-border-white/5 border-t border-brand-border-white/5 bg-brand-card/5">
                        {mod.lessons && mod.lessons.map((lesson: any) => (
                          <Link
                            key={lesson.id}
                            href={`/learn/${courseSlug}/${lesson.slug}`}
                            className="p-4 flex items-center justify-between text-xs hover:bg-brand-card-light/10 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.isCompleted ? (
                                <CheckSquare className="w-4 h-4 text-green-400 shrink-0" />
                              ) : (
                                <Play className="w-4 h-4 text-brand-accent group-hover:scale-105 transition-transform shrink-0" />
                              )}
                              <div>
                                <p className="font-medium text-white group-hover:text-brand-accent transition-colors">{lesson.title}</p>
                                <p className="text-[9px] text-brand-text-muted mt-0.5">{lesson.durationMinutes} mins</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-brand-accent opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>Watch Lesson</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
