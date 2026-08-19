'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Clock, Award, Filter, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Card from '@/components/Card';
import SectionHeading from '@/components/SectionHeading';
import EmptyState from '@/components/EmptyState';
import CardSkeleton from '@/components/skeletons/CardSkeleton';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [type, setType] = useState('All'); // 'All' | 'free' | 'paid'

  const categories = ['All', 'Web Development', 'Mobile Apps', 'Design', 'UI/UX', 'SEO'];

  useEffect(() => {
    fetchCourses();
  }, [category, level, type]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let url = `/api/courses?search=${encodeURIComponent(search)}`;
      if (category !== 'All') url += `&category=${encodeURIComponent(category)}`;
      if (level !== 'All') url += `&level=${encodeURIComponent(level.toLowerCase())}`;
      if (type !== 'All') url += `&type=${type}`;
      
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setCourses(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-32 pb-20 min-h-screen bg-brand-bg relative overflow-hidden">
        {/* Background glow elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          
          <SectionHeading
            badge="My Academy"
            title="Practical Coding Courses"
            subtitle="Learn web development by building real production-ready systems from scratch."
          />

          {/* Filters and search controls */}
          <div className="bg-gradient-to-tr from-brand-card to-brand-card-light p-5 rounded-2xl border border-brand-border-white/5 shadow-xl mb-10 flex flex-col gap-5 text-left">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-brand-text-muted" />
                <input
                  type="text"
                  placeholder="What do you want to learn today?"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none placeholder:text-brand-text-muted"
                />
              </div>
              <Button type="submit" variant="primary" size="md" className="py-2 px-6 text-xs font-bold shrink-0">
                Search Courses
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <span className="text-brand-text-muted flex items-center gap-1.5 shrink-0"><Filter className="w-3.5 h-3.5" /> Filters:</span>
              
              {/* Category selector */}
              <div className="flex flex-col gap-1">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-1.5 bg-brand-card-dark border border-brand-border-white/10 rounded-lg text-white text-[11px] focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Level selector */}
              <div className="flex flex-col gap-1">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="px-3 py-1.5 bg-brand-card-dark border border-brand-border-white/10 rounded-lg text-white text-[11px] focus:outline-none"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Free/Paid selector */}
              <div className="flex flex-col gap-1">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="px-3 py-1.5 bg-brand-card-dark border border-brand-border-white/10 rounded-lg text-white text-[11px] focus:outline-none"
                >
                  <option value="All">Free & Paid</option>
                  <option value="free">Free Courses</option>
                  <option value="paid">Premium Paid</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => { setSearch(''); setCategory('All'); setLevel('All'); setType('All'); }}
                className="text-[10px] text-brand-accent hover:underline cursor-pointer uppercase font-bold"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Courses grid */}
          {loading ? (
            <CardSkeleton type="card" count={6} />
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="group flex flex-col h-full bg-gradient-to-tr from-brand-card to-brand-card-light border border-brand-border-white hover:border-brand-accent/40 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-brand-card-dark border-b border-brand-border-white">
                    <img
                      src={course.thumbnailUrl || '/course-placeholder.jpg'}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {course.badge && course.badge !== 'none' && (
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-brand-accent text-white font-extrabold text-[8px] uppercase tracking-wider rounded-md shadow">
                        {course.badge}
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-brand-bg/80 backdrop-blur text-[10px] font-bold text-white rounded uppercase">
                      {course.level}
                    </span>
                  </div>

                  {/* Content details */}
                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">
                      {course.category}
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight leading-snug mt-1 group-hover:text-brand-accent transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-brand-text-muted mt-2 line-clamp-2 leading-relaxed flex-grow">
                      {course.shortDescription}
                    </p>

                    {/* Meta widgets */}
                    <div className="flex items-center justify-between border-t border-brand-border-white/10 pt-4 mt-4 text-[10px] text-brand-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.round(course.totalDurationMinutes / 60)} hrs
                      </span>
                      <span>•</span>
                      <span>{course.totalLessons} Lessons</span>
                    </div>

                    {/* Price and checkout button */}
                    <div className="flex items-center justify-between mt-5 pt-3 border-t border-brand-border-white/10">
                      <div>
                        {course.salePrice !== undefined && course.salePrice !== null ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-extrabold text-white">৳{course.salePrice}</span>
                            <span className="text-[10px] text-brand-text-muted line-through">৳{course.price}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-extrabold text-white">
                            {course.price === 0 ? 'Free' : `৳${course.price}`}
                          </span>
                        )}
                      </div>
                      <Link href={`/courses/${course.slug}`}>
                        <Button variant="outline" size="sm" className="py-1 px-3 text-[10px]">
                          View Course
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No Courses Found" message="Try adjusting your filter options or search terms." />
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
