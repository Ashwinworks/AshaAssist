import React, { useEffect, useState } from 'react';
import AnganvaadiLayout from './AnganvaadiLayout';
import { Calendar, Syringe, MapPin, Clock, Users, Eye, CheckCircle } from 'lucide-react';
import { vaccinationAPI } from '../../services/api';

const VaccinationSchedules: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [schedules, setSchedules] = useState<any[]>([]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await vaccinationAPI.listSchedules();
      setSchedules(res.schedules || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load vaccination schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const getStatusColor = (date: string) => {
    const scheduleDate = new Date(date);
    const today = new Date();
    const diffTime = scheduleDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'var(--gray-500)'; // Past
    if (diffDays === 0) return 'var(--green-500)'; // Today
    if (diffDays <= 7) return 'var(--blue-500)'; // This week
    return 'var(--gray-400)'; // Future
  };

  const getStatusBgColor = (date: string) => {
    const scheduleDate = new Date(date);
    const today = new Date();
    const diffTime = scheduleDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'var(--gray-50)'; // Past
    if (diffDays === 0) return 'var(--green-50)'; // Today
    if (diffDays <= 7) return 'var(--blue-50)'; // This week
    return 'var(--gray-25)'; // Future
  };

  const getStatusText = (date: string) => {
    const scheduleDate = new Date(date);
    const today = new Date();
    const diffTime = scheduleDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'TODAY';
    if (diffDays <= 7) return 'UPCOMING';
    return 'SCHEDULED';
  };

  return (
    <AnganvaadiLayout title="Vaccination Schedules">
      <div>
        {/* Colorful Header Banner */}
        <div style={{ 
          background: 'var(--blue-50)',
          padding: '2rem',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
          borderLeft: '4px solid var(--blue-500)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-800)', marginBottom: '0.5rem' }}>
                Vaccination Schedules
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--blue-600)' }}>
                View vaccination schedules and immunization programs
              </p>
            </div>
            <Syringe size={48} style={{ color: 'var(--blue-300)' }} />
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
            <div style={{ fontSize: '1.125rem', color: 'var(--gray-600)' }}>Loading vaccination schedules...</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {schedules.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: 'var(--gray-50)',
                borderRadius: '0.75rem',
                border: '2px dashed var(--gray-200)'
              }}>
                <Syringe size={48} style={{ color: 'var(--gray-400)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                  No Vaccination Schedules
                </h3>
                <p style={{ color: 'var(--gray-600)' }}>
                  Vaccination schedules will appear here once they are created.
                </p>
              </div>
            ) : (
              schedules.map((schedule) => (
                <div key={schedule._id} style={{
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid var(--gray-200)',
                  borderLeft: `4px solid ${getStatusColor(schedule.date)}`,
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                        {schedule.title}
                      </h3>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: getStatusBgColor(schedule.date),
                        color: getStatusColor(schedule.date)
                      }}>
                        {getStatusText(schedule.date)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                      <Calendar size={16} />
                      <span style={{ fontSize: '0.875rem' }}>
                        {new Date(schedule.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                      <Clock size={16} />
                      <span style={{ fontSize: '0.875rem' }}>{schedule.time}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                      <MapPin size={16} />
                      <span style={{ fontSize: '0.875rem' }}>{schedule.location}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                      <Syringe size={16} />
                      <span style={{ fontSize: '0.875rem' }}>
                        Vaccines: {schedule.vaccines || 'Various'}
                      </span>
                    </div>
                  </div>

                  {schedule.description && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.375rem' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', margin: 0 }}>
                        {schedule.description}
                      </p>
                    </div>
                  )}

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      border: '1px solid var(--blue-300)',
                      backgroundColor: 'var(--blue-50)',
                      color: 'var(--blue-700)',
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

export default VaccinationSchedules;