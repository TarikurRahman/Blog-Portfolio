'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, HelpCircle, Save, Briefcase } from 'lucide-react';
import Button from '../Button';
import Card from '../Card';
import Modal from '../Modal';

interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
  tags: string[];
}

export default function ExperiencesTab() {
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeExperience, setActiveExperience] = useState<Experience | null>(null);

  // Form states
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [tagsText, setTagsText] = useState('');

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', '6');
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }

      const res = await fetch(`/api/admin/experiences?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setExperiences(json.data.experiences);
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
    loadExperiences();
  }, [page, searchQuery]);

  const openFormModal = (experience: Experience | null) => {
    setActiveExperience(experience);
    if (experience) {
      setRole(experience.role);
      setCompany(experience.company);
      setDuration(experience.duration);
      setDescription(experience.description);
      setTagsText(experience.tags?.join(', ') || '');
    } else {
      setRole('');
      setCompany('');
      setDuration('');
      setDescription('');
      setTagsText('');
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !company || !duration || !description) return;

    const tagsArray = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      let res;
      if (activeExperience) {
        res = await fetch(`/api/admin/experiences/${activeExperience.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role,
            company,
            duration,
            description,
            tags: tagsArray,
          }),
        });
      } else {
        res = await fetch('/api/admin/experiences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role,
            company,
            duration,
            description,
            tags: tagsArray,
          }),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        loadExperiences();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this career entry?')) return;
    try {
      const res = await fetch(`/api/admin/experiences/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadExperiences();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Manage Experiences</h3>
          <p className="text-[11px] text-brand-text-muted mt-0.5">Control the items displayed in the homepage Career Timeline section.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-text-muted" />
            <input
              type="text"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-48 pl-9 pr-4 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50"
            />
          </div>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => openFormModal(null)}>
            Add Entry
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-brand-text-muted">Loading timeline...</div>
      ) : experiences.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {experiences.map((exp) => (
              <Card key={exp.id} hoverEffect={false} className="p-5 border border-brand-border-white bg-brand-card-dark/25 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-grow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                      <p className="text-xs text-brand-accent font-semibold">{exp.company}</p>
                    </div>
                    <span className="text-[10px] bg-brand-accent/15 border border-brand-accent/30 text-brand-accent font-bold px-2 py-0.5 rounded-full shrink-0">
                      {exp.duration}
                    </span>
                  </div>
                  <p className="text-xs text-brand-text-muted leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                  {exp.tags && exp.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {exp.tags.map((tag, idx) => (
                        <span key={idx} className="text-[9px] bg-brand-card-light border border-brand-border-white text-brand-text-muted px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 shrink-0 border-t md:border-t-0 border-brand-border-white/5 pt-3 md:pt-0">
                  <button
                    onClick={() => openFormModal(exp)}
                    className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-brand-accent rounded-lg text-brand-text-muted hover:text-white transition-all cursor-pointer"
                    title="Edit Entry"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-red-500 rounded-lg text-brand-text-muted hover:text-red-400 transition-all cursor-pointer"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-white font-bold">{page} / {totalPages}</span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-brand-card border border-brand-border-white/5 rounded-3xl p-8 text-white">
          <HelpCircle className="w-12 h-12 text-brand-text-muted mx-auto mb-4" />
          <h3 className="text-sm font-bold">No Experiences Configured</h3>
          <p className="text-xs text-brand-text-muted mt-2 max-w-sm mx-auto">Create career entries to display in your CV/Resume timeline.</p>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeExperience ? 'Edit Experience Entry' : 'Add Experience Entry'}>
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Frontend Architect"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Solutions"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Duration *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2024 - Present"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Technologies Used (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, GraphQL, AWS"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-brand-text-muted font-bold uppercase">Role Description *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key responsibilities, deliverables, and architecture accomplishments."
                className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-brand-border-white/5 mt-4">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                Save Entry
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
