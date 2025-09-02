import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import {
  UserCheck,
  UserX,
  Phone,
  MapPin,
  Calendar,
  Users,
  Activity,
  Star,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { adminAPI } from '../../services/api';

interface AshaOverview {
  worker: {
    id: string;
    name: string;
    email: string;
    phone: string;
    ward: string;
    isActive: boolean;
    createdAt?: string;
    lastLogin?: string;
  };
  stats: {
    totalFeedbacks: number;
    averageRating: number;
    complaintsReceived: number;
  };
}

const AshaManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AshaOverview | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await adminAPI.getAshaOverview();
        setOverview(data);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load ASHA overview');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (isActive: boolean) => (isActive ? 'var(--green-600)' : 'var(--red-600)');
  const getStatusBg = (isActive: boolean) => (isActive ? 'var(--green-50)' : 'var(--red-50)');
  const getStatusIcon = (isActive: boolean) => (isActive ? <CheckCircle size={16} /> : <XCircle size={16} />);

  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '—');

  return (
    <AdminLayout title="ASHA Worker Management">
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.0rem', margin: 0 }}>
            Manage the ASHA worker profile, monitor performance, and track activity.
          </p>
        </div>

        {loading && (
          <div className="loading-container" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="loading-spinner" />
            <p>Loading...</p>
          </div>
        )}

        {error && (
          <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--red-600)', marginBottom: '1rem' }}>
            <p style={{ color: 'var(--red-700)', margin: 0 }}>{error}</p>
          </div>
        )}

        {!loading && !error && overview && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  {getStatusIcon(overview.worker.isActive)}
                  <strong>Status</strong>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: 600,
                  color: getStatusColor(overview.worker.isActive),
                  backgroundColor: getStatusBg(overview.worker.isActive),
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem'
                }}>
                  {overview.worker.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Star size={16} color="var(--yellow-600)" />
                  <strong>Average Rating</strong>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{overview.stats.averageRating.toFixed(1)}</div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>{overview.stats.totalFeedbacks} feedbacks</div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <MessageSquare size={16} color="var(--red-600)" />
                  <strong>Complaints Received</strong>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--red-700)' }}>{overview.stats.complaintsReceived}</div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Ratings 2 or below</div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Users size={16} color="var(--blue-600)" />
                  <strong>Ward</strong>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--blue-700)' }}>{overview.worker.ward || '—'}</div>
              </div>
            </div>

            {/* Profile */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">ASHA Worker Profile</h2>
              </div>
              <div className="card-content">
                <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--gray-200)', borderLeft: `4px solid ${getStatusColor(overview.worker.isActive)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <UserCheck size={20} color="var(--green-600)" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                          {overview.worker.name}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: getStatusColor(overview.worker.isActive),
                          backgroundColor: getStatusBg(overview.worker.isActive),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {getStatusIcon(overview.worker.isActive)}
                          {overview.worker.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-700)' }}>
                        <div><strong>Email:</strong> {overview.worker.email}</div>
                        <div><strong>Phone:</strong> {overview.worker.phone}</div>
                        <div><strong>Ward:</strong> {overview.worker.ward}</div>
                        <div><strong>Joined:</strong> {fmt(overview.worker.createdAt)}</div>
                        <div><strong>Last Login:</strong> {fmt(overview.worker.lastLogin)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                    <button
                      className="btn"
                      style={{
                        backgroundColor: overview.worker.isActive ? 'var(--red-600)' : 'var(--green-600)',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: 0.6,
                        cursor: 'not-allowed'
                      }}
                      title="Activate/Deactivate coming soon"
                      disabled
                    >
                      {overview.worker.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                      {overview.worker.isActive ? 'Deactivate Account' : 'Activate Account'}
                    </button>
                    <a
                      className="btn"
                      href={`tel:${overview.worker.phone}`}
                      style={{
                        backgroundColor: 'var(--purple-600)',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        textDecoration: 'none'
                      }}
                    >
                      <Phone size={14} />
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AshaManagement;