import React from 'react';
import { useLocation } from 'react-router-dom';
import MaternityLayout from '../maternity/MaternityLayout';
import PalliativeLayout from '../palliative/PalliativeLayout';

const Calendar: React.FC = () => {
  const location = useLocation();
  const userType = location.pathname.includes('/palliative/') ? 'palliative' : 'maternity';
  
  const getDescription = () => {
    if (userType === 'palliative') {
      return "View upcoming medical appointments, care schedules, medication reminders, and health programs.";
    }
    return "View upcoming vaccination days, community health camps, and programs.";
  };

  const getDetails = () => {
    if (userType === 'palliative') {
      return "This will show medical appointments, care visit schedules, medication reminders, therapy sessions, and important health milestones.";
    }
    return "This will show vaccination schedules, health camp dates, ASHA worker visits, and important health milestones.";
  };

  const getTitle = () => {
    return userType === 'palliative' ? 'Calendar' : 'Integrated Calendar';
  };

  const content = (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Health Events Calendar</h2>
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
            Calendar view will be implemented here
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
      <PalliativeLayout title={getTitle()}>
        {content}
      </PalliativeLayout>
    );
  }

  return (
    <MaternityLayout title={getTitle()}>
      {content}
    </MaternityLayout>
  );
};

export default Calendar;