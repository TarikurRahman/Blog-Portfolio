'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, HelpCircle, Save, Code } from 'lucide-react';
import Button from '../Button';
import Card from '../Card';
import Modal from '../Modal';

interface Service {
  id: string;
  title: string;
  iconName: string;
  description: string;
  bullets: string[];
}

export default function ServicesTab() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeService, setActiveService] = useState<Service | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [iconName, setIconName] = useState('Code');
  const [description, setDescription] = useState('');
  const [bulletsText, setBulletsText] = useState('');

  const loadServices = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', '6');

      const res = await fetch(`/api/admin/services?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setServices(json.data.services);
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
    loadServices();
  }, [page]);

  const openFormModal = (service: Service | null) => {
    setActiveService(service);
    if (service) {
      setTitle(service.title);
      setIconName(service.iconName || 'Code');
      setDescription(service.description);
      setBulletsText(service.bullets?.join('\n') || '');
    } else {
      setTitle('');
      setIconName('Code');
      setDescription('');
      setBulletsText('');
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !iconName) return;

    const bulletsArray = bulletsText
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean);

    try {
      let res;
      if (activeService) {
        res = await fetch(`/api/admin/services/${activeService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            iconName,
            description,
            bullets: bulletsArray,
          }),
        });
      } else {
        res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            iconName,
            description,
            bullets: bulletsArray,
          }),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        loadServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Manage Services</h3>
          <p className="text-[11px] text-brand-text-muted mt-0.5">Define and customize services displayed in the "What I Offer" landing page section.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => openFormModal(null)}>
          Add Service
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-brand-text-muted">Loading services...</div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((s) => (
            <Card key={s.id} hoverEffect={false} className="p-5 border border-brand-border-white bg-brand-card-dark/25 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-brand-accent/15 border border-brand-accent/30 text-brand-accent rounded-xl">
                    <span className="font-bold text-xs font-mono">{s.iconName}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">{s.title}</h4>
                </div>
                <p className="text-xs text-brand-text-muted leading-relaxed line-clamp-3 mb-4">{s.description}</p>
                {s.bullets && s.bullets.length > 0 && (
                  <ul className="space-y-1 text-[11px] text-brand-text-muted/80 list-disc list-inside mb-4 pl-1">
                    {s.bullets.slice(0, 3).map((b, i) => (
                      <li key={i} className="line-clamp-1">{b}</li>
                    ))}
                    {s.bullets.length > 3 && <li>+ {s.bullets.length - 3} more features</li>}
                  </ul>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border-white/5 mt-auto">
                <button
                  onClick={() => openFormModal(s)}
                  className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-brand-accent rounded-lg text-brand-text-muted hover:text-white transition-all cursor-pointer"
                  title="Edit Service"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1.5 bg-brand-card-dark border border-brand-border-white/5 hover:border-red-500 rounded-lg text-brand-text-muted hover:text-red-400 transition-all cursor-pointer"
                  title="Delete Service"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-brand-card border border-brand-border-white/5 rounded-3xl p-8 text-white">
          <HelpCircle className="w-12 h-12 text-brand-text-muted mx-auto mb-4" />
          <h3 className="text-sm font-bold">No Services Configured</h3>
          <p className="text-xs text-brand-text-muted mt-2 max-w-sm mx-auto">Create services that describe your software capabilities.</p>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeService ? 'Edit Service Details' : 'Add New Service'}>
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Service Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Icon Identifier *</label>
                <select
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none cursor-pointer"
                >
                  <option value="Code">Code (Code)</option>
                  <option value="ShoppingBag">Shopping Bag (Shopify)</option>
                  <option value="Layers">Layers (Bubble.io)</option>
                  <option value="Zap">Zap (Performance)</option>
                  <option value="Search">Search (SEO)</option>
                  <option value="Layout">Layout (Design)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-brand-text-muted font-bold uppercase">Service Description *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none resize-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-brand-text-muted font-bold uppercase">Service Highlights / Bullets (one per line)</label>
              <textarea
                rows={4}
                value={bulletsText}
                onChange={(e) => setBulletsText(e.target.value)}
                placeholder="e.g. Pixel perfect Figma conversions&#10;Fully responsive grids&#10;Framer Motion micro-interactions"
                className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-brand-border-white/5 mt-4">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                Save Service
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
