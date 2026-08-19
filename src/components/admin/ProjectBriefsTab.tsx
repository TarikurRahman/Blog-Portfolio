'use client';

import React, { useEffect, useState } from 'react';
import { Search, Eye, Trash2, CheckCircle2, XCircle, Clock, Copy, ExternalLink, HelpCircle } from 'lucide-react';
import Button from '../Button';
import Card from '../Card';
import Modal from '../Modal';

interface Brief {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  businessUrl: string;
  projectType: string;
  projectSize: string;
  selectedFeatures: string[];
  designStyle: string;
  timeline: string;
  budgetRange: string;
  complexityScore: number;
  estimatedPackage: string;
  estimatedTimeline: string;
  generatedSummary: string;
  extraMessage: string;
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  createdAt: string;
}

export default function ProjectBriefsTab() {
  const [loading, setLoading] = useState(true);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, converted: 0, rejected: 0 });

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadBriefs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', '8');
      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);

      const res = await fetch(`/api/admin/project-briefs?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setBriefs(json.data.briefs);
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
    loadBriefs();
  }, [page, status]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadBriefs();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/project-briefs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadBriefs();
        if (selectedBrief && selectedBrief.id === id) {
          setSelectedBrief((prev: any) => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBrief = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project brief?')) return;
    try {
      const res = await fetch(`/api/admin/project-briefs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDetailModalOpen(false);
        loadBriefs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (brief: Brief) => {
    const text = `Project Estimate Brief:
- Name: ${brief.name}
- Email: ${brief.email}
- WhatsApp: ${brief.whatsapp}
- Business Link: ${brief.businessUrl || 'None'}
- Type: ${brief.projectType}
- Size: ${brief.projectSize}
- Budget: ${brief.budgetRange}
- Complexity Score: ${brief.complexityScore}%
- Recommended Package: ${brief.estimatedPackage}
- Summary: ${brief.generatedSummary}
- Message: ${brief.extraMessage || 'None'}`;

    navigator.clipboard.writeText(text);
    alert('Brief copied to clipboard!');
  };

  const statusColors = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    contacted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    converted: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="space-y-6 text-left">
      {/* Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card hoverEffect={false} className="p-4 border border-brand-border-white/5 bg-brand-card-dark/45 text-center">
          <span className="text-[9px] text-brand-text-muted font-bold uppercase block mb-1">Total Briefs</span>
          <span className="text-xl font-extrabold text-white">{stats.total}</span>
        </Card>
        <Card hoverEffect={false} className="p-4 border border-brand-border-white/5 bg-blue-500/5 text-center">
          <span className="text-[9px] text-blue-400 font-bold uppercase block mb-1">New</span>
          <span className="text-xl font-extrabold text-blue-400">{stats.new}</span>
        </Card>
        <Card hoverEffect={false} className="p-4 border border-brand-border-white/5 bg-amber-500/5 text-center">
          <span className="text-[9px] text-amber-400 font-bold uppercase block mb-1">Contacted</span>
          <span className="text-xl font-extrabold text-amber-400">{stats.contacted}</span>
        </Card>
        <Card hoverEffect={false} className="p-4 border border-brand-border-white/5 bg-green-500/5 text-center">
          <span className="text-[9px] text-green-400 font-bold uppercase block mb-1">Converted</span>
          <span className="text-xl font-extrabold text-green-400">{stats.converted}</span>
        </Card>
        <Card hoverEffect={false} className="p-4 border border-brand-border-white/5 bg-red-500/5 text-center">
          <span className="text-[9px] text-red-400 font-bold uppercase block mb-1">Rejected</span>
          <span className="text-xl font-extrabold text-red-400">{stats.rejected}</span>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center p-4 bg-brand-card border border-brand-accent/10 rounded-2xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search by name/email/type..."
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
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Briefs Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-brand-text-muted">Loading briefs...</div>
      ) : briefs.length > 0 ? (
        <div className="overflow-x-auto border border-brand-border-white/5 rounded-2xl bg-brand-card">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-border-white/5 text-[10px] text-brand-text-muted uppercase tracking-wider font-extrabold bg-brand-card-dark/20">
                <th className="p-4">Client</th>
                <th className="p-4">Project Type</th>
                <th className="p-4">Estimated Package</th>
                <th className="p-4">Complexity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {briefs.map((b) => (
                <tr key={b.id} className="border-b border-brand-border-white/5 hover:bg-brand-card-light/20 transition-colors">
                  <td className="p-4 font-bold">
                    <p className="text-white leading-none mb-1">{b.name}</p>
                    <p className="text-[10px] text-brand-text-muted leading-none">{b.email}</p>
                  </td>
                  <td className="p-4 text-white font-medium">{b.projectType}</td>
                  <td className="p-4 text-brand-accent font-extrabold">{b.estimatedPackage}</td>
                  <td className="p-4 font-bold text-white">{b.complexityScore}%</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${statusColors[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedBrief(b);
                        setIsDetailModalOpen(true);
                      }}
                      className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-brand-accent rounded-lg text-brand-text-muted hover:text-white transition-all cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(b)}
                      className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-brand-accent rounded-lg text-brand-text-muted hover:text-white transition-all cursor-pointer"
                      title="Copy to Clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBrief(b.id)}
                      className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-red-500 rounded-lg text-brand-text-muted hover:text-red-400 transition-all cursor-pointer"
                      title="Delete Brief"
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
          <h3 className="text-sm font-bold">No Project Briefs</h3>
          <p className="text-xs text-brand-text-muted mt-2 max-w-sm mx-auto">We couldn't find any estimator submissions in the database.</p>
        </div>
      )}

      {/* Details Modal */}
      {isDetailModalOpen && selectedBrief && (
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Project Brief Details">
          <div className="flex flex-col gap-5 text-left text-white max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-brand-border-white/5">
              <div>
                <p className="text-[9px] text-brand-text-muted uppercase">Client Name</p>
                <p className="text-xs font-bold">{selectedBrief.name}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-text-muted uppercase">Email Address</p>
                <p className="text-xs font-bold">{selectedBrief.email}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-text-muted uppercase">WhatsApp Number</p>
                <a
                  href={`https://wa.me/${selectedBrief.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1 w-fit"
                >
                  {selectedBrief.whatsapp} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div>
                <p className="text-[9px] text-brand-text-muted uppercase">Business Link</p>
                {selectedBrief.businessUrl ? (
                  <a href={selectedBrief.businessUrl} target="_blank" className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1 w-fit">
                    {selectedBrief.businessUrl} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <p className="text-xs font-medium text-brand-text-muted">None Provided</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-brand-border-white/5">
              <div>
                <p className="text-[9px] text-brand-text-muted uppercase">Project Type</p>
                <p className="text-xs font-bold">{selectedBrief.projectType}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-text-muted uppercase">Project Size</p>
                <p className="text-xs font-bold">{selectedBrief.projectSize}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-text-muted uppercase">Timeline</p>
                <p className="text-xs font-bold">{selectedBrief.timeline}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-text-muted uppercase">Budget range</p>
                <p className="text-xs font-bold">{selectedBrief.budgetRange}</p>
              </div>
            </div>

            <div className="pb-4 border-b border-brand-border-white/5">
              <p className="text-[9px] text-brand-text-muted uppercase mb-1.5">Integrations Selected</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedBrief.selectedFeatures.length > 0 ? (
                  selectedBrief.selectedFeatures.map((feat) => (
                    <span key={feat} className="px-2 py-0.5 bg-brand-card border border-brand-border-white text-[9px] rounded font-semibold">
                      {feat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-brand-text-muted">None Selected</span>
                )}
              </div>
            </div>

            <div className="pb-4 border-b border-brand-border-white/5">
              <p className="text-[9px] text-brand-text-muted uppercase">Calculated Packaging</p>
              <p className="text-sm font-extrabold text-brand-accent mt-0.5">{selectedBrief.estimatedPackage} package</p>
              <p className="text-[9px] text-brand-text-muted mt-1 leading-relaxed">{selectedBrief.generatedSummary}</p>
            </div>

            {selectedBrief.extraMessage && (
              <div className="pb-4 border-b border-brand-border-white/5">
                <p className="text-[9px] text-brand-text-muted uppercase">Extra client Message</p>
                <p className="text-xs text-white/90 leading-relaxed whitespace-pre-line mt-1 bg-brand-card-dark/40 p-3 rounded-xl border border-brand-border-white/5">
                  {selectedBrief.extraMessage}
                </p>
              </div>
            )}

            {/* Actions panel inside Modal */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-brand-text-muted font-bold uppercase">Mark Status:</span>
                {['contacted', 'converted', 'rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedBrief.id, st)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      selectedBrief.status === st
                        ? statusColors[st as 'contacted'] + ' border-current'
                        : 'bg-brand-card-dark border-brand-border-white/5 text-brand-text-muted hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => handleCopy(selectedBrief)}>
                  Copy Brief
                </Button>
                <Button variant="danger" onClick={() => handleDeleteBrief(selectedBrief.id)}>
                  Delete Brief
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
