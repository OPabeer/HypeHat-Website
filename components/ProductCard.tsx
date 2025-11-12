
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart, useWishlist } from '../contexts/AppContext';
import { ShoppingCartIcon, StarIcon, HeartIcon } from './Icons';
import { useI18n } from '../contexts/I18nContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t } = useI18n();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const confirmationTimeoutRef = useRef<number | null>(null);

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (confirmationTimeoutRef.current) {
        clearTimeout(confirmationTimeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultOptions = product.variants?.reduce((acc, v) => {
        if (v.options.length > 0) {
          acc[v.name] = v.options[0].name;
        }
        return acc;
    }, {} as {[key:string]: string}) || {};
    addToCart(product, defaultOptions, 1);

    // Show confirmation message
    if (confirmationTimeoutRef.current) {
        clearTimeout(confirmationTimeoutRef.current);
    }
    setShowConfirmation(true);
    confirmationTimeoutRef.current = window.setTimeout(() => {
        setShowConfirmation(false);
    }, 2500);
  };
  
  const handleToggleWishlist = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist(product.id);
  }

  const rating = product.avgRating ?? product.rating;

  return (
    <div className="product-card relative bg-surface rounded-lg overflow-hidden shadow-lg group border border-transparent hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/25">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          <img src={product.images[0]} alt={product.name} className="w-full h-56 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" />
          {product.discountPrice && (
            <span className="absolute top-3 left-3 bg-secondary text-background text-xs font-bold px-2 py-1 rounded z-10">{t('productCard.sale')}</span>
          )}
           <button onClick={handleToggleWishlist} className="absolute top-3 right-3 bg-surface/80 rounded-full p-2 text-textSecondary hover:text-primary transition-colors z-10">
              <HeartIcon className="w-5 h-5" filled={isInWishlist(product.id)} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-textSecondary">{t('categoryNames.'+product.category, product.category)}</p>
          <h3 className="font-semibold text-lg truncate text-textPrimary">{product.name}</h3>
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-600'}`} filled={i < Math.round(rating)} />
              ))}
            </div>
            <span className="text-xs text-textSecondary ml-2">({product.reviewCount ?? 0} {t('productCard.reviews')})</span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              {product.discountPrice ? (
                <>
                  <p className="text-xl font-bold text-primary">Tk {product.discountPrice}</p>
                  <p className="text-sm text-textSecondary line-through">Tk {product.price}</p>
                </>
              ) : (
                <p className="text-xl font-bold text-primary">Tk {product.price}</p>
              )}
            </div>
            <button onClick={handleAddToCart} className="bg-primary/20 text-primary p-2 rounded-full hover:bg-primary hover:text-background transition-colors">
              <ShoppingCartIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Link>
      {/* Toast Notification */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 bg-accent text-background px-4 py-2 rounded-full text-sm font-semibold shadow-lg transform transition-all duration-300 ease-in-out
          ${showConfirmation ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 pointer-events-none scale-95'}`}
      >
          {t('productCard.addedToCart')}
      </div>
    </div>
  );
};