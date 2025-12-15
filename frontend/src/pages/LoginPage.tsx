import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Heart, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import './AuthPages.css';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    trigger,
    watch,
  } = useForm<LoginFormData>({
    mode: 'onChange', // Enable real-time validation
  });

  const watchEmail = watch('email');
  const watchPassword = watch('password');

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      navigate('/dashboard'); // Will redirect to appropriate dashboard based on user type
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="auth-branding-content">
            <Link to="/" className="auth-logo">
              <Heart className="logo-icon" />
              <span className="logo-text">AshaAssist</span>
            </Link>
            <h1 className="auth-branding-title">
              {t('auth.welcomeBack')}
            </h1>
            <p className="auth-branding-description">
              {t('auth.welcomeBackDesc')}
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>{t('auth.secureRecords')}</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>{t('auth.directComm')}</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>{t('auth.personalizedNotif')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-form-container">
          <div className="auth-form-content">
            <div className="auth-header">
              <h2 className="auth-title">{t('auth.loginTitle')}</h2>
              <p className="auth-subtitle">
                {t('auth.loginSubtitle')}
              </p>

            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  {t('auth.email')} <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    className={`input ${errors.email ? 'input-error' : touchedFields.email && watchEmail && watchEmail.trim() && !errors.email ? 'input-success' : ''}`}
                    placeholder="Enter your email address"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address',
                      },
                      onChange: () => trigger('email'),
                    })}
                  />
                  {touchedFields.email && watchEmail && watchEmail.trim() && !errors.email && (
                    <div className="input-success-icon">✓</div>
                  )}
                </div>
                {errors.email && (
                  <span className="form-error">{errors.email.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  {t('auth.password')} <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`input ${errors.password ? 'input-error' : touchedFields.password && watchPassword && watchPassword.trim() && !errors.password ? 'input-success' : ''}`}
                    placeholder="Enter your password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                      onChange: () => trigger('password'),
                    })}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {touchedFields.password && watchPassword && watchPassword.trim() && !errors.password && (
                    <div className="input-success-icon">✓</div>
                  )}
                </div>
                {errors.password && (
                  <span className="form-error">{errors.password.message}</span>
                )}
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox" />
                  <span className="checkbox-text">{t('auth.rememberMe')}</span>
                </label>
                <Link to="/forgot-password" className="forgot-password-link">
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg auth-submit-btn"
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    {t('auth.signingIn')}
                  </>
                ) : (
                  t('auth.signIn')
                )}
              </button>

              <div className="auth-divider">
                <span>{t('auth.or')}</span>
              </div>

              <GoogleSignInButton className="btn-lg auth-google-btn">
                {t('auth.continueWithGoogle')}
              </GoogleSignInButton>
            </form>

            <div className="auth-footer">
              <p className="auth-footer-text">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="auth-footer-link">
                  {t('auth.signUpHere')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;