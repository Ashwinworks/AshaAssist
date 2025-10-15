import React, { useEffect, useState } from 'react';
import AnganvaadiLayout from './AnganvaadiLayout';
import { Plus, GraduationCap, Calendar, MapPin, Clock, Users, Edit, Eye, BookOpen } from 'lucide-react';
import { communityAPI } from '../../services/api';

const CommunityClasses: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState<any[]>([]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await communityAPI.listClasses();
      setClasses(res.classes || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load community classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
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
    <AnganvaadiLayout title="Community Classes">
      <div>
        {/* Colorful Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)',
          padding: '2rem',
          borderRadius: '1rem',
          marginBottom: '2rem',
          border: '1px solid #a78bfa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <BookOpen size={32} color="#7c3aed" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#581c87', margin: 0 }}>
              Community Classes
            </h2>
          </div>
          <p style={{ color: '#6b21a8', fontSize: '0.95rem', margin: 0 }}>
            Schedule and manage community health education classes
          </p>
        </div>
        {/* Colorful Header Banner */}
        <div style={{ 
          background: 'var(--indigo-50)',
          padding: '2rem',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
          borderLeft: '4px solid var(--indigo-500)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--indigo-800)', marginBottom: '0.5rem' }}>
                Community Classes
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--indigo-600)' }}>
                Manage educational sessions and community learning programs
              </p>
            </div>
            <GraduationCap size={48} style={{ color: 'var(--indigo-300)' }} />
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
            <div style={{ fontSize: '1.125rem', color: 'var(--gray-600)' }}>Loading community classes...</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {classes.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: 'var(--gray-50)',
                borderRadius: '0.75rem',
                border: '2px dashed var(--gray-200)'
              }}>
                <GraduationCap size={48} style={{ color: 'var(--gray-400)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                  No Community Classes
                </h3>
                <p style={{ color: 'var(--gray-600)' }}>
                  Community classes will appear here once they are scheduled.
                </p>
              </div>
            ) : (
              classes.map((classItem) => (
                <div key={classItem._id} style={{
                  background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(124, 58, 237, 0.1)',
                  border: '1px solid #e9d5ff',
                  borderLeft: `4px solid ${getStatusColor(classItem.status)}`,
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                        {classItem.title}
                      </h3>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: getStatusBgColor(classItem.status),
                        color: getStatusColor(classItem.status)
                      }}>
                        {classItem.status?.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                      <Calendar size={16} />
                      <span style={{ fontSize: '0.875rem' }}>
                        {new Date(classItem.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                      <Clock size={16} />
                      <span style={{ fontSize: '0.875rem' }}>{classItem.time}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                      <MapPin size={16} />
                      <span style={{ fontSize: '0.875rem' }}>{classItem.location}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                      <Users size={16} />
                      <span style={{ fontSize: '0.875rem' }}>
                        {classItem.currentParticipants || 0} / {classItem.maxParticipants} participants
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
                      border: '1px solid var(--indigo-300)',
                      backgroundColor: 'var(--indigo-50)',
                      color: 'var(--indigo-700)',
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

export default CommunityClasses;