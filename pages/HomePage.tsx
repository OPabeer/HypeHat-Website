import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../contexts/AppContext';
import { ProductCard } from '../components/ProductCard';
import { useI18n } from '../contexts/I18nContext';

const heroImages = [
    'https://picsum.photos/seed/future/1920/1080',
    'https://picsum.photos/seed/tech/1920/1080',
    'https://picsum.photos/seed/gadget/1920/1080',
    'https://picsum.photos/seed/lifestyle/1920/1080'
];

export const HomePage: React.FC = () => {
  const { products, categories } = useProducts();
  const { t } = useI18n();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, []);

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const latestProducts = products.slice(0, 8);
  const displayCategories = categories.filter(c => c !== 'All').slice(0, 4);

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden h-[calc(100vh-80px)] min-h-[500px]">
        <div className="absolute inset-0">
          {heroImages.map((img, index) => (
            <div
              key={img}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
              style={{
                backgroundImage: `url('${img}')`,
                opacity: index === currentSlide ? 1 : 0,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center justify-center text-center animate-fadeInUp">
          <h1 
            className="text-4xl md:text-6xl font-black leading-tight tracking-wide uppercase"
            dangerouslySetInnerHTML={{ __html: t('homePage.heroTitle') }}
          />
          <p className="mt-4 text-lg md:text-xl text-textSecondary max-w-2xl mx-auto">
            {t('homePage.heroSubtitle')}
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-block bg-primary text-background font-bold py-3 px-8 rounded-full hover:bg-opacity-80 transition duration-300 transform hover:scale-105 shadow-lg shadow-primary/30"
          >
            {t('homePage.explore')}
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-textPrimary mb-2">{t('homePage.featuredTitle')}</h2>
          <p className="text-center text-textSecondary mb-10">{t('homePage.featuredSubtitle')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-surface py-16 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-textPrimary mb-10">{t('homePage.categoriesTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {displayCategories.map(category => (
                    <Link key={category} to={`/shop?category=${category}`} className="block group">
                        <div className="relative rounded-lg overflow-hidden h-64 border-2 border-transparent group-hover:border-primary transition-all duration-300">
                            <img src={`https://picsum.photos/seed/${category}/600/400`} alt={category} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                <h3 className="text-white text-2xl font-bold">{t('categoryNames.'+category, category)}</h3>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-16 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-textPrimary mb-10">{t('homePage.newArrivalsTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {latestProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
           <div className="text-center mt-12">
             <Link to="/shop" className="bg-primary text-background font-bold py-3 px-8 rounded-full hover:bg-opacity-80 transition duration-300 transform hover:scale-105">
                {t('homePage.viewAll')}
            </Link>
           </div>
        </div>
      </section>
    </div>
  );
};