import React, { useEffect, useState } from 'react';
import { useNotification } from '../contexts/AppContext';
import { Notification } from '../types';

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    switch (type) {
        case 'success':
            return (
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case 'error':
            return (
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        default:
            return (
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
    }
};


const NotificationToast: React.FC<{ notification: Notification }> = ({ notification }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger fade-in animation
        setIsVisible(true);
    }, []);

    return (
        <div 
            className={`w-full max-w-sm bg-surface shadow-lg rounded-lg pointer-events-auto ring-1 ring-white/10 overflow-hidden transform transition-all duration-300 ease-in-out
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <NotificationIcon type={notification.type} />
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-textPrimary">{notification.message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const NotificationContainer: React.FC = () => {
    const { notifications } = useNotification();

    return (
        <div className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {notifications.map(notification => (
                    <NotificationToast key={notification.id} notification={notification} />
                ))}
            </div>
        </div>
    );
};