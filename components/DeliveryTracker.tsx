import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { TruckIcon } from './Icons';

interface DeliveryTrackerProps {
    order: Order;
}

const getStatusInfo = (status: Order['status']) => {
    switch (status) {
        case 'Pending': return { color: 'text-yellow-400', bgColor: 'bg-yellow-500' };
        case 'Shipped': return { color: 'text-blue-400', bgColor: 'bg-blue-500' };
        case 'Delivered': return { color: 'text-green-400', bgColor: 'bg-green-500' };
        case 'Cancelled': return { color: 'text-red-400', bgColor: 'bg-red-500' };
        default: return { color: 'text-textSecondary', bgColor: 'bg-gray-500' };
    }
}

export const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ order }) => {
    const { t } = useI18n();
    const [statusText, setStatusText] = useState('');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let text = '';
        let progressValue = 0;

        switch (order.status) {
            case 'Delivered':
                text = t('profilePage.deliveryTracker.deliveredOn', new Date(order.estimatedDeliveryDate || order.createdAt).toLocaleDateString());
                progressValue = 100;
                break;
            case 'Cancelled':
                // The parent component will handle this case and not render the tracker
                break;
            case 'Pending':
                text = t('profilePage.deliveryTracker.awaitingShipment');
                progressValue = 10;
                break;
            case 'Shipped':
                if (order.shippedAt && order.estimatedDeliveryDate) {
                    const shippedDate = new Date(order.shippedAt);
                    const estimatedDate = new Date(order.estimatedDeliveryDate);
                    const today = new Date();
                    
                    const totalDuration = Math.max(1, estimatedDate.getTime() - shippedDate.getTime());
                    const elapsedDuration = today.getTime() - shippedDate.getTime();
                    const diffTime = estimatedDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays <= 0) {
                        text = t('profilePage.deliveryTracker.arrivingToday');
                        progressValue = 90;
                    } else if (diffDays === 1) {
                        text = t('profilePage.deliveryTracker.arrivingTomorrow');
                        progressValue = 75;
                    } else {
                        text = t('profilePage.deliveryTracker.arrivingIn', diffDays);
                        // Progress from 10% (shipped) to 90% (arriving today)
                        progressValue = 10 + Math.max(0, Math.min(80, (elapsedDuration / totalDuration) * 80));
                    }
                } else {
                    text = t('profilePage.deliveryTracker.awaitingShipment');
                    progressValue = 10;
                }
                break;
        }
        setStatusText(text);
        setProgress(progressValue);

    }, [order, t]);
    
    if (order.status === 'Cancelled') return null;

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-textPrimary">{statusText}</p>
                <TruckIcon className={`w-6 h-6 ${getStatusInfo(order.status).color}`} />
            </div>
            <div className="w-full bg-background rounded-full h-2.5">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${getStatusInfo(order.status).bgColor}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};