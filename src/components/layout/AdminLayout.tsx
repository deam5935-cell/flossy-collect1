import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  Home,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../lib/firebase';
import { cn } from '../../lib/utils';

export default function AdminLayout() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Inquiries', path: '/admin/messages', icon: MessageSquare },
    { label: 'Content', path: '/admin/content', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col shrink-0">
        <div className="p-8">
          <Link to="/" className="text-xl font-serif tracking-[0.2em] font-bold text-gold">FLOSSY</Link>
          <p className="micro-label mt-2">Admin Panel</p>
        </div>

        <nav className="flex-grow px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-200",
                    location.pathname === item.path 
                      ? "text-gold bg-gold/10 border-r-2 border-gold" 
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 p-4 mb-4">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">
              {profile?.displayName?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{profile?.displayName || 'Admin'}</p>
              <p className="text-[10px] text-white/40 truncate">{profile?.email}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-auto bg-[#050505]">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-sm font-medium uppercase tracking-widest text-white/70">
            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xs text-gold hover:underline flex items-center space-x-2">
              <Home size={14} />
              <span>View Store</span>
            </Link>
          </div>
        </header>
        
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
