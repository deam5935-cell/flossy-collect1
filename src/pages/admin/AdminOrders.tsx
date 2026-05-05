import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Order } from '../../types';
import { formatPrice, cn } from '../../lib/utils';
import { ShoppingBag, Search, ChevronRight, Loader2, Package, Truck, CheckCircle2, Receipt, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const updateStatus = async (orderId: string, status: Order['status']) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp()
      });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'orders');
    } finally {
      setActionLoading(false);
    }
  };

  const generateReceipt = (order: Order) => {
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = '#d4af37'; // Gold
    const textColor = '#1a1a1a';
    
    // Header
    doc.setFillColor(25, 25, 25);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('FLOSSY KOLLECT', 20, 25);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('PURVEYORS OF RARE LUXURY', 20, 32);
    
    doc.setTextColor(primaryColor);
    doc.text(`INVOICE #${order.id.toUpperCase()}`, 150, 25);

    // Customer Info
    doc.setTextColor(textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIPIENT', 20, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(order.customerInfo.name, 20, 66);
    doc.text(order.customerInfo.email, 20, 71);
    doc.text(order.customerInfo.phone, 20, 76);
    doc.text(order.customerInfo.address, 20, 81);
    doc.text(order.customerInfo.city, 20, 86);

    // Order Meta
    doc.setFont('helvetica', 'bold');
    doc.text('DATE', 150, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(format(order.createdAt?.toDate() || new Date(), 'PPP'), 150, 66);
    
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT', 150, 76);
    doc.setFont('helvetica', 'normal');
    doc.text(order.paymentMethod.toUpperCase(), 150, 81);
    doc.text(order.paymentStatus.toUpperCase(), 150, 86);

    // Table Header
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 100, 170, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM', 25, 105);
    doc.text('QTY', 140, 105);
    doc.text('PRICE', 160, 105);
    doc.text('TOTAL', 180, 105);

    // Items
    let y = 115;
    doc.setFont('helvetica', 'normal');
    order.items.forEach((item) => {
      doc.text(item.name.substring(0, 45), 25, y);
      doc.text(item.quantity.toString(), 142, y);
      doc.text(formatPrice(item.price), 160, y);
      doc.text(formatPrice(item.price * item.quantity), 180, y);
      y += 10;
    });

    // Totals
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(130, y, 190, y);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('GRAND TOTAL', 130, y);
    doc.setTextColor(primaryColor);
    doc.text(formatPrice(order.total), 180, y);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('Thank you for choosing Flossy Kollect. Your patronage is our inspiration.', 105, 280, { align: 'center' });
    doc.text('Subject to terms and conditions of return.', 105, 285, { align: 'center' });

    doc.save(`Receipt_FlossyKollect_${order.id}.pdf`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="text-amber-500" />;
      case 'processing': return <Package size={16} className="text-blue-500" />;
      case 'delivered': return <CheckCircle2 size={16} className="text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Orders List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-black/40 border border-white/10 p-4 flex items-center space-x-4">
           <Search size={18} className="text-white/30" />
           <input type="text" placeholder="Search orders by ID or customer..." className="bg-transparent text-sm outline-none flex-grow" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" /></div>
        ) : (
          <div className="bg-black/40 border border-white/10 overflow-hidden text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 micro-label">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className={cn(
                      "cursor-pointer hover:bg-white/[0.02] transition-colors",
                      selectedOrder?.id === order.id ? "bg-gold/5" : ""
                    )}
                  >
                    <td className="px-6 py-4 font-mono text-[10px] text-white/50">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 font-medium">{order.customerInfo.name}</td>
                    <td className="px-6 py-4 text-gold">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4 uppercase text-[10px] tracking-widest text-white/40">{order.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className="capitalize text-xs">{order.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <ChevronRight size={16} className="text-white/20 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail View */}
      <div className="lg:col-span-1">
        <AnimatePresence mode="wait">
          {selectedOrder ? (
            <motion.div 
              key={selectedOrder.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/40 border border-white/10 p-8 sticky top-24"
            >
              <div className="flex justify-between items-start mb-8">
                 <div>
                   <h3 className="micro-label mb-1">Order Summary</h3>
                   <p className="text-xs font-mono text-white/40">{selectedOrder.id}</p>
                 </div>
                 <div className={cn(
                   "text-[10px] uppercase font-bold py-1 px-2 rounded-sm",
                   selectedOrder.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                   selectedOrder.status === 'processing' ? "bg-blue-500/10 text-blue-500" :
                   "bg-green-500/10 text-green-500"
                 )}>
                   {selectedOrder.status}
                 </div>
              </div>

              <div className="space-y-6 mb-10">
                 {selectedOrder.items.map((item, idx) => (
                   <div key={idx} className="flex space-x-4 border-b border-white/5 pb-4 last:border-0">
                      <div className="w-12 aspect-[3/4] bg-zinc-900 border border-white/10 shrink-0">
                        <img src={item.images[0]} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase truncate">{item.name}</p>
                        <p className="text-[10px] text-white/40">Qty: {item.quantity} • {formatPrice(item.price)}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mb-10 space-y-3">
                 <h4 className="micro-label text-gold/60 mb-4">Customer Intelligence</h4>
                 <div className="text-xs space-y-1">
                    <p className="font-medium text-white">{selectedOrder.customerInfo.name}</p>
                    <p className="text-white/50">{selectedOrder.customerInfo.phone}</p>
                    <p className="text-white/50">{selectedOrder.customerInfo.email}</p>
                    <p className="text-white/50 leading-relaxed mt-2">{selectedOrder.customerInfo.address}</p>
                 </div>
              </div>

              {selectedOrder.paymentMethod === 'momo' && (
                <div className="mb-8 p-4 bg-white/[0.03] border border-white/5 rounded-sm">
                   <div className="flex items-center space-x-3 mb-2">
                      <Phone size={14} className="text-gold" />
                      <h4 className="text-[10px] uppercase tracking-widest text-white/60">MoMo Transaction</h4>
                   </div>
                   <div className="flex justify-between items-end">
                      <div>
                         <p className="text-xs font-mono">{selectedOrder.paymentDetails?.phone || 'N/A'}</p>
                         <p className="text-[9px] text-white/30 uppercase tracking-tighter mt-1">{selectedOrder.paymentDetails?.network || 'Mobile Money'}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-green-500 bg-green-500/10 px-2 py-0.5">
                        {selectedOrder.paymentStatus}
                      </span>
                   </div>
                </div>
              )}

              <div className="pt-6 border-t border-white/10">
                 <h4 className="micro-label mb-6">Transition Pipeline</h4>
                 <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => generateReceipt(selectedOrder)}
                      className="text-[10px] uppercase tracking-widest border border-gold/30 text-gold py-3 hover:bg-gold/10 transition-colors flex items-center justify-center space-x-2 mb-2"
                    >
                      <Receipt size={14} />
                      <span>Export Professional Receipt</span>
                    </button>
                    <button 
                      disabled={actionLoading || selectedOrder.status === 'processing'}
                      onClick={() => updateStatus(selectedOrder.id, 'processing')}
                      className="text-[10px] uppercase tracking-widest border border-white/10 py-3 hover:bg-blue-500/10 hover:text-blue-500 transition-colors disabled:opacity-30 flex items-center justify-center"
                    >
                      Process Shipment
                    </button>
                    <button 
                      disabled={actionLoading || selectedOrder.status === 'delivered'}
                      onClick={() => updateStatus(selectedOrder.id, 'delivered')}
                      className="text-[10px] uppercase tracking-widest border border-white/10 py-3 hover:bg-green-500/10 hover:text-green-500 transition-colors disabled:opacity-30 flex items-center justify-center"
                    >
                      Mark as Delivered
                    </button>
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-white/20 border border-dashed border-white/10 rounded">
               <ShoppingBag size={32} className="mb-4" />
               <p className="text-xs uppercase tracking-widest">Select an order to analyze</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} width="16" height="16" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
