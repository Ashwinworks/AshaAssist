import React from 'react';
import MaternityLayout from './MaternityLayout';

const ProfileSetup: React.FC = () => {
  return (
    <MaternityLayout title="Profile Setup">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Complete Your Profile</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            Please complete your personal details to access all maternity care features.
          </p>
          
          <div style={{ 
            padding: '2rem', 
            backgroundColor: 'var(--gray-50)', 
            borderRadius: '0.5rem', 
            textAlign: 'center' 
          }}>
            <p style={{ color: 'var(--gray-600)' }}>
              Profile setup form will be implemented here
            </p>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '1rem' }}>
              This will include fields for personal information, medical history, 
              pregnancy details, and emergency contacts.
            </p>
          </div>
        </div>
      </div>
    </MaternityLayout>
  );
};

export default ProfileSetup;