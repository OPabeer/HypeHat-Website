import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Coupon } from '../../types';
import { youwareService } from '../../services/youwareService';

type CouponFormInputs = Omit<Coupon, 'id' | 'isActive' | 'discountType'>;

export const AdminCouponsPage: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CouponFormInputs>();

    useEffect(() => {
        setCoupons(youwareService.getCoupons());
    }, []);
    
    const refreshCoupons = () => {
        setCoupons(youwareService.getCoupons());
    };

    const onSubmit: SubmitHandler<CouponFormInputs> = (data) => {
        const couponData = {
            ...data,
            discountValue: Number(data.discountValue),
            discountType: 'fixed' as const, // Always fixed
        };
        youwareService.addCoupon(couponData);
        refreshCoupons();
        reset();
    };

    const handleDelete = (couponId: string) => {
        if (window.confirm("Are you sure you want to delete this coupon?")) {
            youwareService.deleteCoupon(couponId);
            refreshCoupons();
        }
    };
    
    const inputClasses = "mt-1 block w-full bg-background border border-white/20 rounded-md shadow-sm p-2 focus:outline-none focus:ring-primary focus:border-primary";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-surface p-6 rounded-lg shadow-md border border-white/10">
                    <h2 className="text-xl font-bold mb-4">Add New Coupon</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-textSecondary">Coupon Code</label>
                            <input {...register("code", { required: "Code is required" })} className={inputClasses} />
                             {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-textSecondary">Discount Amount (Tk)</label>
                            <input type="number" step="any" {...register("discountValue", { required: "Value is required", min: 0, valueAsNumber: true })} className={inputClasses} />
                            {errors.discountValue && <p className="text-red-500 text-sm mt-1">{errors.discountValue.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-textSecondary">Expiry Date</label>
                            <input type="date" {...register("expiryDate", { required: "Expiry date is required" })} className={inputClasses} />
                            {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message}</p>}
                        </div>
                        <button type="submit" className="w-full bg-primary text-background px-4 py-2 rounded-md hover:bg-opacity-80">
                            Add Coupon
                        </button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-2">
                <div className="bg-surface p-6 rounded-lg shadow-md border border-white/10">
                    <h2 className="text-xl font-bold mb-4">Existing Coupons</h2>
                    <div className="space-y-3">
                        {coupons.length > 0 ? coupons.map(coupon => (
                            <div key={coupon.id} className="flex justify-between items-center bg-background p-3 rounded-md border border-white/10">
                                <div>
                                    <p className="font-semibold text-primary">{coupon.code}</p>
                                    <p className="text-sm text-textSecondary">
                                        Tk {coupon.discountValue} off | Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <button onClick={() => handleDelete(coupon.id)} className="text-secondary font-semibold">Delete</button>
                            </div>
                        )) : (
                            <p className="text-textSecondary">No coupons created yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};