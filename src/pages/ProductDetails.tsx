import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronRight, ArrowLeft, Heart, Share2, Info } from 'lucide-react';
import ProductReviews from '../components/ProductReviews';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const snapshot = await getDoc(docRef);
        
        if (snapshot.exists()) {
          const productData = { id: snapshot.id, ...snapshot.data() } as Product;
          setProduct(productData);
          
          // Related Products
          const relQ = query(
            collection(db, 'products'), 
            where('category', '==', productData.category),
            limit(12)
          );
          const relSnap = await getDocs(relQ);
          const allInCategory = relSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
          
          setRelated(allInCategory.filter(d => d.id !== id).slice(0, 4));

          // Find Next Product for addictive browsing
          const currentIndex = allInCategory.findIndex(p => p.id === id);
          if (currentIndex !== -1 && allInCategory.length > 1) {
            const nextIdx = (currentIndex + 1) % allInCategory.length;
            setNextProduct(allInCategory[nextIdx]);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
    window.scrollTo(0, 0);
    setActiveImage(0);
  }, [id]);

  const [nextProduct, setNextProduct] = useState<Product | null>(null);

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-gold animate-pulse">Loading Piece...</div>;
  if (!product) return <div className="h-screen flex flex-col items-center justify-center bg-black">
    <p className="text-xl mb-8 font-serif italic text-white/50">Sold out or not found.</p>
    <Link to="/shop" className="premium-btn">Explore Shop</Link>
  </div>;

  return (
    <div className="pt-24 min-h-screen">
      {/* Breadcrumb */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-[10px] uppercase tracking-widest text-white/40">
          <Link to="/" className="hover:text-gold">Home</Link>
          <ChevronRight size={10} />
          <Link to="/shop" className="hover:text-gold">Shop</Link>
          <ChevronRight size={10} />
          <Link to={`/shop?category=${product.category}`} className="hover:text-gold">{product.category}</Link>
          <ChevronRight size={10} />
          <span className="text-white">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Images Selection */}
        <div className="flex flex-col md:flex-row-reverse gap-6">
          <div className="flex-grow aspect-[3/4] bg-zinc-900 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                src={product.images[activeImage]}
                className="w-full h-full object-cover"
                alt={product.name}
              />
            </AnimatePresence>
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                 <span className="text-xs uppercase tracking-[0.3em] font-bold text-white border-2 border-white px-6 py-2">Out of Stock</span>
              </div>
            )}
          </div>
          
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto max-h-[600px] scrollbar-hide">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={cn(
                  "w-20 md:w-24 aspect-[3/4] shrink-0 border-2 transition-all",
                  activeImage === idx ? "border-gold" : "border-transparent opacity-50 hover:opacity-100"
                )}
              >
                <img src={img} className="w-full h-full object-cover" alt={`View ${idx}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Info Area */}
        <div className="flex flex-col justify-center max-w-lg">
          <h4 className="micro-label mb-2 text-gold">{product.gender}'s Fashion</h4>
          <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight uppercase tracking-wide">{product.name}</h1>
          <p className="text-2xl font-serif text-gold mb-8">{formatPrice(product.price)}</p>
          
          <div className="space-y-8 mb-12">
            <div className="p-4 border border-white/5 bg-white/[0.02]">
              <h5 className="micro-label mb-2 text-white/50 flex items-center">
                <Info size={12} className="mr-2" /> Description
              </h5>
              <p className="text-sm text-white/70 leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="p-4 border border-white/5 bg-white/[0.02]">
                <h5 className="micro-label mb-4 text-white/50 uppercase tracking-[0.2em] text-[8px]">Technical Specifications</h5>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">{key.replace('_', ' ')}</p>
                      <p className="text-xs text-white/80 font-light">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-[10px] uppercase tracking-widest text-green-500/80">In Stock and Ready to Ship from Madina</span>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button 
              disabled={product.stock <= 0}
              onClick={() => addToCart(product)}
              className="premium-btn-solid flex items-center justify-center space-x-3 py-4 disabled:opacity-50 disabled:grayscale"
            >
              <ShoppingBag size={18} />
              <span>Add to Bag</span>
            </button>
            
            <div className="flex space-x-4">
              <button className="flex-grow py-4 border border-white/10 hover:border-gold transition-colors flex items-center justify-center space-x-2 text-[10px] uppercase tracking-widest">
                <Heart size={14} />
                <span>Wishlist</span>
              </button>
              <button className="flex-grow py-4 border border-white/10 hover:border-gold transition-colors flex items-center justify-center space-x-2 text-[10px] uppercase tracking-widest">
                <Share2 size={14} />
                <span>Share</span>
              </button>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex items-center space-x-8 text-white/40">
             <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/WhatsApp_logo-color-vertical.svg" alt="WhatsApp" className="w-5 h-5 grayscale opacity-50" />
                </div>
                <div>
                   <p className="text-[8px] uppercase tracking-widest">Questions?</p>
                   <p className="text-[10px]">Chat via WhatsApp</p>
                </div>
             </div>
             <div>
                <p className="text-[8px] uppercase tracking-widest">Shipping</p>
                <p className="text-[10px]">Nationwide Delivery</p>
             </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="py-24 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <ProductReviews productId={product.id} />
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="py-24 border-t border-white/5 px-6">
          <div className="max-w-7xl mx-auto">
            <h4 className="micro-label mb-12 text-center">Complete the look</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map(item => (
                <Link key={item.id} to={`/product/${item.id}`} className="group">
                  <div className="aspect-[3/4] bg-zinc-900 mb-4 overflow-hidden">
                    <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h5 className="text-[10px] uppercase tracking-widest text-white/50 mb-1">{item.name}</h5>
                  <p className="text-xs text-gold">{formatPrice(item.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Floating Next Piece - Addictive Scrolling */}
      {nextProduct && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-32 right-10 z-40 hidden xl:block"
        >
          <Link to={`/product/${nextProduct.id}`} className="group flex items-center space-x-6 bg-black/80 backdrop-blur-md border border-white/10 p-4 hover:border-gold transition-colors">
            <div className="text-right">
              <p className="micro-label text-gold">Next Piece</p>
              <h5 className="text-[10px] text-white/60 uppercase tracking-widest max-w-[120px] truncate">{nextProduct.name}</h5>
            </div>
            <div className="w-16 h-20 bg-zinc-900 overflow-hidden shrink-0">
               <img src={nextProduct.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
            </div>
            <ChevronRight className="text-gold group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
