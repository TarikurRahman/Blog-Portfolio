'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, Lock, Clock, Award, CheckCircle, ChevronDown, 
  HelpCircle, AlertTriangle, ArrowRight, BookOpen, Star, Share2 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Modal from '@/components/Modal';
import { CourseDetailSkeleton } from '@/components/skeletons/PageSkeletons';
import { useAuth } from '@/context/AuthContext';

export default function CourseDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const { user } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  // Preview Video Player modal
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');

  useEffect(() => {
    if (slug) {
      fetchCourseDetails();
    }
  }, [slug, user]);

  const fetchCourseDetails = async () => {
    try {
      const res = await fetch(`/api/courses/${slug}`);
      const json = await res.json();
      if (json.success && json.data) {
        const c = json.data;
        setCourse(c);
        if (c.curriculum && c.curriculum.length > 0) {
          setOpenModuleId(c.curriculum[0].id);
        }
      } else {
        router.push('/courses');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = () => {
    if (!course) return;

    if (!user) {
      router.push(`/login?redirect=/courses/${slug}`);
      return;
    }

    if (course.enrollmentStatus === 'active') {
      router.push(`/learn/${slug}`);
    } else if (course.enrollmentStatus === 'none' || course.enrollmentStatus === 'rejected') {
      router.push(`/checkout/course/${slug}`);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <CourseDetailSkeleton />
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <main className="flex-grow pt-32 pb-20 flex items-center justify-center bg-brand-bg min-h-screen text-white text-xs">
          Course not found.
        </main>
        <Footer />
      </>
    );
  }

  // CTA Button Text logic
  let ctaText = 'Login to Enroll';
  let ctaDisabled = false;

  if (user) {
    if (course.enrollmentStatus === 'active') {
      ctaText = 'Continue Learning';
    } else if (course.enrollmentStatus === 'pending') {
      ctaText = 'Payment Pending Approval';
      ctaDisabled = true;
    } else {
      ctaText = course.price === 0 ? 'Enroll Now (Free)' : 'Buy Course';
    }
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-32 pb-20 min-h-screen bg-brand-bg text-left relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[10px] text-brand-text-muted font-bold uppercase tracking-wider mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-white">Courses</Link>
            <span>/</span>
            <span className="text-white">{course.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Main details */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Header Titles */}
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 bg-brand-accent/15 border border-brand-accent/30 text-[9px] font-extrabold tracking-widest text-brand-accent rounded uppercase">
                  {course.category}
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  {course.title}
                </h1>
                <p className="text-xs md:text-sm text-brand-text-muted leading-relaxed">
                  {course.shortDescription}
                </p>
              </div>

              {/* Course Meta specifications */}
              <div className="flex flex-wrap items-center gap-6 py-4 border-y border-brand-border-white/10 text-[11px] text-brand-text-muted font-medium">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-accent" /> {Math.round(course.totalDurationMinutes / 60)} hrs duration</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-brand-accent" /> {course.totalLessons} lessons total</span>
                <span>•</span>
                <span className="flex items-center gap-1.5 uppercase"><Award className="w-4 h-4 text-brand-accent" /> {course.level} level</span>
              </div>

              {/* Course description details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white tracking-tight border-l-2 border-brand-accent pl-2.5">
                  Course Overview
                </h3>
                <div className="text-xs text-brand-text-muted leading-relaxed whitespace-pre-wrap">
                  {course.description}
                </div>
              </div>

              {/* What you will learn */}
              {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <Card hoverEffect={false} className="p-6 border border-brand-border-white/10 bg-brand-card-dark/25">
                  <h3 className="text-xs font-bold text-white tracking-tight uppercase mb-4">What you will learn</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-brand-text-muted">
                    {course.whatYouWillLearn.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Curriculum Area */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white tracking-tight border-l-2 border-brand-accent pl-2.5">
                  Curriculum & Structure
                </h3>
                
                <div className="space-y-3">
                  {course.curriculum && course.curriculum.map((mod: any, idx: number) => {
                    const isOpen = openModuleId === mod.id;

                    return (
                      <div key={mod.id} className="border border-brand-border-white/10 rounded-xl bg-brand-card-dark/10 overflow-hidden">
                        {/* Module header trigger */}
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

                        {/* Lessons list details */}
                        {isOpen && (
                          <div className="divide-y divide-brand-border-white/5 border-t border-brand-border-white/5 bg-brand-card/5">
                            {mod.lessons && mod.lessons.map((lesson: any) => (
                              <div key={lesson.id} className="p-4 flex items-center justify-between text-xs hover:bg-brand-card-light/5">
                                <div className="flex items-center gap-3">
                                  {lesson.isPreview ? (
                                    <Play className="w-3.5 h-3.5 text-brand-accent" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 text-brand-text-muted" />
                                  )}
                                  <div>
                                    <p className="font-medium text-white">{lesson.title}</p>
                                    <p className="text-[9px] text-brand-text-muted mt-0.5">{lesson.durationMinutes} mins</p>
                                  </div>
                                </div>
                                <div>
                                  {lesson.isPreview ? (
                                    <button
                                      onClick={() => {
                                        setPreviewVideoId(lesson.youtubeVideoId);
                                        setPreviewTitle(lesson.title);
                                      }}
                                      className="px-2.5 py-1 bg-brand-accent/15 border border-brand-accent/25 text-[10px] font-bold text-brand-accent rounded hover:bg-brand-accent hover:text-white cursor-pointer transition-all"
                                    >
                                      Watch Preview
                                    </button>
                                  ) : (
                                    <Lock className="w-4 h-4 text-brand-text-muted" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white tracking-tight border-l-2 border-brand-accent pl-2.5">
                    Course Requirements
                  </h3>
                  <ul className="list-disc list-inside text-xs text-brand-text-muted space-y-2.5 pl-2">
                    {course.requirements.map((req: string, idx: number) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Right side checkout card widget */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              
              <Card hoverEffect={false} className="p-6 border border-brand-border-white bg-brand-card-dark flex flex-col items-center">
                {/* Course Banner preview */}
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-brand-border-white/10 mb-6 bg-brand-card-dark">
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                </div>

                <div className="w-full flex items-center justify-between border-b border-brand-border-white/10 pb-4 mb-4">
                  <span className="text-xs text-brand-text-muted font-medium">Price:</span>
                  <div>
                    {course.salePrice !== undefined && course.salePrice !== null ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-white">৳{course.salePrice}</span>
                        <span className="text-xs text-brand-text-muted line-through">৳{course.price}</span>
                      </div>
                    ) : (
                      <span className="text-xl font-extrabold text-white">
                        {course.price === 0 ? 'Free' : `৳${course.price}`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full space-y-3 mb-6 text-xs text-brand-text-muted">
                  <div className="flex justify-between">
                    <span>Lessons:</span>
                    <span className="font-semibold text-white">{course.totalLessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Watch Time:</span>
                    <span className="font-semibold text-white">{Math.round(course.totalDurationMinutes / 60)} Hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Access Mode:</span>
                    <span className="font-semibold text-white uppercase">{course.price === 0 ? 'Public' : 'Lifetime Premium'}</span>
                  </div>
                </div>

                <Button
                  onClick={handleActionClick}
                  variant="primary"
                  className="w-full font-bold py-2.5 text-xs flex justify-center"
                  disabled={ctaDisabled}
                >
                  {ctaText}
                </Button>

                {course.enrollmentStatus === 'pending' && (
                  <p className="text-[10px] text-amber-500 mt-3 text-center leading-normal">
                    Your manual payment proof order has been received. Please wait while Tarikur verifies the transaction details.
                  </p>
                )}
              </Card>

            </div>

          </div>

        </div>
      </main>

      {/* Free Preview player Modal */}
      <Modal isOpen={!!previewVideoId} onClose={() => setPreviewVideoId(null)} title={previewTitle} size="lg">
        {previewVideoId && (
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-brand-border-white shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${previewVideoId}?autoplay=1&rel=0&modestbranding=1`}
                title={previewTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setPreviewVideoId(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </>
  );
}
