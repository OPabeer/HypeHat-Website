
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Order, Address } from '../types';
import { youwareService } from '../services/youwareService';
import { ADDRESS_DATA } from '../constants';
import { useI18n } from '../contexts/I18nContext';

type PasswordFormInputs = {
    currentPassword: '';
    newPassword: '';
    confirmPassword: '';
};

type NameFormInputs = {
    name: string;
}

type AddressFormInputs = Omit<Address, 'id'>;

const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`;

const AddressForm: React.FC<{
    address: Partial<Address>;
    onSave: (addressData: Address) => void;
    onCancel: () => void;
}> = ({ address, onSave, onCancel }) => {
    const { t } = useI18n();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AddressFormInputs>({
        defaultValues: {
            division: address.division || Object.keys(ADDRESS_DATA)[0],
            zilla: address.zilla || '',
            upazilla: address.upazilla || '',
            street: address.street || ''
        }
    });

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

    const onSubmit: SubmitHandler<AddressFormInputs> = (data) => {
        onSave({
            ...data,
            id: address.id || generateId(),
        });
    };
    
    const inputClasses = "w-full px-3 py-2 mt-1 bg-background border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 mt-4 bg-background rounded-lg border border-primary/50">
            <h3 className="text-xl font-semibold text-primary">{address.id ? t('profilePage.addressForm.titleEdit') : t('profilePage.addressForm.titleAdd')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium text-textSecondary">{t('checkoutPage.newAddressForm.division')}</label>
                    <select {...register("division")} className={inputClasses}>
                        {Object.keys(ADDRESS_DATA).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-textSecondary">{t('checkoutPage.newAddressForm.zilla')}</label>
                    <select {...register("zilla")} className={inputClasses} disabled={!selectedDivision}>
                        {selectedDivision && Object.keys(ADDRESS_DATA[selectedDivision] || {}).map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-textSecondary">{t('checkoutPage.newAddressForm.upazilla')}</label>
                    <select {...register("upazilla")} className={inputClasses} disabled={!selectedZilla}>
                        {selectedDivision && selectedZilla && (ADDRESS_DATA[selectedDivision]?.[selectedZilla] || []).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="text-sm font-medium text-textSecondary">{t('checkoutPage.newAddressForm.street')}</label>
                <input {...register("street", { required: t('checkoutPage.newAddressForm.streetRequired') })} className={inputClasses} />
                 {errors.street && <p className="text-sm text-red-500 mt-1">{errors.street.message}</p>}
            </div>
            <div className="flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 font-medium text-textPrimary bg-gray-600 rounded-md hover:bg-opacity-80 transition-colors">{t('profilePage.addressForm.cancel')}</button>
                <button type="submit" className="px-6 py-2 font-medium text-background bg-primary rounded-md hover:bg-opacity-80 transition-colors">{t('profilePage.addressForm.save')}</button>
            </div>
        </form>
    )
}


export const ProfilePage: React.FC = () => {
    const { user, logout, updateUserPassword, updateUser } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [profileMessage, setProfileMessage] = useState('');
    const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null);
    
    const passwordForm = useForm<PasswordFormInputs>();
    const newPassword = passwordForm.watch("newPassword");
    
    const nameForm = useForm<NameFormInputs>({
        defaultValues: { name: user?.name || '' }
    });

    useEffect(() => {
        if (user) {
            setOrders(youwareService.getOrdersByUserId(user.id));
            nameForm.reset({ name: user.name || '' });
        }
    }, [user, nameForm]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    const onPasswordChangeSubmit: SubmitHandler<PasswordFormInputs> = (data) => {
        setPasswordMessage({ type: '', text: '' });
        const success = updateUserPassword(data.currentPassword, data.newPassword);
        if (success) {
            setPasswordMessage({ type: 'success', text: t('profilePage.notifications.passwordSuccess') });
            passwordForm.reset();
        } else {
            setPasswordMessage({ type: 'error', text: t('profilePage.notifications.passwordError') });
        }
    };
    
    const onNameUpdateSubmit: SubmitHandler<NameFormInputs> = (data) => {
        updateUser({ name: data.name });
        setProfileMessage(t('profilePage.notifications.nameSuccess'));
        setTimeout(() => setProfileMessage(''), 3000);
    };

    const handleSaveAddress = (addressData: Address) => {
        if (!user) return;
        const currentAddresses = user.addresses || [];
        const existingIndex = currentAddresses.findIndex(a => a.id === addressData.id);

        let updatedAddresses: Address[];
        if (existingIndex > -1) {
            updatedAddresses = [...currentAddresses];
            updatedAddresses[existingIndex] = addressData;
        } else {
            updatedAddresses = [...currentAddresses, addressData];
        }

        updateUser({ addresses: updatedAddresses });
        setEditingAddress(null);
    };

    const handleDeleteAddress = (addressId: string) => {
        if (!user || !window.confirm(t('profilePage.notifications.deleteAddressConfirm'))) return;
        const updatedAddresses = (user.addresses || []).filter(a => a.id !== addressId);
        updateUser({ addresses: updatedAddresses });
    }

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'Pending': return 'text-yellow-400';
            case 'Shipped': return 'text-blue-400';
            case 'Delivered': return 'text-green-400';
            case 'Cancelled': return 'text-red-400';
            default: return 'text-textSecondary';
        }
    }

    if (!user) {
        return <div className="text-center py-20 text-textPrimary">Please log in to view your profile.</div>;
    }

    const inputClasses = "w-full px-3 py-2 mt-1 bg-background border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary";
    const errorClasses = "text-sm text-red-500 mt-1";

    return (
        <div className="bg-background min-h-screen text-textPrimary">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-surface p-6 rounded-lg shadow-lg border border-white/10 text-center">
                            <h1 className="text-3xl font-bold text-primary mb-2">{t('profilePage.myProfile')}</h1>
                            <p className="text-lg text-textSecondary">{user.email}</p>
                             <button 
                                onClick={handleLogout}
                                className="mt-6 w-full px-4 py-2 font-medium text-white bg-secondary rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
                            >
                                {t('profilePage.logout')}
                            </button>
                        </div>
                         <div className="bg-surface p-6 rounded-lg shadow-lg border border-white/10">
                            <h2 className="text-2xl font-bold text-primary mb-6">{t('profilePage.changePassword')}</h2>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordChangeSubmit)} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-textSecondary">{t('profilePage.currentPassword')}</label>
                                    <input type="password" {...passwordForm.register("currentPassword", { required: t('profilePage.validation.currentPassword') })} className={inputClasses}/>
                                    {passwordForm.formState.errors.currentPassword && <p className={errorClasses}>{passwordForm.formState.errors.currentPassword.message}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-textSecondary">{t('profilePage.newPassword')}</label>
                                    <input type="password" {...passwordForm.register("newPassword", { required: t('profilePage.validation.newPassword'), minLength: { value: 6, message: t('profilePage.validation.passwordMinLength') } })} className={inputClasses}/>
                                    {passwordForm.formState.errors.newPassword && <p className={errorClasses}>{passwordForm.formState.errors.newPassword.message}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-textSecondary">{t('profilePage.confirmPassword')}</label>
                                    <input type="password" {...passwordForm.register("confirmPassword", { required: t('profilePage.validation.confirmPassword'), validate: value => value === newPassword || t('profilePage.validation.passwordsNoMatch') })} className={inputClasses}/>
                                    {passwordForm.formState.errors.confirmPassword && <p className={errorClasses}>{passwordForm.formState.errors.confirmPassword.message}</p>}
                                </div>
                                {passwordMessage.text && <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-400' : 'text-red-500'}`}>{passwordMessage.text}</p>}
                                <button type="submit" className="w-full mt-2 px-4 py-2 font-medium text-background bg-primary rounded-md hover:bg-opacity-80 transition-colors">
                                    {t('profilePage.updatePassword')}
                                </button>
                            </form>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-8">
                         <div className="bg-surface p-6 rounded-lg shadow-lg border border-white/10">
                            <h2 className="text-3xl font-bold text-primary mb-6">{t('profilePage.myDetails')}</h2>
                            <form onSubmit={nameForm.handleSubmit(onNameUpdateSubmit)} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-textSecondary">{t('profilePage.fullName')}</label>
                                    <input {...nameForm.register("name", { required: t('profilePage.validation.nameRequired') })} className={inputClasses} />
                                    {nameForm.formState.errors.name && <p className={errorClasses}>{nameForm.formState.errors.name.message}</p>}
                                </div>
                                <div className="flex justify-end items-center gap-4">
                                    {profileMessage && <p className="text-sm text-green-400">{profileMessage}</p>}
                                    <button type="submit" className="px-6 py-2 font-medium text-background bg-primary rounded-md hover:bg-opacity-80 transition-colors">
                                        {t('profilePage.saveName')}
                                    </button>
                                </div>
                            </form>
                            <div className="mt-8">
                                <h3 className="text-2xl font-bold text-primary mb-4">{t('profilePage.myAddresses')}</h3>
                                <div className="space-y-4">
                                    {user.addresses && user.addresses.map(addr => (
                                        <div key={addr.id} className="p-4 bg-background rounded-md border border-white/10 flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-textPrimary">{addr.street}</p>
                                                <p className="text-sm text-textSecondary">{`${addr.upazilla}, ${addr.zilla}`}</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={() => setEditingAddress(addr)} className="text-sm text-primary hover:underline">{t('profilePage.edit')}</button>
                                                <button onClick={() => handleDeleteAddress(addr.id)} className="text-sm text-secondary hover:underline">{t('profilePage.delete')}</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {editingAddress ? (
                                    <AddressForm
                                        address={editingAddress}
                                        onSave={handleSaveAddress}
                                        onCancel={() => setEditingAddress(null)}
                                    />
                                ) : (
                                    <button onClick={() => setEditingAddress({})} className="w-full mt-4 py-2 font-medium text-primary border-2 border-dashed border-primary/50 rounded-md hover:bg-primary/10 transition-colors">
                                        {t('profilePage.addNewAddress')}
                                    </button>
                                )}
                            </div>
                         </div>
                        <div className="bg-surface p-6 rounded-lg shadow-lg border border-white/10">
                            <h2 className="text-3xl font-bold text-primary mb-6">{t('profilePage.myOrders')}</h2>
                            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                                {orders.length > 0 ? (
                                    orders.map(order => (
                                        <div key={order.id} className="border border-white/10 rounded-lg p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-textPrimary">{t('profilePage.orderId')}: {order.id}</p>
                                                    <p className="text-sm text-textSecondary">{t('profilePage.date')}: {new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <p className={`font-bold ${getStatusColor(order.status)}`}>{t('orderStatus.'+order.status, order.status)}</p>
                                            </div>
                                            <div className="mt-2 text-textSecondary">
                                               {order.items.map(item => (
                                                   <p key={item.cartItemId} className="text-sm">- {item.product.name} (x{item.quantity})</p>
                                               ))}
                                            </div>
                                            <p className="text-right font-bold mt-2 text-primary">{t('profilePage.total')}: Tk {order.grandTotal.toFixed(2)}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-textSecondary">{t('profilePage.noOrders')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};