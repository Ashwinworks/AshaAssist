import React from 'react';
import MaternityLayout from './MaternityLayout';

const MCPCard: React.FC = () => {
  return (
    <MaternityLayout title="Digital MCP Card">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Mother and Child Protection Card</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            View your Mother and Child Protection Card, track vaccination history, and see ASHA worker updates.
          </p>
          
          <div style={{ 
            padding: '2rem', 
            backgroundColor: 'var(--gray-50)', 
            borderRadius: '0.5rem', 
            textAlign: 'center' 
          }}>
            <p style={{ color: 'var(--gray-600)' }}>
              Digital MCP Card will be displayed here
            </p>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '1rem' }}>
              This will show your complete medical record, vaccination history, 
              pregnancy milestones, child development tracking, and ASHA worker notes.
            </p>
          </div>
        </div>
      </div>
    </MaternityLayout>
  );
};

export default MCPCard;