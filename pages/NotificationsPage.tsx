import React from 'react';
import { useInbox } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

const timeSince = (dateString: string, t: (key: string, ...args: any[]) => string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return t('notificationsPage.timeAgo.years', Math.floor(interval));
    interval = seconds / 2592000;
    if (interval > 1) return t('notificationsPage.timeAgo.months', Math.floor(interval));
    interval = seconds / 86400;
    if (interval > 1) return t('notificationsPage.timeAgo.days', Math.floor(interval));
    interval = seconds / 3600;
    if (interval > 1) return t('notificationsPage.timeAgo.hours', Math.floor(interval));
    interval = seconds / 60;
    if (interval > 1) return t('notificationsPage.timeAgo.minutes', Math.floor(interval));
    return t('notificationsPage.timeAgo.seconds', Math.floor(seconds));
};

export const NotificationsPage: React.FC = () => {
    const { userNotifications, unreadCount, markAsRead, markAllAsRead } = useInbox();
    const { t } = useI18n();
    const navigate = useNavigate();

    const handleNotificationClick = (notificationId: string, link?: string) => {
        markAsRead(notificationId);
        if (link) {
            navigate(link);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-textPrimary">{t('notificationsPage.title')}</h1>
                    {unreadCount > 0 && (
                        <button 
                            onClick={markAllAsRead} 
                            className="text-sm font-semibold text-primary hover:underline"
                        >
                            {t('notificationsPage.markAllAsRead')}
                        </button>
                    )}
                </div>

                <div className="bg-surface rounded-lg shadow border border-white/10">
                    {userNotifications.length > 0 ? (
                        <ul className="divide-y divide-white/10">
                            {userNotifications.map(notification => (
                                <li
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                                    className={`p-4 transition-colors ${notification.link ? 'cursor-pointer hover:bg-white/5' : ''} ${!notification.isRead ? 'bg-primary/10' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        {!notification.isRead && (
                                            <div className="w-2.5 h-2.5 bg-primary rounded-full mt-1.5 flex-shrink-0" title="Unread"></div>
                                        )}
                                        <div className={`flex-grow ${notification.isRead ? 'ml-6' : ''}`}>
                                            <p className="text-sm text-textPrimary">{notification.message}</p>
                                            <p className="text-xs text-textSecondary mt-1">{timeSince(notification.createdAt, t)}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-16">
                            <h3 className="text-xl font-semibold text-textPrimary">{t('notificationsPage.emptyTitle')}</h3>
                            <p className="text-textSecondary mt-2">{t('notificationsPage.emptySubtitle')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};