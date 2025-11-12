import React from 'react';
import { useWishlist, useProducts } from '../contexts/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

export const WishlistPage: React.FC = () => {
  const { wishlist } = useWishlist();
  const { products } = useProducts();
  const { t } = useI18n();

  const wishlistedProducts = products.filter(product => wishlist.includes(product.id));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-textPrimary">{t('wishlistPage.title')}</h1>
        <p className="mt-2 text-lg text-textSecondary">{t('wishlistPage.subtitle')}</p>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlistedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-lg shadow border border-white/10">
          <h3 className="text-xl font-semibold text-textPrimary">{t('wishlistPage.emptyTitle')}</h3>
          <p className="text-textSecondary mt-2">{t('wishlistPage.emptySubtitle')}</p>
          <Link to="/shop" className="mt-6 inline-block bg-primary text-background font-bold py-3 px-6 rounded-full hover:bg-opacity-80 transition duration-300">
            {t('wishlistPage.goShopping')}
          </Link>
        </div>
      )}
    </div>
  );
};