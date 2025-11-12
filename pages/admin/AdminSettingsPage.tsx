import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { AppSettings } from '../../types';
import { useSettings } from '../../contexts/AppContext';

export const AdminSettingsPage: React.FC = () => {
    const { settings, saveSettings } = useSettings();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<AppSettings>();
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (settings) {
            reset(settings);
        }
    }, [settings, reset]);
    
    const onSubmit: SubmitHandler<AppSettings> = (data) => {
        const processedData: AppSettings = {
            ...data,
            delivery: {
                insideDhaka: Number(data.delivery.insideDhaka),
                outsideDhaka: Number(data.delivery.outsideDhaka),
                codFee: Number(data.delivery.codFee),
            },
            advertisement: {
                ...data.advertisement,
                isEnabled: Boolean(data.advertisement.isEnabled),
                isPopup: Boolean(data.advertisement.isPopup)
            }
        };
        saveSettings(processedData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000); // Hide message after 3 seconds
    };
    
    const inputClasses = "mt-1 block w-full bg-background border border-white/20 rounded-md shadow-sm p-2 focus:outline-none focus:ring-primary focus:border-primary";

    return (
        <div className="bg-surface p-8 rounded-lg shadow-md border border-white/10 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Application Settings</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Delivery Settings */}
                <div>
                    <h2 className="text-xl font-semibold text-primary mb-4">Delivery Charges</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-sm font-medium text-textSecondary">Inside Dhaka (Tk)</label>
                            <input type="number" {...register("delivery.insideDhaka", { required: "This field is required", min: { value: 0, message: "Cannot be negative" }, valueAsNumber: true })} className={inputClasses} />
                             {errors.delivery?.insideDhaka && <p className="text-red-500 text-sm mt-1">{errors.delivery.insideDhaka.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-textSecondary">Outside Dhaka (Tk)</label>
                            <input type="number" {...register("delivery.outsideDhaka", { required: "This field is required", min: { value: 0, message: "Cannot be negative" }, valueAsNumber: true })} className={inputClasses} />
                             {errors.delivery?.outsideDhaka && <p className="text-red-500 text-sm mt-1">{errors.delivery.outsideDhaka.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-textSecondary">Cash on Delivery Fee (Tk)</label>
                            <input type="number" {...register("delivery.codFee", { required: "This field is required", min: { value: 0, message: "Cannot be negative" }, valueAsNumber: true })} className={inputClasses} />
                             {errors.delivery?.codFee && <p className="text-red-500 text-sm mt-1">{errors.delivery.codFee.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div>
                    <h2 className="text-xl font-semibold text-primary mb-4">Social Media</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-textSecondary">Facebook URL</label>
                            <input {...register("social.facebook", { required: true })} className={inputClasses} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-textSecondary">Instagram URL</label>
                            <input {...register("social.instagram", { required: true })} className={inputClasses} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-textSecondary">WhatsApp Number</label>
                            <input {...register("social.whatsapp", { required: true })} className={inputClasses} />
                        </div>
                    </div>
                </div>

                {/* Advertisement Settings */}
                <div>
                    <h2 className="text-xl font-semibold text-primary mb-4">Advertisements</h2>
                    <div className="p-4 border border-white/10 rounded-lg space-y-4">
                         <h3 className="font-semibold text-textPrimary">Sidebar Ad Banner</h3>
                        <div className="flex items-center space-x-3 bg-background p-3 rounded-md">
                            <input type="checkbox" {...register("advertisement.isEnabled")} id="adEnabled" className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"/>
                            <label htmlFor="adEnabled" className="font-medium text-textPrimary">Enable Ad Banner on Shop Page Sidebar</label>
                        </div>
                    </div>
                     <div className="p-4 border border-white/10 rounded-lg space-y-4 mt-4">
                         <h3 className="font-semibold text-textPrimary">Promotional Popup</h3>
                         <div className="flex items-center space-x-3 bg-background p-3 rounded-md">
                            <input type="checkbox" {...register("advertisement.isPopup")} id="popupEnabled" className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"/>
                            <label htmlFor="popupEnabled" className="font-medium text-textPrimary">Enable Promotional Popup on Website</label>
                        </div>
                    </div>
                    <div className="mt-4 space-y-4">
                        <p className="text-sm text-textSecondary">Common settings for both Sidebar Ad and Popup:</p>
                        <div>
                            <label className="text-sm font-medium text-textSecondary">Ad Image URL</label>
                            <input {...register("advertisement.imageUrl")} placeholder="https://example.com/ad.png" className={inputClasses} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-textSecondary">Ad Link URL (where users will go after clicking)</label>
                            <input {...register("advertisement.linkUrl")} placeholder="https://advertiser-website.com" className={inputClasses} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-textSecondary">Ad Title</label>
                            <input {...register("advertisement.title")} placeholder="e.g., Special Offer!" className={inputClasses} />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-textSecondary">Ad Description</label>
                            <input {...register("advertisement.description")} placeholder="e.g., Get 50% off on all items." className={inputClasses} />
                        </div>
                    </div>
                </div>


                <div className="flex justify-end items-center gap-4 pt-4 border-t border-white/10">
                    {isSaved && <p className="text-green-400 text-sm">Settings saved successfully!</p>}
                    <button type="submit" className="bg-primary text-background px-6 py-2 rounded-md hover:bg-opacity-80">
                        Save All Settings
                    </button>
                </div>
            </form>
        </div>
    );
};