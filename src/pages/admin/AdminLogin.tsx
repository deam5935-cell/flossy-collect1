import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { ShieldCheck, ChevronRight } from 'lucide-react';

export default function AdminLogin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        navigate('/admin');
      }
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return null;

  return (
    <div className="h-screen bg-black flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-dark border border-white/10 p-12 text-center"
      >
        <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-gold/20">
          <ShieldCheck size={32} className="text-gold" />
        </div>
        
        <h1 className="text-3xl font-serif tracking-[0.2em] mb-4 text-gold uppercase font-bold">FLOSSY AUTH</h1>
        <p className="text-sm text-white/50 mb-12 font-light tracking-wide leading-relaxed">
          Access restricted to the Flossy Kollect administrative team. Unauthorized access is strictly prohibited.
        </p>

        {user && !isAdmin ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs mb-8 rounded">
            Access Denied: Your account does not have administrative privileges.
          </div>
        ) : null}

        <button 
          onClick={handleLogin}
          className="premium-btn-solid w-full flex items-center justify-center space-x-3 group"
        >
          <span>Sign In with Admin Account</span>
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-12 text-[10px] uppercase tracking-[0.3em] text-white/20">
          Secure System • Madina • Accra
        </p>
      </motion.div>
    </div>
  );
}
