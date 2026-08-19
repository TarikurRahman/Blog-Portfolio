'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '../Button';

interface AskQuestionFormProps {
  onSuccess: () => void;
}

export default function AskQuestionForm({ onSuccess }: AskQuestionFormProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please type your question.');
      return;
    }
    if (!user && (!name.trim() || !email.trim())) {
      setError('Name and Email are required for guest submissions.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const tagsArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const response = await fetch('/api/ask-tarikur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user ? user.name : name,
          email: user ? user.email : email,
          question,
          category,
          tags: tagsArray,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsSubmitted(true);
        setQuestion('');
        setTags('');
        showToast('Question submitted successfully!', 'success');
        onSuccess();
      } else {
        setError(data.message || 'Failed to submit question.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit question. Check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-brand-card border border-brand-accent/25 rounded-3xl p-6 md:p-8 text-center text-white glow-accent flex flex-col items-center">
        <CheckCircle2 className="w-12 h-12 text-brand-accent mb-4 animate-pulse" />
        <h3 className="text-lg font-bold tracking-tight mb-2">Question Submitted</h3>
        <p className="text-xs text-brand-text-muted mb-6 leading-relaxed max-w-sm">
          Your question is pending moderator review. Once Tarikur answers it, it will be published to the public Q&A board.
        </p>
        <Button variant="secondary" size="sm" onClick={() => setIsSubmitted(false)}>
          Ask Another Question
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-brand-card border border-brand-accent/15 rounded-3xl p-6 md:p-8 text-left text-white">
      <h3 className="text-lg font-bold tracking-tight mb-4 border-l-3 border-brand-accent pl-3">
        Ask Tarikur a Question
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Guest Input Row */}
        {!user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Your Name *</label>
              <input
                type="text"
                required
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Email Address *</label>
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/40"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none focus:border-brand-accent/40 cursor-pointer"
            >
              <option value="General">General Questions</option>
              <option value="Frontend">Frontend Development</option>
              <option value="Shopify">Shopify E-Commerce</option>
              <option value="Bubble.io">Bubble.io No-Code</option>
              <option value="SEO">SEO Optimization</option>
              <option value="Freelancing">Freelance Work</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. nextjs, hosting, stripe"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/40"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Your Question *</label>
          <textarea
            required
            rows={4}
            placeholder="Type your question detail here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-4 py-3 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/40 resize-none"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          rightIcon={<Send className="w-4 h-4" />}
          className="w-full sm:w-auto self-start"
        >
          Submit Question
        </Button>
      </form>
    </div>
  );
}
