import React from 'react';
import { useLocation } from 'react-router-dom';
import MaternityLayout from '../maternity/MaternityLayout';
import PalliativeLayout from '../palliative/PalliativeLayout';

const HealthBlogs: React.FC = () => {
  const location = useLocation();
  const userType = location.pathname.includes('/palliative/') ? 'palliative' : 'maternity';
  
  const getDescription = () => {
    if (userType === 'palliative') {
      return "Read health-related blogs on nutrition, hygiene, palliative care, pain management, and elderly care.";
    }
    return "Read health-related blogs on nutrition, hygiene, maternal/child care, and elderly care.";
  };

  const getTopics = () => {
    if (userType === 'palliative') {
      return "This will include articles on palliative care, pain management, nutrition for chronic conditions, comfort care, and general health tips for patients and caregivers.";
    }
    return "This will include articles on prenatal care, nutrition during pregnancy, child development, vaccination schedules, and general health tips.";
  };

  const content = (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Health & Wellness Articles</h2>
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
            Health blogs will be displayed here
          </p>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '1rem' }}>
            {getTopics()}
          </p>
        </div>
      </div>
    </div>
  );

  if (userType === 'palliative') {
    return (
      <PalliativeLayout title="Health Blogs">
        {content}
      </PalliativeLayout>
    );
  }

  return (
    <MaternityLayout title="Health Blogs">
      {content}
    </MaternityLayout>
  );
};

export default HealthBlogs;