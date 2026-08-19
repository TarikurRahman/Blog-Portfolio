'use client';

import React, { useEffect, useState } from 'react';
import { Search, HelpCircle, Layers, Lightbulb } from 'lucide-react';
import AnswerCard from './AnswerCard';

const CATEGORIES = ['All', 'General', 'Frontend', 'Shopify', 'Bubble.io', 'SEO', 'Freelancing'];

interface QAData {
  id: string;
  name: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  publishedAt: string | null;
}

interface PublishedAnswersProps {
  refreshTrigger: number;
}

export default function PublishedAnswers({ refreshTrigger }: PublishedAnswersProps) {
  const [loading, setLoading] = useState(true);
  const [qas, setQas] = useState<QAData[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const loadQAs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (category !== 'All') queryParams.append('category', category);

      const res = await fetch(`/api/ask-tarikur?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setQas(json.data.qas || []);
          setSuggestions(json.data.suggestions || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQAs();
  }, [refreshTrigger, category]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      loadQAs();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSuggestionClick = (suggestionText: string) => {
    setSearch(suggestionText);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Search & Category Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-brand-card border border-brand-accent/10 p-5 rounded-3xl">
        <div className="relative md:col-span-6 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-2xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/40"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto md:col-span-6 w-full pr-2 py-1 scrollbar-thin">
          <Layers className="w-4 h-4 text-brand-accent shrink-0 hidden sm:block" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all ${
                (cat === 'All' && category === 'All') || category === cat
                  ? 'bg-brand-accent border-brand-accent text-white'
                  : 'bg-brand-card-dark border-brand-border-white/5 text-brand-text-muted hover:border-brand-accent/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Questions banner */}
      {search && suggestions.length > 0 && (
        <div className="p-4 bg-brand-accent/5 border border-brand-accent/15 rounded-2xl text-left flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] text-brand-accent font-bold uppercase tracking-wider mb-1.5">Related Questions Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSuggestionClick(s.question)}
                  className="px-2.5 py-1 bg-brand-card hover:bg-brand-card-light/40 border border-brand-border-white/5 rounded-lg text-[10px] font-medium text-white transition-all text-left"
                >
                  {s.question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Questions list */}
      {loading ? (
        <div className="flex flex-col gap-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-3xl bg-brand-card/30 border border-brand-border-white/5 p-6 h-28 flex flex-col gap-3">
              <div className="flex justify-between items-center pb-2 border-b border-brand-border-white/5">
                <div className="w-16 h-3 bg-brand-card-dark rounded-full" />
                <div className="w-20 h-2 bg-brand-card-dark rounded-full" />
              </div>
              <div className="h-3.5 bg-brand-card-dark rounded-full w-2/3" />
              <div className="h-3 bg-brand-card-dark rounded-full w-1/2" />
            </div>
          ))}
        </div>
      ) : qas.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {qas.map((qa) => (
            <AnswerCard key={qa.id} qa={qa} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-brand-card border border-brand-border-white/5 rounded-3xl p-8 text-white">
          <HelpCircle className="w-12 h-12 text-brand-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold">No Questions Found</h3>
          <p className="text-xs text-brand-text-muted mt-2 max-w-sm mx-auto leading-relaxed">
            We couldn't find any approved answers matching your category or search term. Submit a new question to Tarikur above!
          </p>
        </div>
      )}
    </div>
  );
}
