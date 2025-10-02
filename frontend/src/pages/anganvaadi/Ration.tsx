import React, { useEffect, useState } from 'react';
import AnganvaadiLayout from './AnganvaadiLayout';
import { Package, Calendar, Users, CheckCircle, AlertCircle, Truck } from 'lucide-react';

const Ration: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [supplyRequests, setSupplyRequests] = useState<any[]>([]);

  const fetchRationDistribution = async () => {
    try {
      setLoading(true);
      setError('');
      // Mock data for weekly ration distribution - maternal users collecting rations
      const mockRationData = [
        {
          id: 1,
          userName: 'Priya Sharma',
          rationType: 'Weekly Maternal Ration',
          scheduledDate: new Date().toISOString().split('T')[0], // Today
          collectionDate: null,
          status: 'scheduled',
          items: ['Rice 2kg', 'Wheat 1kg', 'Lentils 500g', 'Oil 500ml', 'Sugar 500g'],
          phone: '+91-9876543210'
        },
        {
          id: 2,
          userName: 'Meera Patel',
          rationType: 'Weekly Maternal Ration',
          scheduledDate: new Date().toISOString().split('T')[0], // Today
          collectionDate: new Date().toISOString(),
          status: 'collected',
          items: ['Rice 2kg', 'Wheat 1kg', 'Lentils 500g', 'Oil 500ml', 'Sugar 500g'],
          phone: '+91-9876543211'
        },
        {
          id: 3,
          userName: 'Sunita Verma',
          rationType: 'Weekly Maternal Ration',
          scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          collectionDate: null,
          status: 'scheduled',
          items: ['Rice 2kg', 'Wheat 1kg', 'Lentils 500g', 'Oil 500ml', 'Sugar 500g'],
          phone: '+91-9876543212'
        },
        {
          id: 4,
          userName: 'Anjali Gupta',
          rationType: 'Weekly Maternal Ration',
          scheduledDate: new Date().toISOString().split('T')[0], // Today
          collectionDate: new Date().toISOString(),
          status: 'collected',
          items: ['Rice 2kg', 'Wheat 1kg', 'Lentils 500g', 'Oil 500ml', 'Sugar 500g'],
          phone: '+91-9876543213'
        }
      ];
      setSupplyRequests(mockRationData);
    } catch (e: any) {
      setError('Failed to load ration distribution data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRationDistribution();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'var(--blue-500)';
      case 'collected': return 'var(--green-500)';
      default: return 'var(--gray-400)';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'var(--blue-50)';
      case 'collected': return 'var(--green-50)';
      default: return 'var(--gray-25)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar size={16} />;
      case 'collected': return <CheckCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  return (
    <AnganvaadiLayout title="Ration Distribution">
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
              Ration Distribution
            </h1>
            <p style={{ color: 'var(--gray-600)' }}>
              Manage weekly ration supplies for maternal users
            </p>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {supplyRequests.length === 0 ? (
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
                  No Ration Requests
                </h3>
                <p style={{ color: 'var(--gray-600)' }}>
                  Ration distribution requests will appear here once they are submitted.
                </p>
              </div>
            ) : (
              supplyRequests.map((request) => (
                <div key={request.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid var(--gray-200)',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                        {request.rationType}
                      </h3>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: getStatusBgColor(request.status),
                        color: getStatusColor(request.status)
                      }}>
                        {getStatusIcon(request.status)}
                        {request.status?.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                      <Users size={16} />
                      <span style={{ fontSize: '0.875rem' }}>{request.userName}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', marginBottom: request.collectionDate ? '0.75rem' : '0' }}>
                      <Calendar size={16} />
                      <span style={{ fontSize: '0.875rem' }}>
                        Scheduled: {new Date(request.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>

                    {request.collectionDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                        <CheckCircle size={16} />
                        <span style={{ fontSize: '0.875rem' }}>
                          Collected: {new Date(request.collectionDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.375rem' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', margin: '0 0 0.5rem', fontWeight: '600' }}>
                      Ration Items:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {request.items.map((item: string, index: number) => (
                        <span key={index} style={{
                          fontSize: '0.75rem',
                          color: 'var(--gray-600)',
                          backgroundColor: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          border: '1px solid var(--gray-200)'
                        }}>
                          {item}
                        </span>
                      ))}
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
                      border: '1px solid var(--gray-300)',
                      backgroundColor: 'white',
                      color: 'var(--gray-700)',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}>
                      <CheckCircle size={16} />
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

export default Ration;