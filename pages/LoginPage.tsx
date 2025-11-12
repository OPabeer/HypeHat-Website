import React from 'react';
import { useAuth } from '../contexts/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { useForm, SubmitHandler } from 'react-hook-form';

type LoginFormInputs = {
    identifier: string;
    password: string;
}

export const LoginPage: React.FC = () => {
    const { loginUser } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    const { register, handleSubmit, setError, formState: { errors } } = useForm<LoginFormInputs>();

    const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
        const user = loginUser(data.identifier, data.password);
        if (user) {
            navigate('/profile');
        } else {
            setError("identifier", { type: "manual", message: t('loginPage.error') });
            setError("password", { type: "manual" });
        }
    };
    
    const inputClasses = "w-full px-3 py-2 mt-1 bg-background border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary";
    const errorInputClasses = "w-full px-3 py-2 mt-1 bg-background border border-red-500 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary";

    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-textPrimary">
            <div className="w-full max-w-md p-8 space-y-6 bg-surface rounded-lg shadow-lg border border-white/10">
                <h1 className="text-2xl font-bold text-center">{t('loginPage.title')}</h1>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="identifier" className="text-sm font-medium text-textSecondary">{t('loginPage.emailOrPhone')}</label>
                        <input
                            id="identifier"
                            type="text"
                            {...register("identifier", { required: t('loginPage.validation.identifierRequired')})}
                            className={errors.identifier ? errorInputClasses : inputClasses}
                        />
                         {errors.identifier && <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-textSecondary">{t('loginPage.password')}</label>
                        <input
                            id="password"
                            type="password"
                            {...register("password", { required: t('loginPage.validation.passwordRequired')})}
                            className={errors.password ? errorInputClasses : inputClasses}
                        />
                         {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                    </div>
                    <div className="flex items-center justify-end">
                        <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                            {t('loginPage.forgotPassword')}
                        </Link>
                    </div>
                    <div>
                        <button type="submit" className="w-full px-4 py-2 font-medium text-background bg-primary rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                            {t('loginPage.login')}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-textSecondary">
                    {t('loginPage.noAccount')} <Link to="/register" className="font-medium text-primary hover:underline">{t('loginPage.registerHere')}</Link>
                </p>
            </div>
        </div>
    );
};