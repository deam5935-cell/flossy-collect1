import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, Quote, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { collection, query, where, getDocs, limit, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, SiteConfig } from '../types';
import { formatPrice, cn } from '../lib/utils';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Featured Products
        const featQ = query(collection(db, 'products'), where('isFeatured', '==', true), limit(4));
        const featSnap = await getDocs(featQ);
        setFeaturedProducts(featSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        // Fetch New Arrivals
        const newQ = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(4));
        const newSnap = await getDocs(newQ);
        setNewArrivals(newSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        // Fetch Site Config
        const configDoc = await getDoc(doc(db, 'content', 'config'));
        if (configDoc.exists()) {
          setConfig(configDoc.data() as SiteConfig);
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const categories = [
    { name: 'Women', title: 'The Feminine Edit', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=70&w=800&auto=format&fit=crop' },
    { name: 'Men', title: 'The Modern Gents', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=70&w=800&auto=format&fit=crop' },
    { name: 'Kids', title: 'Mini Style', image: 'https://images.unsplash.com/photo-1519702489929-e8f001f2722b?q=70&w=800&auto=format&fit=crop' },
    { name: 'Accessories', title: 'Timeless Jewelry', image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=70&w=800&auto=format&fit=crop' },
  ];

  return (
    <div className="bg-black">
      {config?.promoBanner && (
        <div className="bg-gold py-2 text-black text-center overflow-hidden">
          <div className="animate-marquee whitespace-nowrap inline-block">
             <span className="text-[10px] font-bold uppercase tracking-[0.3em] px-8">
               {config.promoBanner}
             </span>
             <span className="text-[10px] font-bold uppercase tracking-[0.3em] px-8">
               {config.promoBanner}
             </span>
          </div>
        </div>
      )}
      {/* Hero Section */}

      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-60 scale-105"
            alt="Hero Background"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-8xl font-serif tracking-[0.2em] mb-6 drop-shadow-2xl uppercase">
              {config?.heroTitle || "FLOSSY KOLLECT"}
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-light tracking-widest max-w-2xl mx-auto mb-12">
              {config?.heroSubtitle || "Style for Every Body. Fashion for Every Moment."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/shop" className="premium-btn-solid min-w-[200px]">Shop Collection</Link>
              <Link to="/shop?category=Women" className="premium-btn min-w-[200px]">Explore Trends</Link>
            </div>
          </motion.div>
        </div>


        <div className="absolute bottom-10 left-10 hidden lg:block">
          <p className="micro-label">Location</p>
          <p className="text-sm tracking-widest mt-1">MADINA, ACCRA GHANA</p>
        </div>

        <div className="absolute bottom-10 right-10 flex space-x-6 items-center">
           <div className="w-12 h-[1px] bg-gold/50" />
           <p className="micro-label">Scroll to browse</p>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-24 px-6 max-w-screen-2xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h4 className="micro-label mb-2">Curated Collections</h4>
            <h2 className="text-4xl font-serif">Explore by Department</h2>
          </div>
          <Link to="/shop" className="text-xs uppercase tracking-widest text-gold hover:underline flex items-center">
            View All <ArrowUpRight size={14} className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-[600px] overflow-hidden bg-zinc-900"
            >
              <Link to={`/shop?category=${cat.name}`}>
                <img 
                  src={cat.image} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 luxury-card-overlay flex flex-col justify-end p-8">
                  <h3 className="text-3xl font-serif mb-2">{cat.name}</h3>
                  <p className="text-xs text-gold tracking-widest uppercase mb-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    {cat.title}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-32 px-6 bg-[#030303]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
              <div className="max-w-2xl">
                <span className="text-[10px] uppercase tracking-[0.5em] text-gold mb-6 block font-medium">Just Landed</span>
                <h2 className="text-5xl md:text-7xl font-serif italic mb-8 leading-[1.1]">The Fresh <br /> Perspective</h2>
                <p className="text-white/40 font-light leading-relaxed max-w-md">Our latest additions, curated for the bold and the visionary. Secure your piece of the new collection before it's gone.</p>
              </div>
              <Link to="/shop" className="text-xs uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors pb-2 border-b border-white/10 flex items-center group">
                Shop New Arrivals
                <ArrowRight size={14} className="ml-3 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {newArrivals.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                >
                  <Link to={`/product/${product.id}`} className="group block">
                    <div className="aspect-[3/4] overflow-hidden mb-6 bg-zinc-900 border border-white/5 relative">
                      <img 
                        src={product.images[0]} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-gold text-black text-[9px] font-bold px-2 py-1 uppercase tracking-tighter">New</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-white/40">{product.category}</p>
                      <h3 className="text-sm font-medium tracking-wide group-hover:text-gold transition-colors">{product.name}</h3>
                      <p className="text-gold font-medium">{formatPrice(product.price)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Discovery Scroll (Editorial) */}
      <section className="relative">
         <div className="flex flex-col">
            {[
              {
                title: "Vogue Elegance",
                subtitle: "The Evening Edit",
                image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop",
                align: "left"
              },
              {
                title: "Urban Vision",
                subtitle: "Streetwear Reimagined",
                image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop",
                align: "right"
              },
              {
                title: "Timeless Craft",
                subtitle: "Bespoke Selection",
                image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1920&auto=format&fit=crop",
                align: "left"
              }
            ].map((editorial, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                className="relative h-[80vh] md:h-screen flex items-center justify-center overflow-hidden"
              >
                 <div className="absolute inset-0">
                    <motion.img 
                      initial={{ scale: 1.2 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      src={editorial.image} 
                      className="w-full h-full object-cover brightness-50"
                    />
                 </div>
                 
                 <div className={cn(
                   "relative z-20 max-w-7xl mx-auto px-6 w-full flex flex-col",
                   editorial.align === "right" ? "items-end text-right" : "items-start text-left"
                 )}>
                    <motion.span 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-gold micro-label mb-4"
                    >
                      {editorial.subtitle}
                    </motion.span>
                    <motion.h2 
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-5xl md:text-9xl font-serif italic mb-8"
                    >
                      {editorial.title}
                    </motion.h2>
                    <motion.div
                       initial={{ opacity: 0 }}
                       whileInView={{ opacity: 1 }}
                       transition={{ delay: 0.6 }}
                    >
                       <Link to="/shop" className="premium-btn">Discover More</Link>
                    </motion.div>
                 </div>
              </motion.div>
            ))}
         </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-24 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-6">
            <h4 className="micro-label text-center mb-4">The Highlight Reel</h4>
            <h2 className="text-4xl font-serif text-center mb-16 italic">Must-Have Pieces</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {featuredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group">
                  <div className="aspect-[3/4] overflow-hidden mb-6 bg-zinc-900 relative">
                    <img 
                      src={product.images[0]} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-4 left-4">
                       <span className="bg-black/80 text-[10px] text-gold border border-gold/30 px-2 py-1 uppercase tracking-widest">Featured</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium tracking-wide mb-1 group-hover:text-gold transition-colors">{product.name}</h3>
                  <p className="text-xs text-white/50">{product.category} • {product.gender}</p>
                  <p className="text-gold font-medium mt-2">{formatPrice(product.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section Luxe */}
      <section className="py-32 relative overflow-hidden" id="about">
        <div className="max-w-4xl mx-auto px-6 text-center">
           <Quote size={48} className="mx-auto mb-12 text-gold/20" />
           <p className="text-xl md:text-2xl font-serif leading-relaxed mb-12 italic">
              "{config?.aboutText || "Flossy Kollect is more than a boutique — it’s a luxury lifestyle. Based in the heart of Accra, we curate an exclusive selection for men, women, kids, and stylish littles — all under one hallowed banner."}"
           </p>
           <Link to="/shop" className="premium-btn">Explore The Collection</Link>
        </div>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 blur-[120px]" />
      </section>


      {/* Instagram Feed Section */}
      <section className="py-24 border-t border-white/5">
        <div className="px-6 text-center mb-12">
           <h4 className="micro-label mb-2">Connect With Us</h4>
           <a 
            href="https://instagram.com/flossy_kollect" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xl font-serif hover:text-gold transition-colors inline-flex items-center space-x-2"
           >
             <span>@flossy_kollect on Instagram</span>
             <ArrowUpRight size={16} />
           </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 px-2">
           {[1,2,3,4,5,6].map(i => (
             <div key={i} className="aspect-square bg-zinc-900 overflow-hidden relative group cursor-pointer">
                <div className="absolute inset-0 bg-gold/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Instagram size={24} />
                </div>
                <img 
                  src={`https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=400&q=60`} 
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                  alt={`Instagram ${i}`}
                  loading="lazy"
                  decoding="async"
                />
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}

function Instagram({ size }: { size: number }) {
  return (
    <svg 
      width={size} height={size} 
      viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}
