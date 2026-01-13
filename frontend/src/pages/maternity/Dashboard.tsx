import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MaternityLayout from './MaternityLayout';
import { maternityDashboardAPI, authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Calendar,
  Package,
  Syringe,
  UserCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Baby,
  Eye
} from 'lucide-react';
import BirthRecordingModal from '../../components/BirthRecordingModal';

interface DashboardStats {
  upcomingAppointments: number;
  pendingRequests: number;
  completedVisits: number;
  rationStatus: any;
  nextVaccination: any;
  upcomingEvents: any[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    pendingRequests: 0,
    completedVisits: 0,
    rationStatus: null,
    nextVaccination: null,
    upcomingEvents: []
  });
  const [loading, setLoading] = useState(true);
  const [showBirthModal, setShowBirthModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data...');

        // First, fetch fresh user profile to ensure we have latest maternalHealth data
        try {
          const profileResponse = await authAPI.getProfile();
          if (profileResponse.user) {
            // Update local storage with fresh user data
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...currentUser, ...profileResponse.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('✅ Updated user data with maternalHealth:', updatedUser.maternalHealth);
            // Force a page reload to update the user context
            window.location.reload();
          }
        } catch (profileError) {
          console.error('Failed to fetch fresh profile:', profileError);
        }

        const dashboardStats = await maternityDashboardAPI.getStats();
        console.log('Dashboard stats received:', dashboardStats);
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    // Debug: Log user info to check pregnancy status
    console.log('Current user:', user);
    console.log('Maternal health:', user?.maternalHealth);
    console.log('Pregnancy status:', user?.maternalHealth?.pregnancyStatus);
    console.log('Should show birth card:', user?.maternalHealth?.pregnancyStatus === 'pregnant');

    // If user doesn't have maternalHealth, fetch fresh data
    if (user && !user.maternalHealth) {
      console.log('⚠️ User missing maternalHealth field, fetching fresh profile...');
      fetchDashboardData();
    } else {
      // Just fetch dashboard stats
      setLoading(true);
      maternityDashboardAPI.getStats()
        .then(stats => setStats(stats))
        .catch(error => {
          console.error('Error fetching dashboard data:', error);
          toast.error('Failed to load dashboard data');
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

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
    <MaternityLayout title="Dashboard">
      <div>
        <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #fef3f2 0%, #fdf2f8 100%)', border: '1px solid #f9caca' }}>
          <div className="card-header">
            <h2 className="card-title" style={{ color: '#be185d' }}>Welcome, {user?.name || 'Mother'}!</h2>
          </div>
          <div className="card-content">
            <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
              Welcome to your maternity care dashboard! Here you'll see upcoming health events, vaccinations, and important alerts.
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
                  Please complete your profile setup to access all maternity care features.
                </p>
                <button
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#f59e0b',
                    borderColor: '#f59e0b',
                    color: 'white',
                    fontWeight: 600
                  }}
                  onClick={() => navigate('/maternity/profile')}
                >
                  Complete Profile Setup
                </button>
              </div>
            )}

            {/* Birth Recording Card - Show for pregnant mothers */}
            {user?.maternalHealth?.pregnancyStatus === 'pregnant' && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginTop: user?.isFirstLogin ? '1rem' : '0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Baby size={20} color="#16a34a" />
                  <h3 style={{ color: '#166534', margin: 0, fontWeight: 600 }}>
                    Baby Born? Record Birth Details
                  </h3>
                </div>
                <p style={{ color: '#166534', margin: '0 0 1rem' }}>
                  Record your delivery to unlock vaccination scheduling and child health tracking.
                </p>
                <button
                  className="btn"
                  style={{
                    backgroundColor: '#16a34a',
                    color: 'white',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={() => setShowBirthModal(true)}
                >
                  <Baby size={18} />
                  Record Birth
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ borderLeft: '4px solid #ec4899', backgroundColor: '#fdf2f8' }}>
            <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                backgroundColor: '#fce7f3',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UserCheck size={24} color="#ec4899" />
              </div>
              <div>
                <h3 style={{ color: '#be185d', fontSize: '2rem', margin: '0 0 0.25rem', fontWeight: 700 }}>
                  {loading ? '...' : stats.upcomingAppointments}
                </h3>
                <p style={{ color: '#be185d', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Upcoming Visits</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #3b82f6', backgroundColor: '#eff6ff' }}>
            <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Package size={24} color="#3b82f6" />
              </div>
              <div>
                <h3 style={{ color: '#1d4ed8', fontSize: '2rem', margin: '0 0 0.25rem', fontWeight: 700 }}>
                  {loading ? '...' : stats.pendingRequests}
                </h3>
                <p style={{ color: '#1d4ed8', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Pending Requests</p>
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
                <CheckCircle size={24} color="#10b981" />
              </div>
              <div>
                <h3 style={{ color: '#047857', fontSize: '2rem', margin: '0 0 0.25rem', fontWeight: 700 }}>
                  {loading ? '...' : stats.completedVisits}
                </h3>
                <p style={{ color: '#047857', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Completed Visits</p>
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
                onClick={() => navigate('/maternity/visits')}
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
                onClick={() => navigate('/maternity/supplies')}
              >
                <ShoppingBag size={32} color="#10b981" style={{ marginBottom: '0.5rem' }} />
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
                onClick={() => navigate('/maternity/vaccinations')}
              >
                <Syringe size={32} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: 500, color: '#374151' }}>Vaccinations</span>
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
                onClick={() => navigate('/maternity/ration')}
              >
                <Package size={32} color="#8b5cf6" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: 500, color: '#374151' }}>Monthly Ration</span>
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
                onClick={() => navigate('/maternity/jaundice-detection')}
              >
                <Eye size={32} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: 500, color: '#374151' }}>Jaundice Detection</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ration & Vaccination Status */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Monthly Ration Status */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={20} color="#8b5cf6" />
                Monthly Ration Status
              </h2>
            </div>
            <div className="card-content">
              {loading ? (
                <p style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>Loading...</p>
              ) : stats.rationStatus ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ margin: '0 0 0.25rem', fontWeight: 500, color: '#374151' }}>
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                        Current Month
                      </p>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: stats.rationStatus.status === 'collected' ? '#dcfce7' : '#ffedd5',
                      color: stats.rationStatus.status === 'collected' ? '#047857' : '#ea580c'
                    }}>
                      {stats.rationStatus.status === 'collected' ? 'Collected' : 'Pending'}
                    </span>
                  </div>
                  {stats.rationStatus.status !== 'collected' && (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => navigate('/maternity/ration')}
                    >
                      View Ration Details
                    </button>
                  )}
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                  No ration information available
                </p>
              )}
            </div>
          </div>

          {/* Next Vaccination */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Syringe size={20} color="#f59e0b" />
                Next Vaccination
              </h2>
            </div>
            <div className="card-content">
              {loading ? (
                <p style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>Loading...</p>
              ) : stats.nextVaccination ? (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: 500, color: '#374151' }}>
                      {stats.nextVaccination.childName || 'Baby'}
                    </p>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {stats.nextVaccination.vaccines?.join(', ') || 'Vaccination'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} color="#6b7280" />
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {formatDate(stats.nextVaccination.date)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn"
                    style={{ width: '100%' }}
                    onClick={() => navigate('/maternity/vaccinations')}
                  >
                    View All Vaccinations
                  </button>
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                  No upcoming vaccinations scheduled
                </p>
              )}
            </div>
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
                  onClick={() => navigate('/maternity/calendar')}
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

      {/* Birth Recording Modal */}
      <BirthRecordingModal
        isOpen={showBirthModal}
        onClose={() => setShowBirthModal(false)}
        onSuccess={() => {
          // Reload page to reflect updated user status
          window.location.reload();
        }}
      />
    </MaternityLayout>
  );
};

export default Dashboard;