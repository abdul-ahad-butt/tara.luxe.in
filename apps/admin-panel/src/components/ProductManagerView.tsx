import React, { useState } from 'react';
import { useAdmin, Product } from '../context/AdminRealtimeContext';
import { LuxuryImage } from './LuxuryImage';
import { Plus, Edit2, Trash2, Upload, Minus, Search, Sparkles, X, Check, Image as ImageIcon, AlertCircle, FolderPlus } from 'lucide-react';

export const ProductManagerView: React.FC = () => {
  const {
    products,
    categories,
    addCategory,
    adjustStock,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadImage
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Category inline creation state
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Anti-Tarnish Necklaces',
    description: '',
    price: 699,
    compareAtPrice: 1199,
    quantity: 15,
    imageUrl: '',
    badge: '18k PVD Gold',
    specs: ['316L Stainless Steel', '18k PVD Gold Plating', '100% Waterproof']
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const allCategoryNames = ['All', ...categories.map((c) => c.name)];

  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories[0]?.name || 'Anti-Tarnish Necklaces',
      description: 'Crafted in medical 316L stainless steel with thick 18k PVD gold plating. 100% waterproof and anti-tarnish.',
      price: 699,
      compareAtPrice: 1199,
      quantity: 15,
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      badge: 'New Arrival',
      specs: ['316L Stainless Steel', '18k PVD Gold Plating', '100% Waterproof']
    });
    setFormMsg(null);
    setIsAddingNewCategory(false);
    setModalMode('create');
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      quantity: p.quantity,
      imageUrl: p.imageUrl,
      badge: p.badge || '',
      specs: p.specs || ['316L Stainless Steel', '18k PVD Gold Plating']
    });
    setFormMsg(null);
    setIsAddingNewCategory(false);
    setModalMode('edit');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadedUrl = await uploadImage(file);
    setUploadingImage(false);

    if (uploadedUrl) {
      setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
    } else {
      setFormMsg({ text: 'Image upload failed. Try another image or use an image URL.', error: true });
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    const cat = await addCategory(newCategoryName.trim());
    if (cat) {
      setFormData((prev) => ({ ...prev, category: cat.name }));
      setNewCategoryName('');
      setIsAddingNewCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMsg(null);

    let success = false;
    if (modalMode === 'create') {
      success = await addProduct({
        ...formData,
        price: Number(formData.price),
        compareAtPrice: Number(formData.compareAtPrice),
        quantity: Number(formData.quantity)
      });
    } else if (modalMode === 'edit' && editingProduct) {
      success = await updateProduct(editingProduct.id, {
        ...formData,
        price: Number(formData.price),
        compareAtPrice: Number(formData.compareAtPrice),
        quantity: Number(formData.quantity)
      });
    }

    setIsSubmitting(false);

    if (success) {
      setModalMode(null);
    } else {
      setFormMsg({ text: 'Failed to save product. Please check fields.', error: true });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
        <div>
          <h2 className="text-xl font-serif font-bold text-ivory">Product Inventory & Catalog</h2>
          <p className="text-xs text-ivory/60 mt-1">
            Real-time stock adjustment, instant image uploads, and dynamic categories synced with the Storefront.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-obsidian text-xs font-bold uppercase tracking-wider transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Piece</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gold/60 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-espresso border border-gold/20 rounded-xl pl-10 pr-4 py-2 text-xs text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {allCategoryNames.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-gold text-obsidian font-bold shadow-sm'
                  : 'bg-espresso border border-gold/15 text-ivory/70 hover:text-ivory'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE / TABLET CARDS VIEW (<900px)                           */}
      {/* ------------------------------------------------------------- */}
      <div className="block min-[900px]:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 rounded-2xl glass-card text-ivory/50 text-xs">
            No products match the filter criteria.
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isSoldOut = p.quantity <= 0;
            const isLowStock = p.quantity > 0 && p.quantity <= 5;

            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl glass-card border border-gold/20 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-espresso border border-gold/25 flex-shrink-0">
                    <LuxuryImage
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase text-gold/80 px-2 py-0.5 rounded bg-gold/10 border border-gold/20">
                        {p.category}
                      </span>
                      {isSoldOut ? (
                        <span className="px-2 py-0.5 rounded-full bg-ruby-stock/20 text-ruby-stock text-[10px] font-mono font-bold">
                          Sold Out
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full bg-ruby-stock/20 text-ruby-stock text-[10px] font-mono font-bold animate-pulse">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-stock/20 text-emerald-stock text-[10px] font-mono">
                          In Stock
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-sm text-ivory truncate mt-1">
                      {p.name}
                    </h4>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono font-bold text-gold text-sm">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                      {p.compareAtPrice > p.price && (
                        <span className="text-[10px] text-ivory/40 line-through font-mono">
                          ₹{p.compareAtPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      {p.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold/15 text-gold-light font-mono truncate">
                          {p.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Touch-Friendly Quantity Stepper & Actions */}
                <div className="pt-2 border-t border-gold/15 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-ivory/60 font-mono">Stock:</span>
                    <button
                      onClick={() => adjustStock(p.id, -1)}
                      className="w-8 h-8 rounded-lg bg-espresso hover:bg-gold/20 border border-gold/30 text-ivory hover:text-gold flex items-center justify-center transition-colors"
                      title="Decrease stock"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={p.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          adjustStock(p.id, val, true);
                        }
                      }}
                      className="w-12 text-center bg-obsidian border border-gold/30 rounded-lg py-1 text-xs font-mono font-bold text-ivory"
                    />

                    <button
                      onClick={() => adjustStock(p.id, 1)}
                      className="w-8 h-8 rounded-lg bg-espresso hover:bg-gold/20 border border-gold/30 text-ivory hover:text-gold flex items-center justify-center transition-colors"
                      title="Increase stock"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 rounded-lg bg-espresso hover:bg-gold/20 border border-gold/30 text-gold-light"
                      title="Edit piece"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-2 rounded-lg bg-espresso hover:bg-ruby-stock/20 border border-ruby-stock/30 text-ruby-stock"
                      title="Delete piece"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP TABLE VIEW (>=900px)                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden min-[900px]:block rounded-2xl glass-card overflow-hidden border border-gold/15">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-gold/15 bg-espresso/90 text-[11px] font-mono uppercase tracking-wider text-gold-brushed">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price (₹)</th>
                <th className="p-4">Live Quantity Controls</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10 text-xs">
              {filteredProducts.map((p) => {
                const isSoldOut = p.quantity <= 0;
                const isLowStock = p.quantity > 0 && p.quantity <= 5;

                return (
                  <tr key={p.id} className="hover:bg-espresso/50 transition-colors">
                    {/* Product Cell */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <LuxuryImage
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover bg-espresso flex-shrink-0 border border-gold/20"
                        />
                        <div className="min-w-0 max-w-xs">
                          <div className="font-serif font-bold text-ivory text-sm truncate">
                            {p.name}
                          </div>
                          {p.badge && (
                            <span className="inline-block mt-0.5 text-[9px] px-2 py-0.5 rounded bg-gold/15 text-gold-light font-mono">
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category Cell */}
                    <td className="p-4 text-ivory/70 whitespace-nowrap">
                      {p.category}
                    </td>

                    {/* Price Cell */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-gold text-sm">
                        ₹{p.price.toLocaleString('en-IN')}
                      </div>
                      {p.compareAtPrice > p.price && (
                        <div className="text-[10px] text-ivory/40 line-through">
                          ₹{p.compareAtPrice.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    {/* Instant Inline Quantity Controls */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustStock(p.id, -1)}
                          className="w-7 h-7 rounded-lg bg-espresso hover:bg-gold/20 border border-gold/30 text-ivory hover:text-gold flex items-center justify-center transition-colors"
                          title="Decrease stock by 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="number"
                          min="0"
                          value={p.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              adjustStock(p.id, val, true);
                            }
                          }}
                          className="w-14 text-center bg-obsidian border border-gold/30 rounded-lg py-1 text-xs font-mono font-bold text-ivory focus:outline-none focus:border-gold"
                        />

                        <button
                          onClick={() => adjustStock(p.id, 1)}
                          className="w-7 h-7 rounded-lg bg-espresso hover:bg-gold/20 border border-gold/30 text-ivory hover:text-gold flex items-center justify-center transition-colors"
                          title="Increase stock by 1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {/* Status Tag */}
                        {isSoldOut ? (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-ruby-stock/20 text-ruby-stock text-[10px] font-mono font-bold">
                            Sold Out
                          </span>
                        ) : isLowStock ? (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-ruby-stock/20 text-ruby-stock text-[10px] font-mono font-bold animate-pulse">
                            Low Stock
                          </span>
                        ) : (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-stock/20 text-emerald-stock text-[10px] font-mono">
                            In Stock
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-espresso hover:bg-gold/20 border border-gold/30 text-gold-light hover:text-gold transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-espresso hover:bg-ruby-stock/20 border border-ruby-stock/30 text-ruby-stock transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal with Dynamic Category Selector */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl max-h-[90dvh] overflow-y-auto rounded-3xl bg-espresso border border-gold/30 shadow-2xl p-5 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-gold/20 mb-6">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-ivory">
                {modalMode === 'create' ? 'Add New Luxury Piece' : 'Edit Product Details'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 text-ivory/60 hover:text-ivory rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formMsg && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                  formMsg.error ? 'bg-ruby-stock/20 text-ruby-stock border border-ruby-stock/40' : 'bg-emerald-stock/20 text-emerald-stock'
                }`}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Product Title */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Celestial 18k Gold-Plated Clover Chain Necklace"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              {/* Dynamic Category Selector + "+ New Category" Inline Creator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-ivory/70">
                    Category *
                  </label>
                  {!isAddingNewCategory ? (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCategory(true)}
                      className="text-[10px] text-gold hover:text-gold-light flex items-center gap-1 font-mono cursor-pointer"
                    >
                      <FolderPlus className="w-3 h-3" />
                      <span>+ New Category</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCategory(false)}
                      className="text-[10px] text-ivory/50 hover:text-ivory font-mono cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {isAddingNewCategory ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter new category name..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 bg-obsidian border border-gold/40 rounded-xl px-3 py-2 text-ivory text-xs focus:outline-none focus:border-gold"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="px-3 py-2 bg-gold text-obsidian font-bold rounded-xl text-xs hover:bg-gold-light"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Badge & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 18k PVD Gold, Bestseller Hamper"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold font-mono"
                  />
                </div>
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                    Compare-at Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product specs, styling notes, and materials..."
                  className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold resize-none"
                />
              </div>

              {/* Image Input + Upload (25MB Support) */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                  Product Image *
                </label>
                <div className="flex gap-3 items-center mb-2">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-obsidian border border-gold/30 flex-shrink-0">
                    <LuxuryImage
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-1.5 text-ivory text-xs focus:outline-none focus:border-gold"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gold/15 hover:bg-gold/25 border border-gold/40 text-[11px] text-gold cursor-pointer transition-colors">
                      <Upload className="w-3 h-3" />
                      <span>{uploadingImage ? 'Uploading (up to 25MB)...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gold/20">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl bg-espresso hover:bg-espresso/80 text-ivory/70 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingImage}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-gold-brushed via-gold to-gold-light hover:from-gold hover:to-gold-light text-obsidian font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Piece' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
