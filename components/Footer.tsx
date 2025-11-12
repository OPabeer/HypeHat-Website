import React from 'react';
import { Link } from 'react-router-dom';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from './Icons';
import { useSettings } from '../contexts/AppContext';
import { useI18n } from '../contexts/I18nContext';

export const Footer: React.FC = () => {
    const { settings } = useSettings();
    const { t } = useI18n();

    return (
        <footer className="bg-surface border-t border-white/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div className="md:col-span-1">
                        <Link to="/" className="text-2xl font-black tracking-wider text-textPrimary">Hype<span className="text-primary">Haat</span></Link>
                        <p className="mt-4 text-textSecondary text-sm">{t('footer.about')}</p>
                        <div className="flex space-x-4 mt-4">
                            <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-primary transition-colors"><FacebookIcon /></a>
                            <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-primary transition-colors"><InstagramIcon /></a>
                            <a href={`https://wa.me/${settings.social.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-primary transition-colors"><WhatsAppIcon /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-textPrimary">{t('footer.quickLinks')}</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li><Link to="/about" className="text-textSecondary hover:text-primary transition-colors">{t('footer.aboutUs')}</Link></li>
                            <li><Link to="/contact" className="text-textSecondary hover:text-primary transition-colors">{t('footer.contactUs')}</Link></li>
                            <li><Link to="/shop" className="text-textSecondary hover:text-primary transition-colors">{t('footer.shop')}</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="font-semibold text-textPrimary">{t('footer.support')}</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li><a href="#" className="text-textSecondary hover:text-primary transition-colors">{t('footer.faq')}</a></li>
                            <li><a href="#" className="text-textSecondary hover:text-primary transition-colors">{t('footer.shippingReturns')}</a></li>
                            <li><a href="#" className="text-textSecondary hover:text-primary transition-colors">{t('footer.privacyPolicy')}</a></li>
                        </ul>
                    </div>
                    
                    {/* Newsletter */}
                    <div>
                        <h3 className="font-semibold text-textPrimary">{t('footer.newsletter')}</h3>
                        <p className="mt-4 text-textSecondary text-sm">{t('footer.newsletterSub')}</p>
                        <form className="mt-4 flex">
                            <input type="email" placeholder={t('footer.newsletterPlaceholder')} className="w-full bg-background border border-white/20 rounded-l-md p-2 focus:outline-none focus:ring-1 focus:ring-primary"/>
                            <button className="bg-primary text-background p-2 rounded-r-md hover:bg-opacity-80">{t('footer.subscribe')}</button>
                        </form>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/10 text-center text-textSecondary text-sm">
                    <p>{t('footer.copyright', new Date().getFullYear())}</p>
                    <div className="mt-2">
                        <Link to="/admin/login" className="text-xs text-textSecondary/50 hover:text-primary transition-colors">
                           {t('footer.adminPanel')}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};