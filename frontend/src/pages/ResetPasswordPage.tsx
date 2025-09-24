import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Heart, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import './AuthPages.css';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const oobCode = searchParams.get('oobCode');

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    trigger,
    watch,
  } = useForm<ResetPasswordFormData>({
    mode: 'onChange',
  });

  const watchPassword = watch('password');
  const watchConfirmPassword = watch('confirmPassword');

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [oobCode]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!oobCode) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oobCode: oobCode,
          newPassword: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePasswordMatch = (confirmPassword: string) => {
    const password = watch('password');
    return password === confirmPassword || 'Passwords do not match';
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
                Password Reset Successful
              </h1>
              <p className="auth-branding-description">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>
          </div>

          {/* Right Side - Success Message */}
          <div className="auth-form-container">
            <div className="auth-form-content">
              <div className="auth-header">
                <h2 className="auth-title">Success!</h2>
                <p className="auth-subtitle">
                  Your password has been reset successfully
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
                  <CheckCircle size={32} />
                </div>
                <h3 style={{
                  margin: '0 0 0.5rem',
                  color: 'var(--green-800)',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  Password Reset Complete
                </h3>
                <p style={{
                  margin: '0',
                  color: 'var(--green-700)',
                  fontSize: '0.875rem'
                }}>
                  Redirecting to sign in page in a few seconds...
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
              Enter your new password below. Make sure it's strong and secure.
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Use at least 8 characters</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Include uppercase and lowercase letters</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Add numbers and special characters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Reset Password Form */}
        <div className="auth-form-container">
          <div className="auth-form-content">
            <div className="auth-header">
              <h2 className="auth-title">New Password</h2>
              <p className="auth-subtitle">
                Enter your new password to complete the reset process
              </p>
            </div>

            {!oobCode ? (
              <div className="error-message" style={{
                padding: '1rem',
                backgroundColor: 'var(--red-50)',
                border: '1px solid var(--red-200)',
                borderRadius: '0.375rem',
                color: 'var(--red-700)',
                textAlign: 'center',
                marginBottom: '2rem'
              }}>
                <p style={{ margin: '0', fontWeight: '500' }}>Invalid Reset Link</p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
                  This password reset link is invalid or has expired. Please request a new password reset.
                </p>
                <button
                  onClick={() => navigate('/forgot-password')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--blue-600)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Request New Reset
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                {/* Password Field */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    New Password <span className="required-asterisk">*</span>
                  </label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`input ${errors.password ? 'input-error' : touchedFields.password && watchPassword && watchPassword.trim() && !errors.password ? 'input-success' : ''}`}
                      placeholder="Enter your new password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                          message: 'Password must contain uppercase, lowercase, number and special character',
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

                {/* Confirm Password Field */}
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm New Password <span className="required-asterisk">*</span>
                  </label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`input ${errors.confirmPassword ? 'input-error' : touchedFields.confirmPassword && watchConfirmPassword && watchConfirmPassword.trim() && !errors.confirmPassword ? 'input-success' : ''}`}
                      placeholder="Confirm your new password"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: validatePasswordMatch,
                        onChange: () => trigger('confirmPassword'),
                      })}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {touchedFields.confirmPassword && watchConfirmPassword && watchConfirmPassword.trim() && !errors.confirmPassword && (
                      <div className="input-success-icon">✓</div>
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <span className="form-error">{errors.confirmPassword.message}</span>
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
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;