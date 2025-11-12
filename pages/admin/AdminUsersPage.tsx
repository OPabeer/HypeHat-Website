import React, { useState, useEffect } from 'react';
import { User, Order } from '../../types';
import { youwareService } from '../../services/youwareService';
import { useI18n } from '../../contexts/I18nContext';

export const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const { t } = useI18n();

    useEffect(() => {
        setUsers(youwareService.getAllUsers());
        setOrders(youwareService.getAllOrders());
    }, []);

    const getUserOrderCount = (userId: string) => {
        return orders.filter(order => order.userId === userId).length;
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('adminUsersPage.title')}</h1>
            <div className="bg-surface shadow-md rounded-lg border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="p-4">{t('adminUsersPage.name')}</th>
                                <th className="p-4">{t('adminUsersPage.email')}</th>
                                <th className="p-4">{t('adminUsersPage.totalOrders')}</th>
                                <th className="p-4">{t('adminUsersPage.addresses')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-white/10 last:border-0 hover:bg-white/5">
                                    <td className="p-4 font-semibold">{user.name}</td>
                                    <td className="p-4 text-textSecondary">{user.email}</td>
                                    <td className="p-4 text-center">{getUserOrderCount(user.id)}</td>
                                    <td className="p-4 text-center">{user.addresses?.length || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && <p className="p-4 text-center text-textSecondary">{t('adminUsersPage.noUsers')}</p>}
                </div>
            </div>
        </div>
    );
};