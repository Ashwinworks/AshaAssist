import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PalliativeLayout from './PalliativeLayout';
import { palliativeDashboardAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Package, 
  Activity, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Clipboard,
  Stethoscope
} from 'lucide-react';

interface DashboardStats {
  upcomingAppointments: number;
  pendingRequests: number;
  careVisits: number;
  upcomingEvents: any[];
  recentRecords: any[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    pendingRequests: 0,
    careVisits: 0,
    upcomingEvents: [],
    recentRecords: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching palliative dashboard data...');
        const dashboardStats = await palliativeDashboardAPI.getStats();
        console.log('Palliative dashboard stats received:', dashboardStats);
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <PalliativeLayout title="Dashboard">
      <div>
        <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%)', border: '1px solid #bae6fd' }}>
          <div className="card-header">
            <h2 className="card-title" style={{ color: '#0369a1' }}>Welcome, {user?.name || 'Patient'}!</h2>
          </div>
          <div className="card-content">
            <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
              Welcome to your palliative care dashboard! Here you'll see upcoming appointments, care schedules, and important health alerts.
            </p>
            
            {user?.isFirstLogin && (
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fbbf24',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginTop: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={20} color="#f59e0b" />
                  <h3 style={{ color: '#92400e', margin: 0, fontWeight: 600 }}>
                    Complete Your Profile
                  </h3>
                </div>
                <p style={{ color: '#92400e', margin: '0 0 1rem' }}>
                  Please complete your profile setup to access all palliative care features.
                </p>
                <button 
                  className="btn btn-primary"
                  style={{ 
                    backgroundColor: '#f59e0b', 
                    borderColor: '#f59e0b',
                    color: 'white',
                    fontWeight: 600
                  }}
                  onClick={() => navigate('/palliative/profile')}
                >
                  Complete Profile Setup
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ borderLeft: '4px solid #0ea5e9', backgroundColor: '#f0f9ff' }}>
            <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                backgroundColor: '#e0f2fe', 
                borderRadius: '50%', 
                width: '50px', 
                height: '50px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <UserCheck size={24} color="#0ea5e9" />
              </div>
              <div>
                <h3 style={{ color: '#0369a1', fontSize: '2rem', margin: '0 0 0.25rem', fontWeight: 700 }}>
                  {loading ? '...' : stats.upcomingAppointments}
                </h3>
                <p style={{ color: '#0369a1', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Upcoming Appointments</p>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ borderLeft: '4px solid #10b981', backgroundColor: '#f0fdf4' }}>
            <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                backgroundColor: '#dcfce7', 
                borderRadius: '50%', 
                width: '50px', 
                height: '50px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Package size={24} color="#10b981" />
              </div>
              <div>
                <h3 style={{ color: '#047857', fontSize: '2rem', margin: '0 0 0.25rem', fontWeight: 700 }}>
                  {loading ? '...' : stats.pendingRequests}
                </h3>
                <p style={{ color: '#047857', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Pending Requests</p>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ borderLeft: '4px solid #8b5cf6', backgroundColor: '#f5f3ff' }}>
            <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                backgroundColor: '#ede9fe', 
                borderRadius: '50%', 
                width: '50px', 
                height: '50px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Activity size={24} color="#8b5cf6" />
              </div>
              <div>
                <h3 style={{ color: '#6d28d9', fontSize: '2rem', margin: '0 0 0.25rem', fontWeight: 700 }}>
                  {loading ? '...' : stats.careVisits}
                </h3>
                <p style={{ color: '#6d28d9', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Health Records</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="card-content">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              <button 
                className="btn"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '1.5rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                onClick={() => navigate('/palliative/visits')}
              >
                <UserCheck size={32} color="#6366f1" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: 500, color: '#374151' }}>Request Visit</span>
              </button>
              
              <button 
                className="btn"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '1.5rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                onClick={() => navigate('/palliative/supplies')}
              >
                <Package size={32} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: 500, color: '#374151' }}>Request Supplies</span>
              </button>
              
              <button 
                className="btn"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '1.5rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                onClick={() => navigate('/palliative/records')}
              >
                <Clipboard size={32} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: 500, color: '#374151' }}>Health Records</span>
              </button>
              
              <button 
                className="btn"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '1.5rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                onClick={() => navigate('/palliative/calendar')}
              >
                <Calendar size={32} color="#8b5cf6" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: 500, color: '#374151' }}>Calendar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Health Records & Upcoming Events */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Recent Health Records */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Stethoscope size={20} color="#8b5cf6" />
                Recent Health Records
              </h2>
            </div>
            <div className="card-content">
              {loading ? (
                <p style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>Loading...</p>
              ) : stats.recentRecords && stats.recentRecords.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stats.recentRecords.map((record: any, index: number) => (
                    <div 
                      key={index} 
                      style={{ 
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <p style={{ margin: 0, fontWeight: 500, color: '#374151' }}>
                          {record.testType || 'Health Record'}
                        </p>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {formatDate(record.date || record.createdAt)}
                        </span>
                      </div>
                      {record.value && (
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                          Value: {record.value} {record.unit || ''}
                        </p>
                      )}
                      {record.notes && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                          {record.notes}
                        </p>
                      )}
                    </div>
                  ))}
                  <button 
                    className="btn"
                    style={{ alignSelf: 'flex-start' }}
                    onClick={() => navigate('/palliative/records')}
                  >
                    View All Records
                  </button>
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                  No health records available
                </p>
              )}
            </div>
          </div>
          
          {/* Upcoming Events */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="#0ea5e9" />
                Upcoming Events
              </h2>
            </div>
            <div className="card-content">
              {loading ? (
                <p style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>Loading...</p>
              ) : stats.upcomingEvents && stats.upcomingEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {stats.upcomingEvents.map((event: any, index: number) => (
                    <div 
                      key={index} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        backgroundColor: '#e0f2fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Calendar size={20} color="#0ea5e9" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 0.25rem', fontWeight: 500, color: '#374151' }}>
                          {event.title || 'Event'}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                          {formatDate(event.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <button 
                    className="btn"
                    style={{ alignSelf: 'flex-start' }}
                    onClick={() => navigate('/palliative/calendar')}
                  >
                    View Full Calendar
                  </button>
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                  No upcoming events in the next 7 days
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PalliativeLayout>
  );
};

export default Dashboard;