import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, FileText, ShieldCheck, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSearchParams, useLocation } from 'react-router-dom';

export default function Policies() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam) return tabParam;
    
    if (location.pathname.includes('shipping')) return 'shipping';
    if (location.pathname.includes('terms')) return 'terms';
    if (location.pathname.includes('privacy')) return 'privacy';
    
    return 'shipping';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Force tab update when location changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname, searchParams]);

  const tabs = [
    { id: 'shipping', label: 'Shipping & Returns', icon: Truck },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
  ];

  const Content = () => {
    switch (activeTab) {
      case 'shipping':
        return (
          <div className="space-y-12">
            <h2 className="text-3xl font-serif mb-8">Shipping & Delivery Logistics</h2>
            <div className="space-y-8 text-white/60 font-light leading-relaxed">
              <section>
                <h3 className="text-white micro-label mb-4">Domestic Delivery (Ghana)</h3>
                <p>We provide same-day delivery for all orders within Accra placed before 12:00 PM GMT. Orders to Kumasi, Takoradi, and Tamale typically arrive within 2-3 business days. Delivery is facilitated via our internal courier network and trusted third-party partners.</p>
              </section>
              <section>
                <h3 className="text-white micro-label mb-4">International Shipping</h3>
                <p>We ship worldwide via DHL Express. International shipping rates are calculated at checkout based on weight and destination. Please note that customs duties and taxes may apply for international orders and are the responsibility of the recipient.</p>
              </section>
              <section>
                <h3 className="text-white micro-label mb-4">Return Policy</h3>
                <p>Due to the exclusive nature of our collections, we offer a 7-day exchange window for un-worn items with original tags and packaging. We do not offer cash refunds; however, store credit is provided for returned items that meet our quality control standards.</p>
              </section>
            </div>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-12">
            <h2 className="text-3xl font-serif mb-8">Terms of Service</h2>
            <div className="space-y-8 text-white/60 font-light leading-relaxed">
               <p>Welcome to Flossy Kollect. By accessing this website, you agree to be bound by these terms and conditions. If you do not agree with any part of these terms, please do not use our services.</p>
               <section>
                 <h3 className="text-white micro-label mb-4">Product Availability</h3>
                 <p>All pieces showcased on our platform are subject to availability. As many of our items are limited edition, we reserve the right to limit the quantity of products purchased per individual or household.</p>
               </section>
               <section>
                 <h3 className="text-white micro-label mb-4">Pricing & Currency</h3>
                 <p>All prices are listed in Ghanaian Cedis (GHS). We reserve the right to adjust pricing at any time without prior notice based on market conditions or exchange rate fluctuations.</p>
               </section>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-12">
            <h2 className="text-3xl font-serif mb-8">Privacy Protocol</h2>
            <div className="space-y-8 text-white/60 font-light leading-relaxed">
               <p>Your privacy is paramount. This protocol outlines how we collect, use, and protect your personal information within the Flossy Kollect ecosystem.</p>
               <section>
                 <h3 className="text-white micro-label mb-4">Data Security</h3>
                 <p>We use industry-standard encryption for all data transmissions. Your payment information is processed through secure, PCI-compliant gateways and never stored on our internal servers.</p>
               </section>
               <section>
                 <h3 className="text-white micro-label mb-4">Information Usage</h3>
                 <p>We only collect data necessary to fulfill your orders and improve your shopping experience. We never sell or lease your personal information to third-party marketing entities.</p>
               </section>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16">
        {/* Sidebar */}
        <div className="md:w-64 shrink-0">
           <div className="sticky top-32 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-4 transition-all duration-300 border-l-2",
                    activeTab === tab.id 
                      ? "bg-gold/5 border-gold text-gold" 
                      : "border-transparent text-white/40 hover:text-white"
                  )}
                >
                  <div className="flex items-center space-x-3">
                     <tab.icon size={16} />
                     <span className="text-[11px] uppercase tracking-widest font-medium">{tab.label}</span>
                  </div>
                  <ChevronRight size={14} className={cn("transition-transform", activeTab === tab.id ? "rotate-90" : "")} />
                </button>
              ))}
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
             >
                <Content />
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
