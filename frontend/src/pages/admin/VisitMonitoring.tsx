import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Eye, CheckCircle, XCircle, MapPin, Calendar, User, FileText, Image as ImageIcon, Navigation } from 'lucide-react';
import { homeVisitsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const VisitMonitoring: React.FC = () => {
  const [visits, setVisits] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterVerified, setFilterVerified] = useState('');

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filterCategory) params.userCategory = filterCategory;
      if (filterVerified) params.verified = filterVerified === 'true';
      
      const [visitsRes, statsRes] = await Promise.all([
        homeVisitsAPI.getAllVisits(params),
        homeVisitsAPI.getVisitStats()
      ]);
      
      setVisits(visitsRes.visits || []);
      setStats(statsRes);
      setError('');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load visits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [filterCategory, filterVerified]);

  const openDetailModal = (visit: any) => {
    setSelectedVisit(visit);
    setShowDetailModal(true);
  };

  const handleVerify = async (visitId: string, verified: boolean) => {
    try {
      setVerifying(true);
      await homeVisitsAPI.verifyVisit(visitId, verified);
      toast.success(verified ? 'Visit verified' : 'Visit marked as unverified');
      fetchVisits();
      setShowDetailModal(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to verify visit');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AdminLayout title="Visit Monitoring">
      <div>
        {/* Colorful Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
          padding: '2rem',
          borderRadius: '1rem',
          marginBottom: '2rem',
          border: '1px solid #5eead4'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <Navigation size={32} color="#0f766e" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#134e4a', margin: 0 }}>
              Visit Monitoring
            </h2>
          </div>
          <p style={{ color: '#115e59', fontSize: '0.95rem', margin: 0 }}>
            Monitor and verify home visits recorded by ASHA workers
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card" style={{
              padding: '1.5rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #93c5fd'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af', marginBottom: '0.5rem' }}>
                {stats.totalVisitsThisMonth}
              </div>
              <div style={{ color: '#1e3a8a', fontSize: '0.875rem', fontWeight: '600' }}>Total Visits This Month</div>
            </div>
            <div className="card" style={{
              padding: '1.5rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1px solid #86efac'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#166534', marginBottom: '0.5rem' }}>
                {stats.verifiedVisits}
              </div>
              <div style={{ color: '#14532d', fontSize: '0.875rem', fontWeight: '600' }}>Verified Visits</div>
            </div>
            <div className="card" style={{
              padding: '1.5rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '1px solid #fde68a'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#b45309', marginBottom: '0.5rem' }}>
                {stats.pendingVerification}
              </div>
              <div style={{ color: '#78350f', fontSize: '0.875rem', fontWeight: '600' }}>Pending Verification</div>
            </div>
            <div className="card" style={{
              padding: '1.5rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
              border: '1px solid #f9a8d4'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#be185d', marginBottom: '0.5rem' }}>
                {stats.maternityVisits}
              </div>
              <div style={{ color: '#831843', fontSize: '0.875rem', fontWeight: '600' }}>Maternity Visits</div>
            </div>
            <div className="card" style={{
              padding: '1.5rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
              border: '1px solid #c4b5fd'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#6d28d9', marginBottom: '0.5rem' }}>
                {stats.palliativeVisits}
              </div>
              <div style={{ color: '#5b21b6', fontSize: '0.875rem', fontWeight: '600' }}>Palliative Visits</div>
            </div>
          </div>
        )}

        {error && (
          <div className="card" style={{ marginBottom: '1rem', border: '1px solid var(--red-200)', background: 'var(--red-50)', color: 'var(--red-700)', padding: '0.75rem' }}>
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-content" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
              >
                <option value="">All Categories</option>
                <option value="maternity">Maternity</option>
                <option value="palliative">Palliative</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Verification Status
              </label>
              <select
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
              >
                <option value="">All Status</option>
                <option value="true">Verified</option>
                <option value="false">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visits List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Home Visits</h2>
          </div>
          <div className="card-content">
            {loading ? (
              <p style={{ color: 'var(--gray-600)' }}>Loading visits...</p>
            ) : visits.length === 0 ? (
              <p style={{ color: 'var(--gray-600)' }}>No visits found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {visits.map((visit) => (
                  <div
                    key={visit._id}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      background: 'linear-gradient(135deg, #fefefe 0%, #f9fafb 100%)',
                      border: '1px solid #e5e7eb',
                      borderLeft: `4px solid ${visit.verified ? '#16a34a' : '#eab308'}`,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <User size={18} color="var(--gray-700)" />
                          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                            {visit.userName}
                          </h3>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: visit.userCategory === 'maternity' ? 'var(--pink-700)' : 'var(--blue-700)',
                              backgroundColor: visit.userCategory === 'maternity' ? 'var(--pink-50)' : 'var(--blue-50)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              textTransform: 'capitalize'
                            }}
                          >
                            {visit.userCategory}
                          </span>
                          {visit.verified ? (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: 'var(--green-700)',
                                backgroundColor: 'var(--green-50)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <CheckCircle size={12} />
                              Verified
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: 'var(--yellow-700)',
                                backgroundColor: 'var(--yellow-50)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem'
                              }}
                            >
                              Pending Verification
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                              <User size={14} />
                              <span><strong>ASHA Worker:</strong> {visit.ashaWorkerName}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Calendar size={14} />
                              <span><strong>Visit Date:</strong> {new Date(visit.visitDate).toLocaleString()}</span>
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                              <MapPin size={14} />
                              <span>
                                <strong>GPS:</strong>{' '}
                                {visit.gpsLocation?.latitude && visit.gpsLocation?.longitude
                                  ? `${visit.gpsLocation.latitude.toFixed(6)}, ${visit.gpsLocation.longitude.toFixed(6)}`
                                  : 'Not available'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <FileText size={14} />
                              <span><strong>Notes:</strong> {visit.visitNotes.substring(0, 50)}...</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => openDetailModal(visit)}
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: 'white',
                          border: 'none',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          padding: '0.75rem 1.25rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
                        }}
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedVisit && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: 'min(800px, 95vw)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">Visit Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--gray-600)' }}
                >
                  ×
                </button>
              </div>
              <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* User Info */}
                <div style={{ padding: '1rem', backgroundColor: 'var(--blue-50)', borderRadius: '0.5rem' }}>
                  <div style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{selectedVisit.userName}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                    <div><strong>Category:</strong> {selectedVisit.userCategory}</div>
                    <div><strong>Ward:</strong> {selectedVisit.userWard}</div>
                    <div><strong>ASHA Worker:</strong> {selectedVisit.ashaWorkerName}</div>
                    <div><strong>Visit Date:</strong> {new Date(selectedVisit.visitDate).toLocaleString()}</div>
                  </div>
                </div>

                {/* GPS Location */}
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} />
                    GPS Location
                  </h4>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                    {selectedVisit.gpsLocation?.latitude && selectedVisit.gpsLocation?.longitude ? (
                      <>
                        <div><strong>Latitude:</strong> {selectedVisit.gpsLocation.latitude}</div>
                        <div><strong>Longitude:</strong> {selectedVisit.gpsLocation.longitude}</div>
                        <a
                          href={`https://www.google.com/maps?q=${selectedVisit.gpsLocation.latitude},${selectedVisit.gpsLocation.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--blue-600)', textDecoration: 'underline', marginTop: '0.5rem', display: 'inline-block' }}
                        >
                          View on Google Maps
                        </a>
                      </>
                    ) : (
                      <span>GPS location not available</span>
                    )}
                  </div>
                </div>

                {/* Visit Notes */}
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={18} />
                    Visit Notes
                  </h4>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.5rem', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                    {selectedVisit.visitNotes}
                  </div>
                </div>

                {/* Photo */}
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ImageIcon size={18} />
                    Geotagged Photo
                  </h4>
                  {selectedVisit.photoUrl ? (
                    <img
                      src={`http://localhost:5000${selectedVisit.photoUrl}`}
                      alt="Visit photo"
                      style={{ maxWidth: '100%', borderRadius: '0.5rem', border: '1px solid var(--gray-300)' }}
                    />
                  ) : (
                    <div style={{ padding: '2rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.5rem', textAlign: 'center', color: 'var(--gray-600)' }}>
                      No photo available
                    </div>
                  )}
                </div>

                {/* Verification Actions */}
                {!selectedVisit.verified && (
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                    <button
                      onClick={() => handleVerify(selectedVisit._id, true)}
                      disabled={verifying}
                      style={{
                        backgroundColor: verifying ? 'var(--gray-400)' : 'var(--green-600)',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: verifying ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <CheckCircle size={16} />
                      Verify Visit
                    </button>
                    <button
                      onClick={() => handleVerify(selectedVisit._id, false)}
                      disabled={verifying}
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--red-600)',
                        border: '1px solid var(--red-600)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: verifying ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <XCircle size={16} />
                      Mark as Unverified
                    </button>
                  </div>
                )}

                {selectedVisit.verified && (
                  <div style={{ padding: '1rem', backgroundColor: 'var(--green-50)', borderRadius: '0.5rem', color: 'var(--green-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} />
                    <span style={{ fontWeight: '600' }}>This visit has been verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default VisitMonitoring;
