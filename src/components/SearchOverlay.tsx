import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice } from '../lib/utils';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setLoading(true);
        try {
          // In a real large-scale app, we'd use Algolia or similar.
          // For this boutique, we fetch a set and filter client-side for immediate feedback.
          const q = query(collection(db, 'products'), limit(100));
          const snapshot = await getDocs(q);
          const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          
          const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
          ).slice(0, 6);

          setSuggestions(filtered);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100]"
          >
            <div className="max-w-4xl mx-auto px-6 pt-32">
              <div className="flex justify-between items-center mb-12">
                <span className="micro-label text-gold">Intelligent Finder</span>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                  <X size={32} strokeWidth={1} />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative group">
                <input 
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by collection, style or material..."
                  className="w-full bg-transparent border-b border-white/10 py-8 text-3xl md:text-5xl font-serif text-white outline-none focus:border-gold transition-colors placeholder:text-white/10"
                />
                <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-gold opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <Search size={32} />
                </button>
              </form>

              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-16">
                 {/* Suggestions */}
                 <div className="space-y-8">
                   <h4 className="micro-label text-white/30">Suggestions</h4>
                   {loading ? (
                     <div className="flex items-center space-x-3 text-gold">
                       <Loader2 className="animate-spin" size={16} />
                       <span className="text-xs uppercase tracking-widest">Scanning Catalog...</span>
                     </div>
                   ) : suggestions.length > 0 ? (
                     <div className="space-y-6">
                        {suggestions.map((item) => (
                          <Link 
                            key={item.id} 
                            to={`/product/${item.id}`} 
                            onClick={onClose}
                            className="flex items-center space-x-4 group"
                          >
                             <div className="w-12 h-16 bg-zinc-900 border border-white/5 shrink-0 overflow-hidden">
                               <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                             </div>
                             <div>
                               <p className="text-sm font-medium uppercase group-hover:text-gold transition-colors">{item.name}</p>
                               <p className="text-[10px] text-white/40 uppercase tracking-widest">{item.category} • {formatPrice(item.price)}</p>
                             </div>
                             <ArrowRight size={14} className="ml-auto text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        ))}
                     </div>
                   ) : searchTerm.length >= 2 ? (
                     <p className="text-xs italic text-white/20">No matching pieces discovered.</p>
                   ) : (
                     <div className="flex flex-wrap gap-3">
                        {['Women', 'Men', 'Accessories', 'Beauty', 'New Arrivals'].map(tag => (
                          <button 
                            key={tag}
                            onClick={() => setSearchTerm(tag)}
                            className="px-4 py-2 bg-white/5 rounded-full text-[10px] uppercase tracking-widest hover:bg-gold hover:text-black transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                     </div>
                   )}
                 </div>

                 {/* Trending Search */}
                 <div className="hidden md:block">
                    <h4 className="micro-label text-white/30 mb-8">Trending Now</h4>
                    <ul className="space-y-4">
                       <li><Link to="/shop?category=Women" className="text-lg font-serif hover:text-gold transition-colors">Summer Linen Collection</Link></li>
                       <li><Link to="/shop?category=Accessories" className="text-lg font-serif hover:text-gold transition-colors">24K Gold Accessories</Link></li>
                       <li><Link to="/shop?category=Footwear" className="text-lg font-serif hover:text-gold transition-colors">Minimalist Footwear</Link></li>
                       <li><Link to="/shop?category=Perfumes" className="text-lg font-serif hover:text-gold transition-colors">Premium Ouds & Scents</Link></li>
                    </ul>
                 </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
