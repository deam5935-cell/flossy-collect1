import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { Package, Truck, CheckCircle2, ShoppingBag, LogOut, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserOrders() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'), 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserOrders();
  }, [user]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, { dateStyle: 'long' });
  };

  const getRelativeDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar Info */}
          <div className="lg:w-80 shrink-0">
             <div className="bg-[#050505] border border-white/10 p-10 text-center">
                <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold/20 text-3xl font-serif text-gold lowercase">
                   {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </div>
                <h2 className="text-xl font-serif mb-1">{user?.displayName || 'Client'}</h2>
                <p className="text-xs text-white/40 mb-8 uppercase tracking-widest">{user?.email}</p>
                
                <div className="pt-8 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/50">
                    <span>Rank</span>
                    <span className="text-gold uppercase">Vogue Member</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/50">
                    <span>Account Created</span>
                    <span>{getRelativeDate(profile?.createdAt)}</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Main Content: Orders */}
          <div className="flex-grow">
             <div className="flex items-center justify-between mb-12">
                <h1 className="text-3xl font-serif italic uppercase tracking-widest">Your Collection</h1>
                <p className="micro-label">{orders.length} Past Purchases</p>
             </div>

             {loading ? (
               <div className="space-y-4 animate-pulse">
                 {[1,2,3].map(i => <div key={i} className="h-32 bg-white/5" />)}
               </div>
             ) : orders.length > 0 ? (
               <div className="space-y-8">
                  {orders.map((order) => (
                    <motion.div 
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/40 border border-white/10 p-8"
                    >
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
                         <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">Order Ref: {order.id.slice(-8).toUpperCase()}</p>
                            <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
                         </div>
                         <div className="flex items-center space-x-6">
                            <div className="text-right">
                               <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Status</p>
                               <div className={cn(
                                 "text-[10px] font-bold uppercase tracking-widest",
                                 order.status === 'pending' ? "text-amber-500" :
                                 order.status === 'processing' ? "text-blue-500" :
                                 "text-green-500"
                               )}>
                                 {order.status}
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Amount</p>
                               <p className="text-gold font-serif">{formatPrice(order.total)}</p>
                            </div>
                         </div>
                      </div>

                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mb-8">
                         {order.items.map((item, idx) => (
                           <div key={idx} className="w-16 md:w-20 aspect-[3/4] bg-zinc-900 border border-white/5 shrink-0 group relative cursor-pointer">
                              <img src={item.images[0]} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                 <span className="text-[8px] text-white uppercase text-center px-1">View</span>
                              </div>
                           </div>
                         ))}
                      </div>

                      <div className="flex items-center justify-end space-x-4">
                         <button className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white flex items-center space-x-2">
                            <ShoppingBag size={12} />
                            <span>Buy Again</span>
                         </button>
                         <button className="text-[10px] uppercase tracking-widest text-gold hover:underline flex items-center space-x-2">
                            <ExternalLink size={12} />
                            <span>Invoice</span>
                         </button>
                      </div>
                    </motion.div>
                  ))}
               </div>
             ) : (
               <div className="py-32 text-center bg-[#050505] border border-dashed border-white/10">
                  <ShoppingBag size={48} className="mx-auto mb-6 text-white/10" />
                  <p className="text-sm text-white/40 italic mb-8 uppercase tracking-widest">No order cycles completed yet.</p>
                  <Link to="/shop" className="premium-btn">Start Browsing</Link>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
