import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { v4 as uuidv4 } from 'uuid';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const messageId = uuidv4();
      await addDoc(collection(db, 'messages'), {
        ...formData,
        status: 'unread',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 bg-[#030303] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-start">
          
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="micro-label text-gold mb-6 block">Concierge Services</span>
            <h1 className="text-5xl md:text-7xl font-serif italic mb-8 leading-tight">
              Connect with <br /> Flossy Kollect
            </h1>
            <p className="text-white/40 font-light leading-relaxed mb-16 max-w-md">
              Whether you seek guidance on a bespoke order or require assistance with your selection, our ambassadors are available to assist you in our Accra atelier.
            </p>

            <div className="space-y-12">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-gold" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Email Inquiry</h4>
                  <p className="text-lg font-light">concierge@flossykollect.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-gold" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Headquarters</h4>
                  <p className="text-lg font-light">Diamond Plaza, East Legon <br /> Accra, Ghana</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-gold" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Direct Line</h4>
                  <p className="text-lg font-light">0502645921</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/[0.02] border border-white/5 p-10 md:p-16 relative overflow-hidden"
          >
            {success ? (
              <div className="text-center py-20">
                <CheckCircle size={64} className="text-gold mx-auto mb-8" />
                <h3 className="text-2xl font-serif italic mb-4">Message Transmitted</h3>
                <p className="text-white/40 font-light mb-12">Our concierge team will review your inquiry and respond within 24 hours.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="text-xs uppercase tracking-widest text-gold hover:text-white transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/30">Your Name</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-transparent border-b border-white/10 py-3 focus:border-gold outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/30">Email Address</label>
                    <input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-transparent border-b border-white/10 py-3 focus:border-gold outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30">Subject</label>
                  <input 
                    required
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-transparent border-b border-white/10 py-3 focus:border-gold outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30">Your Message</label>
                  <textarea 
                    required
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-transparent border border-white/10 p-4 focus:border-gold outline-none transition-colors resize-none"
                  />
                </div>

                <button 
                  disabled={loading}
                  type="submit" 
                  className="premium-btn-solid w-full flex items-center justify-center space-x-3 py-5"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  <span>Transmit Inquiry</span>
                </button>
              </form>
            )}
            
            {/* Decoration */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />
          </motion.div>

        </div>
      </div>
    </div>
  );
}
