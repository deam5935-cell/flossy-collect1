import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <h3 className="text-2xl font-serif tracking-[0.3em] font-bold text-gold">FLOSSY</h3>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Style for Every Body. Fashion for Every Moment. Curating excellence in the heart of Accra.
          </p>
          <div className="flex items-center space-x-4">
            <a href="https://instagram.com/flossy_kollect" target="_blank" rel="noreferrer" className="text-white/40 hover:text-gold transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-white/40 hover:text-gold transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-white/40 hover:text-gold transition-colors">
              <Facebook size={20} />
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="micro-label mb-8">Collections</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li><Link to="/shop?category=Women" className="hover:text-gold transition-colors">Women's Fashion</Link></li>
            <li><Link to="/shop?category=Men" className="hover:text-gold transition-colors">Men's Fashion</Link></li>
            <li><Link to="/shop?category=Kids" className="hover:text-gold transition-colors">Kids & Babies</Link></li>
            <li><Link to="/shop?category=Footwear" className="hover:text-gold transition-colors">Footwear</Link></li>
            <li><Link to="/shop?category=Accessories" className="hover:text-gold transition-colors">Jewelry & Watches</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="micro-label mb-8">Support</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li><Link to="/about" className="hover:text-gold transition-colors">Our Story</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
            <li><Link to="/shipping" className="hover:text-gold transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/terms" className="hover:text-gold transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="micro-label mb-8">Store Info</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li className="flex items-start space-x-3">
              <MapPin size={18} className="text-gold shrink-0" />
              <span>Diamond Plaza, East Legon, Accra, Ghana</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone size={18} className="text-gold shrink-0" />
              <span>0502645921</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail size={18} className="text-gold shrink-0" />
              <span>concierge@flossykollect.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-white/30">
        <p>© {new Date().getFullYear()} FLOSSY KOLLECT. ALL RIGHTS RESERVED.</p>
        <div className="flex items-center space-x-6 mt-4 md:mt-0">
          <span>CURRENCY: GHS</span>
          <span>DESIGNED FOR LUXURY</span>
        </div>
      </div>
    </footer>
  );
}
