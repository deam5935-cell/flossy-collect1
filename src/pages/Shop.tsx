import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { Filter, ChevronDown, Grid3X3, Grid2X2, Eye, ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addItem } = useCart();
  
  const categoryFilter = searchParams.get('category');
  const genderFilter = searchParams.get('gender');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        
        if (categoryFilter) {
          q = query(collection(db, 'products'), where('category', '==', categoryFilter), orderBy('createdAt', 'desc'));
        } else if (genderFilter) {
          q = query(collection(db, 'products'), where('gender', '==', genderFilter), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          results = results.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery)
          );
        }

        setProducts(results);
      } catch (err) {
        console.error("Error fetching shop products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [categoryFilter, genderFilter, searchQuery]);

  const categories = ['All', 'Women', 'Men', 'Kids', 'Babies', 'Accessories', 'Beauty', 'Footwear'];

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
           <h4 className="micro-label mb-2 text-gold">The Collection</h4>
           <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif italic"
           >
             {searchQuery ? `Exploring: ${searchQuery}` : (categoryFilter || 'All Creations')}
           </motion.h1>
        </div>

        {/* Filters & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center border-y border-white/10 py-6 mb-12 gap-6 sticky top-20 bg-black z-30">
          <div className="flex items-center space-x-8 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto scrollbar-hide">
            {categories.map((cat) => (
              <Link 
                key={cat} 
                to={cat === 'All' ? '/shop' : `/shop?category=${cat}`}
                className={cn(
                  "text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300",
                  (categoryFilter === cat || (!categoryFilter && cat === 'All')) ? "text-gold font-bold scale-110" : "text-white/50 hover:text-white"
                )}
              >
                {cat}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-6 shrink-0">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-2 transition-colors", viewMode === 'grid' ? "text-gold" : "text-white/30")}
              >
                <Grid3X3 size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-2 transition-colors", viewMode === 'list' ? "text-gold" : "text-white/30")}
              >
                <Grid2X2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] bg-white/5" />
                <div className="h-4 bg-white/5 w-3/4" />
                <div className="h-4 bg-white/5 w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={cn(
            "grid gap-x-6 gap-y-16",
            viewMode === 'grid' ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
          )}>
            <AnimatePresence mode="popLayout">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="relative group"
                >
                  <Link to={`/product/${product.id}`} className={cn(
                    "block",
                    viewMode === 'list' && "flex flex-col md:flex-row gap-12 items-center"
                  )}>
                    <div className={cn(
                      "relative aspect-[3/4] overflow-hidden bg-zinc-900 mb-6",
                      viewMode === 'list' ? "w-full md:w-96" : "w-full"
                    )}>
                      <img 
                        src={product.images[0]} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                      />
                      
                      {/* Overlay Controls */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 lg:p-6 pb-8 lg:pb-10 translate-y-4 group-hover:translate-y-0 transition-transform">
                         <div className="flex flex-col space-y-2">
                           <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setQuickViewProduct(product);
                            }}
                            className="w-full bg-white text-black py-3 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center space-x-2 hover:bg-gold hover:text-white transition-colors"
                           >
                             <Eye size={14} />
                             <span>Quick View</span>
                           </button>
                           <button 
                            onClick={(e) => handleQuickAdd(e, product)}
                            className="w-full bg-transparent border border-white text-white py-3 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center space-x-2 hover:bg-white hover:text-black transition-colors"
                           >
                             <ShoppingBag size={14} />
                             <span>Add to Bag</span>
                           </button>
                         </div>
                      </div>

                      {/* Featured/Stock Badges */}
                      {product.stock <= 3 && product.stock > 0 && (
                        <div className="absolute top-4 left-4 bg-red-500/90 text-white text-[8px] uppercase font-black tracking-widest px-2 py-1">
                          Low Stock
                        </div>
                      )}
                    </div>

                    <div className={viewMode === 'list' ? "text-center md:text-left flex-grow" : ""}>
                      <h4 className="micro-label mb-2 text-white/40">{product.category} • {product.gender}</h4>
                      <h3 className="text-lg font-medium group-hover:text-gold transition-colors mb-2 uppercase tracking-wide leading-tight">{product.name}</h3>
                      <p className="text-gold font-serif text-xl">{formatPrice(product.price)}</p>
                      
                      {viewMode === 'list' && (
                        <>
                          <p className="mt-6 text-white/50 text-sm max-w-xl line-clamp-3 mb-8">{product.description}</p>
                          <div className="flex space-x-4">
                            <button className="premium-btn">View Full Product</button>
                            <button 
                              onClick={(e) => handleQuickAdd(e, product)}
                              className="text-[10px] uppercase tracking-widest border border-white/20 px-8 py-4 hover:bg-white hover:text-black transition-colors"
                            >
                              Add to Bag
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-40 text-center">
             <h3 className="text-xl text-white/50 italic mb-8">No pieces found in this collection.</h3>
             <Link to="/shop" className="premium-btn">Back to All Items</Link>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#0A0A0A] w-full max-w-5xl max-h-[90vh] overflow-hidden border border-white/10 flex flex-col md:flex-row shadow-2xl"
            >
              <button 
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-6 right-6 z-20 text-white/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              {/* Images Column */}
              <div className="w-full md:w-1/2 overflow-y-auto aspect-square md:aspect-auto">
                <div className="grid grid-cols-1 gap-2 p-2">
                  {quickViewProduct.images.map((img, i) => (
                    <img key={i} src={img} className="w-full h-full object-cover" alt={quickViewProduct.name} loading="lazy" decoding="async" />
                  ))}
                </div>
              </div>

              {/* Info Column */}
              <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center overflow-y-auto">
                <h4 className="micro-label text-gold mb-4">{quickViewProduct.category}</h4>
                <h2 className="text-3xl md:text-5xl font-serif mb-6 leading-tight uppercase tracking-tight">{quickViewProduct.name}</h2>
                <p className="text-2xl text-gold font-serif mb-8 border-b border-white/5 pb-8">{formatPrice(quickViewProduct.price)}</p>
                
                <p className="text-white/60 mb-10 leading-relaxed font-light line-clamp-4">
                  {quickViewProduct.description}
                </p>

                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      addItem(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="w-full premium-btn"
                  >
                    Add to Luxury Bag
                  </button>
                  <Link 
                    to={`/product/${quickViewProduct.id}`}
                    className="w-full text-center text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors block py-4"
                  >
                    All Details & Styling Tips
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
