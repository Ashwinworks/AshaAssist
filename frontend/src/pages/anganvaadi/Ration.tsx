import React, { useEffect, useState } from 'react';
import AnganvaadiLayout from './AnganvaadiLayout';
import { Package, Calendar, Users, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { weeklyRationAPI } from '../../services/api';

const Ration: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rations, setRations] = useState<any[]>([]);
  const [weekStartDate, setWeekStartDate] = useState('');

  const fetchRationDistribution = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await weeklyRationAPI.getWeeklyRations();
      setRations(data.rations || []);
      setWeekStartDate(data.weekStartDate || '');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load ration distribution data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCollected = async (userId: string) => {
    try {
      await weeklyRationAPI.markCollected(userId);
      // Refresh the list
      fetchRationDistribution();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Failed to mark ration as collected');
    }
  };

  const handleMarkPending = async (userId: string) => {
    try {
      await weeklyRationAPI.markPending(userId);
      // Refresh the list
      fetchRationDistribution();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Failed to mark ration as pending');
    }
  };

  useEffect(() => {
    fetchRationDistribution();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--yellow-500)';
      case 'collected': return 'var(--green-500)';
      default: return 'var(--gray-400)';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--yellow-50)';
      case 'collected': return 'var(--green-50)';
      default: return 'var(--gray-25)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle size={16} />;
      case 'collected': return <CheckCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const pendingRations = rations.filter(r => r.status === 'pending');
  const collectedRations = rations.filter(r => r.status === 'collected');

  return (
    <AnganvaadiLayout title="Ration Distribution">
      <div>
        {/* Colorful Header Banner */}
        <div style={{ 
          background: 'var(--orange-50)',
          padding: '2rem',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
          borderLeft: '4px solid var(--orange-500)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--orange-800)', marginBottom: '0.5rem' }}>
                Ration Distribution
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--orange-600)' }}>
                Manage weekly ration supplies for maternal users for the week of {new Date(weekStartDate).toLocaleDateString()}
              </p>
            </div>
            <Package size={48} style={{ color: 'var(--orange-300)' }} />
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
            <div style={{ fontSize: '1.125rem', color: 'var(--gray-600)' }}>Loading ration distribution data...</div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderLeft: '4px solid var(--yellow-500)' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
                  {pendingRations.length}
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending Collection</div>
              </div>
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderLeft: '4px solid var(--green-500)' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
                  {collectedRations.length}
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Collected</div>
              </div>
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderLeft: '4px solid var(--blue-500)' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
                  {rations.length}
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Users</div>
              </div>
            </div>

            {/* Pending Rations Section */}
            {pendingRations.length > 0 && (
              <>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--yellow-700)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={20} />
                  Pending Collection ({pendingRations.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  {pendingRations.map((ration: any) => (
                    <div key={ration.id} style={{
                      backgroundColor: 'white',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      border: '2px solid var(--yellow-200)',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                            {ration.userName}
                          </h3>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: getStatusBgColor(ration.status),
                            color: getStatusColor(ration.status)
                          }}>
                            {getStatusIcon(ration.status)}
                            {ration.status?.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                          <Users size={16} />
                          <span style={{ fontSize: '0.875rem' }}>{ration.userPhone || 'No phone'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                          <Calendar size={16} />
                          <span style={{ fontSize: '0.875rem' }}>
                            Week: {new Date(ration.weekStartDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ marginTop: '1rem' }}>
                        <button 
                          onClick={() => handleMarkCollected(ration.userId)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            border: 'none',
                            backgroundColor: 'var(--green-600)',
                            color: 'white',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <CheckCircle size={16} />
                          Mark Collected
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Collected Rations Section */}
            {collectedRations.length > 0 && (
              <>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--green-700)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} />
                  Collected ({collectedRations.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                  {collectedRations.map((ration: any) => (
                    <div key={ration.id} style={{
                      backgroundColor: 'white',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      border: '1px solid var(--green-200)',
                      transition: 'all 0.2s ease',
                      opacity: 0.9
                    }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
                            {ration.userName}
                          </h3>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: getStatusBgColor(ration.status),
                            color: getStatusColor(ration.status)
                          }}>
                            {getStatusIcon(ration.status)}
                            {ration.status?.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                          <Users size={16} />
                          <span style={{ fontSize: '0.875rem' }}>{ration.userPhone || 'No phone'}</span>
                        </div>
                        {ration.collectionDate && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                            <Calendar size={16} />
                            <span style={{ fontSize: '0.875rem' }}>
                              Collected: {new Date(ration.collectionDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: '1rem' }}>
                        <button 
                          onClick={() => handleMarkPending(ration.userId)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            border: '1px solid var(--yellow-300)',
                            backgroundColor: 'var(--yellow-50)',
                            color: 'var(--yellow-700)',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <XCircle size={16} />
                          Mark Pending
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {rations.length === 0 && (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: 'var(--gray-50)',
                borderRadius: '0.75rem',
                border: '2px dashed var(--gray-200)'
              }}>
                <Package size={48} style={{ color: 'var(--gray-400)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                  No Maternity Users
                </h3>
                <p style={{ color: 'var(--gray-600)' }}>
                  No maternity users are currently registered for weekly ration distribution.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </AnganvaadiLayout>
  );
};

export default Ration;