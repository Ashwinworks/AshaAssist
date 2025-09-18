import React from 'react';
import PalliativeLayout from './PalliativeLayout';

const PalliativeVisitRequests: React.FC = () => {
  return (
    <PalliativeLayout title="Visit Requests">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Request Home Visit</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            Request a home visit from your assigned ASHA worker for palliative care services.
          </p>

          <div
            style={{
              padding: '2rem',
              backgroundColor: 'var(--gray-50)',
              borderRadius: '0.5rem',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'var(--gray-600)' }}>Visit request form will be implemented here</p>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '1rem' }}>
              This will allow you to schedule home visits for pain management, comfort care, medication
              administration, health monitoring, and emergency support.
            </p>
          </div>
        </div>
      </div>
    </PalliativeLayout>
  );
};

export default PalliativeVisitRequests;