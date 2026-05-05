import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product, Order } from '../../types';
import { formatPrice } from '../../lib/utils';
import { 
  ShoppingBag, 
  Package, 
  Users, 
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [] as Order[],
    chartData: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const productsSnap = await getDocs(collection(db, 'products'));
        const usersSnap = await getDocs(collection(db, 'users'));
        
        const orders = ordersSnap.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
          } as Order;
        });

        const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

        // Calculate weekly sales for chart
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return { 
            date: d.toLocaleDateString(),
            name: days[d.getDay()],
            sales: 0 
          };
        }).reverse();

        orders.forEach(order => {
          const orderDate = new Date(order.createdAt).toLocaleDateString();
          const dayData = last7Days.find(d => d.date === orderDate);
          if (dayData) {
            dayData.sales += order.total;
          }
        });

        // Recent Orders
        const recentOrders = [...orders]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5);

        setStats({
          totalSales,
          totalOrders: orders.length,
          totalProducts: productsSnap.size,
          totalUsers: usersSnap.size,
          recentOrders,
          chartData: last7Days
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend }: any) => (
    <div className="bg-black/40 border border-white/10 p-6 rounded-none">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gold/10 rounded">
          <Icon className="text-gold" size={20} />
        </div>
        {trend && (
          <div className="flex items-center text-green-500 text-xs font-bold">
            <TrendingUp size={12} className="mr-1" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <p className="micro-label text-white/40 mb-1">{title}</p>
      <h3 className="text-2xl font-serif font-bold text-white tracking-wide">{value}</h3>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={formatPrice(stats.totalSales)} icon={DollarSign} />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} />
        <StatCard title="Active Inventory" value={stats.totalProducts} icon={Package} />
        <StatCard title="Registered Clients" value={stats.totalUsers} icon={Users} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-black/40 border border-white/10 p-8">
          <h3 className="text-sm font-medium uppercase tracking-widest text-white/70 mb-8 flex items-center">
            <TrendingUp size={16} className="mr-2 text-gold" />
            Recent Sales Velocity (Last 7 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} />
                <YAxis stroke="#ffffff40" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20', color: '#fff' }}
                  itemStyle={{ color: '#C5A059' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#C5A059" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 p-8">
          <h3 className="text-sm font-medium uppercase tracking-widest text-white/70 mb-8 flex items-center">
            <Clock size={16} className="mr-2 text-gold" />
            Recent Activity
          </h3>
          <div className="space-y-6">
            {stats.recentOrders.length > 0 ? stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{order.customerInfo.name}</p>
                  <p className="text-[10px] text-white/40">{order.status} • {order.items.length} items</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gold font-medium">{formatPrice(order.total)}</p>
                  <Link to={`/admin/orders`} className="text-[9px] uppercase text-white/30 hover:text-white">Details</Link>
                </div>
              </div>
            )) : <p className="text-xs text-white/30 italic">No recent orders found.</p>}
          </div>
          
          <Link to="/admin/orders" className="premium-btn w-full mt-8 text-center text-[10px]">View all orders</Link>
        </div>
      </div>
    </div>
  );
}
