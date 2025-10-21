import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AshaLayout from './asha/AshaLayout';
import { Bell, Calendar, Users, FileText, Activity, TrendingUp, AlertCircle, Package, Syringe, Home, UserCheck, CheckCircle, Clock, ShoppingCart } from 'lucide-react';
import { homeVisitsAPI } from '../services/api';

interface DashboardStats {
  pendingVisitRequests: number;
  urgentVisitRequests: number;
  scheduledVisitsToday: number;
  totalVisitsThisMonth: number;
  pendingSupplyRequests: number;
  approvedSupplyRequests: number;
  maternalUsers: number;
  palliativeUsers: number;
  upcomingVaccinations: number;
}

const AshaWorkerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    pendingVisitRequests: 0,
    urgentVisitRequests: 0,
    scheduledVisitsToday: 0,
    totalVisitsThisMonth: 0,
    pendingSupplyRequests: 0,
    approvedSupplyRequests: 0,
    maternalUsers: 0,
    palliativeUsers: 0,
    upcomingVaccinations: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch visit requests
      const visitResponse = await fetch('/api/visit-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const visitData = await visitResponse.json();
      const visits = visitData.requests || [];

      // Fetch supply requests
      const supplyResponse = await fetch('/api/supply-requests/scheduled', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const supplyData = await supplyResponse.json();
      const supplies = supplyData.requests || [];

      // Fetch users for visits (this will give us maternal and palliative user counts)
      const usersData = await homeVisitsAPI.getUsersForVisits();
      const users = usersData.users || [];
      
      // Calculate maternal and palliative user counts
      const maternalUsers = users.filter((user: any) => user.category === 'maternity').length;
      const palliativeUsers = users.filter((user: any) => user.category === 'palliative').length;

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const pendingVisits = visits.filter((v: any) => v.status === 'Pending');
      const urgentVisits = visits.filter((v: any) => v.priority === 'Urgent' && v.status === 'Pending');
      const scheduledToday = visits.filter((v: any) => 
        v.status === 'Scheduled' && v.scheduledDate === todayStr
      );

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      const visitsThisMonth = visits.filter((v: any) => {
        const visitDate = new Date(v.createdAt);
        return visitDate >= thisMonth;
      });

      const pendingSupplies = supplies.filter((s: any) => s.status === 'approved');
      const scheduledSupplies = supplies.filter((s: any) => s.status === 'scheduled');

      setStats({
        pendingVisitRequests: pendingVisits.length,
        urgentVisitRequests: urgentVisits.length,
        scheduledVisitsToday: scheduledToday.length,
        totalVisitsThisMonth: visitsThisMonth.length,
        pendingSupplyRequests: pendingSupplies.length,
        approvedSupplyRequests: scheduledSupplies.length,
        maternalUsers: maternalUsers,
        palliativeUsers: palliativeUsers,
        upcomingVaccinations: 0 // Can be fetched from vaccination schedules if needed
      });

      // Set alerts
      const alerts = [];
      if (urgentVisits.length > 0) {
        alerts.push({
          type: 'urgent',
          title: `Urgent: ${urgentVisits.length} Emergency Visit Request${urgentVisits.length > 1 ? 's' : ''}`,
          message: 'High-priority home visits requiring immediate attention',
          color: 'red'
        });
      }
      if (scheduledToday.length > 0) {
        alerts.push({
          type: 'info',
          title: `${scheduledToday.length} Visit${scheduledToday.length > 1 ? 's' : ''} Scheduled Today`,
          message: 'Check your calendar for today\'s scheduled home visits',
          color: 'blue'
        });
      }
      if (pendingSupplies.length > 0) {
        alerts.push({
          type: 'warning',
          title: `${pendingSupplies.length} Supply Request${pendingSupplies.length > 1 ? 's' : ''} Need Scheduling`,
          message: 'Approved supply requests waiting for delivery scheduling',
          color: 'yellow'
        });
      }
      setRecentAlerts(alerts);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AshaLayout title="Dashboard">
      <div>
        {/* Welcome Header */}
        <div className="card" style={{ 
          marginBottom: '2rem', 
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', 
          border: '1px solid #bae6fd' 
        }}>
          <div className="card-header">
            <h2 className="card-title" style={{ color: '#0369a1' }}>Good day, ASHA Worker!</h2>
          </div>
          <div className="card-content">
            <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
              Overview of your community healthcare activities and pending tasks.
            </p>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            Loading dashboard data...
          </div>
        )}

        {!loading && (
        <>
        {/* Stats Cards with Mild Colors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div 
            className="card" 
            style={{ 
              borderLeft: '4px solid #0ea5e9', 
              backgroundColor: '#f0f9ff',
              cursor: 'pointer', 
              transition: 'all 0.2s ease' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
            onClick={() => navigate('/asha/visit-requests')}
          >
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
                <Home size={24} color="#0ea5e9" />
              </div>
              <div>
                <h3 style={{ color: '#0369a1', fontSize: '2rem', margin: '0 0 0.25rem', fontWeight: 700 }}>
                  {stats.pendingVisitRequests}
                </h3>
                <p style={{ color: '#0369a1', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Pending Visit Requests</p>
              </div>
            </div>
            {stats.urgentVisitRequests > 0 && (
              <div style={{ 
                marginTop: '0.75rem',
                fontSize: '0.75rem', 
                color: '#ea580c', 
                backgroundColor: '#ffedd5', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '9999px', 
                display: 'inline-block',
                fontWeight: 600
              }}>
                {stats.urgentVisitRequests} Urgent
              </div>
            )}
          </div>

          <div 
            className="card" 
            style={{ 
              borderLeft: '4px solid #10b981', 
              backgroundColor: '#f0fdf4',
              cursor: 'pointer', 
              transition: 'all 0.2s ease' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
            onClick={() => navigate('/asha/maternal-records')}
          >
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
                <Users size={24} color="#10b981" />
              </div>
              <div>
                <h3 style={{ color: '#047857', fontSize: '2rem', margin: '0 0 0.25rem', fontWeight: 700 }}>
                  {stats.maternalUsers + stats.palliativeUsers}
                </h3>
                <p style={{ color: '#047857', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Users</p>
              </div>
            </div>
            <div style={{ 
              marginTop: '0.75rem',
              fontSize: '0.75rem', 
              color: '#047857', 
              backgroundColor: '#dcfce7', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', 
              display: 'inline-block',
              fontWeight: 600
            }}>
              {stats.maternalUsers} Maternal, {stats.palliativeUsers} Palliative
            </div>
          </div>

          <div 
            className="card" 
            style={{ 
              borderLeft: '4px solid #8b5cf6', 
              backgroundColor: '#f5f3ff',
              cursor: 'pointer', 
              transition: 'all 0.2s ease' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
            onClick={() => navigate('/asha/visit-requests')}
          >
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
                <Calendar size={24} color="#8b5cf6" />
              </div>
              <div>
                <h3 style={{ color: '#6d28d9', fontSize: '2rem', margin: '0 0 0.25rem', fontWeight: 700 }}>
                  {stats.scheduledVisitsToday}
                </h3>
                <p style={{ color: '#6d28d9', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Visits Today</p>
              </div>
            </div>
            <div style={{ 
              marginTop: '0.75rem',
              fontSize: '0.75rem', 
              color: '#6d28d9', 
              backgroundColor: '#ede9fe', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', 
              display: 'inline-block',
              fontWeight: 600
            }}>
              Scheduled
            </div>
          </div>

          <div 
            className="card" 
            style={{ 
              borderLeft: '4px solid #f59e0b', 
              backgroundColor: '#fffbeb',
              cursor: 'pointer', 
              transition: 'all 0.2s ease' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
            onClick={() => navigate('/asha/supply-requests')}
          >
            <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                backgroundColor: '#fef3c7', 
                borderRadius: '50%', 
                width: '50px', 
                height: '50px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Package size={24} color="#f59e0b" />
              </div>
              <div>
                <h3 style={{ color: '#d97706', fontSize: '2rem', margin: '0 0 0.25rem', fontWeight: 700 }}>
                  {stats.pendingSupplyRequests + stats.approvedSupplyRequests}
                </h3>
                <p style={{ color: '#d97706', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Supply Requests</p>
              </div>
            </div>
            <div style={{ 
              marginTop: '0.75rem',
              fontSize: '0.75rem', 
              color: '#d97706', 
              backgroundColor: '#fef3c7', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', 
              display: 'inline-block',
              fontWeight: 600
            }}>
              {stats.pendingSupplyRequests} To Schedule
            </div>
          </div>
        </div>

        {/* Important Alerts */}
        {recentAlerts.length > 0 && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626' }}>
                <AlertCircle size={20} />
                Important Alerts
              </h2>
            </div>
            <div className="card-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentAlerts.map((alert, index) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '1rem', 
                      backgroundColor: alert.color === 'red' ? '#fef2f2' : alert.color === 'blue' ? '#eff6ff' : '#fffbeb', 
                      borderRadius: '0.5rem', 
                      borderLeft: `3px solid ${alert.color === 'red' ? '#dc2626' : alert.color === 'blue' ? '#2563eb' : '#d97706'}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem'
                    }}
                  >
                    <AlertCircle size={20} color={alert.color === 'red' ? '#dc2626' : alert.color === 'blue' ? '#2563eb' : '#d97706'} />
                    <div>
                      <div style={{ fontWeight: '600', color: alert.color === 'red' ? '#991b1b' : alert.color === 'blue' ? '#1d4ed8' : '#92400e', marginBottom: '0.25rem' }}>
                        {alert.title}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: alert.color === 'red' ? '#b91c1c' : alert.color === 'blue' ? '#2563eb' : '#b45309' }}>
                        {alert.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="#0369a1" />
              Quick Actions
            </h2>
          </div>
          <div className="card-content">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1.5rem' 
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
                onClick={() => navigate('/asha/visit-requests')}
              >
                <UserCheck size={32} color="#6366f1" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: 500, color: '#374151' }}>Visit Requests</span>
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
                onClick={() => navigate('/asha/home-visits')}
              >
                <Home size={32} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: 500, color: '#374151' }}>Home Visits</span>
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
                onClick={() => navigate('/asha/supply-requests')}
              >
                <ShoppingCart size={32} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: 500, color: '#374151' }}>Supply Requests</span>
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
                onClick={() => navigate('/asha/maternal-records')}
              >
                <FileText size={32} color="#8b5cf6" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: 500, color: '#374151' }}>Health Records</span>
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Overview */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#0369a1" />
              Monthly Overview
            </h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ 
                padding: '1.5rem', 
                borderRadius: '0.5rem', 
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  backgroundColor: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <CheckCircle size={24} color="#0ea5e9" />
                </div>
                <h3 style={{ color: '#0369a1', fontSize: '2rem', margin: '0 0 0.5rem', fontWeight: 700 }}>
                  {stats.totalVisitsThisMonth}
                </h3>
                <p style={{ color: '#0369a1', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Total Visits This Month</p>
              </div>
              
              <div style={{ 
                padding: '1.5rem', 
                borderRadius: '0.5rem', 
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <Users size={24} color="#10b981" />
                </div>
                <h3 style={{ color: '#047857', fontSize: '2rem', margin: '0 0 0.5rem', fontWeight: 700 }}>
                  {stats.maternalUsers}
                </h3>
                <p style={{ color: '#047857', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Maternal Users</p>
              </div>
              
              <div style={{ 
                padding: '1.5rem', 
                borderRadius: '0.5rem', 
                backgroundColor: '#f5f3ff',
                border: '1px solid #ddd6fe',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  backgroundColor: '#ede9fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <Users size={24} color="#8b5cf6" />
                </div>
                <h3 style={{ color: '#6d28d9', fontSize: '2rem', margin: '0 0 0.5rem', fontWeight: 700 }}>
                  {stats.palliativeUsers}
                </h3>
                <p style={{ color: '#6d28d9', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Palliative Users</p>
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </AshaLayout>
  );
};

export default AshaWorkerDashboard;