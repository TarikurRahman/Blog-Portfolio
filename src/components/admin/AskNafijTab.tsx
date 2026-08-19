'use client';

import React, { useEffect, useState } from 'react';
import { Search, MessageSquare, Trash2, CheckCircle2, AlertCircle, Sparkles, HelpCircle, XCircle } from 'lucide-react';
import Button from '../Button';
import Card from '../Card';
import Modal from '../Modal';

interface QAQuestion {
  id: string;
  name: string;
  email: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  status: 'pending' | 'answered' | 'published' | 'rejected';
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export default function AskTarikurTab() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QAQuestion[]>([]);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Moderator Modals
  const [selectedQA, setSelectedQA] = useState<QAQuestion | null>(null);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);

  // Form states
  const [ansText, setAnsText] = useState('');
  const [ansCategory, setAnsCategory] = useState('General');
  const [ansTags, setAnsTags] = useState('');

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', '8');
      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);

      const res = await fetch(`/api/admin/ask-tarikur?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setQuestions(json.data.questions);
          setTotalPages(json.data.pagination.pages);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [page, status]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadQuestions();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const openAnswerModal = (qa: QAQuestion) => {
    setSelectedQA(qa);
    setAnsText(qa.answer || '');
    setAnsCategory(qa.category || 'General');
    setAnsTags(qa.tags?.join(', ') || '');
    setIsAnswerModalOpen(true);
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQA) return;

    const tagsArray = ansTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/admin/ask-tarikur/${selectedQA.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: ansText,
          category: ansCategory,
          tags: tagsArray,
        }),
      });

      if (res.ok) {
        setIsAnswerModalOpen(false);
        loadQuestions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFeatured = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/ask-nafij/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentVal }),
      });
      if (res.ok) loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/ask-nafij/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/admin/ask-tarikur/${id}`, { method: 'DELETE' });
      if (res.ok) loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    answered: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    published: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold">Ask Tarikur Q&A Moderation</h3>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center p-4 bg-brand-card border border-brand-accent/10 rounded-2xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search by client/question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white placeholder-brand-text-muted focus:outline-none"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none cursor-pointer"
        >
          <option value="">All Question Statuses</option>
          <option value="pending">Pending</option>
          <option value="answered">Answered</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected/Spam</option>
        </select>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="py-20 text-center text-xs text-brand-text-muted">Loading question list...</div>
      ) : questions.length > 0 ? (
        <div className="overflow-x-auto border border-brand-border-white/5 rounded-2xl bg-brand-card">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-border-white/5 text-[10px] text-brand-text-muted uppercase tracking-wider font-extrabold bg-brand-card-dark/20">
                <th className="p-4">Sender</th>
                <th className="p-4">Question Detail</th>
                <th className="p-4">Category</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-brand-border-white/5 hover:bg-brand-card-light/20 transition-colors">
                  <td className="p-4 font-bold">
                    <p className="text-white leading-none mb-1">{q.name}</p>
                    <p className="text-[10px] text-brand-text-muted leading-none">{q.email}</p>
                  </td>
                  <td className="p-4 max-w-sm truncate text-white/90 font-medium">{q.question}</td>
                  <td className="p-4 text-brand-accent font-semibold">{q.category}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleFeatured(q.id, q.isFeatured)}
                      className={`p-1 bg-brand-card-dark border rounded-lg transition-all cursor-pointer ${
                        q.isFeatured
                          ? 'border-brand-accent text-brand-accent'
                          : 'border-brand-border-white/5 text-brand-text-muted hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${statusColors[q.status]}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openAnswerModal(q)}
                      className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-brand-accent rounded-lg text-brand-text-muted hover:text-white transition-all cursor-pointer"
                      title="Answer Question"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    {q.status === 'answered' && (
                      <button
                        onClick={() => updateStatus(q.id, 'published')}
                        className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-green-500 rounded-lg text-brand-text-muted hover:text-green-400 transition-all cursor-pointer"
                        title="Publish Answer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {q.status === 'published' && (
                      <button
                        onClick={() => updateStatus(q.id, 'answered')}
                        className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-amber-500 rounded-lg text-brand-text-muted hover:text-amber-400 transition-all cursor-pointer"
                        title="Unpublish / Hide"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(q.id, 'rejected')}
                      className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-red-500 rounded-lg text-brand-text-muted hover:text-red-400 transition-all cursor-pointer"
                      title="Mark as Spam / Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-red-500 rounded-lg text-brand-text-muted hover:text-red-400 transition-all cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-brand-border-white/5 bg-brand-card-dark/10">
              <span className="text-[10px] text-brand-text-muted font-medium">Page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="py-1 px-2.5"
                >
                  Prev
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="py-1 px-2.5"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-brand-card border border-brand-border-white/5 rounded-3xl p-8 text-white">
          <HelpCircle className="w-12 h-12 text-brand-text-muted mx-auto mb-4" />
          <h3 className="text-sm font-bold">No Questions</h3>
          <p className="text-xs text-brand-text-muted mt-2 max-w-sm mx-auto">We couldn't find any public Q&A questions matching the selected status.</p>
        </div>
      )}

      {/* Answer Moderator Modal */}
      {isAnswerModalOpen && selectedQA && (
        <Modal isOpen={isAnswerModalOpen} onClose={() => setIsAnswerModalOpen(false)} title="Answer / Edit Q&A Question">
          <form onSubmit={handleAnswerSubmit} className="flex flex-col gap-4 text-left">
            <div className="p-3 bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-xs text-brand-text-muted">
              <p className="font-bold text-white mb-1">Q: {selectedQA.question}</p>
              <p className="text-[10px]">Asked by {selectedQA.name} ({selectedQA.email}) on {new Date(selectedQA.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-brand-text-muted font-bold uppercase">Answer *</label>
              <textarea
                required
                rows={5}
                value={ansText}
                onChange={(e) => setAnsText(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Category</label>
                <select
                  value={ansCategory}
                  onChange={(e) => setAnsCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="Frontend">Frontend Development</option>
                  <option value="Shopify">Shopify E-Commerce</option>
                  <option value="Bubble.io">Bubble.io No-Code</option>
                  <option value="SEO">SEO Optimization</option>
                  <option value="Freelancing">Freelancing</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. nextjs, backend"
                  value={ansTags}
                  onChange={(e) => setAnsTags(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-brand-border-white/5 mt-4">
              <Button variant="secondary" onClick={() => setIsAnswerModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save & Answer
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
