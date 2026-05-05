import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Message } from '../../types';
import { Mail, Check, Trash2, Clock, User, MessageCircle, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'messages');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (id: string, status: 'read' | 'replied') => {
    try {
      await updateDoc(doc(db, 'messages', id), { status });
      setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
      if (selectedMessage?.id === id) setSelectedMessage({ ...selectedMessage, status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `messages/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this message inquiry?")) return;
    try {
      await deleteDoc(doc(db, 'messages', id));
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `messages/${id}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif italic mb-2">Concierge Inquiries</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest">Manage customer communications</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* List */}
        <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <p className="text-center py-12 text-white/20 text-xs italic">Syncing message center...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5">
              <Mail className="mx-auto mb-4 text-white/10" />
              <p className="text-white/30 text-xs uppercase tracking-widest">No unread messages</p>
            </div>
          ) : (
            messages.map((message) => (
              <button
                key={message.id}
                onClick={() => {
                  setSelectedMessage(message);
                  if (message.status === 'unread') handleStatusUpdate(message.id, 'read');
                }}
                className={`w-full text-left p-6 border transition-all duration-300 relative group ${
                  selectedMessage?.id === message.id 
                    ? 'bg-gold/5 border-gold shadow-[0_0_20px_rgba(212,175,55,0.05)]' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                }`}
              >
                {message.status === 'unread' && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-gold" />
                )}
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[9px] uppercase tracking-tighter px-2 py-0.5 ${
                    message.status === 'replied' ? 'bg-green-500/20 text-green-500' : 
                    message.status === 'read' ? 'bg-white/10 text-white/40' : 'bg-gold text-black font-bold'
                  }`}>
                    {message.status}
                  </span>
                  <span className="text-[10px] text-white/20">
                    {format(message.createdAt?.get() || new Date(), 'MMM dd')}
                  </span>
                </div>
                <h4 className={`text-sm font-medium mb-1 truncate ${message.status === 'unread' ? 'text-white' : 'text-white/60'}`}>
                  {message.subject}
                </h4>
                <p className="text-[10px] text-white/40 uppercase tracking-widest truncate">{message.name}</p>
              </button>
            ))
          )}
        </div>

        {/* View */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div
                key={selectedMessage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/[0.02] border border-white/5 p-12 min-h-[500px] flex flex-col"
              >
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-serif italic">{selectedMessage.subject}</h3>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <User size={14} className="text-gold" />
                        <span className="text-xs uppercase tracking-widest font-medium">{selectedMessage.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail size={14} className="text-gold" />
                        <a href={`mailto:${selectedMessage.email}`} className="text-xs text-white/40 hover:text-white transition-colors">{selectedMessage.email}</a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedMessage.status !== 'replied' && (
                      <button 
                        onClick={() => handleStatusUpdate(selectedMessage.id, 'replied')}
                        className="bg-green-500/10 text-green-500 text-[10px] uppercase tracking-widest px-4 py-2 flex items-center space-x-2 hover:bg-green-500/20 transition-colors"
                      >
                        <Check size={12} />
                        <span>Mark Replied</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="bg-red-500/10 text-red-500 p-2 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex space-x-4 mb-6">
                    <MessageCircle size={20} className="text-white/10 shrink-0" />
                    <p className="text-lg text-white/80 font-light leading-relaxed italic">
                      "{selectedMessage.message}"
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                  <div className="flex items-center space-x-3 text-white/20">
                    <Clock size={14} />
                    <span className="text-[10px] uppercase tracking-widest font-medium">
                      Received {format(selectedMessage.createdAt?.get() || new Date(), 'PPPP p')}
                    </span>
                  </div>
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="premium-btn-solid flex items-center space-x-3 px-8 py-3"
                  >
                    <ExternalLink size={14} />
                    <span>Open Mail Client</span>
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white/[0.02] border border-white/5 p-12 h-[500px] flex items-center justify-center text-center">
                <div className="max-w-xs">
                  <Mail className="mx-auto mb-6 text-white/5" size={48} strokeWidth={1} />
                  <p className="text-white/20 text-xs uppercase tracking-[0.2em]">Select an inquiry from the courier log to view details.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
