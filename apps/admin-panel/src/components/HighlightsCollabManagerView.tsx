import React, { useState } from 'react';
import { useAdmin, Highlight, Collaboration } from '../context/AdminRealtimeContext';
import { LuxuryImage } from './LuxuryImage';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Instagram,
  ExternalLink,
  MessageCircle,
  Image as ImageIcon,
  CheckCircle2,
  X
} from 'lucide-react';

export const HighlightsCollabManagerView: React.FC = () => {
  const {
    highlights,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    collaborations,
    createCollaboration,
    updateCollaboration,
    deleteCollaboration,
    uploadImage
  } = useAdmin();

  const [activeSubTab, setActiveSubTab] = useState<'highlights' | 'collaborations'>('highlights');

  // Highlight modal states
  const [highlightModalOpen, setHighlightModalOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [highlightForm, setHighlightForm] = useState({
    title: '',
    iconText: '✨',
    category: 'Reviews',
    image: '',
    caption: '',
    tag: '@tara.luxe.in'
  });

  // Collaboration modal states
  const [collabModalOpen, setCollabModalOpen] = useState(false);
  const [editingCollab, setEditingCollab] = useState<Collaboration | null>(null);
  const [collabForm, setCollabForm] = useState({
    creatorName: '',
    handle: '@',
    profileUrl: 'https://www.instagram.com/tara.luxe.in/',
    image: '',
    featuredItem: '',
    quote: '',
    date: 'Recent'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // -------------------------------------------------------------
  // HIGHLIGHT HANDLERS
  // -------------------------------------------------------------
  const openNewHighlightModal = () => {
    setEditingHighlight(null);
    setHighlightForm({
      title: 'New Highlight ✨',
      iconText: '✨',
      category: 'Story',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      caption: 'Exclusive pieces curated for our Tara Luxe community.',
      tag: '@tara.luxe.in'
    });
    setHighlightModalOpen(true);
  };

  const openEditHighlightModal = (hl: Highlight) => {
    setEditingHighlight(hl);
    setHighlightForm({
      title: hl.title,
      iconText: hl.iconText || '✨',
      category: hl.category || 'Story',
      image: hl.image,
      caption: hl.caption || '',
      tag: hl.tag || '@tara.luxe.in'
    });
    setHighlightModalOpen(true);
  };

  const handleHighlightImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      if (url) {
        setHighlightForm((prev) => ({ ...prev, image: url }));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!highlightForm.title.trim() || !highlightForm.image.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingHighlight) {
        await updateHighlight(editingHighlight.id, highlightForm);
      } else {
        await createHighlight(highlightForm);
      }
      setHighlightModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHighlight = async (id: string, title: string) => {
    if (confirm(`Delete highlight "${title}"? This will update the storefront in real time.`)) {
      await deleteHighlight(id);
    }
  };

  // -------------------------------------------------------------
  // COLLABORATION HANDLERS
  // -------------------------------------------------------------
  const openNewCollabModal = () => {
    setEditingCollab(null);
    setCollabForm({
      creatorName: '',
      handle: '@',
      profileUrl: 'https://www.instagram.com/tara.luxe.in/',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      featuredItem: '',
      quote: '',
      date: 'Recent'
    });
    setCollabModalOpen(true);
  };

  const openEditCollabModal = (c: Collaboration) => {
    setEditingCollab(c);
    setCollabForm({
      creatorName: c.creatorName,
      handle: c.handle,
      profileUrl: c.profileUrl,
      image: c.image,
      featuredItem: c.featuredItem,
      quote: c.quote,
      date: c.date
    });
    setCollabModalOpen(true);
  };

  const handleCollabImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      if (url) {
        setCollabForm((prev) => ({ ...prev, image: url }));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabForm.creatorName.trim() || !collabForm.image.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingCollab) {
        await updateCollaboration(editingCollab.id, collabForm);
      } else {
        await createCollaboration(collabForm);
      }
      setCollabModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCollab = async (id: string, name: string) => {
    if (confirm(`Delete collaboration post with "${name}"? This will update the storefront in real time.`)) {
      await deleteCollaboration(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl glass-panel flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-gold" />
            <h2 className="text-xl font-serif font-bold text-ivory">
              Instagram Highlights & Creator Collaborations
            </h2>
          </div>
          <p className="text-xs text-ivory/60 mt-1 max-w-2xl">
            Manage official @tara.luxe.in story highlights and the "Spotted in Tara Luxe" creator showcase.
            Any update broadcasts immediately to the Storefront via real-time SSE stream.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 rounded-xl bg-obsidian border border-gold/20 text-xs">
            <button
              onClick={() => setActiveSubTab('highlights')}
              className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
                activeSubTab === 'highlights'
                  ? 'bg-gold text-obsidian font-bold shadow'
                  : 'text-ivory/70 hover:text-ivory'
              }`}
            >
              Story Highlights ({highlights.length})
            </button>
            <button
              onClick={() => setActiveSubTab('collaborations')}
              className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
                activeSubTab === 'collaborations'
                  ? 'bg-gold text-obsidian font-bold shadow'
                  : 'text-ivory/70 hover:text-ivory'
              }`}
            >
              Collaborations ({collaborations.length})
            </button>
          </div>

          {activeSubTab === 'highlights' ? (
            <button
              onClick={openNewHighlightModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gold text-obsidian font-bold text-xs hover:bg-gold-light transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add Highlight</span>
            </button>
          ) : (
            <button
              onClick={openNewCollabModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gold text-obsidian font-bold text-xs hover:bg-gold-light transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add Collaboration</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* HIGHLIGHTS TAB CONTENT */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'highlights' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((hl) => (
            <div
              key={hl.id}
              className="p-4 rounded-2xl glass-card border border-gold/20 hover:border-gold/50 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Circle Story Preview */}
                <div className="flex justify-center mb-4">
                  <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-md">
                    <div className="p-0.5 rounded-full bg-obsidian">
                      <div className="w-20 h-20 rounded-full overflow-hidden border border-gold/40">
                        <LuxuryImage
                          src={hl.image}
                          alt={hl.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    <span className="absolute bottom-0 right-0 px-1.5 py-0.5 rounded-full bg-gold text-obsidian text-[10px] font-bold">
                      {hl.iconText || '✨'}
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="font-serif font-bold text-base text-ivory">{hl.title}</h3>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold/15 text-gold-light border border-gold/25">
                      {hl.category}
                    </span>
                    <span className="text-[10px] font-mono text-ivory/50">{hl.tag}</span>
                  </div>
                  <p className="text-xs text-ivory/70 line-clamp-2 mt-2 italic px-2">
                    "{hl.caption}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-gold/15 flex items-center justify-between">
                <button
                  onClick={() => openEditHighlightModal(hl)}
                  className="flex items-center gap-1 text-xs text-gold hover:text-gold-light font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteHighlight(hl.id, hl.title)}
                  className="p-1.5 text-ruby-stock hover:text-red-400 hover:bg-ruby-stock/10 rounded-lg transition-colors"
                  title="Delete Highlight"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* COLLABORATIONS TAB CONTENT */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'collaborations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {collaborations.map((collab) => (
            <div
              key={collab.id}
              className="rounded-2xl glass-card border border-gold/20 overflow-hidden flex flex-col justify-between group hover:border-gold/50 transition-all"
            >
              <div>
                {/* Image Banner */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-espresso">
                  <LuxuryImage
                    src={collab.image}
                    alt={collab.creatorName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-obsidian/80 backdrop-blur-md border border-gold/30 text-[10px] font-mono text-gold-light flex items-center gap-1">
                    <Instagram className="w-3 h-3 text-gold" />
                    <span>{collab.handle}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-obsidian/80 backdrop-blur-md text-[10px] font-mono text-ivory/70">
                    {collab.date}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base text-ivory">{collab.creatorName}</h3>
                    <a
                      href={collab.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gold hover:underline flex items-center gap-1"
                    >
                      <span>Visit Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="inline-block px-2.5 py-1 rounded-lg bg-gold/10 border border-gold/25 text-[11px] text-gold-light font-medium">
                    ✦ Featured: {collab.featuredItem}
                  </div>

                  <p className="text-xs text-ivory/75 italic line-clamp-3">
                    "{collab.quote}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-3 border-t border-gold/15 flex items-center justify-between">
                <button
                  onClick={() => openEditCollabModal(collab)}
                  className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Post</span>
                </button>
                <button
                  onClick={() => handleDeleteCollab(collab.id, collab.creatorName)}
                  className="p-1.5 text-ruby-stock hover:text-red-400 hover:bg-ruby-stock/10 rounded-lg transition-colors"
                  title="Delete Collaboration"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HIGHLIGHT MODAL (CREATE / EDIT) */}
      {/* ------------------------------------------------------------- */}
      {highlightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel p-6 border border-gold/40 shadow-2xl relative">
            <button
              onClick={() => setHighlightModalOpen(false)}
              className="absolute top-4 right-4 text-ivory/60 hover:text-gold"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-ivory mb-1">
              {editingHighlight ? 'Edit Instagram Highlight' : 'New Instagram Highlight'}
            </h3>
            <p className="text-xs text-ivory/60 mb-4">
              Changes reflect immediately on the storefront highlights circular row.
            </p>

            <form onSubmit={handleSaveHighlight} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-gold-light mb-1 uppercase tracking-wider">
                  Highlight Title *
                </label>
                <input
                  type="text"
                  required
                  value={highlightForm.title}
                  onChange={(e) => setHighlightForm({ ...highlightForm, title: e.target.value })}
                  placeholder="e.g. Reviews ✨, Collab ✨"
                  className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-ivory text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gold-light mb-1 uppercase tracking-wider">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={highlightForm.category}
                    onChange={(e) => setHighlightForm({ ...highlightForm, category: e.target.value })}
                    placeholder="e.g. Reviews, Orders"
                    className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-ivory text-xs focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gold-light mb-1 uppercase tracking-wider">
                    Emoji / Icon Badge
                  </label>
                  <input
                    type="text"
                    value={highlightForm.iconText}
                    onChange={(e) => setHighlightForm({ ...highlightForm, iconText: e.target.value })}
                    placeholder="e.g. ✨, 🎁, ✦"
                    className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-ivory text-xs focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Cover Image Upload / URL */}
              <div>
                <label className="block text-[11px] font-mono text-gold-light mb-1 uppercase tracking-wider">
                  Cover / Story Image *
                </label>
                <div className="flex gap-3 items-center mb-2">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-gold/40 flex-shrink-0 bg-espresso">
                    <LuxuryImage
                      src={highlightForm.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      required
                      value={highlightForm.image}
                      onChange={(e) => setHighlightForm({ ...highlightForm, image: e.target.value })}
                      placeholder="Paste image URL..."
                      className="w-full px-3 py-1.5 rounded-xl bg-obsidian border border-gold/30 text-ivory text-xs focus:outline-none focus:border-gold"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gold/15 hover:bg-gold/25 border border-gold/40 text-[11px] text-gold cursor-pointer transition-colors">
                      <Upload className="w-3 h-3" />
                      <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleHighlightImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gold-light mb-1 uppercase tracking-wider">
                  Modal Story Caption / PR Info
                </label>
                <textarea
                  rows={2}
                  value={highlightForm.caption}
                  onChange={(e) => setHighlightForm({ ...highlightForm, caption: e.target.value })}
                  placeholder="e.g. Post any Reel from our page & tag us in your story to get your PR package"
                  className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-ivory text-xs focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gold/15">
                <button
                  type="button"
                  onClick={() => setHighlightModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-espresso hover:bg-espresso/80 text-xs text-ivory/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-light text-obsidian font-bold text-xs shadow-lg transition-all"
                >
                  {isSubmitting ? 'Saving...' : editingHighlight ? 'Update Highlight' : 'Create Highlight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* COLLABORATION MODAL (CREATE / EDIT) */}
      {/* ------------------------------------------------------------- */}
      {collabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl glass-panel p-6 border border-gold/40 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCollabModalOpen(false)}
              className="absolute top-4 right-4 text-ivory/60 hover:text-gold"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-ivory mb-1">
              {editingCollab ? 'Edit Collaboration Post' : 'Add Creator Collaboration'}
            </h3>
            <p className="text-xs text-ivory/60 mb-4">
              Add a brand creator, influencer, or customer feature to the "Spotted in Tara Luxe" showcase.
            </p>

            <form onSubmit={handleSaveCollab} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gold-light mb-1 uppercase tracking-wider">
                    Creator Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={collabForm.creatorName}
                    onChange={(e) => setCollabForm({ ...collabForm, creatorName: e.target.value })}
                    placeholder="e.g. Ananya Roy"
                    className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-ivory text-xs focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gold-light mb-1 uppercase tracking-wider">
                    Instagram Handle *
                  </label>
                  <input
                    type="text"
                    required
                    value={collabForm.handle}
                    onChange={(e) => setCollabForm({ ...collabForm, handle: e.target.value })}
                    placeholder="@creatorhandle"
                    className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-ivory text-xs focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gold-light mb-1 uppercase tracking-wider">
                  Instagram Profile URL
                </label>
                <input
                  type="url"
                  value={collabForm.profileUrl}
                  onChange={(e) => setCollabForm({ ...collabForm, profileUrl: e.target.value })}
                  placeholder="https://www.instagram.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-ivory text-xs focus:outline-none focus:border-gold"
                />
              </div>

              {/* Image Input + Upload */}
              <div>
                <label className="block text-[11px] font-mono text-gold-light mb-1 uppercase tracking-wider">
                  Post / Reel Photo *
                </label>
                <div className="flex gap-3 items-center mb-2">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gold/40 flex-shrink-0 bg-espresso">
                    <LuxuryImage
                      src={collabForm.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      required
                      value={collabForm.image}
                      onChange={(e) => setCollabForm({ ...collabForm, image: e.target.value })}
                      placeholder="Paste image URL..."
                      className="w-full px-3 py-1.5 rounded-xl bg-obsidian border border-gold/30 text-ivory text-xs focus:outline-none focus:border-gold"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gold/15 hover:bg-gold/25 border border-gold/40 text-[11px] text-gold cursor-pointer transition-colors">
                      <Upload className="w-3 h-3" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCollabImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gold-light mb-1 uppercase tracking-wider">
                    Featured Item *
                  </label>
                  <input
                    type="text"
                    required
                    value={collabForm.featuredItem}
                    onChange={(e) => setCollabForm({ ...collabForm, featuredItem: e.target.value })}
                    placeholder="e.g. Celestial Clover Necklace"
                    className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-ivory text-xs focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gold-light mb-1 uppercase tracking-wider">
                    Date / Campaign Tag
                  </label>
                  <input
                    type="text"
                    value={collabForm.date}
                    onChange={(e) => setCollabForm({ ...collabForm, date: e.target.value })}
                    placeholder="e.g. Festive Edit, Oct 2026"
                    className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-ivory text-xs focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gold-light mb-1 uppercase tracking-wider">
                  Creator Review Quote / Caption
                </label>
                <textarea
                  rows={3}
                  value={collabForm.quote}
                  onChange={(e) => setCollabForm({ ...collabForm, quote: e.target.value })}
                  placeholder="e.g. Wore this necklace for a week straight through showers and gym sessions—zero tarnish, pure 18k shine! ✦"
                  className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-ivory text-xs focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gold/15">
                <button
                  type="button"
                  onClick={() => setCollabModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-espresso hover:bg-espresso/80 text-xs text-ivory/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-light text-obsidian font-bold text-xs shadow-lg transition-all"
                >
                  {isSubmitting ? 'Saving...' : editingCollab ? 'Update Collaboration' : 'Publish Collaboration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
