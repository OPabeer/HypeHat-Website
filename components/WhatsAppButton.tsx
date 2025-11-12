import React from 'react';
import { WhatsAppIcon } from './Icons';
import { useSettings } from '../contexts/AppContext';

export const WhatsAppButton: React.FC = () => {
    const { settings } = useSettings();

    return (
        <a 
            href={`https://wa.me/${settings.social.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors z-30"
            aria-label="Chat on WhatsApp"
        >
            <WhatsAppIcon className="w-8 h-8" />
        </a>
    );
};
