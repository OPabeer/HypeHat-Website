

import React, { useEffect } from 'react';
import { useForm, SubmitHandler, useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Product, SupplierInfo } from '../../types';
import { youwareService } from '../../services/youwareService';
import { useProducts, useNotification } from '../../contexts/AppContext';
import { useI18n } from '../../contexts/I18nContext';

type FormValues = Omit<Product, 'id' | 'rating' | 'avgRating' | 'reviewCount' | 'images'> & { 
    id?: string;
    images: { url: string }[];
};

export const AdminProductFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshProducts, refreshCategories } = useProducts();
    const { addNotification } = useNotification();
    const { t } = useI18n();
    const isEditing = Boolean(id);
    const { categories } = useProducts();

    const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            discountPrice: undefined,
            images: [{ url: '' }],
            category: '',
            stock: 0,
            isFeatured: false,
            variants: [],
            productType: 'dropship',
            supplierInfo: { name: '', url: '', costPrice: 0 },
            guideUrl: '',
        }
    });

    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
        control,
        name: "images"
    });

    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
        control,
        name: "variants"
    });

    const productType = watch('productType');
    const variants = watch('variants');

    useEffect(() => {
        if (isEditing && id) {
            const product = youwareService.getProductById(id);
            if (product) {
                reset({
                    ...product,
                    images: product.images.length > 0 ? product.images.map(img => ({ url: img })) : [{ url: '' }],
                    discountPrice: product.discountPrice || undefined,
                    guideUrl: product.guideUrl || '',
                });
            }
        } else if (searchParams.toString()) {
            // Pre-fill from AI import
            // FIX: Changed type to `any` to allow dynamic property assignment from URL search params without TypeScript errors.
            const importedProduct: any = {};
            for (const [key, value] of searchParams.entries()) {
                try {
                    // Try to parse arrays/objects
                    importedProduct[key] = JSON.parse(value);
                } catch {
                     // Otherwise, treat as a string or let react-hook-form handle it
                    importedProduct[key] = value;
                }
            }
            if (Array.isArray(importedProduct.images)) {
                importedProduct.images = importedProduct.images.map(imgUrl => ({ url: String(imgUrl) }));
            } else {
                 importedProduct.images = [{url: ''}];
            }
            reset(importedProduct as FormValues);
        }
    }, [id, isEditing, reset, searchParams]);

    useEffect(() => {
        if (variants && variants.length > 0) {
            const totalStock = variants.reduce((total, variant) => {
                return total + (variant.options?.reduce((sum, option) => sum + Number(option.stock || 0), 0) || 0);
            }, 0);
            setValue('stock', totalStock, { shouldValidate: true });
        }
    }, [variants, setValue]);


    const onSubmit: SubmitHandler<FormValues> = (data) => {
        const productData = {
            ...data,
            price: Number(data.price),
            discountPrice: data.discountPrice ? Number(data.discountPrice) : undefined,
            stock: Number(data.stock),
            supplierInfo: {
                ...data.supplierInfo,
                costPrice: data.supplierInfo ? Number(data.supplierInfo.costPrice) : 0,
            },
            images: data.images.map(img => img.url).filter(url => url && url.trim() !== '')
        };

        if (isEditing && productData.id) {
            youwareService.updateProduct({ ...productData, rating: 0, id: productData.id });
            addNotification(t('adminProductForm.successUpdate'), 'success');
        } else {
            const { id, ...newProductData } = productData;
            youwareService.addProduct(newProductData);
            addNotification(t('adminProductForm.successAdd'), 'success');
        }
        refreshProducts();
        refreshCategories();
        navigate('/admin');
    };

    const inputClasses = "w-full p-2 bg-background border border-white/20 rounded-md focus:outline-none focus:ring-1 focus:ring-primary";
    const labelClasses = "block text-sm font-medium text-textSecondary mb-1";
    
    return (
        <div className="max-w-4xl mx-auto bg-surface p-8 rounded-lg border border-white/10">
            <h1 className="text-3xl font-bold mb-6">{isEditing ? t('adminProductForm.editTitle') : t('adminProductForm.addTitle')}</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <h2 className="text-xl font-semibold border-b border-white/10 pb-2">{t('adminProductForm.basicInfo')}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClasses}>{t('adminProductForm.productName')}</label>
                        <input {...register('name', { required: t('adminProductForm.validation.name') })} className={inputClasses} />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className={labelClasses}>{t('adminProductForm.category')}</label>
                        <input {...register('category', { required: t('adminProductForm.validation.category') })} className={inputClasses} list="categories-list" placeholder={t('adminProductForm.categoryPlaceholder')}/>
                        <datalist id="categories-list">
                            {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} />)}
                        </datalist>
                         {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>{t('adminProductForm.description')}</label>
                    <textarea {...register('description', { required: t('adminProductForm.validation.description') })} rows={4} className={inputClasses}></textarea>
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>
                
                <div>
                    <label className={labelClasses}>{t('adminProductForm.productType')}</label>
                    <div className="flex gap-4 p-3 bg-background rounded-md">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="dropship" {...register('productType')} /> {t('adminProductForm.dropship')}</label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="in-house" {...register('productType')} /> {t('adminProductForm.inHouse')}</label>
                    </div>
                </div>

                {productType === 'dropship' && (
                     <div className="p-4 border border-white/20 rounded-lg space-y-4 bg-background">
                         <h3 className="font-semibold">{t('adminProductForm.supplierInfo')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelClasses}>{t('adminProductForm.supplierName')}</label>
                                <input {...register('supplierInfo.name')} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>{t('adminProductForm.supplierUrl')}</label>
                                <input {...register('supplierInfo.url')} className={inputClasses} />
                            </div>
                             <div>
                                <label className={labelClasses}>{t('adminProductForm.costPrice')}</label>
                                <input type="number" step="any" {...register('supplierInfo.costPrice', { valueAsNumber: true, min: 0 })} className={inputClasses} />
                            </div>
                        </div>
                    </div>
                )}

                <h2 className="text-xl font-semibold border-b border-white/10 pb-2 pt-4">{t('adminProductForm.pricingStock')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelClasses}>{t('adminProductForm.salePrice')}</label>
                        <input type="number" step="any" {...register('price', { required: t('adminProductForm.validation.price'), valueAsNumber: true, min: 0 })} className={inputClasses} />
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                    </div>
                    <div>
                        <label className={labelClasses}>{t('adminProductForm.discountPrice')}</label>
                        <input type="number" step="any" {...register('discountPrice', { valueAsNumber: true, min: 0 })} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>{variants && variants.length > 0 ? t('adminProductForm.totalStock') : t('adminProductForm.stock')}</label>
                        <input type="number" {...register('stock', { required: true, valueAsNumber: true, min: 0 })} disabled={variants && variants.length > 0} className={`${inputClasses} ${variants && variants.length > 0 ? 'bg-gray-700 cursor-not-allowed' : ''}`} />
                    </div>
                </div>

                <h2 className="text-xl font-semibold border-b border-white/10 pb-2 pt-4">{t('adminProductForm.images')}</h2>
                <div className="space-y-2">
                    {imageFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <input {...register(`images.${index}.url` as const, { required: true })} className={inputClasses} placeholder={t('adminProductForm.imageUrlPlaceholder')} />
                            <button type="button" onClick={() => removeImage(index)} className="bg-secondary text-white px-3 py-2 rounded-md">{t('adminProductForm.remove')}</button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={() => appendImage({ url: '' })} className="mt-2 bg-primary/20 text-primary px-4 py-2 rounded-md text-sm">{t('adminProductForm.addImage')}</button>

                
                <h2 className="text-xl font-semibold border-b border-white/10 pb-2 pt-4">{t('adminProductForm.variants')}</h2>
                <p className="text-sm text-textSecondary">{t('adminProductForm.variantHelperText')}</p>
                <div className="space-y-4">
                    {variantFields.map((variant, vIndex) => (
                        <div key={variant.id} className="p-4 border border-white/20 rounded-lg bg-background">
                            <div className="flex justify-between items-center mb-2">
                                <input {...register(`variants.${vIndex}.name` as const, { required: true })} placeholder={t('adminProductForm.variantType')} className={`${inputClasses} w-1/3`} />
                                <button type="button" onClick={() => removeVariant(vIndex)} className="bg-secondary text-white px-3 py-2 rounded-md">{t('adminProductForm.removeVariant')}</button>
                            </div>
                            <VariantOptions control={control} register={register} vIndex={vIndex} />
                        </div>
                    ))}
                </div>
                <button type="button" onClick={() => appendVariant({ name: '', options: [{ name: '', stock: 0, imageIndex: undefined }] })} className="mt-2 bg-primary/20 text-primary px-4 py-2 rounded-md text-sm">{t('adminProductForm.addVariant')}</button>
                
                <div className="pt-4 space-y-4">
                    <div>
                        <label className={labelClasses}>{t('orderConfirmationPage.guidesTitle')} (Optional PDF)</label>
                        <input {...register('guideUrl')} className={inputClasses} placeholder="https://.../guide.pdf"/>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" {...register('isFeatured')} id="isFeatured" className="h-4 w-4" />
                        <label htmlFor="isFeatured">{t('adminProductForm.featured')}</label>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                    <button type="submit" className="bg-primary text-background font-bold py-2 px-8 rounded-full hover:bg-opacity-80 transition">
                        {isEditing ? t('adminProductForm.updateButton') : t('adminProductForm.addButton')}
                    </button>
                </div>
            </form>
        </div>
    );
};

const VariantOptions = ({ control, register, vIndex }: { control: Control<FormValues>, register: UseFormRegister<FormValues>, vIndex: number }) => {
    const { t } = useI18n();
    const { fields, append, remove } = useFieldArray({
        control,
        name: `variants.${vIndex}.options`
    });

    const inputClasses = "w-full p-1 bg-surface border border-white/20 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm";
    
    return (
        <div className="space-y-2 pl-4">
            {fields.map((option, oIndex) => (
                <div key={option.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4"><input {...register(`variants.${vIndex}.options.${oIndex}.name` as const, { required: true })} placeholder={t('adminProductForm.optionName')} className={inputClasses} /></div>
                    <div className="col-span-3"><input type="number" {...register(`variants.${vIndex}.options.${oIndex}.stock` as const, { required: true, valueAsNumber: true, min: 0 })} placeholder={t('adminProductForm.stock')} className={inputClasses} /></div>
                    <div className="col-span-3"><input type="number" {...register(`variants.${vIndex}.options.${oIndex}.imageIndex` as const, { valueAsNumber: true, min: 0 })} placeholder={t('adminProductForm.linkImage')} className={inputClasses} /></div>
                    <div className="col-span-2"><button type="button" onClick={() => remove(oIndex)} className="text-secondary text-sm">{t('adminProductForm.remove')}</button></div>
                </div>
            ))}
            <button type="button" onClick={() => append({ name: '', stock: 0, imageIndex: undefined })} className="text-primary text-sm font-semibold">{t('adminProductForm.addOption')}</button>
        </div>
    );
};
