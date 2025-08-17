import React from 'react';
import PalliativeLayout from './PalliativeLayout';

const ProfileSetup: React.FC = () => {
  return (
    <PalliativeLayout title="Profile Setup">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Complete Your Profile</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            Please complete your personal and medical details to access all palliative care features.
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
              current conditions, medications, and emergency contacts.
            </p>
          </div>
        </div>
      </div>
    </PalliativeLayout>
  );
};

export default ProfileSetup;