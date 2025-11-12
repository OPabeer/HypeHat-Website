import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useI18n } from '../contexts/I18nContext';

type FormInputs = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export const ContactPage: React.FC = () => {
    const { t } = useI18n();
    const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>();

    const onSubmit: SubmitHandler<FormInputs> = data => {
        console.log(data);
        alert(t('contactPage.successAlert'));
        // Here you would typically send the data to a server
    };

  return (
    <div className="bg-background text-textPrimary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold">{t('contactPage.title')}</h1>
          <p className="mt-3 text-lg text-textSecondary">
            {t('contactPage.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-surface p-8 rounded-lg border border-white/10">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-textSecondary">{t('contactPage.nameLabel')}</label>
                        <input
                            type="text"
                            id="name"
                            {...register("name", { required: t('contactPage.errorName') })}
                            className={`mt-1 block w-full px-3 py-2 bg-background border ${errors.name ? 'border-red-500' : 'border-white/20'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-textSecondary">{t('contactPage.emailLabel')}</label>
                        <input
                            type="email"
                            id="email"
                            {...register("email", { 
                                required: t('contactPage.errorEmail'),
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: t('contactPage.errorEmailInvalid')
                                } 
                            })}
                            className={`mt-1 block w-full px-3 py-2 bg-background border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                    </div>
                </div>
                <div className="mt-6">
                     <label htmlFor="subject" className="block text-sm font-medium text-textSecondary">{t('contactPage.subjectLabel')}</label>
                     <input
                        type="text"
                        id="subject"
                        {...register("subject", { required: t('contactPage.errorSubject') })}
                        className={`mt-1 block w-full px-3 py-2 bg-background border ${errors.subject ? 'border-red-500' : 'border-white/20'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                    />
                    {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
                </div>
                 <div className="mt-6">
                     <label htmlFor="message" className="block text-sm font-medium text-textSecondary">{t('contactPage.messageLabel')}</label>
                     <textarea
                        id="message"
                        rows={4}
                        {...register("message", { required: t('contactPage.errorMessage') })}
                        className={`mt-1 block w-full px-3 py-2 bg-background border ${errors.message ? 'border-red-500' : 'border-white/20'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                    />
                    {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
                </div>
                <div className="mt-6 text-right">
                    <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-background bg-primary hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                        {t('contactPage.sendMessage')}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};