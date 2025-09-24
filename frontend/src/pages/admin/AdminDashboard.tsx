import React from 'react';
import AdminLayout from './AdminLayout';
import {
  Users,
  UserCheck,
  Activity,
  FileText,
  Calendar,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // Mock data for demonstration
  const dashboardStats = {
    totalUsers: {
      maternal: 156,
      palliative: 89,
      total: 245
    },
    ashaWorkers: {
      active: 1,
      inactive: 0,
      total: 1
    },
    contentStats: {
      healthBlogs: 24,
      vaccinationSchedules: 8,
      communityClasses: 15,
      localCamps: 6
    },
    recentActivity: [
      {
        id: 1,
        type: 'user_registration',
        message: 'New maternal user registered: Priya Sharma',
        time: '2 hours ago',
        icon: UserCheck,
        color: 'var(--green-600)'
      },
      {
        id: 2,
        type: 'content_published',
        message: 'ASHA Meera published new health blog',
        time: '4 hours ago',
        icon: FileText,
        color: 'var(--blue-600)'
      },
      {
        id: 3,
        type: 'feedback_received',
        message: 'New feedback received for ASHA Sunita',
        time: '6 hours ago',
        icon: MessageSquare,
        color: 'var(--yellow-600)'
      },
      {
        id: 4,
        type: 'vaccination_scheduled',
        message: 'Vaccination drive scheduled for Ward 12',
        time: '8 hours ago',
        icon: Calendar,
        color: 'var(--purple-600)'
      }
    ],
    pendingApprovals: {
      healthBlogs: 3,
      vaccinationSchedules: 1,
      communityClasses: 2,
      localCamps: 1
    },
    systemHealth: {
      activeUsers: 89,
      systemUptime: '99.9%',
      responseTime: '1.2s',
      errorRate: '0.1%'
    }
  };

  const getActivityIcon = (activity: any) => {
    const IconComponent = activity.icon;
    return <IconComponent size={16} color={activity.color} />;
  };

  return (
    <AdminLayout title="Admin Dashboard">
      <div>
        {/* Welcome Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
            Welcome to AshaAssist Admin Panel
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem' }}>
            Monitor system performance, manage the ASHA worker, and oversee community health services in Ward 12.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Total Users */}
          <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--blue-500), var(--blue-600))' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <Users size={24} color="white" />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                  {dashboardStats.totalUsers.total}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Total Users</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>
              <span>Maternal: {dashboardStats.totalUsers.maternal}</span>
              <span>Palliative: {dashboardStats.totalUsers.palliative}</span>
            </div>
          </div>

          {/* ASHA Workers */}
          <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--green-500), var(--green-600))' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <UserCheck size={24} color="white" />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                  {dashboardStats.ashaWorkers.active}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>ASHA Worker</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>
              <span>Status: Active</span>
            </div>
          </div>

          {/* Content Published */}
          <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--purple-500), var(--purple-600))' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <FileText size={24} color="white" />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                  {Object.values(dashboardStats.contentStats).reduce((sum, val) => sum + val, 0)}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Content Published</div>
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>
              Blogs, Schedules, Classes & Camps
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--yellow-500), var(--yellow-600))' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <Clock size={24} color="white" />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                  {Object.values(dashboardStats.pendingApprovals).reduce((sum, val) => sum + val, 0)}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Pending Approvals</div>
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>
              Requires your review
            </div>
          </div>
        </div>

        {/* Content Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {dashboardStats.contentStats.healthBlogs}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Health Blogs</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {dashboardStats.contentStats.vaccinationSchedules}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Vaccination Schedules</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {dashboardStats.contentStats.communityClasses}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Community Classes</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--red-600)', marginBottom: '0.5rem' }}>
              {dashboardStats.contentStats.localCamps}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Local Camps</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--blue-600)" />
                Recent Activity
              </h3>
            </div>
            <div className="card-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dashboardStats.recentActivity.map((activity) => (
                  <div 
                    key={activity.id}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      padding: '1rem',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--gray-200)'
                    }}
                  >
                    <div style={{ 
                      padding: '0.5rem', 
                      borderRadius: '0.375rem', 
                      backgroundColor: `${activity.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getActivityIcon(activity)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                        {activity.message}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} color="var(--green-600)" />
                System Health
              </h3>
            </div>
            <div className="card-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Active Users</span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--green-600)' }}>
                    {dashboardStats.systemHealth.activeUsers}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>System Uptime</span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--green-600)' }}>
                    {dashboardStats.systemHealth.systemUptime}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Response Time</span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--blue-600)' }}>
                    {dashboardStats.systemHealth.responseTime}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Error Rate</span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--green-600)' }}>
                    {dashboardStats.systemHealth.errorRate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <button 
                className="btn"
                style={{ 
                  backgroundColor: 'var(--blue-600)', 
                  color: 'white', 
                  border: 'none',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                <Users size={20} />
                Manage ASHA Workers
              </button>
              <button 
                className="btn"
                style={{ 
                  backgroundColor: 'var(--purple-600)', 
                  color: 'white', 
                  border: 'none',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                <FileText size={20} />
                Review Content
              </button>
              <button 
                className="btn"
                style={{ 
                  backgroundColor: 'var(--yellow-600)', 
                  color: 'white', 
                  border: 'none',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                <MessageSquare size={20} />
                View Feedbacks
              </button>
              <button 
                className="btn"
                style={{ 
                  backgroundColor: 'var(--green-600)', 
                  color: 'white', 
                  border: 'none',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                <CheckCircle size={20} />
                Approve Content
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;