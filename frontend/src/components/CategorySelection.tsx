import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, HandHeart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './CategorySelection.css';

interface CategorySelectionProps {
  onComplete: () => void;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({ onComplete }) => {
  const [selectedCategory, setSelectedCategory] = useState<'maternity' | 'palliative' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleCategorySelect = (category: 'maternity' | 'palliative') => {
    setSelectedCategory(category);
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      toast.error('Please select a beneficiary category');
      return;
    }

    try {
      setIsLoading(true);
      
      // Update user profile with selected category
      await authAPI.updateProfile({
        beneficiaryCategory: selectedCategory,
        profileCompleted: true,
        isFirstLogin: false
      });

      // Update local user state
      if (user) {
        updateUser({
          ...user,
          beneficiaryCategory: selectedCategory,
          profileCompleted: true,
          isFirstLogin: false
        });
      }

      toast.success('Profile updated successfully!');
      onComplete();
      navigate('/dashboard'); // Will redirect to appropriate dashboard based on user type
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.error || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="category-selection-overlay">
      <div className="category-selection-container">
        <div className="category-selection-content">
          {/* Header */}
          <div className="category-header">
            <div className="category-logo">
              <Heart className="logo-icon" />
              <span className="logo-text">AshaAssist</span>
            </div>
            <h2 className="category-title">Welcome, {user?.name}!</h2>
            <p className="category-subtitle">
              Please select your beneficiary category to personalize your experience
            </p>
          </div>

          {/* Category Options */}
          <div className="category-options">
            <div
              className={`category-card ${selectedCategory === 'maternity' ? 'selected' : ''}`}
              onClick={() => handleCategorySelect('maternity')}
            >
              <div className="category-icon maternity">
                <Users size={32} />
              </div>
              <h3 className="category-name">Maternity Care</h3>
              <p className="category-description">
                For expecting mothers and families seeking maternal health support, 
                prenatal care, and child health services.
              </p>
              <div className="category-features">
                <span>• Prenatal checkups</span>
                <span>• Vaccination schedules</span>
                <span>• Nutritional guidance</span>
                <span>• Delivery support</span>
              </div>
            </div>

            <div
              className={`category-card ${selectedCategory === 'palliative' ? 'selected' : ''}`}
              onClick={() => handleCategorySelect('palliative')}
            >
              <div className="category-icon palliative">
                <HandHeart size={32} />
              </div>
              <h3 className="category-name">Palliative Care</h3>
              <p className="category-description">
                For individuals and families dealing with serious illnesses, 
                focusing on comfort and quality of life.
              </p>
              <div className="category-features">
                <span>• Pain management</span>
                <span>• Comfort care</span>
                <span>• Family support</span>
                <span>• Medical assistance</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedCategory || isLoading}
            className="category-submit-btn"
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Updating Profile...
              </>
            ) : (
              'Continue to Dashboard'
            )}
          </button>

          {/* Skip Option */}
          <button
            onClick={() => {
              onComplete();
              navigate('/dashboard'); // Will redirect to appropriate dashboard based on user type
            }}
            className="category-skip-btn"
            disabled={isLoading}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySelection;