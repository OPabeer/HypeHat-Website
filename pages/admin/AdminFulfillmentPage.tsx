import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { youwareService } from '../../services/youwareService';
import { FulfillmentItem } from '../../types';
import { useI18n } from '../../contexts/I18nContext';

export const AdminFulfillmentPage: React.FC = () => {
    const { t } = useI18n();
    const [fulfillmentItems, setFulfillmentItems] = useState<FulfillmentItem[]>([]);
    
    const loadItems = () => {
        const items = youwareService.getFulfillmentCart();
        // Sort with not-purchased items first
        items.sort((a, b) => (a.isPurchased ? 1 : 0) - (b.isPurchased ? 1 : 0));
        setFulfillmentItems(items);
    };

    useEffect(() => {
        loadItems();
    }, []);
    
    const handleTogglePurchased = (itemId: string, currentStatus: boolean) => {
        youwareService.updateFulfillmentItemStatus(itemId, !currentStatus);
        loadItems();
    };

    const handleClearPurchased = () => {
        if (window.confirm("Are you sure you want to remove all purchased items from this list?")) {
            youwareService.clearPurchasedFulfillmentItems();
            loadItems();
        }
    };
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{t('adminFulfillmentPage.title')}</h1>
                    <p className="text-textSecondary mt-2 max-w-2xl">{t('adminFulfillmentPage.subtitle')}</p>
                </div>
                <button
                    onClick={handleClearPurchased}
                    className="bg-secondary text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition whitespace-nowrap"
                >
                    {t('adminFulfillmentPage.clearPurchased')}
                </button>
            </div>
            
            <div className="bg-surface shadow-md rounded-lg border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="p-4">{t('adminFulfillmentPage.item')}</th>
                                <th className="p-4">{t('adminFulfillmentPage.customer')}</th>
                                <th className="p-4">{t('adminFulfillmentPage.order')}</th>
                                <th className="p-4">{t('adminFulfillmentPage.status')}</th>
                                <th className="p-4">{t('adminFulfillmentPage.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fulfillmentItems.map(item => (
                                <tr key={item.id} className={`border-b border-white/10 last:border-0 hover:bg-white/5 ${item.isPurchased ? 'opacity-50' : ''}`}>
                                    <td className="p-4">
                                        <a href={item.supplierUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                                            {item.productName}
                                        </a>
                                        <p className="text-sm text-textSecondary">Qty: {item.quantity}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold">{item.customerName}</p>
                                        <p className="text-xs text-textSecondary max-w-xs">{item.customerAddress}</p>
                                    </td>
                                    <td className="p-4">
                                        <Link to={`/admin/orders`} className="font-mono text-accent hover:underline">
                                           {item.orderId.slice(-6)}
                                        </Link>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.isPurchased ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {item.isPurchased ? t('adminFulfillmentPage.purchased') : t('orderStatus.Pending')}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleTogglePurchased(item.id, item.isPurchased)}
                                            className={`text-sm font-semibold py-1 px-3 rounded-full transition ${item.isPurchased ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-primary hover:bg-opacity-80 text-background'}`}
                                        >
                                            {item.isPurchased ? 'Mark as Pending' : t('adminFulfillmentPage.markAsPurchased')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {fulfillmentItems.length === 0 && (
                        <p className="p-8 text-center text-textSecondary">{t('adminFulfillmentPage.empty')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
