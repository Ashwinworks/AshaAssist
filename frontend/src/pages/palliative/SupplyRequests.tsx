import React from 'react';
import PalliativeLayout from './PalliativeLayout';

const SupplyRequests: React.FC = () => {
  return (
    <PalliativeLayout title="Supply Requests">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Request Medical Supplies</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            Request medical supplies, comfort items, mobility aids, and other essential equipment for palliative care.
          </p>
          
          <div style={{ 
            padding: '2rem', 
            backgroundColor: 'var(--gray-50)', 
            borderRadius: '0.5rem', 
            textAlign: 'center' 
          }}>
            <p style={{ color: 'var(--gray-600)' }}>
              Supply request form will be implemented here
            </p>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '1rem' }}>
              This will include options to request medical equipment, comfort items, 
              mobility aids, nutritional supplements, and other palliative care supplies.
            </p>
          </div>
        </div>
      </div>
    </PalliativeLayout>
  );
};

export default SupplyRequests;