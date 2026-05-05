import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl text-center relative z-10"
        >
          <div className="inline-flex items-center justify-center p-8 rounded-full bg-white/[0.02] border border-white/5 mb-12 relative group">
            <div className="absolute inset-0 bg-gold/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <ShoppingBag size={48} strokeWidth={1} className="text-gold/40 relative z-10" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif mb-8 italic tracking-tight">
            Your collection <br /> awaits
          </h1>
          
          <p className="text-lg md:text-xl text-white/40 font-light mb-16 max-w-md mx-auto leading-relaxed">
            Curate your signature look with pieces designed to defy the ordinary.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/shop" className="premium-btn-solid min-w-[200px]">
              Browse Boutique
            </Link>
            <Link to="/" className="text-xs uppercase tracking-[0.2em] text-white/40 hover:text-gold transition-colors py-4">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-serif mb-16 text-center italic">Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* List */}
          <div className="lg:col-span-2 space-y-12">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex gap-6 pb-12 border-b border-white/5"
                >
                  <div className="w-32 aspect-[3/4] bg-zinc-900 border border-white/5">
                    <img src={item.images[0]} className="w-full h-full object-cover" alt={item.name} />
                  </div>
                  <div className="flex-grow flex flex-col pt-2">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-lg font-medium tracking-tight uppercase">{item.name}</h3>
                       <button onClick={() => removeFromCart(item.id)} className="text-white/30 hover:text-red-500">
                         <Trash2 size={18} />
                       </button>
                    </div>
                    <p className="text-xs text-gold/60 micro-label mb-6">{item.category} • {item.gender}</p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-white/10">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-white/5 disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 py-1 text-sm border-x border-white/10 min-w-[3rem] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-white/5"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-gold font-serif">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
             <div className="bg-[#050505] border border-white/5 p-8 sticky top-32">
                <h2 className="micro-label mb-8">Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Delivery</span>
                    <span className="text-gold">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Tax</span>
                    <span>{formatPrice(total * 0.05)}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 mb-8 flex justify-between items-baseline">
                   <span className="text-xs uppercase tracking-widest text-white/50">Total</span>
                   <span className="text-3xl font-serif text-gold">{formatPrice(total * 1.05)}</span>
                </div>

                <Link to="/checkout" className="premium-btn-solid w-full flex items-center justify-center space-x-2">
                  <span>Checkout</span>
                  <ArrowRight size={16} />
                </Link>

                <p className="mt-8 text-[10px] text-center text-white/30 leading-relaxed italic uppercase tracking-tighter">
                  Secure checkout handled by Flossy Kollect. Shipping within 24-48 hours within Accra.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
