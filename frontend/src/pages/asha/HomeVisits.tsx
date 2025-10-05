import React, { useEffect, useState } from 'react';
import AshaLayout from './AshaLayout';
import { Home, MapPin, Calendar, Camera, FileText, CheckCircle, Clock, User } from 'lucide-react';
import { homeVisitsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const HomeVisits: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  
  // Form state
  const [visitNotes, setVisitNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await homeVisitsAPI.getUsersForVisits();
      setUsers(res.users || []);
      setError('');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openRecordModal = (user: any) => {
    setSelectedUser(user);
    setVisitNotes('');
    setPhoto(null);
    setPhotoPreview('');
    setGpsLocation(null);
    setShowRecordModal(true);
    
    // Get GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast.success('Location captured');
        },
        (error) => {
          toast.error('Failed to get location. Please enable GPS.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    if (!visitNotes.trim()) {
      toast.error('Please enter visit notes');
      return;
    }
    
    if (!photo) {
      toast.error('Please upload a geotagged photo');
      return;
    }
    
    if (!gpsLocation) {
      toast.error('GPS location not available. Please enable location services.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('userId', selectedUser.id);
      formData.append('visitNotes', visitNotes);
      formData.append('photo', photo);
      formData.append('latitude', gpsLocation.latitude.toString());
      formData.append('longitude', gpsLocation.longitude.toString());
      
      await homeVisitsAPI.recordVisit(formData);
      
      toast.success('Visit recorded successfully!');
      setShowRecordModal(false);
      fetchUsers(); // Refresh the list
      
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to record visit');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    return category === 'maternity' ? 'var(--pink-600)' : 'var(--blue-600)';
  };

  const getCategoryBg = (category: string) => {
    return category === 'maternity' ? 'var(--pink-50)' : 'var(--blue-50)';
  };

  const isOverdue = (lastVisitDate: string | null) => {
    if (!lastVisitDate) return true;
    const daysSinceVisit = Math.floor((Date.now() - new Date(lastVisitDate).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceVisit > 30; // Overdue if more than 30 days
  };

  return (
    <AshaLayout title="Home Visits">
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', margin: 0 }}>
            Record home visits for maternity and palliative care users with geotagged photos.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {users.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Users</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--red-600)', marginBottom: '0.5rem' }}>
              {users.filter(u => isOverdue(u.lastVisitDate)).length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Overdue Visits</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--pink-600)', marginBottom: '0.5rem' }}>
              {users.filter(u => u.category === 'maternity').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Maternity Users</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {users.filter(u => u.category === 'palliative').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Palliative Users</div>
          </div>
        </div>

        {error && (
          <div className="card" style={{ marginBottom: '1rem', border: '1px solid var(--red-200)', background: 'var(--red-50)', color: 'var(--red-700)', padding: '0.75rem' }}>
            {error}
          </div>
        )}

        {/* Users List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Users Requiring Home Visits</h2>
          </div>
          <div className="card-content">
            {loading ? (
              <p style={{ color: 'var(--gray-600)' }}>Loading users...</p>
            ) : users.length === 0 ? (
              <p style={{ color: 'var(--gray-600)' }}>No users found in your ward.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      border: '1px solid var(--gray-200)',
                      borderLeft: `4px solid ${isOverdue(user.lastVisitDate) ? 'var(--red-600)' : 'var(--green-600)'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <User size={20} color="var(--gray-700)" />
                          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                            {user.name}
                          </h3>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: getCategoryColor(user.category),
                              backgroundColor: getCategoryBg(user.category),
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              textTransform: 'capitalize'
                            }}
                          >
                            {user.category}
                          </span>
                          {isOverdue(user.lastVisitDate) && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: 'var(--red-700)',
                                backgroundColor: 'var(--red-50)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem'
                              }}
                            >
                              Overdue
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                          <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <MapPin size={14} />
                              <span><strong>Ward:</strong> {user.ward}</span>
                            </div>
                            <div style={{ marginTop: '0.25rem' }}>
                              <strong>Address:</strong> {user.address}
                            </div>
                          </div>

                          <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Calendar size={14} />
                              <span>
                                <strong>Last Visit:</strong>{' '}
                                {user.lastVisitDate
                                  ? new Date(user.lastVisitDate).toLocaleDateString()
                                  : 'Never visited'}
                              </span>
                            </div>
                            <div style={{ marginTop: '0.25rem' }}>
                              <strong>Total Visits:</strong> {user.totalVisits}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => openRecordModal(user)}
                        style={{
                          backgroundColor: 'var(--green-600)',
                          color: 'white',
                          border: 'none',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--green-700)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--green-600)';
                        }}
                      >
                        <CheckCircle size={16} />
                        Record Visit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Record Visit Modal */}
        {showRecordModal && selectedUser && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: 'min(600px, 95vw)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">Record Home Visit</h3>
                <button
                  onClick={() => setShowRecordModal(false)}
                  style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--gray-600)' }}
                >
                  ×
                </button>
              </div>
              <div className="card-content">
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--blue-50)', borderRadius: '0.5rem' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{selectedUser.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                    <div><strong>Category:</strong> {selectedUser.category}</div>
                    <div><strong>Ward:</strong> {selectedUser.ward}</div>
                    <div><strong>Address:</strong> {selectedUser.address}</div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* GPS Status */}
                  <div style={{ padding: '0.75rem', backgroundColor: gpsLocation ? 'var(--green-50)' : 'var(--yellow-50)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color={gpsLocation ? 'var(--green-600)' : 'var(--yellow-600)'} />
                    <span style={{ fontSize: '0.875rem', color: gpsLocation ? 'var(--green-700)' : 'var(--yellow-700)' }}>
                      {gpsLocation
                        ? `Location captured: ${gpsLocation.latitude.toFixed(6)}, ${gpsLocation.longitude.toFixed(6)}`
                        : 'Capturing GPS location...'}
                    </span>
                  </div>

                  {/* Visit Notes */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                      Visit Notes <span style={{ color: 'var(--red-500)' }}>*</span>
                    </label>
                    <textarea
                      value={visitNotes}
                      onChange={(e) => setVisitNotes(e.target.value)}
                      placeholder="Describe what was discussed, observations, health status, etc..."
                      rows={4}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--gray-300)',
                        borderRadius: '0.5rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                      Geotagged Photo <span style={{ color: 'var(--red-500)' }}>*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--gray-300)',
                        borderRadius: '0.5rem'
                      }}
                    />
                    {photoPreview && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <img
                          src={photoPreview}
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '0.5rem', border: '1px solid var(--gray-300)' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
                    <button
                      type="submit"
                      disabled={submitting || !gpsLocation}
                      style={{
                        backgroundColor: submitting || !gpsLocation ? 'var(--gray-400)' : 'var(--green-600)',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: submitting || !gpsLocation ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <CheckCircle size={16} />
                      {submitting ? 'Recording...' : 'Record Visit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRecordModal(false)}
                      disabled={submitting}
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--gray-600)',
                        border: '1px solid var(--gray-300)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: submitting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AshaLayout>
  );
};

export default HomeVisits;
