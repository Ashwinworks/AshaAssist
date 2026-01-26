import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Clock,
  Package,
  Heart,
  Shield,
  BarChart3
} from 'lucide-react';
import { adminAPI, healthBlogsAPI, communityAPI, vaccinationAPI, supplyAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: {
    maternal: number;
    palliative: number;
    total: number;
  };
  ashaWorkers: {
    active: number;
    inactive: number;
    total: number;
  };
  contentStats: {
    healthBlogs: number;
    vaccinationSchedules: number;
    communityClasses: number;
    localCamps: number;
  };
  supplyStats: {
    totalRequests: number;
    approvedRequests: number;
    pendingRequests: number;
    deliveredSupplies: number;
  };
  recentActivity: Array<{
    id: number;
    type: string;
    message: string;
    time: string;
    icon: any;
    color: string;
  }>;
  pendingApprovals: {
    healthBlogs: number;
    vaccinationSchedules: number;
    communityClasses: number;
    localCamps: number;
  };
  systemHealth: {
    activeUsers: number;
    systemUptime: string;
    responseTime: string;
    errorRate: string;
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: { maternal: 0, palliative: 0, total: 0 },
    ashaWorkers: { active: 0, inactive: 0, total: 0 },
    contentStats: { healthBlogs: 0, vaccinationSchedules: 0, communityClasses: 0, localCamps: 0 },
    supplyStats: { totalRequests: 0, approvedRequests: 0, pendingRequests: 0, deliveredSupplies: 0 },
    recentActivity: [],
    pendingApprovals: { healthBlogs: 0, vaccinationSchedules: 0, communityClasses: 0, localCamps: 0 },
    systemHealth: { activeUsers: 0, systemUptime: '99.9%', responseTime: '1.2s', errorRate: '0.1%' }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [
          maternalUsers,
          palliativeUsers,
          ashaOverview,
          healthBlogs,
          vaccinationSchedules,
          communityClasses,
          localCamps,
          feedbacks,
          supplyRequests
        ] = await Promise.all([
          adminAPI.listUsers({ type: 'user', category: 'maternity' }),
          adminAPI.listUsers({ type: 'user', category: 'palliative' }),
          adminAPI.getAshaOverview(),
          healthBlogsAPI.list(),
          vaccinationAPI.listSchedules(),
          communityAPI.listClasses(),
          communityAPI.listCamps(),
          adminAPI.listAllFeedback(),
          adminAPI.getSupplyRequests()
        ]);

        // Calculate user stats
        const maternalCount = maternalUsers.total || 0;
        const palliativeCount = palliativeUsers.total || 0;
        const totalUsers = maternalCount + palliativeCount;

        // ASHA worker stats
        const ashaActive = ashaOverview.worker?.isActive ? 1 : 0;
        const ashaInactive = ashaActive === 0 ? 1 : 0;

        // Content stats
        const blogsCount = healthBlogs.blogs?.length || 0;
        const schedulesCount = vaccinationSchedules.schedules?.length || 0;
        const classesCount = communityClasses.classes?.length || 0;
        const campsCount = localCamps.camps?.length || 0;

        // Supply stats
        const totalSupplyRequests = supplyRequests.requests?.length || 0;
        const approvedSupplyRequests = supplyRequests.requests?.filter((req: any) => req.status === 'approved').length || 0;
        const pendingSupplyRequests = supplyRequests.requests?.filter((req: any) => req.status === 'pending').length || 0;
        const deliveredSupplies = supplyRequests.requests?.filter((req: any) => req.deliveryStatus === 'delivered').length || 0;

        // Pending approvals (draft content)
        const pendingBlogs = healthBlogs.blogs?.filter((blog: any) => blog.status === 'draft').length || 0;
        const pendingSchedules = vaccinationSchedules.schedules?.filter((schedule: any) => schedule.status === 'draft').length || 0;
        const pendingClasses = communityClasses.classes?.filter((cls: any) => cls.status === 'draft').length || 0;
        const pendingCamps = localCamps.camps?.filter((camp: any) => camp.status === 'draft').length || 0;

        // Recent activity (simplified - using recent feedbacks and content)
        const recentActivity = [];
        if (feedbacks.feedbacks && feedbacks.feedbacks.length > 0) {
          const recentFeedback = feedbacks.feedbacks[0];
          recentActivity.push({
            id: 1,
            type: 'feedback_received',
            message: `New feedback received from ${recentFeedback.userName || 'User'}`,
            time: recentFeedback.createdAt ? new Date(recentFeedback.createdAt).toLocaleString() : 'Recently',
            icon: MessageSquare,
            color: 'var(--yellow-600)'
          });
        }

        if (blogsCount > 0) {
          recentActivity.push({
            id: 2,
            type: 'content_published',
            message: `${blogsCount} health blogs published`,
            time: 'Recently',
            icon: FileText,
            color: 'var(--blue-600)'
          });
        }

        if (schedulesCount > 0) {
          recentActivity.push({
            id: 3,
            type: 'vaccination_scheduled',
            message: `${schedulesCount} vaccination schedules active`,
            time: 'Recently',
            icon: Calendar,
            color: 'var(--purple-600)'
          });
        }

        if (totalUsers > 0) {
          recentActivity.push({
            id: 4,
            type: 'user_registration',
            message: `${totalUsers} total users registered`,
            time: 'Recently',
            icon: UserCheck,
            color: 'var(--green-600)'
          });
        }

        if (totalSupplyRequests > 0) {
          recentActivity.push({
            id: 5,
            type: 'supply_request',
            message: `${totalSupplyRequests} supply requests processed`,
            time: 'Recently',
            icon: Package,
            color: 'var(--blue-600)'
          });
        }

        const newStats = {
          totalUsers: { maternal: maternalCount, palliative: palliativeCount, total: totalUsers },
          ashaWorkers: { active: ashaActive, inactive: ashaInactive, total: 1 },
          contentStats: {
            healthBlogs: blogsCount,
            vaccinationSchedules: schedulesCount,
            communityClasses: classesCount,
            localCamps: campsCount
          },
          supplyStats: {
            totalRequests: totalSupplyRequests,
            approvedRequests: approvedSupplyRequests,
            pendingRequests: pendingSupplyRequests,
            deliveredSupplies: deliveredSupplies
          },
          recentActivity,
          pendingApprovals: {
            healthBlogs: pendingBlogs,
            vaccinationSchedules: pendingSchedules,
            communityClasses: pendingClasses,
            localCamps: pendingCamps
          },
          systemHealth: {
            activeUsers: totalUsers,
            systemUptime: '99.9%',
            responseTime: '1.2s',
            errorRate: '0.1%'
          }
        };

        console.log('Dashboard stats loaded:', newStats);
        setDashboardStats(newStats);

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (activity: any) => {
    const IconComponent = activity.icon;
    return <IconComponent size={16} color={activity.color} />;
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="loading-container" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="loading-spinner" />
          <p>Loading dashboard data...</p>
        </div>
      </AdminLayout>
    );
  }

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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
          minHeight: '200px'
        }}>
          {/* Total Users */}
          <div className="card" style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <Users size={24} color="white" />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                  {dashboardStats.totalUsers.total || 0}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Total Users</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>
              <span>Maternal: {dashboardStats.totalUsers.maternal || 0}</span>
              <span>Palliative: {dashboardStats.totalUsers.palliative || 0}</span>
            </div>
          </div>

          {/* ASHA Workers */}
          <div className="card" style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <UserCheck size={24} color="white" />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                  {dashboardStats.ashaWorkers.active || 0}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>ASHA Worker</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>
              <span>Status: {dashboardStats.ashaWorkers.active > 0 ? 'Active' : 'Inactive'}</span>
            </div>
          </div>

          {/* Content Published */}
          <div className="card" style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <FileText size={24} color="white" />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                  {Object.values(dashboardStats.contentStats).reduce((sum, val) => sum + (val || 0), 0)}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Content Published</div>
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>
              Blogs, Schedules, Classes & Camps
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="card" style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <Clock size={24} color="white" />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                  {Object.values(dashboardStats.pendingApprovals).reduce((sum, val) => sum + (val || 0), 0)}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Pending Approvals</div>
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>
              Requires your review
            </div>
          </div>

          {/* Supply Statistics */}
          <div className="card" style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <Package size={24} color="white" />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                  {dashboardStats.supplyStats.totalRequests || 0}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Supply Requests</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>
              <span>Delivered: {dashboardStats.supplyStats.deliveredSupplies || 0}</span>
              <span>Pending: {dashboardStats.supplyStats.pendingRequests || 0}</span>
            </div>
          </div>
        </div>

        {/* Detailed Statistics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.5rem' }}>
              {dashboardStats.contentStats.healthBlogs || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Health Blogs</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981', marginBottom: '0.5rem' }}>
              {dashboardStats.contentStats.vaccinationSchedules || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Vaccination Schedules</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8b5cf6', marginBottom: '0.5rem' }}>
              {dashboardStats.contentStats.communityClasses || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Community Classes</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444', marginBottom: '0.5rem' }}>
              {dashboardStats.contentStats.localCamps || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Local Camps</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.5rem' }}>
              {dashboardStats.supplyStats.approvedRequests || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Approved Supplies</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#06b6d4', marginBottom: '0.5rem' }}>
              {dashboardStats.supplyStats.deliveredSupplies || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Delivered Supplies</div>
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
                onClick={() => navigate('/admin/asha-management')}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  minHeight: '120px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <Users size={24} />
                Manage ASHA Workers
              </button>
              <button
                className="btn"
                onClick={() => navigate('/admin/content/health-blogs')}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  minHeight: '120px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <FileText size={24} />
                Review Content
              </button>
              <button
                className="btn"
                onClick={() => navigate('/admin/feedbacks')}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  border: 'none',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  minHeight: '120px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <MessageSquare size={24} />
                View Feedbacks
              </button>
              <button
                className="btn"
                onClick={() => navigate('/admin/supply-requests')}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  minHeight: '120px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <CheckCircle size={24} />
                Supply Requests
              </button>
              <button
                className="btn"
                onClick={() => navigate('/admin/ward-analytics')}
                style={{
                  background: 'linear-gradient(135deg, #ec4899, #db2777)',
                  color: 'white',
                  border: 'none',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  minHeight: '120px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <BarChart3 size={24} />
                Ward Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;