import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { SiteConfig } from '../../types';
import { Save, Loader2, RefreshCcw, Info } from 'lucide-react';

export default function AdminContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SiteConfig>({
    heroTitle: 'FLOSSY KOLLECT',
    heroSubtitle: 'Style for Every Body. Fashion for Every Moment.',
    aboutText: 'Flossy Kollect is a modern fashion boutique offering stylish, affordable, and high-quality clothing and accessories...',
    promoBanner: 'ENJOY FREE SHIPPING ON ALL ORDERS OVER GHS 500 IN ACCRA!'
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const docRef = doc(db, 'content', 'config');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setConfig(snap.data() as SiteConfig);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'content', 'config'), {
        ...config,
        updatedAt: serverTimestamp()
      });
      alert('Brand identity updated successfully.');
    } catch (err) {
       handleFirestoreError(err, OperationType.UPDATE, 'content/config');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <div className="max-w-4xl space-y-12">
      <div>
        <h2 className="text-2xl font-serif italic text-gold mb-2">Brand Identity & Digital Presence</h2>
        <p className="text-xs text-white/40 uppercase tracking-[0.2em]">Curate your store's front-facing voice and imagery.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-12">
        {/* Hero Configuration */}
        <div className="bg-black/40 border border-white/10 p-10 space-y-8">
           <div className="flex items-center space-x-3 mb-4">
              <RefreshCcw size={18} className="text-gold" />
              <h3 className="micro-label">Hero Section Narrative</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-8">
              <div>
                <label className="micro-label text-white/60 mb-2 block">Hero Title (Brand Emphasis)</label>
                <input 
                  value={config.heroTitle} 
                  onChange={e => setConfig({...config, heroTitle: e.target.value})}
                  className="input-luxury text-xl" 
                />
              </div>
              <div>
                <label className="micro-label text-white/60 mb-2 block">Tagline / Mission Statement</label>
                <input 
                  value={config.heroSubtitle} 
                  onChange={e => setConfig({...config, heroSubtitle: e.target.value})}
                  className="input-luxury" 
                />
              </div>
           </div>
        </div>

        {/* Global Promotions */}
        <div className="bg-black/40 border border-white/10 p-10 space-y-8">
           <div className="flex items-center space-x-3 mb-4">
              <Info size={18} className="text-gold" />
              <h3 className="micro-label">Announcement Banner</h3>
           </div>
           
           <div>
              <label className="micro-label text-white/60 mb-2 block">Current Promotion Text</label>
              <textarea 
                rows={2}
                value={config.promoBanner} 
                onChange={e => setConfig({...config, promoBanner: e.target.value})}
                className="input-luxury resize-none" 
              />
           </div>
        </div>

        {/* About Narrative */}
        <div className="bg-black/40 border border-white/10 p-10 space-y-8">
           <h3 className="micro-label mb-4">Brand Story / About Us</h3>
           <div>
              <textarea 
                rows={6}
                value={config.aboutText} 
                onChange={e => setConfig({...config, aboutText: e.target.value})}
                className="input-luxury leading-relaxed font-light resize-none" 
              />
           </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            disabled={saving}
            className="premium-btn-solid flex items-center space-x-3 px-12 h-16"
            type="submit"
          >
            {saving ? <Loader2 className="animate-spin" /> : (
              <>
                <Save size={18} />
                <span>Publish Updates</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
