import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Smartphone, CreditCard, Landmark, ArrowRight, CheckCircle, Loader2, ChevronLeft, ShieldCheck } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

type PaymentMethod = 'momo' | 'card' | 'bank_transfer';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo');
  
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    momoNumber: '',
    momoNetwork: 'MTN',
  });

  if (items.length === 0) {
    navigate('/shop');
    return null;
  }

  const handleNextStep = () => setStep(s => s + 1);
  const handlePrevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
       alert("Please sign in to complete your order.");
       return;
    }

    setLoading(true);
    const orderId = `LM-${uuidv4().slice(0, 8).toUpperCase()}`;

    try {
      const orderData = {
        userId: user.uid,
        items,
        total,
        status: 'pending',
        paymentStatus: paymentMethod === 'momo' ? 'pending' : 'pending',
        paymentMethod,
        paymentDetails: paymentMethod === 'momo' ? {
          phone: formData.momoNumber,
          network: formData.momoNetwork,
        } : {},
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'orders', orderId), orderData);
      
      // Decrement stock for each item
      for (const item of items) {
        try {
          const productRef = doc(db, 'products', item.id);
          await updateDoc(productRef, {
            stock: increment(-item.quantity)
          });
        } catch (err) {
          console.error(`Failed to decrement stock for ${item.id}`, err);
        }
      }
      
      // Simulate MoMo Processing
      if (paymentMethod === 'momo') {
         setTimeout(async () => {
             // In a real app, this would be a webhook response
             // We'll redirect to success landing
             clearCart();
             navigate(`/profile`);
             alert(`Order ${orderId} received. Please check your phone for the MoMo prompt!`);
         }, 2000);
      } else {
        clearCart();
        navigate(`/profile`);
        alert("Order placed successfully!");
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`);
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 bg-[#030303] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 mb-12">
          <button onClick={() => navigate('/cart')} className="text-white/40 hover:text-white flex items-center space-x-2 text-[10px] uppercase tracking-widest">
            <ChevronLeft size={14} />
            <span>Back to Cart</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-16">
          {/* Main Flow */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-12">
              <h1 className="text-4xl font-serif italic">The Final Accord</h1>
              <div className="flex items-center space-x-4">
                 {[1, 2].map((s) => (
                   <div 
                    key={s}
                    className={`w-10 h-1 border rounded-full transition-colors ${step >= s ? 'bg-gold border-gold' : 'bg-white/5 border-white/10'}`} 
                   />
                 ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-12"
                >
                  <section>
                    <h3 className="micro-label text-gold mb-8">Shipping & Delivery</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/30">Hallowed Name</label>
                        <input 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="input-luxury" placeholder="Full name" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/30">Electronic Courier</label>
                        <input 
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="input-luxury" placeholder="email@address.com" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/30">Direct Line</label>
                        <input 
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="input-luxury" placeholder="+233..." 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/30">Sanctuary City</label>
                        <input 
                          value={formData.city}
                          onChange={e => setFormData({...formData, city: e.target.value})}
                          className="input-luxury" placeholder="Accra, Kumasi..." 
                        />
                      </div>
                    </div>
                    <div className="mt-8 space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/30">Precise Address</label>
                      <input 
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="input-luxury" placeholder="House No, Street Name, Landmark" 
                      />
                    </div>
                  </section>

                  <button 
                    onClick={handleNextStep}
                    className="premium-btn-solid w-full py-5 flex items-center justify-center space-x-3"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <section>
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="micro-label text-gold">Vault Options</h3>
                       <div className="flex items-center space-x-2 text-[10px] text-white/30 uppercase tracking-widest">
                          <Lock size={12} />
                          <span>End-to-End Encryption</span>
                       </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                      {[
                        { id: 'momo', label: 'Mobile Money', icon: Smartphone, desc: 'Instant & Secure' },
                        { id: 'card', label: 'Credit Card', icon: CreditCard, desc: 'Visa/Mastercard' },
                        { id: 'bank_transfer', label: 'Bank', icon: Landmark, desc: 'Manual Transfer' }
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                          className={`p-6 border text-left transition-all relative ${
                            paymentMethod === method.id 
                              ? 'bg-gold/5 border-gold shadow-[0_0_30px_rgba(212,175,55,0.05)]' 
                              : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                          }`}
                        >
                          <method.icon size={24} className={paymentMethod === method.id ? 'text-gold' : 'text-white/20'} />
                          <h4 className="text-sm font-medium mt-6 mb-1">{method.label}</h4>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest">{method.desc}</p>
                          {paymentMethod === method.id && (
                             <CheckCircle size={16} className="absolute top-4 right-4 text-gold" />
                          )}
                        </button>
                      ))}
                    </div>

                    {paymentMethod === 'momo' && (
                       <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.02] border border-white/5 p-8 space-y-8"
                       >
                          <div className="flex items-center space-x-4 mb-4">
                             <div className="p-3 bg-gold/10 rounded-full">
                                <Smartphone size={20} className="text-gold" />
                             </div>
                             <div>
                                <h4 className="text-sm font-medium">Mobile Money Payment</h4>
                                <p className="text-xs text-white/40">Enter your wallet details to trigger prompt</p>
                             </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/30">Network Provider</label>
                                <select 
                                  value={formData.momoNetwork}
                                  onChange={e => setFormData({...formData, momoNetwork: e.target.value})}
                                  className="input-luxury appearance-none"
                                >
                                   <option value="MTN">MTN Mobile Money</option>
                                   <option value="Vodafone">Vodafone Cash</option>
                                   <option value="AirtelTigo">AirtelTigo Money</option>
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/30">Wallet Number</label>
                                <input 
                                  required
                                  value={formData.momoNumber}
                                  onChange={e => setFormData({...formData, momoNumber: e.target.value})}
                                  className="input-luxury" placeholder="024 000 0000" 
                                />
                             </div>
                          </div>

                          <div className="p-4 bg-white/[0.03] border border-white/5 flex items-start space-x-3">
                             <ShieldCheck size={16} className="text-gold shrink-0 mt-1" />
                             <p className="text-[10px] text-white/40 leading-relaxed italic">
                               By proceeding, you will receive a secure prompt on your mobile device to authorize the transaction of {formatPrice(total)}.
                             </p>
                          </div>
                       </motion.div>
                    )}

                    {paymentMethod === 'card' && (
                       <div className="p-12 border border-white/5 bg-white/[0.02] text-center">
                          <p className="text-xs text-white/40 uppercase tracking-widest">Card infrastructure currently undergoing maintenance.</p>
                          <p className="text-[10px] text-gold mt-2">Please utilize MoMo for immediate processing.</p>
                       </div>
                    )}
                  </section>

                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handlePrevStep}
                      className="px-8 py-5 border border-white/10 hover:border-gold transition-colors text-[10px] uppercase tracking-widest"
                    >
                      Return
                    </button>
                    <button 
                      onClick={handleSubmit}
                      disabled={loading || (paymentMethod === 'momo' && !formData.momoNumber)}
                      className="premium-btn-solid flex-grow py-5 flex items-center justify-center space-x-3 disabled:opacity-30"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                      <span>Authorize {formatPrice(total)}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar: Summary */}
          <div className="lg:col-span-1">
             <div className="bg-white/[0.02] border border-white/5 p-8 sticky top-32">
                <h3 className="micro-label text-white/30 mb-8 pb-4 border-b border-white/5">Order Manifest</h3>
                <div className="space-y-6 mb-12">
                   {items.map((item) => (
                      <div key={item.id} className="flex space-x-4">
                         <div className="w-16 h-20 bg-zinc-900 border border-white/5 overflow-hidden">
                            <img src={item.images[0]} className="w-full h-full object-cover" alt={item.name} />
                         </div>
                         <div className="flex-grow">
                            <h4 className="text-[10px] uppercase tracking-widest text-white leading-tight mb-1">{item.name}</h4>
                            <p className="text-[10px] text-white/30">Qty: {item.quantity}</p>
                            <p className="text-xs text-gold font-medium mt-1">{formatPrice(item.price * item.quantity)}</p>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                   <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-white/40">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                   </div>
                   <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-white/40">
                      <span>Shipping</span>
                      <span className="text-green-500">Gratis</span>
                   </div>
                   <div className="flex justify-between items-center pt-4">
                      <span className="text-sm font-medium">Grand Total</span>
                      <span className="text-xl text-gold font-bold">{formatPrice(total)}</span>
                   </div>
                </div>

                <div className="mt-12 bg-white/[0.03] p-4 flex items-center space-x-3">
                   <ShieldCheck size={16} className="text-white/20" />
                   <p className="text-[8px] uppercase tracking-widest text-white/20">Secured via Quantum-Ready Protocol v2.4</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
