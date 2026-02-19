import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnganvaadiLayout from './AnganvaadiLayout';
import { Users, Activity, AlertCircle, BookOpen, MapPin, Package, Syringe } from 'lucide-react';
import { anganvaadiAPI } from '../../services/api';

const AnganvaadiDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    vaccinationsScheduled: number;
    classesToday: number;
    rationDistributions: number;
    campsThisWeek: number;
  }>({
    vaccinationsScheduled: 0,
    classesToday: 0,
    rationDistributions: 0,
    campsThisWeek: 0
  });
  const [updates, setUpdates] = useState<Array<{
    type: string;
    title: string;
    message: string;
    color: string;
  }>>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await anganvaadiAPI.getDashboardStats();
      setStats(data.stats);
      setUpdates(data.updates);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AnganvaadiLayout title="Dashboard">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading dashboard data...</p>
        </div>
      </AnganvaadiLayout>
    );
  }

  return (
    <AnganvaadiLayout title="Dashboard">
      <div>
        {/* Overview Stats */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', marginBottom: '1.5rem' }}>
            Overview of your Anganvaadi center activities and community services.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.25rem' }}>
                  {stats.vaccinationsScheduled}
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500' }}>Vaccinations Scheduled</div>
              </div>
              <Syringe style={{ width: '2.5rem', height: '2.5rem', color: 'var(--green-200)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--green-600)', backgroundColor: 'var(--green-50)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'inline-block' }}>
              This Month
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.25rem' }}>
                  {stats.classesToday}
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500' }}>Classes Today</div>
              </div>
              <BookOpen style={{ width: '2.5rem', height: '2.5rem', color: 'var(--blue-200)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--blue-600)', backgroundColor: 'var(--blue-50)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'inline-block' }}>
              Scheduled
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.25rem' }}>
                  {stats.rationDistributions}
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500' }}>Ration Distributions</div>
              </div>
              <Package style={{ width: '2.5rem', height: '2.5rem', color: 'var(--purple-200)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--purple-600)', backgroundColor: 'var(--purple-50)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'inline-block' }}>
              This Month
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--orange-600)', marginBottom: '0.25rem' }}>
                  {stats.campsThisWeek}
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500' }}>Camps This Week</div>
              </div>
              <MapPin style={{ width: '2.5rem', height: '2.5rem', color: 'var(--orange-200)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--orange-600)', backgroundColor: 'var(--orange-50)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'inline-block' }}>
              Upcoming Events
            </div>
          </div>
        </div>

        {/* Important Alerts */}
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--green-500)' }}>
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--green-700)' }}>
              <AlertCircle size={24} />
              Center Updates
            </h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {updates.map((update, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    backgroundColor: `var(--${update.color}-50)`,
                    borderRadius: '0.5rem',
                    borderLeft: `3px solid var(--${update.color}-400)`
                  }}
                >
                  <div style={{ fontWeight: '600', color: `var(--${update.color}-800)`, marginBottom: '0.25rem' }}>
                    {update.title}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: `var(--${update.color}-700)` }}>
                    {update.message}
                  </div>
                </div>
              ))}
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
              <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--green-100)', backgroundColor: 'var(--green-25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <BookOpen style={{ width: '1.5rem', height: '1.5rem', color: 'var(--green-600)' }} />
                  <h3 style={{ margin: '0', color: 'var(--green-800)', fontSize: '1.125rem', fontWeight: '600' }}>Community Classes</h3>
                </div>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--green-700)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  Organize community classes, educational sessions, and nutritional awareness programs.
                </p>
                <button className="btn" style={{
                  backgroundColor: 'var(--green-600)',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }} onClick={() => navigate('/anganvaadi/community-classes')}>
                  View Classes
                </button>
              </div>

              <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--blue-100)', backgroundColor: 'var(--blue-25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <MapPin style={{ width: '1.5rem', height: '1.5rem', color: 'var(--blue-600)' }} />
                  <h3 style={{ margin: '0', color: 'var(--blue-800)', fontSize: '1.125rem', fontWeight: '600' }}>Local Camps</h3>
                </div>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--blue-700)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  Manage health camps, vaccination drives, and community outreach programs in the area.
                </p>
                <button className="btn" style={{
                  backgroundColor: 'var(--blue-600)',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }} onClick={() => navigate('/anganvaadi/local-camps')}>
                  View Camps
                </button>
              </div>

              <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--purple-100)', backgroundColor: 'var(--purple-25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Package style={{ width: '1.5rem', height: '1.5rem', color: 'var(--purple-600)' }} />
                  <h3 style={{ margin: '0', color: 'var(--purple-800)', fontSize: '1.125rem', fontWeight: '600' }}>Ration Distribution</h3>
                </div>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--purple-700)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  Track and manage weekly ration supplies distribution to maternal users and children.
                </p>
                <button className="btn" style={{
                  backgroundColor: 'var(--purple-600)',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }} onClick={() => navigate('/anganvaadi/ration')}>
                  View Ration
                </button>
              </div>

              <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--orange-100)', backgroundColor: 'var(--orange-25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Syringe style={{ width: '1.5rem', height: '1.5rem', color: 'var(--orange-600)' }} />
                  <h3 style={{ margin: '0', color: 'var(--orange-800)', fontSize: '1.125rem', fontWeight: '600' }}>Vaccination Schedules</h3>
                </div>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--orange-700)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  View immunization schedules, track vaccination records, and manage health programs.
                </p>
                <button className="btn" style={{
                  backgroundColor: 'var(--orange-600)',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }} onClick={() => navigate('/anganvaadi/vaccination-schedules')}>
                  View Schedules
                </button>
              </div>

              <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--pink-100)', backgroundColor: 'var(--pink-25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Users style={{ width: '1.5rem', height: '1.5rem', color: 'var(--pink-600)' }} />
                  <h3 style={{ margin: '0', color: 'var(--pink-800)', fontSize: '1.125rem', fontWeight: '600' }}>PMSMA Approvals</h3>
                </div>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--pink-700)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  Review and approve PMSMA installment applications submitted by mothers.
                </p>
                <button className="btn" style={{
                  backgroundColor: '#ec4899',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }} onClick={() => navigate('/anganvaadi/pmsma-approvals')}>
                  Review Applications
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnganvaadiLayout>
  );
};

export default AnganvaadiDashboard;