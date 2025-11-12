import React from 'react';
import { useAuth, useNotification } from '../contexts/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { useForm, SubmitHandler } from 'react-hook-form';

type RegisterFormInputs = {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export const RegisterPage: React.FC = () => {
    const { registerUser } = useAuth();
    const { addNotification } = useNotification();
    const { t } = useI18n();
    const navigate = useNavigate();
    const { register, handleSubmit, setError, formState: { errors } } = useForm<RegisterFormInputs>();

    const onSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
        const { user, error } = registerUser(data.name, data.email, data.phone, data.password);
        if (user) {
            addNotification(t('registerPage.success'), 'success');
            navigate('/login');
        } else {
            if (error === 'email') {
                setError('email', { type: 'manual', message: t('registerPage.validation.errorEmailExists') });
            } else if (error === 'phone') {
                setError('phone', { type: 'manual', message: t('registerPage.validation.errorPhoneExists') });
            } else {
                 setError('root', { type: 'manual', message: t('registerPage.error') });
            }
        }
    };
    
    const inputClasses = "w-full px-3 py-2 mt-1 bg-background border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary";
    const errorInputClasses = "w-full px-3 py-2 mt-1 bg-background border border-red-500 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary";
    const errorTextClasses = "mt-1 text-sm text-red-600";

    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-textPrimary">
            <div className="w-full max-w-md p-8 space-y-6 bg-surface rounded-lg shadow-lg border border-white/10">
                <h1 className="text-2xl font-bold text-center">{t('registerPage.title')}</h1>
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="name" className="text-sm font-medium text-textSecondary">{t('registerPage.name')}</label>
                        <input
                            id="name"
                            type="text"
                            {...register("name", { required: t('registerPage.validation.nameRequired') })}
                            className={errors.name ? errorInputClasses : inputClasses}
                        />
                        {errors.name && <p className={errorTextClasses}>{errors.name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-textSecondary">{t('registerPage.email')}</label>
                        <input
                            id="email"
                            type="email"
                            {...register("email", { 
                                required: t('registerPage.validation.emailRequired'),
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: t('registerPage.validation.emailInvalid')
                                } 
                            })}
                            className={errors.email ? errorInputClasses : inputClasses}
                        />
                         {errors.email && <p className={errorTextClasses}>{errors.email.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="phone" className="text-sm font-medium text-textSecondary">{t('registerPage.phone')}</label>
                        <input
                            id="phone"
                            type="tel"
                            {...register("phone", { 
                                required: t('registerPage.validation.phoneRequired'),
                                pattern: {
                                    value: /^(\+?880|0)1[3-9]\d{8}$/,
                                    message: t('registerPage.validation.phoneInvalid')
                                } 
                            })}
                            className={errors.phone ? errorInputClasses : inputClasses}
                        />
                         {errors.phone && <p className={errorTextClasses}>{errors.phone.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-textSecondary">{t('registerPage.password')}</label>
                        <input
                            id="password"
                            type="password"
                            {...register("password", { 
                                required: t('registerPage.validation.passwordRequired'),
                                minLength: {
                                    value: 6,
                                    message: t('registerPage.validation.passwordMinLength')
                                } 
                            })}
                            className={errors.password ? errorInputClasses : inputClasses}
                        />
                         {errors.password && <p className={errorTextClasses}>{errors.password.message}</p>}
                    </div>
                    {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}
                    <div className="pt-2">
                        <button type="submit" className="w-full px-4 py-2 font-medium text-background bg-primary rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                            {t('registerPage.register')}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-textSecondary">
                    {t('registerPage.haveAccount')} <Link to="/login" className="font-medium text-primary hover:underline">{t('registerPage.loginHere')}</Link>
                </p>
            </div>
        </div>
    );
};