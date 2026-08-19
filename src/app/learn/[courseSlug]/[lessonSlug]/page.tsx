'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, Lock, Clock, ChevronDown, CheckSquare, Square,
  ArrowLeft, ArrowRight, BookOpen, CheckCircle, FileText, ExternalLink 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { LessonPlayerSkeleton } from '@/components/skeletons/PageSkeletons';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LearnLessonPage() {
  const { courseSlug, lessonSlug } = useParams() as { courseSlug: string; lessonSlug: string };
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // DB States
  const [lesson, setLesson] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  
  // Loading & Error states
  const [loadingLesson, setLoadingLesson] = useState(true);
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [progressToggling, setProgressToggling] = useState(false);

  // Sidebar controls
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=/learn/${courseSlug}/${lessonSlug}`);
      return;
    }

    if (courseSlug && lessonSlug) {
      fetchLessonDetails();
    }
  }, [courseSlug, lessonSlug, user, isLoading]);

  useEffect(() => {
    if (courseSlug) {
      fetchCurriculum();
    }
  }, [courseSlug, lessonSlug]);

  const fetchLessonDetails = async () => {
    setLoadingLesson(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/learn/${courseSlug}/${lessonSlug}`);
      const json = await res.json();
      if (json.success) {
        setLesson(json.data);
      } else {
        setErrorMsg(json.message || 'Access to premium lesson denied.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to connect to lesson player server.');
    } finally {
      setLoadingLesson(false);
    }
  };

  const fetchCurriculum = async () => {
    setLoadingCurriculum(true);
    try {
      const res = await fetch(`/api/learn/${courseSlug}`);
      const json = await res.json();
      if (json.success) {
        setCurriculum(json.data.curriculum || []);
        setCourse(json.data.course);
        setCompletedLessonIds(json.data.completedLessonIds || []);
        
        // Find module ID of current lesson to keep it open in sidebar
        const currentLesson = (json.data.curriculum || [])
          .flatMap((m: any) => m.lessons.map((l: any) => ({ moduleId: m.id, ...l })))
          .find((l: any) => l.slug === lessonSlug);
        if (currentLesson) {
          setOpenModuleId(currentLesson.moduleId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCurriculum(false);
    }
  };

  const toggleLessonProgress = async () => {
    if (!lesson || progressToggling) return;

    setProgressToggling(true);
    const targetStatus = !lesson.isCompleted;

    try {
      const res = await fetch('/api/lesson-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          courseId: course.id,
          isCompleted: targetStatus
        })
      });
      const json = await res.json();
      if (json.success) {
        setLesson((prev: any) => ({ ...prev, isCompleted: targetStatus }));
        if (targetStatus) {
          setCompletedLessonIds((prev) => [...prev, lesson.id]);
          showToast('Lesson marked as completed!', 'success');
        } else {
          setCompletedLessonIds((prev) => prev.filter(id => id !== lesson.id));
          showToast('Lesson marked as incomplete', 'info');
        }
      } else {
        showToast(json.message || 'Failed to update progress', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProgressToggling(false);
    }
  };

  if (isLoading || loadingLesson || loadingCurriculum) {
    return (
      <>
        <Navbar />
        <LessonPlayerSkeleton />
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
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">Premium Access Lock</h1>
            <p className="text-xs text-brand-text-muted leading-relaxed">{errorMsg}</p>
            <div className="pt-4 flex flex-col gap-2">
              <Link href={`/courses/${courseSlug}`}>
                <Button variant="primary" size="sm" className="w-full text-xs py-2">
                  Buy / Enroll Course
                </Button>
              </Link>
              <Link href="/dashboard?tab=courses">
                <Button variant="secondary" size="sm" className="w-full text-xs py-2">
                  My Courses
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  if (!lesson || !course) return null;

  // Flatten lessons list to find next/prev slugs
  const flatLessons = curriculum.flatMap(m => m.lessons || []);
  const currentIdx = flatLessons.findIndex(l => l.slug === lessonSlug);
  const prevLesson = currentIdx > 0 ? flatLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < flatLessons.length - 1 ? flatLessons[currentIdx + 1] : null;

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-28 pb-20 min-h-screen bg-brand-bg text-left relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          
          {/* Breadcrumb nav links */}
          <div className="flex items-center gap-2 text-[10px] text-brand-text-muted font-bold uppercase tracking-wider mb-5">
            <Link href="/dashboard?tab=courses" className="hover:text-white">Dashboard</Link>
            <span>/</span>
            <Link href={`/learn/${courseSlug}`} className="hover:text-white truncate max-w-[120px]">{course.title}</Link>
            <span>/</span>
            <span className="text-white truncate max-w-[120px]">{lesson.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Player & Meta details */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Secure Embed Player Container */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-brand-border-white shadow-2xl relative">
                {lesson.youtubeVideoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}?rel=0&modestbranding=1&showinfo=0&controls=1&iv_load_policy=3&disablekb=1`}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-brand-text-muted text-xs">
                    <Lock className="w-8 h-8 text-brand-text-muted mb-3" />
                    <span>Failed to retrieve stream token. Reload page.</span>
                  </div>
                )}
              </div>

              {/* Action Control buttons bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-brand-card/45 p-4 rounded-xl border border-brand-border-white/5">
                <div className="flex gap-2">
                  {prevLesson ? (
                    <Link href={`/learn/${courseSlug}/${prevLesson.slug}`}>
                      <Button variant="secondary" size="sm" className="py-1 px-3 text-[10px] gap-1 flex items-center">
                        <ArrowLeft className="w-3.5 h-3.5" /> Previous
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="secondary" size="sm" className="py-1 px-3 text-[10px] gap-1 flex items-center opacity-40 cursor-not-allowed" disabled>
                      <ArrowLeft className="w-3.5 h-3.5" /> Previous
                    </Button>
                  )}

                  {nextLesson ? (
                    <Link href={`/learn/${courseSlug}/${nextLesson.slug}`}>
                      <Button variant="secondary" size="sm" className="py-1 px-3 text-[10px] gap-1 flex items-center">
                        Next <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/learn/${courseSlug}`}>
                      <Button variant="outline" size="sm" className="py-1 px-3 text-[10px] gap-1 flex items-center border-brand-accent/20 text-brand-accent hover:bg-brand-accent/10">
                        Finish Course <CheckCircle className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>

                <Button
                  onClick={toggleLessonProgress}
                  variant={lesson.isCompleted ? "outline" : "primary"}
                  size="sm"
                  className={`py-1 px-4 text-[10px] gap-1.5 font-bold ${
                    lesson.isCompleted ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : ''
                  }`}
                  isLoading={progressToggling}
                >
                  {lesson.isCompleted ? (
                    <>
                      <CheckSquare className="w-4 h-4" /> Lesson Completed
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4" /> Mark as Complete
                    </>
                  )}
                </Button>
              </div>

              {/* Title & Description Info */}
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-white tracking-tight leading-snug">
                    {lesson.title}
                  </h1>
                  {lesson.isPreview && (
                    <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 font-extrabold text-[8px] uppercase tracking-wider rounded">
                      Preview Lesson
                    </span>
                  )}
                </div>
                {lesson.description && (
                  <p className="text-xs text-brand-text-muted leading-relaxed whitespace-pre-wrap">
                    {lesson.description}
                  </p>
                )}
              </div>

              {/* Resources download links block */}
              {lesson.resources && (
                <div className="space-y-3 pt-6 border-t border-brand-border-white/10 text-left">
                  <h3 className="text-xs font-bold text-white tracking-tight uppercase flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-accent" /> Lesson Resources
                  </h3>
                  <div className="p-4 bg-brand-card-dark/40 border border-brand-border-white/5 rounded-xl text-xs text-brand-text-muted leading-relaxed whitespace-pre-wrap">
                    {/* Render raw resource text or simple links */}
                    {lesson.resources.split('\n').map((line: string, idx: number) => {
                      // Detect standard markdown link format e.g. [title](url)
                      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
                      const match = line.match(linkRegex);
                      if (match) {
                        return (
                          <div key={idx} className="flex items-center gap-1.5 py-0.5">
                            <ExternalLink className="w-3 h-3 text-brand-accent shrink-0" />
                            <a href={match[2]} target="_blank" rel="noreferrer" className="text-brand-accent hover:underline font-bold">
                              {match[1]}
                            </a>
                          </div>
                        );
                      }
                      return <p key={idx}>{line}</p>;
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Right Sidebar Column: Curriculum Sidebar Navigation */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xs font-bold text-white tracking-tight uppercase border-b border-brand-border-white/10 pb-3 mb-2">
                Course Lessons Outline
              </h3>

              <div className="space-y-3.5 text-left">
                {curriculum.map((mod: any, idx: number) => {
                  const isOpen = openModuleId === mod.id;

                  return (
                    <div key={mod.id} className="border border-brand-border-white/10 rounded-xl bg-brand-card-dark/10 overflow-hidden">
                      {/* Module Title bar trigger */}
                      <button
                        onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
                        className="w-full flex items-center justify-between p-3.5 hover:bg-brand-card-light/20 transition-all text-left cursor-pointer"
                      >
                        <div className="min-w-0">
                          <span className="text-[8px] font-bold text-brand-accent uppercase tracking-wider">Module {idx + 1}</span>
                          <h4 className="text-[11px] font-bold text-white truncate leading-snug mt-0.5">{mod.title}</h4>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-brand-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Lessons list details */}
                      {isOpen && (
                        <div className="divide-y divide-brand-border-white/5 border-t border-brand-border-white/5 bg-brand-card/5 text-[11px]">
                          {mod.lessons && mod.lessons.map((les: any) => {
                            const isCurrent = les.slug === lessonSlug;
                            const isCompleted = completedLessonIds.includes(les.id);

                            return (
                              <Link
                                key={les.id}
                                href={`/learn/${courseSlug}/${les.slug}`}
                                className={`p-3 flex items-start justify-between hover:bg-brand-card-light/10 transition-colors group cursor-pointer ${
                                  isCurrent ? 'bg-brand-accent/10 border-l-2 border-brand-accent' : ''
                                }`}
                              >
                                <div className="flex gap-2.5 items-start min-w-0">
                                  {isCompleted ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                                  ) : (
                                    <Play className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isCurrent ? 'text-brand-accent' : 'text-brand-text-muted'}`} />
                                  )}
                                  <div className="min-w-0">
                                    <p className={`font-semibold truncate ${
                                      isCurrent ? 'text-brand-accent' : 'text-white group-hover:text-brand-accent transition-colors'
                                    }`}>{les.title}</p>
                                    <p className="text-[8px] text-brand-text-muted mt-0.5">{les.durationMinutes} mins</p>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
