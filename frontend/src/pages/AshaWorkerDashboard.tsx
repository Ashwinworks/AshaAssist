import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AshaLayout from './asha/AshaLayout';
import { Bell, Calendar, Users, FileText, Activity, TrendingUp, AlertCircle, Package, Syringe, Home } from 'lucide-react';

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

      // Fetch maternal records
      const maternalResponse = await fetch('/api/maternal-records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const maternalData = await maternalResponse.json();

      // Fetch palliative records
      const palliativeResponse = await fetch('/api/palliative-records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const palliativeData = await palliativeResponse.json();

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
        maternalUsers: maternalData.records?.length || 0,
        palliativeUsers: palliativeData.records?.length || 0,
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
        {/* Overview Stats */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', marginBottom: '1.5rem' }}>
            Overview of your community healthcare activities and pending tasks.
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-600)' }}>
            Loading dashboard data...
          </div>
        )}

        {!loading && (
        <>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div 
            className="card" 
            style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick={() => navigate('/asha/visit-requests')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--red-600)', marginBottom: '0.25rem' }}>
                  {stats.pendingVisitRequests}
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500' }}>Pending Visit Requests</div>
              </div>
              <Home style={{ width: '2.5rem', height: '2.5rem', color: 'var(--red-200)' }} />
            </div>
            {stats.urgentVisitRequests > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--red-600)', backgroundColor: 'var(--red-50)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'inline-block' }}>
                {stats.urgentVisitRequests} Urgent
              </div>
            )}
          </div>

          <div 
            className="card" 
            style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick={() => navigate('/asha/maternal-records')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.25rem' }}>
                  {stats.maternalUsers + stats.palliativeUsers}
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500' }}>Total Families</div>
              </div>
              <Users style={{ width: '2.5rem', height: '2.5rem', color: 'var(--green-200)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--green-600)', backgroundColor: 'var(--green-50)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'inline-block' }}>
              {stats.maternalUsers} Maternity, {stats.palliativeUsers} Palliative
            </div>
          </div>

          <div 
            className="card" 
            style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick={() => navigate('/asha/visit-requests')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.25rem' }}>
                  {stats.scheduledVisitsToday}
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500' }}>Visits Today</div>
              </div>
              <Calendar style={{ width: '2.5rem', height: '2.5rem', color: 'var(--blue-200)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--blue-600)', backgroundColor: 'var(--blue-50)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'inline-block' }}>
              Scheduled
            </div>
          </div>

          <div 
            className="card" 
            style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick={() => navigate('/asha/supply-requests')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.25rem' }}>
                  {stats.pendingSupplyRequests + stats.approvedSupplyRequests}
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500' }}>Supply Requests</div>
              </div>
              <Package style={{ width: '2.5rem', height: '2.5rem', color: 'var(--purple-200)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--purple-600)', backgroundColor: 'var(--purple-50)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'inline-block' }}>
              {stats.pendingSupplyRequests} To Schedule
            </div>
          </div>
        </div>

        {/* Important Alerts */}
        {recentAlerts.length > 0 && (
          <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--red-500)' }}>
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--red-700)' }}>
                <AlertCircle size={24} />
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
                      backgroundColor: `var(--${alert.color}-50)`, 
                      borderRadius: '0.5rem', 
                      borderLeft: `3px solid var(--${alert.color}-400)` 
                    }}
                  >
                    <div style={{ fontWeight: '600', color: `var(--${alert.color}-800)`, marginBottom: '0.25rem' }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: `var(--${alert.color}-700)` }}>
                      {alert.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
                <button 
                  className="btn" 
                  onClick={() => navigate('/asha/visit-requests')}
                  style={{ 
                    backgroundColor: 'var(--red-600)', 
                    color: 'white', 
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  View Requests ({stats.pendingVisitRequests})
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
                <button 
                  className="btn" 
                  onClick={() => navigate('/asha/home-visits')}
                  style={{ 
                    backgroundColor: 'var(--blue-600)', 
                    color: 'white', 
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  View Schedule
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
                <button 
                  className="btn" 
                  onClick={() => navigate('/asha/maternal-records')}
                  style={{ 
                    backgroundColor: 'var(--green-600)', 
                    color: 'white', 
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
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
                <button 
                  className="btn" 
                  onClick={() => navigate('/asha/health-blogs')}
                  style={{ 
                    backgroundColor: 'var(--purple-600)', 
                    color: 'white', 
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Create Update
                </button>
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