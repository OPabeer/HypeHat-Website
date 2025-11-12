import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart, useNotification, useInbox } from '../contexts/AppContext';
import { youwareService } from '../services/youwareService';
import { Order } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useForm, SubmitHandler } from 'react-hook-form';

type PaymentMethod = 'bkash' | 'nagad' | 'rocket';

type PaymentFormInputs = {
    transactionId: string;
};

const paymentDetails: { [key in PaymentMethod]: { name: string; number: string; type: string } } = {
    bkash: { name: 'bKash', number: '01712345678', type: 'Merchant' },
    nagad: { name: 'Nagad', number: '01812345678', type: 'Merchant' },
    rocket: { name: 'Rocket', number: '01912345678', type: 'Personal' },
};

export const PaymentVerificationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { addNotification } = useNotification();
    const { refreshUserNotifications } = useInbox();
    const { t } = useI18n();
    
    const { register, handleSubmit, formState: { errors } } = useForm<PaymentFormInputs>();

    const orderData = location.state?.orderData as Omit<Order, 'id' | 'createdAt'>;

    if (!orderData) {
        navigate('/checkout');
        return null;
    }

    const { paymentMethod: paymentMethodKey, grandTotal, userId } = orderData;
    const currentPayment = paymentDetails[paymentMethodKey as PaymentMethod];
    
    // Generate a simulated QR code for payment
    const qrData = encodeURIComponent(`payment_type=${currentPayment.name}&number=${currentPayment.number}&amount=${grandTotal.toFixed(2)}`);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}&qzone=1&bgcolor=1E1E1E&color=FFFFFF`;


    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            addNotification(t('paymentVerificationPage.copySuccess', text), 'success');
        }).catch(err => {
            addNotification(t('paymentVerificationPage.copyError', text), 'error');
            console.error('Could not copy text: ', err);
        });
    };

    const handleConfirmPayment: SubmitHandler<PaymentFormInputs> = (data) => {
        const finalOrderData: Omit<Order, 'id' | 'createdAt'> = {
            ...orderData,
            transactionId: data.transactionId.trim(),
        };

        const newOrder = youwareService.createOrder(finalOrderData);
        
        youwareService.addUserNotification({
            userId: userId,
            message: `Your order #${newOrder.id.slice(-6)} has been placed. We will verify your payment shortly.`,
            link: `/order-confirmation/${newOrder.id}`
        });
        refreshUserNotifications();

        orderData.items.forEach(item => {
            const product = youwareService.getProductById(item.product.id);
            if (product) {
                if (product.variants && product.variants.length > 0) {
                    for (const variant of product.variants) {
                        const option = variant.options.find(opt => opt.name === item.selectedOptions[variant.name]);
                        if (option) {
                            option.stock -= item.quantity;
                        }
                    }
                    product.stock = product.variants.reduce((total, v) => total + v.options.reduce((sum, opt) => sum + opt.stock, 0), 0);
                } else {
                    product.stock -= item.quantity;
                }
                youwareService.updateProduct(product);
            }
        });

        clearCart();
        addNotification(t('paymentVerificationPage.orderSuccess'), "success");
        navigate(`/order-confirmation/${newOrder.id}`);
    };
    

    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-textPrimary p-4">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-surface rounded-lg shadow-lg border border-white/10">
                <h1 className="text-2xl font-bold text-center text-primary">{t('paymentVerificationPage.title')}</h1>
                <p className="text-center text-textSecondary">{t('paymentVerificationPage.paymentDetailsFor', currentPayment.name)}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-background p-6 rounded-lg border border-white/20">
                    <div className="text-center md:text-left space-y-4">
                        <div>
                            <p className="text-sm text-textSecondary">{t('paymentVerificationPage.totalAmount')}</p>
                            <p className="text-4xl font-bold text-accent">Tk {grandTotal.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-textSecondary">{currentPayment.name} {t('paymentVerificationPage.merchantNumber')}</p>
                             <button
                                type="button"
                                onClick={() => handleCopyToClipboard(currentPayment.number)}
                                className="font-mono text-xl font-bold text-primary my-1 tracking-widest p-2 rounded hover:bg-white/10 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                                title={t('paymentVerificationPage.copyNumber')}
                            >
                                {currentPayment.number}
                            </button>
                        </div>
                        <p className="text-xs text-textSecondary">{t('paymentVerificationPage.paymentType', currentPayment.type)}</p>
                    </div>
                    <div className="text-center">
                         <p className="text-sm font-semibold text-textSecondary mb-2">{t('paymentVerificationPage.orScanQr')}</p>
                         <div className="bg-surface p-2 rounded-lg inline-block border border-white/10">
                            <img src={qrCodeUrl} alt={`${currentPayment.name} QR Code`} className="w-40 h-40" />
                         </div>
                    </div>
                </div>

                <div className="pt-4">
                     <h3 className="font-semibold text-center mb-4">{t('paymentVerificationPage.paymentGuideTitle', currentPayment.name)}</h3>
                     <ol className="text-sm text-textSecondary space-y-2 list-decimal list-inside text-center">
                        <li>{t('paymentVerificationPage.guide.step1', currentPayment.name)}</li>
                        <li>{t('paymentVerificationPage.guide.step2')}</li>
                        <li>{t('paymentVerificationPage.guide.step3', currentPayment.number)}</li>
                        <li>{t('paymentVerificationPage.guide.step4', grandTotal.toFixed(2))}</li>
                        <li>{t('paymentVerificationPage.guide.step5')}</li>
                     </ol>
                </div>


                <form className="space-y-6 pt-6 border-t border-white/20" onSubmit={handleSubmit(handleConfirmPayment)}>
                     <div>
                        <label htmlFor="trxId" className="text-sm font-medium text-textSecondary">
                           {t('paymentVerificationPage.trxIdLabel')}
                        </label>
                        <input
                            id="trxId"
                            type="text"
                            {...register("transactionId", { 
                                required: t('paymentVerificationPage.error.trxIdRequired'),
                                pattern: {
                                    value: /^[a-zA-Z0-9]{8,10}$/,
                                    message: t('paymentVerificationPage.error.trxIdInvalid')
                                }
                            })}
                            placeholder={t('paymentVerificationPage.trxIdPlaceholder')}
                            className="w-full px-3 py-2 mt-1 bg-background border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                         {errors.transactionId && <p className="text-sm text-red-500 mt-1">{errors.transactionId.message}</p>}
                    </div>

                     <div>
                        <button type="submit" className="w-full px-4 py-3 font-medium text-background bg-primary rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                           {t('paymentVerificationPage.confirmButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};