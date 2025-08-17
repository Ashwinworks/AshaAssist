import React from 'react';
import AshaLayout from './asha/AshaLayout';
import { Bell, Calendar, Users, FileText, Settings, Activity, TrendingUp, AlertCircle } from 'lucide-react';

const AshaWorkerDashboard: React.FC = () => {
  return (
    <AshaLayout title="Dashboard">
      <div>
        {/* Overview Stats */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', marginBottom: '1.5rem' }}>
            Overview of your community healthcare activities and pending tasks.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--red-600)', marginBottom: '0.25rem' }}>
                  12
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500' }}>Pending Requests</div>
              </div>
              <Bell style={{ width: '2.5rem', height: '2.5rem', color: 'var(--red-200)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--red-600)', backgroundColor: 'var(--red-50)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'inline-block' }}>
              Requires Attention
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.25rem' }}>
                  45
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500' }}>Families Served</div>
              </div>
              <Users style={{ width: '2.5rem', height: '2.5rem', color: 'var(--green-200)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--green-600)', backgroundColor: 'var(--green-50)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'inline-block' }}>
              Active Cases
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.25rem' }}>
                  8
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500' }}>Visits Today</div>
              </div>
              <Calendar style={{ width: '2.5rem', height: '2.5rem', color: 'var(--blue-200)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--blue-600)', backgroundColor: 'var(--blue-50)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'inline-block' }}>
              Scheduled
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.25rem' }}>
                  127
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500' }}>Total Visits This Month</div>
              </div>
              <TrendingUp style={{ width: '2.5rem', height: '2.5rem', color: 'var(--purple-200)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--purple-600)', backgroundColor: 'var(--purple-50)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'inline-block' }}>
              +15% from last month
            </div>
          </div>
        </div>

        {/* Important Alerts */}
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--red-500)' }}>
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--red-700)' }}>
              <AlertCircle size={24} />
              Important Alerts
            </h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--red-50)', borderRadius: '0.5rem', borderLeft: '3px solid var(--red-400)' }}>
                <div style={{ fontWeight: '600', color: 'var(--red-800)', marginBottom: '0.25rem' }}>
                  Urgent: 3 Emergency Visit Requests
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--red-700)' }}>
                  High-priority home visits requiring immediate attention
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--yellow-50)', borderRadius: '0.5rem', borderLeft: '3px solid var(--yellow-400)' }}>
                <div style={{ fontWeight: '600', color: 'var(--yellow-800)', marginBottom: '0.25rem' }}>
                  Vaccination Drive Tomorrow
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--yellow-700)' }}>
                  Community vaccination drive scheduled at Ward 12 Community Center
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={24} />
              Quick Actions
            </h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--red-100)', backgroundColor: 'var(--red-25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Bell style={{ width: '1.5rem', height: '1.5rem', color: 'var(--red-600)' }} />
                  <h3 style={{ margin: '0', color: 'var(--red-800)', fontSize: '1.125rem', fontWeight: '600' }}>Pending Requests</h3>
                </div>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--red-700)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  Review and approve home visit and supply requests from families in your ward.
                </p>
                <button className="btn" style={{ 
                  backgroundColor: 'var(--red-600)', 
                  color: 'white', 
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  View Requests (12)
                </button>
              </div>
              
              <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--blue-100)', backgroundColor: 'var(--blue-25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Calendar style={{ width: '1.5rem', height: '1.5rem', color: 'var(--blue-600)' }} />
                  <h3 style={{ margin: '0', color: 'var(--blue-800)', fontSize: '1.125rem', fontWeight: '600' }}>Today's Schedule</h3>
                </div>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--blue-700)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  Manage your visit schedule, vaccination drives, and community events.
                </p>
                <button className="btn" style={{ 
                  backgroundColor: 'var(--blue-600)', 
                  color: 'white', 
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  View Calendar
                </button>
              </div>

              <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--green-100)', backgroundColor: 'var(--green-25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <FileText style={{ width: '1.5rem', height: '1.5rem', color: 'var(--green-600)' }} />
                  <h3 style={{ margin: '0', color: 'var(--green-800)', fontSize: '1.125rem', fontWeight: '600' }}>Update Records</h3>
                </div>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--green-700)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  Update maternal, palliative, and vaccination records for your families.
                </p>
                <button className="btn" style={{ 
                  backgroundColor: 'var(--green-600)', 
                  color: 'white', 
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  Manage Records
                </button>
              </div>

              <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--purple-100)', backgroundColor: 'var(--purple-25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Users style={{ width: '1.5rem', height: '1.5rem', color: 'var(--purple-600)' }} />
                  <h3 style={{ margin: '0', color: 'var(--purple-800)', fontSize: '1.125rem', fontWeight: '600' }}>Community Updates</h3>
                </div>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--purple-700)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  Post health blogs, announce vaccination schedules, and community events.
                </p>
                <button className="btn" style={{ 
                  backgroundColor: 'var(--purple-600)', 
                  color: 'white', 
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  Create Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AshaLayout>
  );
};

export default AshaWorkerDashboard;