'use client';

import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { mockDb } from '@/data/mockDb';
import { Project } from '@/data/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import SectionHeading from '@/components/SectionHeading';
import EmptyState from '@/components/EmptyState';
import CardSkeleton from '@/components/skeletons/CardSkeleton';

export default function ProjectsListingPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Frontend' | 'Shopify' | 'Bubble.io' | 'UI/UX'>('All');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/projects');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setProjects(json.data);
            setFilteredProjects(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Filter callback
  useEffect(() => {
    let result = [...projects];

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    setFilteredProjects(result);
  }, [searchQuery, selectedCategory, projects]);

  const categories: ('All' | 'Frontend' | 'Shopify' | 'Bubble.io' | 'UI/UX')[] = [
    'All',
    'Frontend',
    'Shopify',
    'Bubble.io',
    'UI/UX'
  ];

  return (
    <>
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 relative min-h-screen">
        {/* Glows */}
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <SectionHeading
            badge="My Portfolio"
            title="Explore My Work"
            subtitle="Browse through standard layout frontend repositories, liquid themes, Bubble apps, and design projects."
          />

          {/* Search and Filters Layout */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-10 bg-brand-card p-4 rounded-2xl border border-brand-border-white shadow-lg">
            
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2.5 md:pb-0 scrollbar-none">
              <SlidersHorizontal className="w-4 h-4 text-brand-text-muted shrink-0 mr-1 hidden sm:block" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-brand-accent text-white shadow-md'
                      : 'bg-brand-card-dark text-brand-text-muted border border-brand-border-white hover:text-white hover:border-brand-accent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input bar */}
            <div className="relative w-full md:max-w-xs shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
              <input
                type="text"
                placeholder="Search projects by tag or title..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
              />
            </div>

          </div>

          {/* Listing Grid */}
          {loading ? (
            <CardSkeleton type="card" count={6} />
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No projects match your criteria"
              message="We couldn't find any projects fitting that category or query. Try searching for other technologies like React, Liquid, or Stripe."
              onAction={() => {
                setSearchInput('');
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              actionText="Reset All Filters"
            />
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
