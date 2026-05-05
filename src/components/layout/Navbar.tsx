import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { loginWithGoogle, logout } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import SearchOverlay from '../SearchOverlay';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 py-4",
      isScrolled ? "bg-black/90 backdrop-blur-md border-b border-white/10" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Menu Mobile */}
        <button className="lg:hidden text-white" onClick={() => setIsMenuOpen(true)}>
          <Menu size={24} />
        </button>

        {/* Left: Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link to="/shop" className="text-xs uppercase tracking-widest text-white hover:text-gold transition-colors drop-shadow-sm">Shop</Link>
          <Link to="/shop?category=Women" className="text-xs uppercase tracking-widest text-white hover:text-gold transition-colors drop-shadow-sm">Women</Link>
          <Link to="/shop?category=Men" className="text-xs uppercase tracking-widest text-white hover:text-gold transition-colors drop-shadow-sm">Men</Link>
        </div>

        {/* Center: Logo */}
        <Link to="/" className="text-2xl font-serif tracking-[0.3em] font-bold text-gold">
          FLOSSY
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="text-white/70 hover:text-gold transition-colors"
          >
            <Search size={20} />
          </button>
          
          <div className="relative flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-white/70 hover:text-gold">
                  <User size={20} />
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="hidden sm:block text-[10px] border border-gold/50 px-2 py-1 text-gold uppercase tracking-tighter">Admin</Link>
                )}
              </div>
            ) : (
              <button onClick={() => loginWithGoogle()} className="text-xs uppercase tracking-widest text-gold hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-sm border border-gold/20">Login</button>
            )}
          </div>

          <Link to="/cart" className="relative group">
            <ShoppingBag size={20} className="text-white/70 group-hover:text-gold transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[80%] max-w-sm bg-dark z-[70] p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-lg font-serif tracking-widest text-gold">FLOSSY</span>
                <button onClick={() => setIsMenuOpen(false)} className="text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col space-y-6">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-xl uppercase tracking-widest text-white">Home</Link>
                <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-xl uppercase tracking-widest text-white">All Collection</Link>
                <Link to="/shop?category=Women" onClick={() => setIsMenuOpen(false)} className="text-xl uppercase tracking-widest text-white">Women</Link>
                <Link to="/shop?category=Men" onClick={() => setIsMenuOpen(false)} className="text-xl uppercase tracking-widest text-white">Men</Link>
                <Link to="/shop?category=Kids" onClick={() => setIsMenuOpen(false)} className="text-xl uppercase tracking-widest text-white">Kids</Link>
                <Link to="/shop?category=Beauty" onClick={() => setIsMenuOpen(false)} className="text-xl uppercase tracking-widest text-white">Beauty</Link>
              </div>

              <div className="mt-auto pt-8 border-t border-white/10">
                {user ? (
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-sm uppercase tracking-widest text-red-500">Logout</button>
                ) : (
                  <button onClick={() => { loginWithGoogle(); setIsMenuOpen(false); }} className="text-sm uppercase tracking-widest text-gold">Sign In / Register</button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
