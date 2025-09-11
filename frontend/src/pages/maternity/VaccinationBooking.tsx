import React, { useEffect, useMemo, useState } from 'react';
import MaternityLayout from './MaternityLayout';
import { Calendar, Syringe, MapPin, Clock, Plus, CheckCircle } from 'lucide-react';
import { vaccinationAPI } from '../../services/api';

const VaccinationBooking: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  const [childName, setChildName] = useState('');
  const [myBookings, setMyBookings] = useState<Record<string, any[]>>({});
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await vaccinationAPI.listSchedules({ fromDate: new Date().toISOString().slice(0,10) });
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
      // ignore per-schedule error, don't block UI
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    // Preload user's bookings for displayed schedules so we can show "Already booked" details
    const load = async () => {
      for (const s of schedules) {
        if (!myBookings[s.id]) {
          try { await fetchMyBookings(s.id); } catch (_) {}
        }
      }
    };
    if (schedules.length > 0) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedules]);

  const startBooking = (schedule: any) => {
    setSelectedSchedule(schedule);
    setSelectedVaccines([]);
    setChildName('');
    if (!myBookings[schedule.id]) {
      fetchMyBookings(schedule.id);
    }
  };

  const toggleVaccine = (v: string) => {
    setSelectedVaccines(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    setError(''); setSuccess('');
    try {
      if (!childName.trim()) {
        setError('Please enter child name');
        return;
      }
      if (selectedVaccines.length === 0) {
        setError('Select at least one vaccine');
        return;
      }
      await vaccinationAPI.book(selectedSchedule.id, {
        childName: childName.trim(),
        vaccines: selectedVaccines,
      });
      setSuccess('Booking confirmed');
      await fetchMyBookings(selectedSchedule.id);
      setSelectedVaccines([]);
      setChildName('');
      setSelectedSchedule(null);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to create booking');
    }
  };

  const upcomingCount = useMemo(() => schedules.filter(s => s.status === 'Scheduled').length, [schedules]);

  return (
    <MaternityLayout title="Vaccination Booking">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Book Vaccination Appointments</h2>
        </div>
        <div className="card-content">
          {error && (
            <div className="card" style={{ marginBottom: '1rem', border: '1px solid var(--red-200)', background: 'var(--red-50)' }}>
              <div className="card-content" style={{ color: 'var(--red-700)' }}>{error}</div>
            </div>
          )}
          {success && (
            <div className="card" style={{ marginBottom: '1rem', border: '1px solid var(--green-200)', background: 'var(--green-50)' }}>
              <div className="card-content" style={{ color: 'var(--green-700)' }}>{success}</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
                {upcomingCount}
              </div>
              <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Upcoming Schedules</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Available Vaccination Schedules</h3>
            </div>
            <div className="card-content">
              {loading ? (
                <p style={{ color: 'var(--gray-600)' }}>Loading schedules...</p>
              ) : schedules.length === 0 ? (
                <p style={{ color: 'var(--gray-600)' }}>No upcoming vaccination schedules.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {schedules.map(s => (
                    <div key={s.id} className="card" style={{ padding: '1rem', border: '1px solid var(--gray-200)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <Syringe size={18} color="var(--blue-600)" />
                            <strong>{s.title}</strong>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', color: 'var(--gray-700)', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> {s.date}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {s.time || '—'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {s.location}</div>
                          </div>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>{s.description}</div>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}><strong>Vaccines:</strong> {Array.isArray(s.vaccines) ? s.vaccines.join(', ') : s.vaccines}</div>
                        </div>
                        <div>
                          {(myBookings[s.id]?.length || 0) > 0 ? (
                            <button disabled style={{ background: '#e5e7eb', color: '#6b7280', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', cursor: 'not-allowed' }}>
                              Already booked
                            </button>
                          ) : (
                            <button onClick={() => startBooking(s)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Plus size={16} /> Book
                            </button>
                          )}
                        </div>
                      </div>

                      {((myBookings[s.id]?.length || 0) > 0) && (
                        <div className="card" style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--green-25)', border: '1px solid #d1fae5' }}>
                          <strong>Your booking</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            <div><strong>Child:</strong> {myBookings[s.id][0]?.childName}</div>
                            <div><strong>Vaccines:</strong> {Array.isArray(myBookings[s.id][0]?.vaccines) ? myBookings[s.id][0]?.vaccines.join(', ') : myBookings[s.id][0]?.vaccines}</div>
                            <div style={{ color: 'var(--gray-500)' }}><strong>Booked at:</strong> {myBookings[s.id][0]?.createdAt ? new Date(myBookings[s.id][0]?.createdAt).toLocaleString() : ''}</div>
                          </div>
                        </div>
                      )}

                      {selectedSchedule?.id === s.id && (myBookings[s.id]?.length || 0) === 0 && (
                        <div className="card" style={{ marginTop: '0.75rem', padding: '1rem', background: 'var(--blue-25)' }}>
                          <form onSubmit={submitBooking} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Child Name</label>
                              <input type="text" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Enter child's full name" style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Vaccines</label>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {Array.isArray(s.vaccines) && s.vaccines.map((v: string) => {
                                  const active = selectedVaccines.includes(v);
                                  return (
                                    <button key={v} type="button" onClick={() => toggleVaccine(v)} style={{ border: `1px solid ${active ? '#2563eb' : '#d1d5db'}`, background: active ? '#2563eb' : 'white', color: active ? 'white' : 'var(--gray-700)', padding: '0.4rem 0.6rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                      {v}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem' }}>
                              <button type="submit" style={{ background: '#16a34a', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle size={16} /> Confirm Booking
                              </button>
                              <button type="button" onClick={() => setSelectedSchedule(null)} style={{ border: '1px solid #d1d5db', background: 'white', color: 'var(--gray-700)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                            </div>
                          </form>

                          <div className="card" style={{ marginTop: '1rem', padding: '0.75rem', background: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong>My Bookings for this schedule</strong>
                              <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{bookingsLoading ? 'Loading...' : (myBookings[s.id]?.length || 0)}</span>
                            </div>
                            <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
                              {(myBookings[s.id] || []).map(b => (
                                <div key={b.id} className="card" style={{ padding: '0.75rem', border: '1px solid var(--gray-200)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                      <div style={{ fontWeight: 600 }}>{b.childName}</div>
                                      <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{Array.isArray(b.vaccines) ? b.vaccines.join(', ') : b.vaccines}</div>
                                    </div>
                                    <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</div>
                                  </div>
                                </div>
                              ))}
                              {(myBookings[s.id] || []).length === 0 && !bookingsLoading && (
                                <div style={{ color: 'var(--gray-600)' }}>You have no bookings for this schedule.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MaternityLayout>
  );
};

export default VaccinationBooking;