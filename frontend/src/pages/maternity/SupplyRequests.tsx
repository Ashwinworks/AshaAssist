import React from 'react';
import MaternityLayout from './MaternityLayout';

const SupplyRequests: React.FC = () => {
  return (
    <MaternityLayout title="Supply Requests">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Request Supplies</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            Request nutritional items like Amrutham Podi, baby kits, adult diapers, water beds, etc.
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
              This will include options to request various supplies like nutritional supplements, 
              baby care items, medical equipment, and other essential materials.
            </p>
          </div>
        </div>
      </div>
    </MaternityLayout>
  );
};

export default SupplyRequests;