import React, { useEffect, useMemo, useState } from 'react';
import MaternityLayout from './MaternityLayout';
import { Calendar, Syringe, MapPin, Clock, CheckCircle, Award, Download } from 'lucide-react';
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
          try { await fetchMyBookings(s.id); } catch (_) {}
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

  const handleDownloadCertificate = (booking: any, schedule: any) => {
    const bookingId = booking?.id;
    setDownloadingId(bookingId);
    try {
      const issuedDate = new Date().toISOString().slice(0,10);
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Vaccination Certificate</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #111827; }
            .header { text-align: center; border-bottom: 3px solid #ec4899; padding-bottom: 16px; margin-bottom: 28px; }
            .title { font-size: 24px; font-weight: 700; color: #ec4899; }
            .subtitle { font-size: 14px; color: #6b7280; }
            .section { margin: 20px 0; }
            .row { margin: 10px 0; }
            .label { font-weight: 600; color: #374151; display: inline-block; width: 180px; }
            .value { color: #111827; }
            .pill { background: #f0f9ff; color: #0c4a6e; padding: 6px 10px; border-radius: 8px; display: inline-block; margin: 4px 6px 0 0; }
            .footer { text-align: center; margin-top: 36px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
            @media print { @page { size: A4 portrait; margin: 12mm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">VACCINATION COMPLETION CERTIFICATE</div>
            <div class="subtitle">Mother and Child Protection Program</div>
          </div>
          <div class="section">
            <div class="row"><span class="label">Child's Name:</span><span class="value">${booking?.childName || '-'}</span></div>
            <div class="row"><span class="label">Vaccination Date:</span><span class="value">${schedule?.date || '-'}</span></div>
            <div class="row"><span class="label">Location:</span><span class="value">${schedule?.location || '-'}</span></div>
            <div class="row"><span class="label">Vaccines:</span><span class="value">${(booking?.vaccines || []).map((v: string) => `<span class='pill'>${v}</span>`).join('')}</span></div>
            <div class="row"><span class="label">Certificate ID:</span><span class="value">${bookingId}</span></div>
            <div class="row"><span class="label">Issued Date:</span><span class="value">${issuedDate}</span></div>
            <div class="row"><span class="label">Status:</span><span class="value">Completed</span></div>
          </div>
          <div class="footer">This certificate confirms the successful completion of vaccination as per the immunization schedule.</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>`;
      const win = window.open('', '_blank');
      if (win) {
        win.document.open('text/html');
        win.document.write(html);
        win.document.close();
      } else {
        alert('Pop-up blocked. Please allow pop-ups to print the certificate.');
      }
    } finally {
      setDownloadingId(null);
    }
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
                                  onClick={() => handleDownloadCertificate(b, s)}
                                  disabled={downloadingId === b.id}
                                  style={{ backgroundColor: '#db2777', color: 'white', padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                  title="Download vaccination certificate (PDF)"
                                >
                                  <Download size={16} /> {downloadingId === b.id ? 'Downloading...' : 'Certificate PDF'}
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
    </MaternityLayout>
  );
};

export default VaccinationBooking;