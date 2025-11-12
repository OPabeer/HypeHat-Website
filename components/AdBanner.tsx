import React from 'react';
import { useSettings } from '../contexts/AppContext';

export const AdBanner: React.FC = () => {
    const { settings } = useSettings();

    // Ensure settings and advertisement data are loaded before rendering
    if (!settings?.advertisement?.isEnabled) {
        return null;
    }

    const { imageUrl, linkUrl, title, description } = settings.advertisement;

    return (
        <div className="mt-8">
            <div className="bg-surface p-4 rounded-lg border border-white/10">
                <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block group">
                    <div className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden mb-3">
                         <img 
                            src={imageUrl} 
                            alt={title} 
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" 
                         />
                    </div>
                    <h4 className="font-semibold text-textPrimary group-hover:text-primary transition-colors">{title}</h4>
                    <p className="text-xs text-textSecondary mt-1">{description}</p>
                </a>
                 <p className="text-right text-[10px] text-textSecondary/50 mt-2">Advertisement</p>
            </div>
        </div>
    );
};