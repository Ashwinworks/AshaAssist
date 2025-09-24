import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Heart, Mail, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import './AuthPages.css';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    trigger,
    watch,
  } = useForm<ForgotPasswordFormData>({
    mode: 'onChange',
  });

  const watchEmail = watch('email');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError('');

      // Use Firebase Auth to send password reset email
      await sendPasswordResetEmail(auth, data.email.toLowerCase().trim());

      setIsSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);

      // Handle specific Firebase Auth errors
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError('Failed to send reset email. Please check Firebase Console email configuration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          {/* Left Side - Branding */}
          <div className="auth-branding">
            <div className="auth-branding-content">
              <div className="auth-logo">
                <Heart className="logo-icon" />
                <span className="logo-text">AshaAssist</span>
              </div>
              <h1 className="auth-branding-title">
                Check Your Email
              </h1>
              <p className="auth-branding-description">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
              </p>
            </div>
          </div>

          {/* Right Side - Success Message */}
          <div className="auth-form-container">
            <div className="auth-form-content">
              <div className="auth-header">
                <h2 className="auth-title">Email Sent</h2>
                <p className="auth-subtitle">
                  Password reset instructions have been sent to your email
                </p>
              </div>

              <div className="success-message" style={{
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: 'var(--green-50)',
                border: '1px solid var(--green-200)',
                borderRadius: '0.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  backgroundColor: 'var(--green-100)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: 'var(--green-600)'
                }}>
                  <Mail size={24} />
                </div>
                <h3 style={{
                  margin: '0 0 0.5rem',
                  color: 'var(--green-800)',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  Check Your Email
                </h3>
                <p style={{
                  margin: '0',
                  color: 'var(--green-700)',
                  fontSize: '0.875rem'
                }}>
                  We've sent password reset instructions to your email address.
                  The link will expire in 1 hour.
                </p>
              </div>

              <div className="auth-footer">
                <p className="auth-footer-text">
                  Didn't receive the email?{' '}
                  <button
                    onClick={() => setIsSuccess(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--blue-600)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: 'inherit'
                    }}
                  >
                    Try again
                  </button>
                </p>
                <p className="auth-footer-text" style={{ marginTop: '0.5rem' }}>
                  <Link to="/login" className="auth-footer-link">
                    <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
                    Back to Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="auth-branding-content">
            <div className="auth-logo">
              <Heart className="logo-icon" />
              <span className="logo-text">AshaAssist</span>
            </div>
            <h1 className="auth-branding-title">
              Reset Your Password
            </h1>
            <p className="auth-branding-description">
              Enter your email address and we'll send you a link to reset your password.
              This feature is only available for accounts created with email/password or Google sign-in.
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Secure password reset process</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>One-time use reset links</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Links expire in 1 hour</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Forgot Password Form */}
        <div className="auth-form-container">
          <div className="auth-form-content">
            <div className="auth-header">
              <h2 className="auth-title">Forgot Password</h2>
              <p className="auth-subtitle">
                Enter your email address to receive a password reset link
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address <span className="required-asterisk">*</span>
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

              {/* Error Message */}
              {error && (
                <div className="error-message" style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--red-50)',
                  border: '1px solid var(--red-200)',
                  borderRadius: '0.375rem',
                  color: 'var(--red-700)',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg auth-submit-btn"
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="auth-footer">
              <p className="auth-footer-text">
                Remember your password?{' '}
                <Link to="/login" className="auth-footer-link">
                  <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
                  Back to Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;