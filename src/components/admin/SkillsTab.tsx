'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, HelpCircle, Save, Star } from 'lucide-react';
import Button from '../Button';
import Card from '../Card';
import Modal from '../Modal';

interface Skill {
  id: string;
  name: string;
  category: 'frontend' | 'nocode' | 'optimization';
  level: number;
  iconName: string;
}

export default function SkillsTab() {
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'frontend' | 'nocode' | 'optimization'>('frontend');
  const [level, setLevel] = useState(85);
  const [iconName, setIconName] = useState('Code');

  const loadSkills = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', '12');

      const res = await fetch(`/api/admin/skills?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setSkills(json.data.skills);
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
    loadSkills();
  }, [page]);

  const openFormModal = (skill: Skill | null) => {
    setActiveSkill(skill);
    if (skill) {
      setName(skill.name);
      setCategory(skill.category || 'frontend');
      setLevel(skill.level || 85);
      setIconName(skill.iconName || 'Code');
    } else {
      setName('');
      setCategory('frontend');
      setLevel(85);
      setIconName('Code');
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || level === undefined || !iconName) return;

    try {
      let res;
      if (activeSkill) {
        res = await fetch(`/api/admin/skills/${activeSkill.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            category,
            level: Number(level),
            iconName,
          }),
        });
      } else {
        res = await fetch('/api/admin/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            category,
            level: Number(level),
            iconName,
          }),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        loadSkills();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this skill?')) return;
    try {
      const res = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadSkills();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categoryLabels = {
    frontend: 'Frontend Stack',
    nocode: 'No-Code Engine',
    optimization: 'Optimization & SEO',
  };

  const categoryColors = {
    frontend: 'border-brand-accent/30 bg-brand-accent/5 text-brand-accent',
    nocode: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    optimization: 'border-green-500/30 bg-green-500/5 text-green-400',
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Manage Skills & Stacks</h3>
          <p className="text-[11px] text-brand-text-muted mt-0.5">Control dynamic levels and proficiency lists rendered in your homepage "Expertise & Technologies" grid.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => openFormModal(null)}>
          Add Skill
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-brand-text-muted">Loading skills library...</div>
      ) : skills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {skills.map((s) => (
            <Card key={s.id} hoverEffect={false} className="p-4 border border-brand-border-white bg-brand-card-dark/25 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 border text-[8px] font-extrabold uppercase rounded-full tracking-wider ${categoryColors[s.category]}`}>
                    {categoryLabels[s.category]}
                  </span>
                  <span className="text-white text-[10px] font-bold">{s.level}%</span>
                </div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-6.5 h-6.5 rounded-lg border border-brand-border-white/5 flex items-center justify-center bg-brand-card font-mono text-[10px] text-brand-accent font-bold">
                    {s.iconName[0]}
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{s.name}</h4>
                </div>
                
                {/* Visual slider gauge */}
                <div className="w-full h-1.5 bg-brand-card border border-brand-border-white/5 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-brand-accent rounded-full" style={{ width: `${s.level}%` }} />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-brand-border-white/5 mt-2">
                <button
                  onClick={() => openFormModal(s)}
                  className="p-1 bg-brand-card-dark border border-brand-border-white/5 hover:border-brand-accent rounded text-brand-text-muted hover:text-white transition-all cursor-pointer"
                  title="Edit Skill"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1 bg-brand-card-dark border border-brand-border-white/5 hover:border-red-500 rounded text-brand-text-muted hover:text-red-400 transition-all cursor-pointer"
                  title="Delete Skill"
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
          <h3 className="text-sm font-bold">No Skills Configured</h3>
          <p className="text-xs text-brand-text-muted mt-2 max-w-sm mx-auto">Click "Add Skill" to seed skills into the visual lists.</p>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeSkill ? 'Edit Skill parameters' : 'Add New Skill'}>
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Skill Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Category *</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none cursor-pointer"
                >
                  <option value="frontend">Frontend Architecture</option>
                  <option value="nocode">No-Code platforms</option>
                  <option value="optimization">Performance & SEO</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Proficiency Level * ({level}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full h-8 cursor-pointer accent-brand-accent bg-transparent"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-brand-text-muted font-bold uppercase">Vector Icon Identifier *</label>
                <select
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white focus:outline-none cursor-pointer"
                >
                  <option value="Code">Code (Tag)</option>
                  <option value="Cpu">CPU (Processor)</option>
                  <option value="Shield">Shield (Security)</option>
                  <option value="Palette">Palette (Tailwind/CSS)</option>
                  <option value="ShoppingBag">Shopping Bag (Shopify)</option>
                  <option value="Layers">Layers (Bubble.io)</option>
                  <option value="Layout">Layout (UX)</option>
                  <option value="Search">Search (SEO)</option>
                  <option value="Zap">Zap (Performance)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-brand-border-white/5 mt-4">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                Save Skill
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
