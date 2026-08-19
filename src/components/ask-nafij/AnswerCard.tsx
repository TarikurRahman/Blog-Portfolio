'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquareCode } from 'lucide-react';
import Card from '../Card';

interface QAData {
  id: string;
  name: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  publishedAt: string | null;
}

interface AnswerCardProps {
  qa: QAData;
}

export default function AnswerCard({ qa }: AnswerCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card hoverEffect className="overflow-hidden transition-all duration-300 p-0 text-left border border-brand-accent/15">
      {/* Question panel (clickable) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 md:p-6 text-left flex items-start gap-4 hover:bg-brand-card-light/40 transition-colors"
      >
        <div className="p-2 bg-brand-accent/15 rounded-xl text-brand-accent shrink-0 mt-0.5">
          <HelpCircle className="w-5 h-5" />
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 bg-brand-card-dark text-brand-accent border border-brand-accent/25 rounded text-[9px] font-bold uppercase tracking-wider">
              {qa.category}
            </span>
            <span className="text-[9px] text-brand-text-muted font-bold uppercase">
              Asked by {qa.name}
            </span>
          </div>

          <h3 className="text-xs md:text-sm font-extrabold text-white leading-relaxed pr-6">
            {qa.question}
          </h3>
        </div>

        <div className="shrink-0 text-brand-text-muted hover:text-white mt-1">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Answer panel */}
      {isOpen && (
        <div className="px-5 pb-6 md:px-6 md:pb-8 pt-2 bg-brand-card-dark/30 border-t border-brand-border-white/5 flex gap-4 items-start animate-fadeIn">
          <div className="p-2 bg-blue-500/15 rounded-xl text-blue-400 shrink-0 mt-1">
            <MessageSquareCode className="w-5 h-5" />
          </div>

          <div className="flex-1 flex flex-col gap-4 text-xs md:text-sm text-brand-text-muted leading-relaxed">
            <p className="whitespace-pre-line text-white/90">
              {qa.answer}
            </p>

            {qa.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {qa.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-brand-card border border-brand-border-white text-[9px] rounded-full text-brand-text-muted font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
