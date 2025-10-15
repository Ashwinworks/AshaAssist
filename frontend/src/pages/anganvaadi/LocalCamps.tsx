import React, { useEffect, useState } from 'react';
import AnganvaadiLayout from './AnganvaadiLayout';
import { Plus, MapPin, Calendar, Clock, Users, Edit, Eye, Target } from 'lucide-react';
import { communityAPI } from '../../services/api';

const LocalCamps: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [camps, setCamps] = useState<any[]>([]);

  const fetchCamps = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await communityAPI.listCamps();
      setCamps(res.camps || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load local camps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'var(--blue-500)';
      case 'ongoing': return 'var(--green-500)';
      case 'completed': return 'var(--gray-500)';
      case 'cancelled': return 'var(--red-500)';
      default: return 'var(--gray-400)';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'var(--blue-50)';
      case 'ongoing': return 'var(--green-50)';
      case 'cancelled': return 'var(--red-50)';
      default: return 'var(--gray-25)';
    }
  };

  return (
    <AnganvaadiLayout title="Local Camps">
      <div>
        {/* Colorful Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          padding: '2rem',
          borderRadius: '1rem',
          marginBottom: '2rem',
          border: '1px solid #34d399'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <Target size={32} color="#059669" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#064e3b', margin: 0 }}>
              Local Health Camps
            </h2>
          </div>
          <p style={{ color: '#065f46', fontSize: '0.95rem', margin: 0 }}>
            Organize and manage community health camps and medical check-ups
          </p>
        </div>
        <div style={{ 
          background: 'var(--pink-50)',
          padding: '2rem',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
          borderLeft: '4px solid var(--pink-500)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--pink-800)', marginBottom: '0.5rem' }}>
                Local Health Camps
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--pink-600)' }}>
                View and manage health camps and medical programs in your area
              </p>
            </div>
            <MapPin size={48} style={{ color: 'var(--pink-300)' }} />
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--red-50)',
            color: 'var(--red-700)',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--red-200)'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.125rem', color: 'var(--gray-600)' }}>Loading local camps...</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {camps.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: 'var(--gray-50)',
                borderRadius: '0.75rem',
                border: '2px dashed var(--gray-200)'
              }}>
                <MapPin size={48} style={{ color: 'var(--gray-400)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                  No Local Camps
                </h3>
                <p style={{ color: 'var(--gray-600)' }}>
                  Local camps will appear here once they are scheduled.
                </p>
              </div>
            ) : (
              camps.map((camp) => (
                <div key={camp._id} style={{
                  background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(20, 184, 166, 0.1)',
                  border: '1px solid #99f6e4',
                  borderLeft: `4px solid ${getStatusColor(camp.status)}`,
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                        {camp.title}
                      </h3>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: getStatusBgColor(camp.status),
                        color: getStatusColor(camp.status)
                      }}>
                        {camp.status?.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                      <Calendar size={16} />
                      <span style={{ fontSize: '0.875rem' }}>
                        {new Date(camp.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                      <Clock size={16} />
                      <span style={{ fontSize: '0.875rem' }}>{camp.time}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                      <MapPin size={16} />
                      <span style={{ fontSize: '0.875rem' }}>{camp.location}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                      <Target size={16} />
                      <span style={{ fontSize: '0.875rem' }}>{camp.category}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                      <Users size={16} />
                      <span style={{ fontSize: '0.875rem' }}>
                        Expected: {camp.expectedParticipants || 0}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      border: '1px solid var(--pink-300)',
                      backgroundColor: 'var(--pink-50)',
                      color: 'var(--pink-700)',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}>
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AnganvaadiLayout>
  );
};

export default LocalCamps;