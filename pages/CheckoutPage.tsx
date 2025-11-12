import React, { useState, useMemo, useEffect } from 'react';
import { useCart, useAuth, useSettings, useNotification, useInbox } from '../contexts/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { youwareService } from '../services/youwareService';
import { Coupon, Order, Address } from '../types';
import { XIcon } from '../components/Icons';
import { ADDRESS_DATA } from '../constants';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useI18n } from '../contexts/I18nContext';

type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket';

type CheckoutFormInputs = {
    name: string;
    phone: string;
};

const NewAddressForm: React.FC<{onAddressChange: (address: Omit<Address, 'id'>) => void}> = ({ onAddressChange }) => {
     const { t } = useI18n();
     const { register, watch, setValue, formState: { errors } } = useForm<Omit<Address, 'id'>>({
        defaultValues: {
            division: Object.keys(ADDRESS_DATA)[0],
            zilla: '',
            upazilla: '',
            street: ''
        }
    });

    const formValues = watch();
    useEffect(() => {
        onAddressChange(formValues);
    }, [formValues, onAddressChange]);

    const selectedDivision = watch("division");
    const selectedZilla = watch("zilla");

    useEffect(() => {
        if (selectedDivision) {
            const zillasInDivision = Object.keys(ADDRESS_DATA[selectedDivision] || {});
            setValue('zilla', zillasInDivision[0] || '');
        }
    }, [selectedDivision, setValue]);

    useEffect(() => {
        if (selectedDivision && selectedZilla) {
            const upazillasInZilla = ADDRESS_DATA[selectedDivision]?.[selectedZilla] || [];
            setValue('upazilla', upazillasInZilla[0] || '');
        }
    }, [selectedDivision, selectedZilla, setValue]);
    
    const inputClasses = "w-full p-2 bg-background border border-white/20 rounded";

    return (
        <div className="space-y-4 pt-4 border-t border-white/10 mt-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium text-textSecondary">{t('checkoutPage.newAddressForm.division')}</label>
                    <select {...register("division", { required: true })} className={inputClasses}>
                        {Object.keys(ADDRESS_DATA).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-textSecondary">{t('checkoutPage.newAddressForm.zilla')}</label>
                    <select {...register("zilla", { required: true })} className={inputClasses} disabled={!selectedDivision}>
                        {selectedDivision && Object.keys(ADDRESS_DATA[selectedDivision] || {}).map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-textSecondary">{t('checkoutPage.newAddressForm.upazilla')}</label>
                    <select {...register("upazilla", { required: true })} className={inputClasses} disabled={!selectedZilla}>
                        {selectedDivision && selectedZilla && (ADDRESS_DATA[selectedDivision]?.[selectedZilla] || []).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>
            <input type="text" placeholder={t('checkoutPage.newAddressForm.street')} {...register("street", { required: true })} className={inputClasses}/>
            {errors.street && <p className="text-red-500 text-sm">{t('checkoutPage.newAddressForm.streetRequired')}</p>}
        </div>
    );
};

export const CheckoutPage: React.FC = () => {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
    const { user } = useAuth();
    const { settings } = useSettings();
    const { addNotification } = useNotification();
    const { refreshUserNotifications } = useInbox();
    const { t } = useI18n();
    const navigate = useNavigate();

    const [deliveryOption, setDeliveryOption] = useState<'insideDhaka' | 'outsideDhaka'>('insideDhaka');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState('');
    
    // Address state
    const userAddresses = user?.addresses || [];
    const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>(userAddresses[0]?.id || 'new');
    const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({division: '', zilla: '', upazilla: '', street: ''});
    
    const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormInputs>({
        defaultValues: {
            name: user?.name || '',
            phone: ''
        }
    });
    
    // Automatically set delivery option based on selected address
    useEffect(() => {
        let currentZilla: string | undefined;

        if (selectedAddressId === 'new') {
            currentZilla = newAddress.zilla;
        } else {
            const selectedSavedAddress = userAddresses.find(addr => addr.id === selectedAddressId);
            currentZilla = selectedSavedAddress?.zilla;
        }

        if (currentZilla) {
            if (currentZilla === 'Dhaka') {
                setDeliveryOption('insideDhaka');
            } else {
                setDeliveryOption('outsideDhaka');
            }
        }
    }, [selectedAddressId, newAddress, userAddresses]);


    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);
    }, [cart]);

    const deliveryCharge = useMemo(() => {
        return deliveryOption === 'insideDhaka' ? settings.delivery.insideDhaka : settings.delivery.outsideDhaka;
    }, [deliveryOption, settings]);

    const codFee = useMemo(() => {
        return paymentMethod === 'cod' ? settings.delivery.codFee : 0;
    }, [paymentMethod, settings]);

    const couponDiscount = useMemo(() => {
        if (!appliedCoupon) return 0;
        return Math.min(appliedCoupon.discountValue, subtotal);
    }, [appliedCoupon, subtotal]);

    const grandTotal = subtotal + deliveryCharge + codFee - couponDiscount;
    
    const handleApplyCoupon = () => {
        setCouponError('');
        const validCoupon = youwareService.validateCoupon(couponCode);
        if(validCoupon) {
            setAppliedCoupon(validCoupon);
        } else {
            setCouponError('Invalid or expired coupon code.');
            setAppliedCoupon(null);
        }
    };

    const onConfirmOrder: SubmitHandler<CheckoutFormInputs> = (data) => {
        if (!user) {
            addNotification(t('checkoutPage.notifications.loginRequired'), "error");
            navigate('/login');
            return;
        }

        let deliveryAddress: Omit<Address, 'id'> | null = null;
        if (selectedAddressId === 'new') {
            if (!newAddress.street || !newAddress.division || !newAddress.zilla || !newAddress.upazilla) {
                 addNotification(t('checkoutPage.notifications.addressRequired'), "error");
                 return;
            }
            deliveryAddress = newAddress;
        } else {
            deliveryAddress = user.addresses?.find(a => a.id === selectedAddressId) || null;
        }
        
        const { name, phone } = data;

        if (!name || !phone || !deliveryAddress) {
            addNotification(t('checkoutPage.notifications.fillFields'), "error");
            return;
        }
        if(cart.length === 0) {
            addNotification(t('checkoutPage.notifications.cartEmpty'), "error");
            return;
        }

        const fullAddress = `${deliveryAddress.street}, ${deliveryAddress.upazilla}, ${deliveryAddress.zilla}, ${deliveryAddress.division}`;
        
        const paymentMethodName = {
            cod: t('checkoutPage.cod'),
            bkash: t('checkoutPage.bkash'),
            nagad: t('checkoutPage.nagad'),
            rocket: t('checkoutPage.rocket')
        }[paymentMethod];
        
        const orderData: Omit<Order, 'id' | 'createdAt'> = {
            userId: user.id,
            userName: name,
            userPhone: phone,
            userAddress: fullAddress,
            items: cart,
            subtotal,
            deliveryCharge,
            couponDiscount,
            couponCode: appliedCoupon?.code,
            codFee,
            grandTotal,
            paymentMethod: paymentMethodName,
            status: 'Pending'
        };

        if (paymentMethod === 'cod') {
            const newOrder = youwareService.createOrder(orderData);
            
            // Create a user notification
            youwareService.addUserNotification({
                userId: user.id,
                message: `Your order #${newOrder.id.slice(-6)} has been placed successfully.`,
                link: `/order-confirmation/${newOrder.id}`
            });
            refreshUserNotifications();
            
            cart.forEach(item => {
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
            addNotification(t('checkoutPage.notifications.orderSuccess'), "success");
            navigate(`/order-confirmation/${newOrder.id}`);
        } else {
            navigate('/payment-verification', { state: { orderData } });
        }
    };
    
    const inputClasses = "w-full p-2 bg-background border border-white/20 rounded";
    const errorInputClasses = "w-full p-2 bg-background border border-red-500 rounded";
    const errorTextClasses = "text-red-500 text-sm mt-1";

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
            <h1 className="text-3xl font-bold text-center mb-8">{t('checkoutPage.title')}</h1>

            {cart.length === 0 ? (
                 <div className="text-center py-16 bg-surface rounded-lg shadow border border-white/10">
                    <h3 className="text-xl font-semibold text-textPrimary">{t('checkoutPage.emptyCartTitle')}</h3>
                    <p className="text-textSecondary mt-2">{t('checkoutPage.emptyCartSubtitle')}</p>
                    <Link to="/shop" className="mt-6 inline-block bg-primary text-background font-bold py-3 px-6 rounded-full hover:bg-opacity-80 transition duration-300">
                        {t('checkoutPage.goShopping')}
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onConfirmOrder)}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Cart Items */}
                            <div className="bg-surface p-6 rounded-lg border border-white/10">
                                 <h2 className="text-xl font-semibold mb-4">{t('checkoutPage.yourItems')}</h2>
                                 <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.cartItemId} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-b-0">
                                            <div className="flex items-center gap-4 flex-grow">
                                                <img src={item.selectedImage} alt={item.product.name} className="w-20 h-20 object-cover rounded-md" />
                                                <div>
                                                    <p className="font-semibold">{item.product.name}</p>
                                                    <p className="text-sm text-textSecondary">{Object.values(item.selectedOptions).join(', ')}</p>
                                                    <p className="text-sm text-primary font-bold mt-1">Tk {item.product.discountPrice || item.product.price}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center border border-white/20 rounded-full">
                                                    <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="px-3 py-1 text-lg">-</button>
                                                    <span className="px-3 py-1">{item.quantity}</span>
                                                    <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="px-3 py-1 text-lg">+</button>
                                                </div>
                                                <p className="font-semibold w-24 text-right">Tk {((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}</p>
                                                <button type="button" onClick={() => removeFromCart(item.cartItemId)} className="text-textSecondary hover:text-secondary p-1">
                                                    <XIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="bg-surface p-8 rounded-lg border border-white/10">
                                <h2 className="text-xl font-semibold mb-6">{t('checkoutPage.deliveryInfo')}</h2>
                                <div className="space-y-4">
                                    <div>
                                        <input type="text" placeholder={t('checkoutPage.fullName')} {...register("name", { required: t('checkoutPage.validation.nameRequired')})} className={errors.name ? errorInputClasses : inputClasses} />
                                        {errors.name && <p className={errorTextClasses}>{errors.name.message}</p>}
                                    </div>
                                    <div>
                                        <input type="tel" placeholder={t('checkoutPage.phone')} {...register("phone", { required: t('checkoutPage.validation.phoneRequired'), pattern: { value: /^(\+?880|0)1[3-9]\d{8}$/, message: t('checkoutPage.validation.phoneInvalid') } })} className={errors.phone ? errorInputClasses : inputClasses} />
                                        {errors.phone && <p className={errorTextClasses}>{errors.phone.message}</p>}
                                    </div>
                                    
                                    <h3 className="text-lg font-semibold pt-4">{t('checkoutPage.selectAddress')}</h3>
                                    <div className="space-y-3">
                                        {userAddresses.map(addr => (
                                             <label key={addr.id} className="flex items-start p-3 bg-background rounded-md border-2 border-transparent has-[:checked]:border-primary transition">
                                                <input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="h-4 w-4 mt-1 text-primary focus:ring-primary"/>
                                                <span className="ml-3 text-sm">
                                                    <span className="font-bold block">{addr.street}</span>
                                                    <span className="text-textSecondary">{`${addr.upazilla}, ${addr.zilla}`}</span>
                                                </span>
                                            </label>
                                        ))}
                                        <label className="flex items-start p-3 bg-background rounded-md border-2 border-transparent has-[:checked]:border-primary transition">
                                            <input type="radio" name="address" value="new" checked={selectedAddressId === 'new'} onChange={() => setSelectedAddressId('new')} className="h-4 w-4 mt-1 text-primary focus:ring-primary"/>
                                            <span className="ml-3 text-sm font-medium">{t('checkoutPage.addNewAddress')}</span>
                                        </label>
                                    </div>

                                    {selectedAddressId === 'new' && <NewAddressForm onAddressChange={setNewAddress} />}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-surface p-6 rounded-lg border border-white/10 sticky top-24">
                                <h2 className="text-xl font-semibold mb-4">{t('checkoutPage.orderSummary')}</h2>
                                 <div className="space-y-2 mb-4">
                                    <label className="block text-sm font-medium text-textSecondary">{t('checkoutPage.deliveryOption')}</label>
                                    <select value={deliveryOption} onChange={(e) => setDeliveryOption(e.target.value as any)} className="w-full p-2 bg-background border border-white/20 rounded">
                                        <option value="insideDhaka">{t('checkoutPage.insideDhaka', settings.delivery.insideDhaka)}</option>
                                        <option value="outsideDhaka">{t('checkoutPage.outsideDhaka', settings.delivery.outsideDhaka)}</option>
                                    </select>
                                </div>
                                
                                {/* Payment Method */}
                                <div className="space-y-3 mb-4">
                                    <label className="block text-sm font-medium text-textSecondary">{t('checkoutPage.paymentMethod')}</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center p-3 bg-background rounded-md border-2 border-transparent has-[:checked]:border-primary transition">
                                            <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="h-4 w-4 text-primary focus:ring-primary"/>
                                            <span className="ml-3 text-sm font-medium">{t('checkoutPage.cod')}</span>
                                        </label>
                                        <label className="flex items-center p-3 bg-background rounded-md border-2 border-transparent has-[:checked]:border-primary transition">
                                            <input type="radio" name="payment" value="bkash" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} className="h-4 w-4 text-primary focus:ring-primary"/>
                                            <span className="ml-3 text-sm font-medium">{t('checkoutPage.bkash')}</span>
                                        </label>
                                        <label className="flex items-center p-3 bg-background rounded-md border-2 border-transparent has-[:checked]:border-primary transition">
                                            <input type="radio" name="payment" value="nagad" checked={paymentMethod === 'nagad'} onChange={() => setPaymentMethod('nagad')} className="h-4 w-4 text-primary focus:ring-primary"/>
                                            <span className="ml-3 text-sm font-medium">{t('checkoutPage.nagad')}</span>
                                        </label>
                                        <label className="flex items-center p-3 bg-background rounded-md border-2 border-transparent has-[:checked]:border-primary transition">
                                            <input type="radio" name="payment" value="rocket" checked={paymentMethod === 'rocket'} onChange={() => setPaymentMethod('rocket')} className="h-4 w-4 text-primary focus:ring-primary"/>
                                            <span className="ml-3 text-sm font-medium">{t('checkoutPage.rocket')}</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between"><span>{t('checkoutPage.subtotal')}</span><span>Tk {subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>{t('checkoutPage.delivery')}</span><span>Tk {deliveryCharge.toFixed(2)}</span></div>
                                    {codFee > 0 && <div className="flex justify-between"><span>{t('checkoutPage.codFee')}</span><span>Tk {codFee.toFixed(2)}</span></div>}
                                    {appliedCoupon && <div className="flex justify-between text-green-400"><span>{t('checkoutPage.discount', appliedCoupon.code)}</span><span>- Tk {couponDiscount.toFixed(2)}</span></div>}
                                </div>
                                <div className="border-t border-white/20 my-4"></div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>{t('checkoutPage.grandTotal')}</span>
                                    <span>Tk {grandTotal.toFixed(2)}</span>
                                </div>
                                <div className="mt-4">
                                    <div className="flex">
                                        <input type="text" placeholder={t('checkoutPage.couponPlaceholder')} value={couponCode} onChange={e => setCouponCode(e.target.value)} className="w-full p-2 bg-background border border-white/20 rounded-l"/>
                                        <button type="button" onClick={handleApplyCoupon} className="bg-secondary text-white px-4 rounded-r">{t('checkoutPage.apply')}</button>
                                    </div>
                                    {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                                </div>
                                <button type="submit" className="w-full mt-6 bg-primary text-background font-bold py-3 rounded-full hover:bg-opacity-80 transition">
                                    {paymentMethod === 'cod' ? t('checkoutPage.confirmOrder') : t('checkoutPage.proceedToPayment')}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};