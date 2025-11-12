import React, { useState, useEffect, useMemo } from 'react';
import { useProducts } from '../../contexts/AppContext';
import { youwareService } from '../../services/youwareService';
import { Link, useNavigate } from 'react-router-dom';
import { PLACEHOLDER_IMAGE_URL } from '../../constants';
import { Order, User, Product } from '../../types';
import { useI18n } from '../../contexts/I18nContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
    <div className="bg-surface p-6 rounded-lg border border-white/10 flex items-center gap-6">
        <div className="bg-primary/20 text-primary p-4 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-textSecondary">{title}</p>
            <p className="text-3xl font-bold text-textPrimary">{value}</p>
        </div>
    </div>
);

const getStatusColor = (status: Order['status']) => {
  switch (status) {
      case 'Pending': return 'text-yellow-400';
      case 'Shipped': return 'text-blue-400';
      case 'Delivered': return 'text-green-400';
      case 'Cancelled': return 'text-red-400';
      default: return 'text-textSecondary';
  }
}

export const AdminDashboardPage: React.FC = () => {
  const { products, refreshProducts } = useProducts();
  const { t } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setOrders(youwareService.getAllOrders());
    setUsers(youwareService.getAllUsers());
  }, []);
  
  const stats = useMemo(() => {
    const totalRevenue = orders
        .filter(o => o.status === 'Delivered')
        .reduce((sum, order) => sum + order.grandTotal, 0);
    
    return {
        totalRevenue: `Tk ${totalRevenue.toLocaleString()}`,
        totalOrders: orders.length,
        totalCustomers: users.length,
        totalProducts: products.length,
        recentOrders: orders.slice(0, 5)
    }
  }, [orders, users, products]);

  const handleDelete = (productId: string, productName: string) => {
    if(window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
        youwareService.deleteProduct(productId);
        refreshProducts();
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('adminDashboard.title')}</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title={t('adminDashboard.totalRevenue')} value={stats.totalRevenue} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
          <StatCard title={t('adminDashboard.totalOrders')} value={stats.totalOrders} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
          <StatCard title={t('adminDashboard.totalCustomers')} value={stats.totalCustomers} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.978 5.978 0 0112 13a5.979 5.979 0 013 1" /></svg>} />
          <StatCard title={t('adminDashboard.totalProducts')} value={stats.totalProducts} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} />
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t('adminDashboard.recentOrders')}</h2>
          <Link to="/admin/orders" className="text-primary font-semibold hover:underline">{t('adminDashboard.viewAll')}</Link>
        </div>
        <div className="bg-surface shadow-md rounded-lg border border-white/10 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/20">
                <tr>
                  <th className="p-4">{t('adminDashboard.orderId')}</th>
                  <th className="p-4">{t('adminDashboard.customer')}</th>
                  <th className="p-4">{t('adminDashboard.total')}</th>
                  <th className="p-4">{t('adminDashboard.status')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-white/10 last:border-0 hover:bg-white/5">
                    <td className="p-4 font-mono text-primary">{order.id.slice(-6)}</td>
                    <td className="p-4">{order.userName}</td>
                    <td className="p-4 font-semibold">Tk {order.grandTotal.toFixed(2)}</td>
                    <td className="p-4 font-semibold">
                      <span className={getStatusColor(order.status)}>{t('orderStatus.'+order.status, order.status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      {/* All Products List */}
      <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{t('adminDashboard.allProducts')}</h2>
            <Link to="/admin/new" className="bg-primary text-background font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition duration-300">
              Add New Product
            </Link>
          </div>
          <div className="bg-surface shadow-md rounded-lg border border-white/10 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/20">
                <tr>
                  <th className="p-4">Image</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-2">
                        <img src={p.images[0] || PLACEHOLDER_IMAGE_URL} alt={p.name} className="w-16 h-16 object-cover rounded-md"/>
                    </td>
                    <td className="p-4 font-semibold">
                        {p.name}
                        <span className={`ml-2 text-xs font-semibold px-2 py-1 rounded-full ${p.productType === 'dropship' ? 'bg-secondary/20 text-secondary' : 'bg-accent/20 text-accent'}`}>
                            {p.productType === 'dropship' ? 'Dropship' : 'In-House'}
                        </span>
                    </td>
                    <td className="p-4 text-textSecondary">{p.category}</td>
                    <td className="p-4 text-textSecondary">Tk {p.discountPrice || p.price}</td>
                    <td className="p-4 text-textSecondary">{p.stock}</td>
                    <td className="p-4">
                        <div className="flex gap-4">
                            <button onClick={() => navigate(`/admin/edit/${p.id}`)} className="text-primary font-semibold hover:underline">Edit</button>
                            <button onClick={() => handleDelete(p.id, p.name)} className="text-secondary font-semibold hover:underline">Delete</button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <p className="p-4 text-center text-textSecondary">No products found. Add one to get started!</p>}
          </div>
      </div>
    </div>
  );
};