import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/AppContext';
import { Product } from '../types';
import { SearchIcon, XIcon } from './Icons';
import { useI18n } from '../contexts/I18nContext';

interface SearchModalProps {
    onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
    const { products } = useProducts();
    const { t } = useI18n();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim().length > 1) {
            const filteredSuggestions = products
                .filter(product =>
                    product.name.toLowerCase().includes(value.toLowerCase()) ||
                    product.description.toLowerCase().includes(value.toLowerCase()) ||
                    product.category.toLowerCase().includes(value.toLowerCase())
                )
                .slice(0, 5);
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/shop?search=${searchTerm.trim()}`);
            onClose();
        }
    };
    
    const handleSuggestionClick = (productId: string) => {
        navigate(`/product/${productId}`);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 z-50 flex justify-center p-4 pt-16 animate-fadeIn" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="w-full max-w-lg h-fit bg-surface rounded-lg shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSearchSubmit} className="relative border-b border-white/10">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={t('header.searchPlaceholder')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full bg-transparent py-4 px-6 focus:outline-none text-lg"
                        autoComplete="off"
                    />
                     <button type="submit" className="absolute right-16 top-1/2 -translate-y-1/2 text-textSecondary hover:text-primary">
                        <SearchIcon className="w-6 h-6" />
                    </button>
                    <button type="button" onClick={onClose} className="absolute right-5 top-1/2 -translate-y-1/2 text-textSecondary hover:text-primary">
                        <XIcon className="w-6 h-6" />
                    </button>
                </form>
                {suggestions.length > 0 && (
                    <div className="overflow-y-auto max-h-[60vh]">
                        <ul>
                            {suggestions.map(product => (
                                <li key={product.id}>
                                    <button
                                        onClick={() => handleSuggestionClick(product.id)}
                                        className="w-full text-left px-6 py-4 flex items-center hover:bg-white/10 transition-colors duration-200"
                                    >
                                        <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-md mr-4"/>
                                        <div>
                                            <p className="font-semibold text-textPrimary">{product.name}</p>
                                            <p className="text-sm text-textSecondary">{t('categoryNames.' + product.category, product.category)}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};