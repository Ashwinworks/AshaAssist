import React from 'react';
import MaternityLayout from './MaternityLayout';

const MaternityVisitRequests: React.FC = () => {
  return (
    <MaternityLayout title="Visit Requests">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Request Home Visit</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            Request a home visit from your assigned ASHA worker for maternity care services.
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
              This will allow you to schedule home visits for antenatal checkups, consultations, vaccination
              administration, postnatal care, and emergency support.
            </p>
          </div>
        </div>
      </div>
    </MaternityLayout>
  );
};

export default MaternityVisitRequests;