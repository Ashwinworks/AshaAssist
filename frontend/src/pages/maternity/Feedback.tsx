import React from 'react';
import MaternityLayout from './MaternityLayout';

const Feedback: React.FC = () => {
  return (
    <MaternityLayout title="Feedback">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Rate Your ASHA Worker</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            Submit performance feedback and service ratings for your ASHA worker.
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
              This will include rating systems, feedback forms, service quality assessment, 
              and suggestions for improvement.
            </p>
          </div>
        </div>
      </div>
    </MaternityLayout>
  );
};

export default Feedback;