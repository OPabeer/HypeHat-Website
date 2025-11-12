import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AppContext';
import { AdminChatbotWidget } from '../../components/AdminChatbotWidget';
import { useI18n } from '../../contexts/I18nContext';
import { PuzzlePieceIcon, ClipboardListIcon, UserIcon, StarIcon, BellIcon, SparklesIcon, TruckIcon } from '../../components/Icons'; // Assuming icons exist

export const AdminLayout: React.FC = () => {
    const { logout } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navLinkClasses = "flex items-center gap-3 py-2.5 px-4 rounded transition duration-200 text-textSecondary hover:bg-primary/20 hover:text-primary";
    const activeNavLinkClasses = "bg-primary/20 text-primary font-semibold";

    return (
        <div className="flex min-h-screen bg-background text-textPrimary">
            <aside className="w-64 bg-surface border-r border-white/10 flex flex-col">
                <div className="p-6">
                     <h1 className="text-2xl font-bold text-center text-primary">{t('adminLayout.title')}</h1>
                </div>
                <nav className="flex-grow px-4 space-y-2">
                    <NavLink to="/admin" end className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{t('adminLayout.dashboard')}</NavLink>
                    <NavLink to="/admin/new" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{t('adminLayout.addProduct')}</NavLink>
                    <NavLink to="/admin/import" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{t('adminLayout.importProduct')}</NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{t('adminLayout.orders')}</NavLink>
                    <NavLink to="/admin/fulfillment" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                        <TruckIcon className="w-5 h-5" />
                        {t('adminLayout.fulfillment')}
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{t('adminLayout.users')}</NavLink>
                    <NavLink to="/admin/reviews" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{t('adminLayout.reviews')}</NavLink>
                    <NavLink to="/admin/coupons" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{t('adminLayout.coupons')}</NavLink>
                    <NavLink to="/admin/settings" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{t('adminLayout.settings')}</NavLink>
                </nav>
                 <div className="p-4 border-t border-white/10">
                    <button onClick={handleLogout} className="w-full text-left py-2.5 px-4 rounded transition duration-200 text-textSecondary hover:bg-secondary/20 hover:text-secondary">
                        {t('adminLayout.logout')}
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-8 relative">
                <Outlet />
                <AdminChatbotWidget />
            </main>
        </div>
    );
};
