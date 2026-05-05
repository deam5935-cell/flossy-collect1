import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Heart, Globe, Quote } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-32 pb-20">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden mb-24">
         <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1441984908747-d4e2da43e77a?q=80&w=2000&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-40 brightness-50"
              alt="Atelier"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
         </div>
         
         <div className="relative z-10 text-center px-6">
            <motion.h4 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="micro-label text-gold mb-4"
            >
              The Maison
            </motion.h4>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-serif italic"
            >
              Our Vision
            </motion.h1>
         </div>
      </section>

      {/* Philosophy */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
         <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
               <h2 className="text-4xl font-serif mb-8 leading-tight">Democratizing Luxury <br /> From the Heart of Accra</h2>
               <div className="space-y-6 text-white/60 font-light leading-relaxed">
                  <p>
                    Founded with a singular mission, Flossy Kollect serves as a bridge between high-fashion aspirational aesthetics and the everyday reality of global style enthusiasts. Located in the vibrant heart of East Legon, Accra, we curate pieces that speak a universal language of elegance.
                  </p>
                  <p>
                    We believe that luxury shouldn't be defined by a price tag, but by the craftsmanship, the selection, and the feeling it evokes. Every item in our collection is hand-picked to ensure it meets our rigorous standards of quality and timelessness.
                  </p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="aspect-[3/4] bg-zinc-900 overflow-hidden mt-12">
                  <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover filter grayscale" />
               </div>
               <div className="aspect-[3/4] bg-zinc-900 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover filter sepia-[0.3]" />
               </div>
            </div>
         </div>
      </section>

      {/* Values */}
      <section className="bg-white/[0.02] border-y border-white/5 py-32 mb-32">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-16 text-center">
               {[
                 { icon: Sparkles, title: "Curated Excellence", desc: "Our buyers scour global markets to bring you unique silhouettes that stand apart from the mundane." },
                 { icon: Shield, title: "Unwavering Quality", desc: "From the first stitch to the final seam, we prioritize longevity and material integrity." },
                 { icon: Heart, title: "Inclusive Style", desc: "Fashion for every body, every age, and every moment. We believe in style without boundaries." }
               ].map((v, i) => (
                 <div key={i} className="space-y-6">
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto border border-gold/10 text-gold">
                       <v.icon size={24} />
                    </div>
                    <h3 className="text-xl font-serif">{v.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed font-light">{v.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Quote */}
      <section className="max-w-4xl mx-auto px-6 text-center">
         <Quote size={48} className="mx-auto mb-12 text-gold/20" />
         <h2 className="text-3xl md:text-4xl font-serif italic leading-relaxed mb-12">
           "Fashion passes, style remains. At Flossy Kollect, we don't just sell clothes; we provide the building blocks for your personal legacy."
         </h2>
         <div className="w-12 h-[1px] bg-gold mx-auto mb-4" />
         <p className="micro-label">Founding Philosophy</p>
      </section>
    </div>
  );
}
