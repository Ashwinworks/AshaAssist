import React, { useEffect, useState } from 'react';
import MaternityLayout from './MaternityLayout';
import { Package, Calendar, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { monthlyRationAPI } from '../../services/api';

const MonthlyRation: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ration, setRation] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRationStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await monthlyRationAPI.getMyRationStatus();
      setRation(data.ration);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load ration status');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCollected = async () => {
    try {
      setError('');
      setSuccessMessage('');
      await monthlyRationAPI.markCollected();
      setSuccessMessage('Ration marked as collected successfully!');
      // Refresh the status
      fetchRationStatus();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to mark ration as collected');
    }
  };

  useEffect(() => {
    fetchRationStatus();
  }, []);

  const getMonthName = (monthStartDate: string) => {
    return new Date(monthStartDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <MaternityLayout title="Monthly Ration">
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem' }}>
            Track and collect your monthly ration supplies from the Anganwadi center.
          </p>
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

        {successMessage && (
          <div style={{
            backgroundColor: 'var(--green-50)',
            color: 'var(--green-700)',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--green-200)'
          }}>
            {successMessage}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.125rem', color: 'var(--gray-600)' }}>Loading ration status...</div>
          </div>
        ) : ration ? (
          <div className="card">
            <div className="card-header" style={{ 
              backgroundColor: ration.status === 'collected' ? 'var(--green-50)' : 'var(--yellow-50)',
              borderBottom: `2px solid ${ration.status === 'collected' ? 'var(--green-200)' : 'var(--yellow-200)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 className="card-title" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  color: ration.status === 'collected' ? 'var(--green-800)' : 'var(--yellow-800)'
                }}>
                  <ShoppingBag size={24} />
                  Monthly Ration Status
                </h2>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  backgroundColor: ration.status === 'collected' ? 'var(--green-100)' : 'var(--yellow-100)',
                  color: ration.status === 'collected' ? 'var(--green-700)' : 'var(--yellow-700)'
                }}>
                  {ration.status === 'collected' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {ration.status === 'collected' ? 'COLLECTED' : 'PENDING COLLECTION'}
                </div>
              </div>
            </div>
            <div className="card-content" style={{ padding: '2rem' }}>
              {/* Month Information */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: 'var(--blue-50)',
                borderRadius: '0.5rem',
                border: '1px solid var(--blue-200)'
              }}>
                <Calendar size={20} color="var(--blue-600)" />
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--blue-600)', fontWeight: '500' }}>
                    Current Month
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--blue-800)' }}>
                    {getMonthName(ration.monthStartDate)}
                  </div>
                </div>
              </div>

              {/* Ration Items */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: 'var(--gray-900)', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Package size={20} />
                  Ration Items
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                  gap: '0.75rem' 
                }}>
                  {ration.items?.map((item: string, index: number) => (
                    <div key={index} style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'white',
                      border: '1px solid var(--gray-200)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: 'var(--gray-700)',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--green-500)'
                      }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Collection Information */}
              {ration.collectionDate && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--green-50)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--green-200)',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--green-700)' }}>
                    <CheckCircle size={18} />
                    <span style={{ fontWeight: '600' }}>
                      Collected on: {new Date(ration.collectionDate).toLocaleDateString()} at {new Date(ration.collectionDate).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {ration.status === 'pending' && (
                <div style={{ 
                  padding: '1.5rem', 
                  backgroundColor: 'var(--yellow-50)', 
                  borderRadius: '0.75rem',
                  border: '1px solid var(--yellow-200)'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: 'var(--yellow-800)',
                      marginBottom: '0.5rem'
                    }}>
                      Ready to Collect?
                    </h4>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--yellow-700)',
                      margin: 0
                    }}>
                      Visit your nearest Anganwadi center to collect this month's ration. Mark as collected once you've received your supplies.
                    </p>
                  </div>
                  <button
                    onClick={handleMarkCollected}
                    className="btn"
                    style={{
                      backgroundColor: 'var(--green-600)',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <CheckCircle size={20} />
                    Mark as Collected
                  </button>
                </div>
              )}

              {/* Information Note */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: 'var(--blue-50)',
                borderRadius: '0.5rem',
                border: '1px solid var(--blue-200)'
              }}>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--blue-700)',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  <strong>Note:</strong> Monthly rations are distributed every month from the Anganwadi center. 
                  Please collect your ration during the center's operating hours. For any queries, contact your local Anganwadi worker.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-content" style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: 'var(--gray-600)' 
            }}>
              <Package size={48} style={{ color: 'var(--gray-400)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                No Ration Information
              </h3>
              <p>
                No ration information available for this month. Please contact your Anganwadi worker.
              </p>
            </div>
          </div>
        )}
      </div>
    </MaternityLayout>
  );
};

export default MonthlyRation;
