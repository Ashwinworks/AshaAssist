import React from 'react';
import MaternityLayout from './MaternityLayout';

const VaccinationBooking: React.FC = () => {
  return (
    <MaternityLayout title="Vaccination Booking">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Book Vaccination Appointments</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            Book vaccination appointments for your child and track upcoming schedules.
          </p>
          
          <div style={{ 
            padding: '2rem', 
            backgroundColor: 'var(--gray-50)', 
            borderRadius: '0.5rem', 
            textAlign: 'center' 
          }}>
            <p style={{ color: 'var(--gray-600)' }}>
              Vaccination booking system will be implemented here
            </p>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '1rem' }}>
              This will include vaccination schedules, appointment booking, 
              reminders, and tracking of completed immunizations.
            </p>
          </div>
        </div>
      </div>
    </MaternityLayout>
  );
};

export default VaccinationBooking;