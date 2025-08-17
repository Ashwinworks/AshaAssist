import React from 'react';
import { useLocation } from 'react-router-dom';
import MaternityLayout from '../maternity/MaternityLayout';
import PalliativeLayout from '../palliative/PalliativeLayout';

const VisitRequests: React.FC = () => {
  const location = useLocation();
  const userType = location.pathname.includes('/palliative/') ? 'palliative' : 'maternity';
  
  const getDescription = () => {
    if (userType === 'palliative') {
      return "Request a home visit from your assigned ASHA worker for palliative care services.";
    }
    return "Request a home visit from your assigned ASHA worker.";
  };

  const getDetails = () => {
    if (userType === 'palliative') {
      return "This will allow you to schedule home visits for pain management, comfort care, medication administration, health monitoring, and emergency support.";
    }
    return "This will allow you to schedule home visits for health checkups, consultations, vaccination administration, and emergency care.";
  };

  const content = (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Request Home Visit</h2>
      </div>
      <div className="card-content">
        <p style={{ marginBottom: '2rem' }}>
          {getDescription()}
        </p>
        
        <div style={{ 
          padding: '2rem', 
          backgroundColor: 'var(--gray-50)', 
          borderRadius: '0.5rem', 
          textAlign: 'center' 
        }}>
          <p style={{ color: 'var(--gray-600)' }}>
            Visit request form will be implemented here
          </p>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '1rem' }}>
            {getDetails()}
          </p>
        </div>
      </div>
    </div>
  );

  if (userType === 'palliative') {
    return (
      <PalliativeLayout title="Visit Requests">
        {content}
      </PalliativeLayout>
    );
  }

  return (
    <MaternityLayout title="Visit Requests">
      {content}
    </MaternityLayout>
  );
};

export default VisitRequests;