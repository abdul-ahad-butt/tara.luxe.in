import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard3D } from './ProductCard3D';
import { Sparkles, ArrowUpDown } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const {
    products,
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    loading
  } = useStore();

  const allCategoryPills = useMemo(() => {
    return ['All', ...categories.map((c) => c.name)];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'stock') return b.quantity - a.quantity;
      return 0; // featured/default
    });
  }, [products, activeCategory, searchQuery, sortBy]);

  return (
    <section id="collection-grid" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Grid Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-gold/15">
        <div>
          <div className="flex items-center gap-2 text-gold-brushed text-xs font-mono uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Curated Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ivory">
            {activeCategory === 'All' ? 'Complete Tara Luxe Edit' : activeCategory}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-ivory-warm/70">
            Showing {filteredProducts.length} pieces • 100% Anti-Tarnish 316L Stainless Steel & 18k PVD Plated
          </p>
        </div>

        {/* Sort Filter Selector */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <ArrowUpDown className="w-4 h-4 text-gold/70" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-espresso border border-gold/30 rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold cursor-pointer"
          >
            <option value="featured">Featured Collection</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="stock">Stock Available</option>
          </select>
        </div>
      </div>

      {/* Dynamic Category Pills Bar */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {allCategoryPills.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-gold text-obsidian font-bold shadow-gold-glow'
                : 'bg-espresso/80 text-ivory/80 border border-gold/20 hover:border-gold/50 hover:text-gold'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-gold-light font-mono">Loading handcrafted jewellery collection...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center rounded-3xl glass-card border border-gold/20 p-8 max-w-md mx-auto">
          <p className="text-lg font-serif text-ivory mb-2">No matching pieces found</p>
          <p className="text-xs text-ivory/60 mb-6">
            Try adjusting your search terms or filter category to discover our collection.
          </p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setSearchQuery('');
            }}
            className="px-5 py-2 rounded-full bg-gold text-obsidian text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard3D key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};
