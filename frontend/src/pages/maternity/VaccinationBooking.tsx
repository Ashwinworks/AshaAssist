import React, { useEffect, useMemo, useState } from 'react';
import MaternityLayout from './MaternityLayout';
import { Calendar, Syringe, MapPin, Clock, CheckCircle, Award, Download, Eye, X } from 'lucide-react';
import { vaccinationAPI } from '../../services/api';

const VaccinationBooking: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<Record<string, any[]>>({});
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const [childName, setChildName] = useState('');
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBookingId, setPreviewBookingId] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      // Fetch schedules from 1 year ago to show past completed vaccinations
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const res = await vaccinationAPI.listSchedules({ fromDate: oneYearAgo.toISOString().slice(0, 10) });
      setSchedules(res.schedules || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async (scheduleId: string) => {
    try {
      setBookingsLoading(true);
      const res = await vaccinationAPI.listBookings(scheduleId);
      setMyBookings(prev => ({ ...prev, [scheduleId]: res.bookings || [] }));
    } catch (e: any) {
      // ignore per-schedule error
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    const preload = async () => {
      for (const s of schedules) {
        if (!myBookings[s.id]) {
          try { await fetchMyBookings(s.id); } catch (_) { }
        }
      }
    };
    if (schedules.length) preload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedules]);

  const myCompletedFor = (scheduleId: string) => (myBookings[scheduleId] || []).filter(b => b.status === 'Completed');

  const userHasAnyBookingFor = (scheduleId: string) => (myBookings[scheduleId] || []).length > 0;

  const startBooking = (schedule: any) => {
    setActiveScheduleId(schedule.id);
    setChildName('');
    setSelectedVaccines([]);
  };

  const toggleVaccine = (v: string) => {
    setSelectedVaccines(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const submitBooking = async (e: React.FormEvent, schedule: any) => {
    e.preventDefault();
    if (!schedule?.id) return;
    if (!childName.trim()) { alert('Please enter child name'); return; }
    if (selectedVaccines.length === 0) { alert('Select at least one vaccine'); return; }
    try {
      setSubmitting(true);
      await vaccinationAPI.book(schedule.id, { childName: childName.trim(), vaccines: selectedVaccines });
      setSuccess('Booking confirmed');
      await fetchMyBookings(schedule.id);
      setActiveScheduleId(null);
      setChildName('');
      setSelectedVaccines([]);
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreviewCertificate = async (booking: any) => {
    const bookingId = booking?.id;
    if (!bookingId) return;

    setDownloadingId(bookingId);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/vaccination-certificate/${bookingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load certificate');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewBookingId(bookingId);
    } catch (error: any) {
      console.error('Certificate preview error:', error);
      alert(error.message || 'Failed to load certificate. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadFromPreview = () => {
    if (!previewUrl || !previewBookingId) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `vaccination-certificate-${previewBookingId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewBookingId(null);
  };

  return (
    <MaternityLayout title="Vaccination Booking">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Vaccination Schedules</h2>
        </div>
        <div className="card-content">
          {error && (
            <div className="card" style={{ padding: '0.75rem', borderLeft: '4px solid var(--red-600)', marginBottom: '1rem' }}>
              <div style={{ color: 'var(--red-700)' }}>{error}</div>
            </div>
          )}

          {loading ? (
            <p>Loading schedules...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {schedules.map((s) => (
                <div key={s.id} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Syringe size={18} color="#db2777" />
                    <strong>{s.title || 'Vaccination Schedule'}</strong>
                  </div>
                  <div style={{ display: 'grid', gap: '0.25rem', color: 'var(--gray-700)', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} /> {s.date}
                    </div>
                    {s.time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} /> {s.time}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} /> {s.location}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600 }}>Vaccines:</span> {Array.isArray(s.vaccines) ? s.vaccines.join(', ') : '-'}
                    </div>
                  </div>

                  {/* My booking(s) for this schedule */}
                  <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--gray-200)', paddingTop: '0.75rem' }}>
                    {bookingsLoading && !myBookings[s.id] && <div>Loading your bookings...</div>}
                    {myBookings[s.id] && myBookings[s.id].length > 0 ? (
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {myBookings[s.id].map((b) => (
                          <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {b.status === 'Completed' ? <CheckCircle size={16} color="#16a34a" /> : <Clock size={16} color="#475569" />}
                              <div style={{ fontSize: '0.875rem' }}>
                                <div style={{ fontWeight: 600 }}>{b.childName}</div>
                                <div style={{ color: 'var(--gray-600)' }}>{b.vaccines?.join(', ')}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {b.status === 'Completed' && (
                                <button
                                  className="btn"
                                  onClick={() => handlePreviewCertificate(b)}
                                  disabled={downloadingId === b.id}
                                  style={{ backgroundColor: '#db2777', color: 'white', padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                  title="Preview vaccination certificate"
                                >
                                  <Eye size={16} /> {downloadingId === b.id ? 'Loading...' : 'View Certificate'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>No bookings yet for this schedule.</div>
                    )}
                  </div>

                  {/* Booking form (only if user has not booked this schedule) */}
                  {!userHasAnyBookingFor(s.id) && (
                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--gray-200)', paddingTop: '0.75rem' }}>
                      {activeScheduleId !== s.id ? (
                        <button
                          className="btn"
                          onClick={() => startBooking(s)}
                          style={{ backgroundColor: '#16a34a', color: 'white', padding: '0.45rem 0.85rem' }}
                        >
                          Book This Schedule
                        </button>
                      ) : (
                        <form onSubmit={(e) => submitBooking(e, s)} style={{ display: 'grid', gap: '0.5rem' }}>
                          <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Child Name</label>
                            <input
                              value={childName}
                              onChange={(e) => setChildName(e.target.value)}
                              className="input"
                              placeholder="Enter child's name"
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Select Vaccines</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {(Array.isArray(s.vaccines) ? s.vaccines : []).map((v: string) => (
                                <label key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', border: '1px solid var(--gray-200)', padding: '0.35rem 0.5rem', borderRadius: '0.375rem', background: selectedVaccines.includes(v) ? 'var(--primary-50)' : 'white' }}>
                                  <input type="checkbox" checked={selectedVaccines.includes(v)} onChange={() => toggleVaccine(v)} /> {v}
                                </label>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn" type="submit" disabled={submitting} style={{ backgroundColor: '#0ea5e9', color: 'white' }}>
                              {submitting ? 'Booking...' : 'Confirm Booking'}
                            </button>
                            <button type="button" className="btn" onClick={() => setActiveScheduleId(null)} style={{ backgroundColor: 'white', border: '1px solid var(--gray-300)', color: 'var(--gray-800)' }}>Cancel</button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificate Preview Modal */}
      {previewUrl && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '0.75rem', width: '100%', maxWidth: '900px',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: 0, fontWeight: 600, color: '#1f2937' }}>Certificate Preview</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleDownloadFromPreview}
                  className="btn"
                  style={{ backgroundColor: '#16a34a', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Download size={16} /> Download PDF
                </button>
                <button
                  onClick={closePreview}
                  className="btn"
                  style={{ backgroundColor: '#f3f4f6', color: '#374151', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <X size={16} /> Close
                </button>
              </div>
            </div>
            {/* PDF Viewer */}
            <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
              <iframe
                src={previewUrl}
                style={{ width: '100%', height: '70vh', border: 'none' }}
                title="Certificate Preview"
              />
            </div>
          </div>
        </div>
      )}
    </MaternityLayout>
  );
};

export default VaccinationBooking;