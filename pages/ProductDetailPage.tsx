

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Product, Review, SelectedVariant } from '../types';
import { youwareService } from '../services/youwareService';
import { useCart, useAuth, useProducts } from '../contexts/AppContext';
import { StarIcon } from '../components/Icons';
import { ProductCard } from '../components/ProductCard';
import { useI18n } from '../contexts/I18nContext';

export const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { products, refreshProducts } = useProducts();
    const { t } = useI18n();

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<SelectedVariant>({});
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState('');
    
    // Review form state
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [reviewError, setReviewError] = useState('');

    const loadProductData = useCallback(() => {
        if (id) {
            const foundProduct = youwareService.getProductById(id);
            if (foundProduct) {
                setProduct(foundProduct);
                setReviews(youwareService.getReviewsByProductId(id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                setMainImage(foundProduct.images[0]);
                const defaultOptions: SelectedVariant = {};
                foundProduct.variants?.forEach(variant => {
                    if (variant.options.length > 0) {
                        defaultOptions[variant.name] = variant.options[0].name;
                    }
                });
                setSelectedOptions(defaultOptions);
            } else {
                navigate('/shop');
            }
        }
    }, [id, navigate]);

    useEffect(() => {
        loadProductData();
    }, [id, products, loadProductData]);

    const handleOptionChange = (variantName: string, optionName: string) => {
        const newOptions = { ...selectedOptions, [variantName]: optionName };
        setSelectedOptions(newOptions);

        const variant = product?.variants?.find(v => v.name === variantName);
        const option = variant?.options.find(o => o.name === optionName);
        if (option?.imageIndex !== undefined && product?.images[option.imageIndex]) {
            setMainImage(product.images[option.imageIndex]);
        }
    };
    
    const handleAddToCart = () => {
        if(product) {
            addToCart(product, selectedOptions, quantity);
            alert(t('productDetailPage.cartAlert', quantity, product.name));
        }
    };

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!user) {
            setReviewError(t('productDetailPage.reviewErrorLogin'));
            return;
        }
        if(!newComment.trim()){
            setReviewError(t('productDetailPage.reviewErrorComment'));
            return;
        }
        if(product) {
            youwareService.addReview({
                productId: product.id,
                productName: product.name,
                userId: user.id,
                userName: user.name,
                rating: newRating,
                comment: newComment,
            });
            setNewComment('');
            setNewRating(5);
            setReviewError('');
            refreshProducts(); // This will trigger the useEffect to reload product data including new avg rating
        }
    }

    const currentStock = useMemo(() => {
        if (!product) return 0;
        if (!product.variants || product.variants.length === 0) {
            return product.stock;
        }
        // Find stock for the selected combination of variants
        let stock = Infinity;
        for(const variant of product.variants) {
            const selectedOptionName = selectedOptions[variant.name];
            const option = variant.options.find(o => o.name === selectedOptionName);
            if(option) {
                stock = Math.min(stock, option.stock);
            } else {
                return 0; // A variant selection is invalid
            }
        }
        return stock === Infinity ? 0 : stock;
    }, [product, selectedOptions]);

    const relatedProducts = useMemo(() => {
        if(!product) return [];
        return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    }, [product, products]);

    const loginReviewText = () => {
        const textParts = t('productDetailPage.loginToReview').split(/<1>|<\/1>/);
        return (
            <p className="text-textSecondary">
                {textParts[0]}
                <Link to="/login" className="text-primary hover:underline">{textParts[1]}</Link>
                {textParts[2]}
            </p>
        );
    };

    if (!product) {
        return <div className="text-center py-20">Loading product...</div>;
    }

    return (
        <div className="bg-background text-textPrimary">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div>
                        <div className="aspect-w-1 aspect-h-1 bg-surface rounded-lg overflow-hidden border border-white/10 mb-4">
                            <img src={mainImage} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {product.images.map((img, index) => (
                                <button key={index} onClick={() => setMainImage(img)} className={`aspect-w-1 aspect-h-1 bg-surface rounded-md overflow-hidden border-2 ${mainImage === img ? 'border-primary' : 'border-transparent'}`}>
                                    <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="bg-surface p-8 rounded-lg border border-white/10">
                        <p className="text-sm text-textSecondary tracking-widest uppercase">{t('categoryNames.'+product.category, product.category)}</p>
                        <h1 className="text-3xl font-bold my-2">{product.name}</h1>
                        <div className="flex items-center my-4">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(product.avgRating || product.rating) ? 'text-yellow-400' : 'text-gray-600'}`} filled={i < Math.round(product.avgRating || product.rating)} />
                            ))}
                            <span className="text-sm text-textSecondary ml-2">{t('productDetailPage.reviews', product.reviewCount || 0)}</span>
                        </div>
                        <p className="text-textSecondary leading-relaxed">{product.description}</p>
                        
                        <div className="my-6">
                            {product.discountPrice ? (
                                <div className="flex items-baseline gap-4">
                                    <p className="text-4xl font-extrabold text-primary">Tk {product.discountPrice}</p>
                                    <p className="text-xl text-textSecondary line-through">Tk {product.price}</p>
                                </div>
                            ) : (
                                <p className="text-4xl font-extrabold text-primary">Tk {product.price}</p>
                            )}
                        </div>

                        {/* Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="space-y-4 my-6">
                                {product.variants.map(variant => (
                                    <div key={variant.name}>
                                        <h3 className="text-sm font-semibold text-textSecondary mb-2">{variant.name}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {variant.options.map(option => (
                                                <button key={option.name} onClick={() => handleOptionChange(variant.name, option.name)} className={`px-4 py-2 text-sm rounded-full border-2 transition-colors ${selectedOptions[variant.name] === option.name ? 'bg-primary border-primary text-background' : 'bg-background border-white/20 hover:border-primary'}`}>
                                                    {option.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Add to Cart */}
                        <div className="flex items-center gap-4 my-8">
                           <div className="flex items-center border border-white/20 rounded-full">
                               <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 text-xl">-</button>
                               <span className="px-4 py-2 font-semibold">{quantity}</span>
                               <button onClick={() => setQuantity(q => Math.min(currentStock, q + 1))} className="px-4 py-2 text-xl">+</button>
                           </div>
                           <button onClick={handleAddToCart} disabled={currentStock === 0} className="flex-grow bg-primary text-background font-bold py-3 rounded-full hover:bg-opacity-80 transition disabled:bg-gray-600 disabled:cursor-not-allowed">
                                {currentStock > 0 ? t('productDetailPage.addToCart') : t('productDetailPage.outOfStock')}
                           </button>
                        </div>
                         <p className="text-sm text-textSecondary">{currentStock > 0 ? t('productDetailPage.availability', currentStock) : t('productDetailPage.availabilityNone')}</p>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-center mb-10">{t('productDetailPage.customerReviews')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-surface p-8 rounded-lg border border-white/10">
                           <h3 className="text-xl font-semibold mb-4 text-primary">{t('productDetailPage.writeReview')}</h3>
                           {user ? (
                               <form onSubmit={handleReviewSubmit} className="space-y-4">
                                   <div>
                                       <label className="text-textSecondary">{t('productDetailPage.rating')}</label>
                                       <div className="flex items-center">
                                           {[...Array(5)].map((_, i) => (
                                                <button type="button" key={i} onClick={() => setNewRating(i + 1)}>
                                                   <StarIcon className={`w-6 h-6 cursor-pointer ${i < newRating ? 'text-yellow-400' : 'text-gray-600'}`} filled={i < newRating} />
                                                </button>
                                           ))}
                                       </div>
                                   </div>
                                    <div>
                                       <label htmlFor="comment" className="text-textSecondary">{t('productDetailPage.comment')}</label>
                                       <textarea id="comment" value={newComment} onChange={e => setNewComment(e.target.value)} rows={4} className="w-full mt-1 p-2 bg-background border border-white/20 rounded"/>
                                   </div>
                                   {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
                                   <button type="submit" className="bg-primary text-background font-bold py-2 px-6 rounded-full hover:bg-opacity-80">{t('productDetailPage.submitReview')}</button>
                               </form>
                           ) : (
                               loginReviewText()
                           )}
                       </div>
                       <div className="space-y-6 max-h-96 overflow-y-auto pr-4">
                           {reviews.length > 0 ? reviews.map(review => (
                               <div key={review.id} className="border-b border-white/10 pb-4">
                                   <div className="flex items-center mb-1">
                                       { [...Array(5)].map((_, i) => <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`} filled={i < review.rating} />) }
                                       <p className="ml-4 font-semibold text-textPrimary">{review.userName}</p>
                                   </div>
                                   <p className="text-textSecondary italic">"{review.comment}"</p>
                                   <p className="text-xs text-gray-500 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                               </div>
                           )) : (
                               <p className="text-textSecondary">{t('productDetailPage.noReviews')}</p>
                           )}
                       </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-center mb-10">{t('productDetailPage.relatedProducts')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map(p => <ProductCard key={p.id} product={p}/>)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};