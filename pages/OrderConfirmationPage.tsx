
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Order } from '../types';
import { youwareService } from '../services/youwareService';
import { DownloadIcon } from '../components/Icons';
import { useI18n } from '../contexts/I18nContext';

export const OrderConfirmationPage: React.FC = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const { t } = useI18n();

    useEffect(() => {
        if (orderId) {
            const foundOrder = youwareService.getAllOrders().find(o => o.id === orderId);
            setOrder(foundOrder || null);
        }
    }, [orderId]);

    const orderIdText = () => {
        const textParts = t('orderConfirmationPage.orderId').split(/<1>|<\/1>/);
        return (
            <>
                {textParts[0]}
                <span className="text-accent">{orderId}</span>
                {textParts[1]}
            </>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh] flex flex-col justify-center items-center">
             <div className="bg-surface p-10 rounded-lg shadow-lg border border-white/10 max-w-3xl w-full">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-primary">{t('orderConfirmationPage.thankYou')}</h1>
                    <p className="text-textSecondary mt-4">{t('orderConfirmationPage.successMessage')}</p>
                    <p className="text-textPrimary font-semibold mt-2">{orderIdText()}</p>
                    <p className="text-textSecondary mt-4">{t('orderConfirmationPage.contactMessage')}</p>
                </div>

                {order && (
                    <>
                        {/* Order Summary Section */}
                        <div className="mt-8 pt-6 border-t border-white/20">
                            <h2 className="text-xl font-semibold text-center mb-4">{t('orderConfirmationPage.summaryTitle')}</h2>
                            <div className="bg-background p-4 rounded-md space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-textSecondary">{t('orderConfirmationPage.orderDate')}:</span>
                                    <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-textSecondary">{t('orderConfirmationPage.paymentMethod')}:</span>
                                    <span className="font-medium">{order.paymentMethod}</span>
                                </div>
                                {order.transactionId && (
                                    <div className="flex justify-between">
                                        <span className="text-textSecondary">{t('orderConfirmationPage.transactionId')}:</span>
                                        <span className="font-medium font-mono text-accent">{order.transactionId}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-textSecondary">{t('orderConfirmationPage.shippingTo')}:</span>
                                    <span className="font-medium text-right max-w-[60%]">{order.userAddress}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-white/10 mt-2">
                                    <span className="text-textSecondary font-bold">{t('orderConfirmationPage.grandTotal')}:</span>
                                    <span className="font-bold text-lg text-primary">Tk {order.grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Product Guides Section */}
                        <div className="mt-8 pt-6 border-t border-white/20">
                            <h2 className="text-xl font-semibold text-center mb-4">{t('orderConfirmationPage.guidesTitle')}</h2>
                            <div className="space-y-3">
                                {order.items.map(item => item.product.guideUrl ? (
                                    <div key={item.cartItemId} className="bg-background p-3 rounded-md flex justify-between items-center">
                                        <p className="text-textPrimary font-medium">{item.product.name}</p>
                                        <a 
                                            href={item.product.guideUrl} 
                                            download 
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary hover:text-background transition-colors"
                                        >
                                            <DownloadIcon className="w-4 h-4" />
                                            {t('orderConfirmationPage.downloadDetails')}
                                        </a>
                                    </div>
                                ) : null)}
                            </div>
                             {order.items.every(item => !item.product.guideUrl) && (
                                <p className="text-center text-textSecondary text-sm">{t('orderConfirmationPage.noGuides')}</p>
                            )}
                        </div>
                    </>
                )}

                <div className="text-center">
                    <Link to="/shop" className="mt-8 inline-block bg-primary text-background font-bold py-3 px-8 rounded-full hover:bg-opacity-80 transition">
                        {t('orderConfirmationPage.continueShopping')}
                    </Link>
                </div>
             </div>
        </div>
    );
};