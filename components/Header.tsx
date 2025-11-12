import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart, useAuth, useTheme, useProducts, useInbox } from '../contexts/AppContext';
import { Product } from '../types';
import { THEMES } from '../constants';
import { SearchIcon, ShoppingCartIcon, UserIcon, HeartIcon, SunIcon, MoonIcon, SparklesIcon, BellIcon } from './Icons';
import { useI18n } from '../contexts/I18nContext';

export const Header: React.FC = () => {
    const { cartCount } = useCart();
    const { user, isAdmin, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { products } = useProducts();
    const { unreadCount } = useInbox();
    const { t, language, setLanguage } = useI18n();

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (searchTerm.trim()) {
            navigate(`/shop?search=${searchTerm.trim()}`);
            setSearchTerm('');
        }
    };
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim().length > 1) {
            const filteredSuggestions = products
                .filter(product =>
                    product.name.toLowerCase().includes(value.toLowerCase()) ||
                    product.description.toLowerCase().includes(value.toLowerCase())
                )
                .slice(0, 5); // Limit to 5 suggestions
            setSuggestions(filteredSuggestions);
            setShowSuggestions(filteredSuggestions.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (productId: string) => {
        navigate(`/product/${productId}`);
        setSearchTerm('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const handleThemeChange = () => {
        const currentIndex = THEMES.findIndex(t => t.name === theme);
        const nextIndex = (currentIndex + 1) % THEMES.length;
        setTheme(THEMES[nextIndex].name);
    };
    
    const handleLanguageChange = () => {
        setLanguage(language === 'en' ? 'bn' : 'en');
    };

    const ThemeIcon = () => {
        if (theme === 'light') return <SunIcon className="w-6 h-6" />;
        if (theme === 'crimson-haze') return <MoonIcon className="w-6 h-6" />;
        return <SparklesIcon className="w-6 h-6" />;
    };

    const navLinkClasses = "relative text-textSecondary hover:text-primary transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300";
    const activeNavLinkClasses = "text-primary after:w-full";

    return (
        <header className={`sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-white/10 transition-all duration-300 ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 transition-all duration-300">
                <div className="flex items-center justify-between h-full">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-3xl font-black tracking-wider text-textPrimary">Hype<span className="text-primary">Haat</span></Link>
                    </div>

                    <nav className="hidden md:flex md:space-x-8 font-semibold">
                        <NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{t('header.navHome')}</NavLink>
                        <NavLink to="/shop" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{t('header.navShop')}</NavLink>
                        <NavLink to="/about" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{t('header.navAbout')}</NavLink>
                        <NavLink to="/contact" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{t('header.navContact')}</NavLink>
                        {isAdmin && (
                             <NavLink to="/admin" className={({ isActive }) => `text-secondary hover:text-primary ${isActive ? 'border-b-2 border-primary' : ''}`}>{t('header.navAdmin')}</NavLink>
                        )}
                    </nav>

                    <div className="flex items-center space-x-4">
                        <div ref={searchContainerRef} className="hidden sm:block relative">
                            <form onSubmit={handleSearchSubmit}>
                                <input
                                    type="text"
                                    placeholder={t('header.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                    className="bg-surface border border-white/20 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 text-textPrimary w-32 md:w-48"
                                    autoComplete="off"
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-primary">
                                    <SearchIcon className="w-5 h-5" />
                                </button>
                            </form>
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full mt-2 w-full bg-surface rounded-md shadow-lg border border-white/10 z-50 overflow-hidden">
                                    <ul>
                                        {suggestions.map(product => (
                                            <li key={product.id}>
                                                <button
                                                    onClick={() => handleSuggestionClick(product.id)}
                                                    className="w-full text-left px-4 py-3 flex items-center hover:bg-white/10 transition-colors duration-200"
                                                >
                                                    <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded-md mr-4"/>
                                                    <div>
                                                        <p className="font-semibold text-textPrimary truncate">{product.name}</p>
                                                        <p className="text-sm text-textSecondary">{t('categoryNames.' + product.category, product.category)}</p>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={handleLanguageChange}
                            className="relative text-textSecondary hover:text-primary transition-colors font-semibold w-8 text-center"
                            title="Change Language"
                        >
                           {language === 'en' ? 'বাংলা' : 'EN'}
                        </button>

                        <button
                            onClick={handleThemeChange}
                            className="relative text-textSecondary hover:text-primary transition-colors"
                            title={t('header.changeTheme')}
                        >
                           <ThemeIcon />
                        </button>

                        <Link to="/wishlist" className="relative text-textSecondary hover:text-primary transition-colors">
                            <HeartIcon className="w-6 h-6" />
                        </Link>
                        
                        {user && (
                            <Link to="/notifications" className="relative text-textSecondary hover:text-primary transition-colors">
                                <BellIcon className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-secondary text-background text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">{unreadCount}</span>
                                )}
                            </Link>
                        )}

                        <Link to="/checkout" className="relative text-textSecondary hover:text-primary transition-colors">
                            <ShoppingCartIcon className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-background text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{cartCount}</span>
                            )}
                        </Link>
                        
                        {user ? (
                            <div className="relative group">
                                <Link to="/profile">
                                    <UserIcon className="w-6 h-6 text-textSecondary hover:text-primary" />
                                </Link>
                                <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg border border-white/10 py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                    <div className="px-4 py-2 text-sm text-textPrimary font-semibold">{user.name}</div>
                                    <Link to="/profile" className="block px-4 py-2 text-sm text-textSecondary hover:bg-white/10 hover:text-primary">{t('header.profile')}</Link>
                                    <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-textSecondary hover:bg-white/10 hover:text-primary">{t('header.logout')}</button>
                                </div>
                            </div>
                        ) : (
                             <Link to="/login">
                                <UserIcon className="w-6 h-6 text-textSecondary hover:text-primary" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};