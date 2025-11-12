import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../contexts/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { AdBanner } from '../components/AdBanner';
import { useI18n } from '../contexts/I18nContext';

export const ShopPage: React.FC = () => {
  const { products, categories } = useProducts();
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortOption, setSortOption] = useState('featured');
  
  useEffect(() => {
    // Sync state with URL params on initial load or when params change
    setCategory(searchParams.get('category') || 'All');
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered: Product[] = [...products];

    // Filter by category
    if (category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.avgRating || b.rating) - (a.avgRating || a.rating));
        break;
      case 'featured':
      default:
        // A simple featured sort, could be more complex
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return filtered;
  }, [products, category, searchTerm, sortOption]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const newSearchParams = new URLSearchParams(searchParams);
    if (newCategory === 'All') {
        newSearchParams.delete('category');
    } else {
        newSearchParams.set('category', newCategory);
    }
    setSearchParams(newSearchParams);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeInUp">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-textPrimary">{t('shopPage.title')}</h1>
        <p className="mt-2 text-lg text-textSecondary">{t('shopPage.subtitle')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters */}
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <div className="bg-surface p-6 rounded-lg border border-white/10 sticky top-28">
            <h3 className="font-bold text-lg mb-4 text-primary">{t('shopPage.categories')}</h3>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left transition-colors ${
                      category === cat ? 'text-primary font-semibold' : 'text-textSecondary hover:text-primary'
                    }`}
                  >
                    {t('categoryNames.'+cat, cat)}
                  </button>
                </li>
              ))}
            </ul>
            <AdBanner />
          </div>
        </aside>

        {/* Product Grid */}
        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-surface p-4 rounded-lg border border-white/10">
            <input 
                type="text" 
                placeholder={t('shopPage.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full sm:w-1/2 bg-background border border-white/20 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-primary mb-4 sm:mb-0"
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full sm:w-auto bg-background border border-white/20 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="featured">{t('shopPage.sortFeatured')}</option>
              <option value="price-asc">{t('shopPage.sortPriceAsc')}</option>
              <option value="price-desc">{t('shopPage.sortPriceDesc')}</option>
              <option value="rating">{t('shopPage.sortRating')}</option>
            </select>
          </div>

          {filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedProducts.map(product => (
                <div key={product.id} className="animate-fadeInUp" style={{animationDuration: '0.5s'}}>
                    <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface rounded-lg">
                <h3 className="text-xl font-semibold">{t('shopPage.noProductsTitle')}</h3>
                <p className="text-textSecondary mt-2">{t('shopPage.noProductsSubtitle')}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};