'use client';

import React, { useEffect, useState } from 'react';
import { Camera, Image as ImageIcon, Save, Trash2, HelpCircle } from 'lucide-react';
import Button from '../Button';
import Card from '../Card';
import { useToast } from '@/context/ToastContext';

export default function PageMediaTab() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Image states
  const [homeHeroImageUrl, setHomeHeroImageUrl] = useState('');
  const [aboutHeroImageUrl, setAboutHeroImageUrl] = useState('');
  const [aboutBottomBannerImageUrl, setAboutBottomBannerImageUrl] = useState('');

  // Upload progress states
  const [uploadingHomeHero, setUploadingHomeHero] = useState(false);
  const [uploadingAboutHero, setUploadingAboutHero] = useState(false);
  const [uploadingAboutBottom, setUploadingAboutBottom] = useState(false);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/site-media');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setHomeHeroImageUrl(json.data.homeHeroImageUrl || '');
          setAboutHeroImageUrl(json.data.aboutHeroImageUrl || '');
          setAboutBottomBannerImageUrl(json.data.aboutBottomBannerImageUrl || '');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load page media configurations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const uploadImageFile = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Upload failed');
    }
    return data.data.fileUrl;
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'homeHero' | 'aboutHero' | 'aboutBottom'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show indicator
    if (type === 'homeHero') setUploadingHomeHero(true);
    if (type === 'aboutHero') setUploadingAboutHero(true);
    if (type === 'aboutBottom') setUploadingAboutBottom(true);

    showToast('Uploading image to cloud storage...', 'info');

    try {
      const url = await uploadImageFile(file, 'site-media');
      
      if (type === 'homeHero') {
        setHomeHeroImageUrl(url);
      } else if (type === 'aboutHero') {
        setAboutHeroImageUrl(url);
      } else if (type === 'aboutBottom') {
        setAboutBottomBannerImageUrl(url);
      }
      
      showToast('Image uploaded successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingHomeHero(false);
      setUploadingAboutHero(false);
      setUploadingAboutBottom(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/site-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeHeroImageUrl,
          aboutHeroImageUrl,
          aboutBottomBannerImageUrl,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast('Page media configurations saved successfully!', 'success');
      } else {
        showToast(json.message || 'Failed to save configuration', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred while saving', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-brand-text-muted">Loading page media settings...</div>;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Landing Page Media Manager</h3>
          <p className="text-[11px] text-brand-text-muted mt-0.5">Customize default graphics/illustrations on your Home and About landing pages.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Home Hero Graphic Card */}
        <Card hoverEffect={false} className="p-6 border border-brand-border-white bg-brand-card-dark/25">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-brand-accent uppercase">1. Homepage Hero Image</h4>
                <p className="text-[10px] text-brand-text-muted mt-0.5">
                  Replaces the default hero visual / avatar on the home page. Defaults to Tarikur's main portrait if blank.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/90 font-semibold">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={homeHeroImageUrl}
                  onChange={(e) => setHomeHeroImageUrl(e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white placeholder-brand-text-muted focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/90 font-semibold">File Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'homeHero')}
                  className="w-full text-xs text-brand-text-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-brand-accent file:text-white file:cursor-pointer"
                />
              </div>
            </div>

            <div className="w-full md:w-64 flex flex-col justify-center items-center shrink-0 p-4 border border-brand-border-white/5 rounded-xl bg-brand-card-dark/40">
              <span className="text-[9px] text-brand-text-muted uppercase font-bold mb-2">Live Preview</span>
              {homeHeroImageUrl ? (
                <div className="relative aspect-square w-40 rounded-xl overflow-hidden border border-brand-border">
                  <img src={homeHeroImageUrl} alt="Home Hero Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setHomeHeroImageUrl('')}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-600/80 hover:bg-red-700 text-white rounded cursor-pointer"
                    title="Clear image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="aspect-square w-40 rounded-xl bg-brand-card flex flex-col items-center justify-center text-brand-text-muted border border-brand-border-white/5">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-[10px] text-center px-4">Default Profile Portrait Fallback</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* About Hero Graphic Card */}
        <Card hoverEffect={false} className="p-6 border border-brand-border-white bg-brand-card-dark/25">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-brand-accent uppercase">2. About Page Hero Image</h4>
                <p className="text-[10px] text-brand-text-muted mt-0.5">
                  The primary visual shown in the header/top-right portion of your About page profile.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/90 font-semibold">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={aboutHeroImageUrl}
                  onChange={(e) => setAboutHeroImageUrl(e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white placeholder-brand-text-muted focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/90 font-semibold">File Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'aboutHero')}
                  className="w-full text-xs text-brand-text-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-brand-accent file:text-white file:cursor-pointer"
                />
              </div>
            </div>

            <div className="w-full md:w-64 flex flex-col justify-center items-center shrink-0 p-4 border border-brand-border-white/5 rounded-xl bg-brand-card-dark/40">
              <span className="text-[9px] text-brand-text-muted uppercase font-bold mb-2">Live Preview</span>
              {aboutHeroImageUrl ? (
                <div className="relative aspect-square w-40 rounded-xl overflow-hidden border border-brand-border">
                  <img src={aboutHeroImageUrl} alt="About Hero Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setAboutHeroImageUrl('')}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-600/80 hover:bg-red-700 text-white rounded cursor-pointer"
                    title="Clear image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="aspect-square w-40 rounded-xl bg-brand-card flex flex-col items-center justify-center text-brand-text-muted border border-brand-border-white/5">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-[10px] text-center px-4">Default About Graphic Fallback</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* About Bottom Banner Card */}
        <Card hoverEffect={false} className="p-6 border border-brand-border-white bg-brand-card-dark/25">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-brand-accent uppercase">3. About Page Bottom Banner</h4>
                <p className="text-[10px] text-brand-text-muted mt-0.5">
                  The wide graphic banner displayed across the bottom of the About section. Recommended size: 1200x400.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/90 font-semibold">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={aboutBottomBannerImageUrl}
                  onChange={(e) => setAboutBottomBannerImageUrl(e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white placeholder-brand-text-muted focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/90 font-semibold">File Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'aboutBottom')}
                  className="w-full text-xs text-brand-text-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-brand-accent file:text-white file:cursor-pointer"
                />
              </div>
            </div>

            <div className="w-full md:w-64 flex flex-col justify-center items-center shrink-0 p-4 border border-brand-border-white/5 rounded-xl bg-brand-card-dark/40">
              <span className="text-[9px] text-brand-text-muted uppercase font-bold mb-2">Live Preview</span>
              {aboutBottomBannerImageUrl ? (
                <div className="relative w-48 h-20 rounded-xl overflow-hidden border border-brand-border">
                  <img src={aboutBottomBannerImageUrl} alt="About Bottom Banner Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setAboutBottomBannerImageUrl('')}
                    className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-700 text-white rounded cursor-pointer"
                    title="Clear image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-48 h-20 rounded-xl bg-brand-card flex flex-col items-center justify-center text-brand-text-muted border border-brand-border-white/5">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-[9px] text-center px-4">Default Wide Banner Fallback</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto font-bold py-3 text-xs px-8"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Media Configurations
          </Button>
        </div>
      </form>
    </div>
  );
}
