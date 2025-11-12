import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { youwareService } from '../services/youwareService';
import { useAuth } from '../contexts/AppContext';
import { useI18n } from '../contexts/I18nContext';

type EmailFormInputs = {
  email: string;
};

type ResetFormInputs = {
  code: string;
  newPassword: string;
  confirmPassword: string;
};

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'enterEmail' | 'resetPassword'>('enterEmail');
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);
  const { resetPassword } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const emailForm = useForm<EmailFormInputs>();
  const resetForm = useForm<ResetFormInputs>();
  const newPassword = resetForm.watch("newPassword");

  useEffect(() => {
    if (step !== 'resetPassword' || timeLeft <= 0 || isExpired) {
      return;
    }
    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    if (timeLeft === 1) { // Will be 0 on next render
        clearInterval(intervalId);
        setIsExpired(true);
        setError(t('forgotPasswordPage.error.codeExpired'));
    }

    return () => clearInterval(intervalId);
  }, [step, timeLeft, isExpired, t]);

  const handleRequestCode: SubmitHandler<EmailFormInputs> = async (data) => {
    setIsRequestingCode(true);
    setError('');
    setMessage('');

    const response = await youwareService.requestPasswordReset(data.email);

    if (response.success) {
      setUserEmail(data.email);
      setStep('resetPassword');
      setMessage(response.message);
      setTimeLeft(300); // Reset timer
      setIsExpired(false);
      resetForm.reset();
    } else {
        setError(response.message || t('forgotPasswordPage.error.unexpected'));
    }
    setIsRequestingCode(false);
  };
  
  const onResetSubmit: SubmitHandler<ResetFormInputs> = (data) => {
      setError('');
      setMessage('');
      
      if (isExpired) {
          setError(t('forgotPasswordPage.error.codeExpired'));
          return;
      }
      
      // For this demo, we'll assume the code is '123456' as we can't see the email.
      if (data.code !== '123456') {
          setError(t('forgotPasswordPage.error.codeIncorrect'));
          return;
      }
      
      const success = resetPassword(userEmail, data.newPassword);
      
      if(success) {
          setMessage(t('forgotPasswordPage.successMessage'));
          setTimeout(() => navigate('/login'), 4000);
      } else {
          setError(t('forgotPasswordPage.error.unexpected'));
      }
  };
  
  const handleRequestNewCode = () => {
      setStep('enterEmail');
      setError('');
      setMessage('');
      emailForm.setValue('email', userEmail);
  };

  const isResetting = message.includes('successfully') || message.includes('সফলভাবে');
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-textPrimary">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface rounded-lg shadow-lg border border-white/10">
        <h1 className="text-2xl font-bold text-center">{t('forgotPasswordPage.title')}</h1>
        
        {step === 'enterEmail' && (
             <>
                <p className="text-center text-textSecondary text-sm">
                    {t('forgotPasswordPage.emailStepSubtitle')}
                </p>
                <form className="space-y-6" onSubmit={emailForm.handleSubmit(handleRequestCode)}>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-textSecondary">{t('forgotPasswordPage.emailLabel')}</label>
                        <input
                            id="email"
                            type="email"
                            {...emailForm.register('email', { 
                                required: t('contactPage.errorEmail'),
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: t('contactPage.errorEmailInvalid')
                                } 
                            })}
                            className="w-full px-3 py-2 mt-1 bg-background border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                        {emailForm.formState.errors.email && <p className="text-sm text-red-600 mt-1">{emailForm.formState.errors.email.message}</p>}
                    </div>
                     {error && <p className="text-sm text-red-600">{error}</p>}
                    <div>
                        <button type="submit" disabled={isRequestingCode} className="w-full px-4 py-2 font-medium text-background bg-primary rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:bg-gray-500 disabled:cursor-wait">
                            {isRequestingCode ? t('forgotPasswordPage.sending') : t('forgotPasswordPage.sendCode')}
                        </button>
                    </div>
                </form>
             </>
        )}
        
        {step === 'resetPassword' && (
            <>
                {message && <p className={`p-3 rounded-md text-sm ${isResetting ? 'text-green-400 bg-green-500/10' : 'text-textSecondary bg-background'}`}>{message}</p>}
                
                {isResetting ? (
                    <div className="text-center">
                        <Link to="/login" className="font-medium text-primary hover:underline">
                            {t('forgotPasswordPage.goToLogin')}
                        </Link>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={resetForm.handleSubmit(onResetSubmit)}>
                        <p className="text-sm text-center text-textSecondary">
                            {t('forgotPasswordPage.resetStepSubtitle')}
                        </p>

                        {!isExpired && (
                           <div className="text-center font-mono text-lg text-primary p-2 bg-background rounded-md">
                                {t('forgotPasswordPage.codeExpires', String(minutes).padStart(2, '0'), String(seconds).padStart(2, '0'))}
                           </div>
                        )}
                        
                        <div>
                            <label className="text-sm font-medium text-textSecondary">{t('forgotPasswordPage.codeLabel')}</label>
                            <input
                                type="text"
                                {...resetForm.register('code', { required: t('profilePage.validation.currentPassword') })}
                                disabled={isExpired}
                                className="w-full px-3 py-2 mt-1 bg-background border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                            {resetForm.formState.errors.code && <p className="text-sm text-red-600 mt-1">{resetForm.formState.errors.code.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-textSecondary">{t('forgotPasswordPage.newPasswordLabel')}</label>
                            <input
                                type="password"
                                {...resetForm.register('newPassword', { 
                                    required: t('profilePage.validation.newPassword'), 
                                    minLength: { value: 6, message: t('profilePage.validation.passwordMinLength') } 
                                })}
                                disabled={isExpired}
                                className="w-full px-3 py-2 mt-1 bg-background border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                            {resetForm.formState.errors.newPassword && <p className="text-sm text-red-600 mt-1">{resetForm.formState.errors.newPassword.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-textSecondary">{t('forgotPasswordPage.confirmPasswordLabel')}</label>
                            <input
                                type="password"
                                {...resetForm.register('confirmPassword', { 
                                    required: t('profilePage.validation.confirmPassword'),
                                    validate: value => value === newPassword || t('profilePage.validation.passwordsNoMatch') 
                                })}
                                disabled={isExpired}
                                className="w-full px-3 py-2 mt-1 bg-background border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                            {resetForm.formState.errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{resetForm.formState.errors.confirmPassword.message}</p>}
                        </div>
                        
                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div>
                             {isExpired ? (
                                <button type="button" onClick={handleRequestNewCode} className="w-full px-4 py-2 font-medium text-background bg-secondary rounded-md hover:bg-opacity-80 transition-colors">
                                    {t('forgotPasswordPage.requestNewCode')}
                                </button>
                            ) : (
                                <button type="submit" className="w-full px-4 py-2 font-medium text-background bg-primary rounded-md hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                                    {t('forgotPasswordPage.resetPassword')}
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </>
        )}
        
        <p className="text-sm text-center text-textSecondary">
          {t('forgotPasswordPage.backToLogin')} <Link to="/login" className="font-medium text-primary hover:underline">{t('forgotPasswordPage.loginHere')}</Link>
        </p>
      </div>
    </div>
  );
};