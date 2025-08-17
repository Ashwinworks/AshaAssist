import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MaternityLayout from './MaternityLayout';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <MaternityLayout title="Dashboard">
      <div>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">Quick Overview</h2>
          </div>
          <div className="card-content">
            <p>Welcome to your maternity care dashboard! Here you'll see upcoming health events, vaccinations, and important alerts.</p>
            
            {user?.isFirstLogin && (
              <div style={{
                backgroundColor: 'var(--warning-50)',
                border: '1px solid var(--warning-200)',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginTop: '1rem'
              }}>
                <h3 style={{ color: 'var(--warning-800)', margin: '0 0 0.5rem' }}>
                  Complete Your Profile
                </h3>
                <p style={{ color: 'var(--warning-700)', margin: '0 0 1rem' }}>
                  Please complete your profile setup to access all maternity care features.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/maternity/profile')}
                >
                  Complete Profile Setup
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card">
            <div className="card-content" style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--pink-600)', fontSize: '2rem', margin: '0 0 0.5rem' }}>0</h3>
              <p style={{ color: 'var(--gray-600)', margin: 0 }}>Upcoming Appointments</p>
            </div>
          </div>
          <div className="card">
            <div className="card-content" style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--blue-600)', fontSize: '2rem', margin: '0 0 0.5rem' }}>0</h3>
              <p style={{ color: 'var(--gray-600)', margin: 0 }}>Pending Requests</p>
            </div>
          </div>
          <div className="card">
            <div className="card-content" style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--green-600)', fontSize: '2rem', margin: '0 0 0.5rem' }}>0</h3>
              <p style={{ color: 'var(--gray-600)', margin: 0 }}>Completed Visits</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
          </div>
          <div className="card-content">
            <p style={{ color: 'var(--gray-600)', textAlign: 'center', padding: '2rem' }}>
              No recent activity to display
            </p>
          </div>
        </div>
      </div>
    </MaternityLayout>
  );
};

export default Dashboard;