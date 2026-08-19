'use client';

import React, { useEffect, useState } from 'react';
import {
  Star,
  Search,
  MessageSquare,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MessageCircle
} from 'lucide-react';
import Button from '../Button';
import Card from '../Card';
import Modal from '../Modal';

interface Review {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  overallRating: number;
  designRating: number;
  speedRating: number;
  contentRating: number;
  easeOfUseRating: number;
  impressedBy: string[];
  improvementSuggestions: string[];
  reviewText: string;
  wouldRecommend: boolean;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  adminReply: string;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  featured: number;
  averageRating: number;
}

export default function SiteReviewsTab() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    featured: 0,
    averageRating: 0,
  });

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Moderator modals
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const loadReviews = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', '8');
      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);

      const res = await fetch(`/api/admin/site-reviews?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setReviews(json.data.reviews);
          setStats(json.data.stats);
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
    loadReviews();
  }, [page, status]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadReviews();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/site-reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFeatured = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/site-reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentVal }),
      });
      if (res.ok) {
        loadReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openReplyModal = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || '');
    setIsReplyModalOpen(true);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;

    try {
      const res = await fetch(`/api/admin/site-reviews/${selectedReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: replyText }),
      });

      if (res.ok) {
        setIsReplyModalOpen(false);
        loadReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/site-reviews/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < rating ? 'fill-amber-400' : 'text-brand-border-white/20'}`}
          />
        ))}
      </div>
    );
  };

  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Visitor Site Reviews & Feedback</h3>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card hoverEffect={false} className="p-4 border border-brand-border-white/5 bg-brand-card-dark/20 text-center">
          <p className="text-[10px] text-brand-text-muted uppercase tracking-wider font-extrabold">Average Score</p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <p className="text-2xl font-bold text-white">{stats.averageRating}</p>
          </div>
        </Card>
        <Card hoverEffect={false} className="p-4 border border-brand-border-white/5 bg-brand-card-dark/20 text-center">
          <p className="text-[10px] text-brand-text-muted uppercase tracking-wider font-extrabold">Total Reviews</p>
          <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
        </Card>
        <Card hoverEffect={false} className="p-4 border border-brand-border-white/5 bg-brand-card-dark/20 text-center">
          <p className="text-[10px] text-brand-text-muted uppercase tracking-wider font-extrabold">Approved</p>
          <p className="text-2xl font-bold text-green-400 mt-2">{stats.approved}</p>
        </Card>
        <Card hoverEffect={false} className="p-4 border border-brand-border-white/5 bg-brand-card-dark/20 text-center">
          <p className="text-[10px] text-brand-text-muted uppercase tracking-wider font-extrabold">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-400 mt-2">{stats.pending}</p>
        </Card>
        <Card hoverEffect={false} className="p-4 border border-brand-border-white/5 bg-brand-card-dark/20 text-center col-span-2 md:col-span-1">
          <p className="text-[10px] text-brand-text-muted uppercase tracking-wider font-extrabold">Featured on Home</p>
          <p className="text-2xl font-bold text-brand-accent mt-2">{stats.featured}</p>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-4 bg-brand-card border border-brand-accent/10 rounded-2xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search by reviewer name or text..."
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
          <option value="">All Review Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-brand-text-muted">Loading review list...</div>
      ) : reviews.length > 0 ? (
        <div className="overflow-x-auto border border-brand-border-white/5 rounded-2xl bg-brand-card">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-border-white/5 text-[10px] text-brand-text-muted uppercase tracking-wider font-extrabold bg-brand-card-dark/20">
                <th className="p-4">Reviewer</th>
                <th className="p-4">Ratings</th>
                <th className="p-4">Feedback details</th>
                <th className="p-4">Recommend</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-brand-border-white/5 hover:bg-brand-card-light/20 transition-colors">
                  <td className="p-4 font-bold">
                    <p className="text-white leading-none mb-1">{r.name}</p>
                    <p className="text-[10px] text-brand-text-muted leading-none">{r.email}</p>
                  </td>
                  <td className="p-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-brand-text-muted w-12 font-semibold">Overall:</span>
                      {renderStars(r.overallRating)}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-brand-text-muted font-normal">
                      <span>Design: {r.designRating}</span>
                      <span>•</span>
                      <span>Speed: {r.speedRating}</span>
                      <span>•</span>
                      <span>Ease: {r.easeOfUseRating}</span>
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="text-white/90 line-clamp-2">{r.reviewText}</p>
                    {r.adminReply && (
                      <div className="mt-1 flex items-start gap-1 text-[10px] text-brand-accent bg-brand-accent/5 p-1 rounded border border-brand-accent/10">
                        <MessageCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p className="italic line-clamp-1"><strong className="not-italic">Reply:</strong> {r.adminReply}</p>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {r.wouldRecommend ? (
                      <span className="flex items-center gap-1 text-green-400 font-bold text-[10px]">
                        <ThumbsUp className="w-3 h-3" /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 font-bold text-[10px]">
                        <ThumbsDown className="w-3 h-3" /> No
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleFeatured(r.id, r.isFeatured)}
                      className={`p-1 bg-brand-card-dark border rounded-lg transition-all cursor-pointer ${
                        r.isFeatured
                          ? 'border-brand-accent text-brand-accent'
                          : 'border-brand-border-white/5 text-brand-text-muted hover:text-white'
                      }`}
                      title={r.isFeatured ? 'Unfeature review' : 'Feature review'}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${statusColors[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openReplyModal(r)}
                      className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-brand-accent rounded-lg text-brand-text-muted hover:text-white transition-all cursor-pointer"
                      title="Reply to Review"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    {r.status !== 'approved' && (
                      <button
                        onClick={() => updateStatus(r.id, 'approved')}
                        className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-green-500 rounded-lg text-brand-text-muted hover:text-green-400 transition-all cursor-pointer"
                        title="Approve Review"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus(r.id, 'rejected')}
                        className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-red-500 rounded-lg text-brand-text-muted hover:text-red-400 transition-all cursor-pointer"
                        title="Reject / Hide Review"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-red-500 rounded-lg text-brand-text-muted hover:text-red-400 transition-all cursor-pointer"
                      title="Delete Review"
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
          <AlertCircle className="w-12 h-12 text-brand-text-muted mx-auto mb-4" />
          <h3 className="text-sm font-bold">No Reviews Found</h3>
          <p className="text-xs text-brand-text-muted mt-2 max-w-sm mx-auto">We couldn't find any reviews matching the selected status or filter.</p>
        </div>
      )}

      {/* Reply Modal */}
      {isReplyModalOpen && selectedReview && (
        <Modal isOpen={isReplyModalOpen} onClose={() => setIsReplyModalOpen(false)} title="Reply to Site Review">
          <form onSubmit={handleReplySubmit} className="flex flex-col gap-4 text-left">
            <div className="p-4 bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-xs text-brand-text-muted">
              <p className="font-bold text-white mb-1">Review by {selectedReview.name}:</p>
              <p className="italic">"{selectedReview.reviewText}"</p>
              <div className="flex gap-4 mt-2 font-semibold">
                <span>Overall: {selectedReview.overallRating}/5</span>
                <span>Design: {selectedReview.designRating}/5</span>
                <span>Speed: {selectedReview.speedRating}/5</span>
                <span>Ease of use: {selectedReview.easeOfUseRating}/5</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <label className="text-[10px] text-brand-text-muted font-bold uppercase">Admin Reply Text</label>
              <textarea
                required
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your thank you note or feedback response..."
                className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-brand-border-white/5 mt-4">
              <Button variant="secondary" onClick={() => setIsReplyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Reply
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
