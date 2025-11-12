import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/AppContext';
import { XIcon } from './Icons';

export const PopupModal: React.FC = () => {
    const { settings } = useSettings();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if the popup should be shown
        if (settings.advertisement.isPopup) {
            const hasBeenShown = sessionStorage.getItem('popupShown');
            if (!hasBeenShown) {
                // Add a small delay to let the page load
                const timer = setTimeout(() => {
                    setIsOpen(true);
                    sessionStorage.setItem('popupShown', 'true');
                }, 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [settings.advertisement.isPopup]);

    if (!isOpen || !settings.advertisement.isPopup) {
        return null;
    }

    const { imageUrl, linkUrl, title, description } = settings.advertisement;

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={handleClose}
        >
            <div 
                className="bg-surface rounded-lg shadow-xl w-full max-w-md relative border border-primary/50 transform transition-all duration-300 scale-95 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={handleClose}
                    className="absolute -top-3 -right-3 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-80 transition-transform hover:scale-110"
                    aria-label="Close popup"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block group">
                    {imageUrl && (
                        <div className="rounded-t-lg overflow-hidden">
                            <img src={imageUrl} alt={title} className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity" />
                        </div>
                    )}
                    <div className="p-6 text-center">
                        <h3 className="text-2xl font-bold text-primary group-hover:underline">{title}</h3>
                        <p className="text-textSecondary mt-2">{description}</p>
                    </div>
                </a>
            </div>
            <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
