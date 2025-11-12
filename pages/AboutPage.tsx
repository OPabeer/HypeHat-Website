import React from 'react';
import { useI18n } from '../contexts/I18nContext';

export const AboutPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="bg-background text-textPrimary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 
            className="text-4xl font-extrabold sm:text-5xl md:text-6xl"
            dangerouslySetInnerHTML={{ __html: t('aboutPage.title')}}
          />
          <p className="mt-3 max-w-md mx-auto text-base text-textSecondary sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {t('aboutPage.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <img 
              className="rounded-lg shadow-xl border-2 border-primary/30" 
              src="https://picsum.photos/seed/office/800/600" 
              alt="Our team working" 
            />
          </div>
          <div className="bg-surface p-8 rounded-lg border border-white/10">
            <h2 className="text-3xl font-bold text-primary mb-4">{t('aboutPage.mission')}</h2>
            <p className="text-textSecondary text-lg mb-6">
              {t('aboutPage.missionText')}
            </p>
            <h2 className="text-3xl font-bold text-primary mb-4">{t('aboutPage.story')}</h2>
            <p className="text-textSecondary text-lg">
              {t('aboutPage.storyText')}
            </p>
          </div>
        </div>

        <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-textPrimary mb-10">{t('aboutPage.whyUs')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6 bg-surface rounded-lg border border-white/10 transition-all hover:border-primary/50 hover:shadow-glow-primary">
                    <h3 className="text-xl font-semibold mb-2 text-primary">{t('aboutPage.quality')}</h3>
                    <p className="text-textSecondary">{t('aboutPage.qualityText')}</p>
                </div>
                 <div className="p-6 bg-surface rounded-lg border border-white/10 transition-all hover:border-primary/50 hover:shadow-glow-primary">
                    <h3 className="text-xl font-semibold mb-2 text-primary">{t('aboutPage.shipping')}</h3>
                    <p className="text-textSecondary">{t('aboutPage.shippingText')}</p>
                </div>
                 <div className="p-6 bg-surface rounded-lg border border-white/10 transition-all hover:border-primary/50 hover:shadow-glow-primary">
                    <h3 className="text-xl font-semibold mb-2 text-primary">{t('aboutPage.support')}</h3>
                    <p className="text-textSecondary">{t('aboutPage.supportText')}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};