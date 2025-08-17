import React from 'react';
import PalliativeLayout from './PalliativeLayout';

const Feedback: React.FC = () => {
  return (
    <PalliativeLayout title="Feedback">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Rate Your Care Services</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            Submit feedback and ratings for your ASHA worker and palliative care services.
          </p>
          
          <div style={{ 
            padding: '2rem', 
            backgroundColor: 'var(--gray-50)', 
            borderRadius: '0.5rem', 
            textAlign: 'center' 
          }}>
            <p style={{ color: 'var(--gray-600)' }}>
              Feedback form will be implemented here
            </p>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '1rem' }}>
              This will include rating systems for care quality, ASHA worker performance, 
              service satisfaction, and suggestions for improvement.
            </p>
          </div>
        </div>
      </div>
    </PalliativeLayout>
  );
};

export default Feedback;