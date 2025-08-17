import React from 'react';
import PalliativeLayout from './PalliativeLayout';

const HealthRecords: React.FC = () => {
  return (
    <PalliativeLayout title="Health Records">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Medical History & Records</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            View your complete medical history, treatment plans, medications, and care notes from your healthcare team.
          </p>
          
          <div style={{ 
            padding: '2rem', 
            backgroundColor: 'var(--gray-50)', 
            borderRadius: '0.5rem', 
            textAlign: 'center' 
          }}>
            <p style={{ color: 'var(--gray-600)' }}>
              Health records will be displayed here
            </p>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '1rem' }}>
              This will show your medical history, current medications, treatment plans, 
              care notes from ASHA workers, and important health milestones.
            </p>
          </div>
        </div>
      </div>
    </PalliativeLayout>
  );
};

export default HealthRecords;