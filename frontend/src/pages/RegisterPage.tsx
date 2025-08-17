import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Heart, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import './AuthPages.css';

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  userType: 'user' | 'asha_worker' | 'admin';
  beneficiaryCategory: 'maternity' | 'palliative';
  agreeToTerms: boolean;
}

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const defaultUserType = searchParams.get('type') as 'user' | 'asha_worker' | 'admin' || 'user';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
    trigger,
  } = useForm<RegisterFormData>({
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      userType: defaultUserType,
      beneficiaryCategory: 'maternity',
    },
  });

  const watchUserType = watch('userType');
  const watchPassword = watch('password');
  const watchConfirmPassword = watch('confirmPassword');
  const watchName = watch('name');
  const watchEmail = watch('email');
  const watchPhone = watch('phone');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        userType: data.userType,
        beneficiaryCategory: data.userType === 'user' ? data.beneficiaryCategory : '',
      });
      // Redirect to login page after successful registration
      navigate('/login');
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
            <div className="auth-logo">
              <Heart className="logo-icon" />
              <span className="logo-text">AshaAssist</span>
            </div>
            <h1 className="auth-branding-title">
              Join Our Healthcare Community
            </h1>
            <p className="auth-branding-description">
              Connect with ASHA workers, access quality healthcare services, 
              and be part of a community that cares about your well-being.
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Free registration and account setup</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Personalized healthcare dashboard</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>24/7 access to health services</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="auth-form-container">
          <div className="auth-form-content">
            <div className="auth-header">
              <h2 className="auth-title">Create Your Account</h2>
              <p className="auth-subtitle">
                Register to access healthcare services and connect with your local ASHA worker
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              {/* Hidden user type - automatically set to 'user' */}
              <input
                type="hidden"
                value="user"
                {...register('userType', { required: false })}
              />

              {/* Beneficiary Category - Always show since only users can register */}
                <div className="form-group">
                  <label className="form-label">Care Category <span className="required-asterisk">*</span></label>
                  <div className="beneficiary-selector">
                    <label className="beneficiary-option">
                      <input
                        type="radio"
                        value="maternity"
                        {...register('beneficiaryCategory', { 
                          required: 'Please select a care category'
                        })}
                      />
                      <div className="beneficiary-card">
                        <div className="beneficiary-title">Maternity Care</div>
                        <div className="beneficiary-desc">Pregnant women & new mothers</div>
                      </div>
                    </label>
                    <label className="beneficiary-option">
                      <input
                        type="radio"
                        value="palliative"
                        {...register('beneficiaryCategory', { 
                          required: 'Please select a care category'
                        })}
                      />
                      <div className="beneficiary-card">
                        <div className="beneficiary-title">Palliative Care</div>
                        <div className="beneficiary-desc">Chronic & terminal illness support</div>
                      </div>
                    </label>
                  </div>
                  {errors.beneficiaryCategory && (
                    <span className="form-error">{errors.beneficiaryCategory.message}</span>
                  )}
                </div>

              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    id="name"
                    type="text"
                    className={`input ${errors.name ? 'input-error' : touchedFields.name && !errors.name && watchName && watchName.trim() ? 'input-success' : ''}`}
                    placeholder="Enter your full name"
                    {...register('name', {
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters',
                      },
                      pattern: {
                        value: /^[a-zA-Z\s]+$/,
                        message: 'Name can only contain letters and spaces',
                      },
                      onChange: () => trigger('name'),
                    })}
                  />
                  {touchedFields.name && !errors.name && watchName && watchName.trim() && (
                    <div className="input-success-icon">✓</div>
                  )}
                </div>
                {errors.name && (
                  <span className="form-error">{errors.name.message}</span>
                )}
              </div>

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
                    className={`input ${errors.email ? 'input-error' : touchedFields.email && !errors.email && watchEmail && watchEmail.trim() ? 'input-success' : ''}`}
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
                  {touchedFields.email && !errors.email && watchEmail && watchEmail.trim() && (
                    <div className="input-success-icon">✓</div>
                  )}
                </div>
                {errors.email && (
                  <span className="form-error">{errors.email.message}</span>
                )}
                {!errors.email && touchedFields.email && watchEmail && watchEmail.trim() && (
                  <div className="form-success">Valid email address</div>
                )}
              </div>

              {/* Phone Field */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper">
                  <Phone className="input-icon" />
                  <input
                    id="phone"
                    type="tel"
                    className={`input ${errors.phone ? 'input-error' : touchedFields.phone && !errors.phone && watchPhone && watchPhone.trim() ? 'input-success' : ''}`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Enter a valid 10-digit Indian mobile number starting with 6-9',
                      },
                      minLength: {
                        value: 10,
                        message: 'Phone number must be exactly 10 digits',
                      },
                      maxLength: {
                        value: 10,
                        message: 'Phone number must be exactly 10 digits',
                      },
                      onChange: () => trigger('phone'),
                    })}
                  />
                  {touchedFields.phone && !errors.phone && watchPhone && watchPhone.trim() && (
                    <div className="input-success-icon">✓</div>
                  )}
                </div>
                {errors.phone && (
                  <span className="form-error">{errors.phone.message}</span>
                )}
                {!errors.phone && !touchedFields.phone && (
                  <div className="form-help">
                    Enter 10-digit Indian mobile number (starting with 6-9)
                  </div>
                )}
                {!errors.phone && touchedFields.phone && watchPhone && watchPhone.trim() && (
                  <div className="form-success">Valid phone number</div>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`input ${errors.password ? 'input-error' : touchedFields.password && !errors.password && watchPassword && watchPassword.trim() ? 'input-success' : ''}`}
                    placeholder="Create a strong password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters long',
                      },
                      validate: {
                        hasUpperCase: (value) =>
                          /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
                        hasLowerCase: (value) =>
                          /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
                        hasNumber: (value) =>
                          /\d/.test(value) || 'Password must contain at least one number',
                        hasSpecialChar: (value) =>
                          /[!@#$%^&*(),.?":{}|<>]/.test(value) || 'Password must contain at least one special character',
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
                </div>
                {errors.password && (
                  <span className="form-error">{errors.password.message}</span>
                )}
                {touchedFields.password && (
                  <div className="password-requirements">
                    <div className="password-requirement-title">Password must contain:</div>
                    <div className={`password-requirement ${watchPassword && watchPassword.length >= 8 ? 'valid' : 'invalid'}`}>
                      {watchPassword && watchPassword.length >= 8 ? '✓' : '×'} At least 8 characters
                    </div>
                    <div className={`password-requirement ${watchPassword && /[A-Z]/.test(watchPassword) ? 'valid' : 'invalid'}`}>
                      {watchPassword && /[A-Z]/.test(watchPassword) ? '✓' : '×'} One uppercase letter
                    </div>
                    <div className={`password-requirement ${watchPassword && /[a-z]/.test(watchPassword) ? 'valid' : 'invalid'}`}>
                      {watchPassword && /[a-z]/.test(watchPassword) ? '✓' : '×'} One lowercase letter
                    </div>
                    <div className={`password-requirement ${watchPassword && /\d/.test(watchPassword) ? 'valid' : 'invalid'}`}>
                      {watchPassword && /\d/.test(watchPassword) ? '✓' : '×'} One number
                    </div>
                    <div className={`password-requirement ${watchPassword && /[!@#$%^&*(),.?":{}|<>]/.test(watchPassword) ? 'valid' : 'invalid'}`}>
                      {watchPassword && /[!@#$%^&*(),.?":{}|<>]/.test(watchPassword) ? '✓' : '×'} One special character
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password <span className="required-asterisk">*</span>
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`input ${errors.confirmPassword ? 'input-error' : touchedFields.confirmPassword && !errors.confirmPassword && watchConfirmPassword && watchConfirmPassword.trim() ? 'input-success' : ''}`}
                    placeholder="Confirm your password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === watchPassword || 'Passwords do not match',
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
                  {touchedFields.confirmPassword && !errors.confirmPassword && watchConfirmPassword && watchConfirmPassword.trim() && watchPassword && (
                    <div className="input-success-icon">✓</div>
                  )}
                </div>
                {errors.confirmPassword && (
                  <span className="form-error">{errors.confirmPassword.message}</span>
                )}
                {!errors.confirmPassword && touchedFields.confirmPassword && watchConfirmPassword && watchConfirmPassword.trim() && watchPassword && (
                  <div className="form-success">Passwords match</div>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox"
                    {...register('agreeToTerms', {
                      required: 'You must agree to the terms and conditions',
                    })}
                  />
                  <span className="checkbox-text">
                    I agree to the{' '}
                    <Link to="/terms" className="terms-link">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="terms-link">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <span className="form-error">{errors.agreeToTerms.message}</span>
                )}
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Divider */}
              <div className="auth-divider">
                <span>or</span>
              </div>

              {/* Google Signup */}
              <GoogleSignInButton className="btn-lg auth-google-btn">
                Continue with Google
              </GoogleSignInButton>
            </form>

            {/* Sign In Link */}
            <div className="auth-footer">
              <p className="auth-footer-text">
                Already have an account?{' '}
                <Link to="/login" className="auth-footer-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;