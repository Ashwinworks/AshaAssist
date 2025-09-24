import React, { useEffect, useMemo, useState } from 'react';
import AshaLayout from './AshaLayout';
import { Plus, Calendar, Syringe, MapPin, Clock, Users, Eye, Edit, CheckCircle, XCircle } from 'lucide-react';
import { vaccinationAPI } from '../../services/api';

interface ScheduleForm {
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  vaccines: string; // comma-separated input
  description: string;
}

const VaccinationSchedules: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // View / Edit state
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string>('');
  const [scheduleBookings, setScheduleBookings] = useState<Record<string, number>>({});

  const [editForm, setEditForm] = useState<ScheduleForm>({
    title: '',
    date: '',
    time: '',
    location: '',
    vaccines: '',
    description: ''
  });


  const [form, setForm] = useState<ScheduleForm>({
    title: '',
    date: '',
    time: '',
    location: '',
    vaccines: '',
    description: ''
  });

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await vaccinationAPI.listSchedules();
      setSchedules(res.schedules || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Fetch booking counts for all schedules
  useEffect(() => {
    const fetchBookingCounts = async () => {
      const counts: Record<string, number> = {};
      for (const schedule of schedules) {
        try {
          const res = await vaccinationAPI.listBookings(schedule.id);
          counts[schedule.id] = (res.bookings || []).length;
        } catch (e) {
          counts[schedule.id] = 0;
        }
      }
      setScheduleBookings(counts);
    };
    if (schedules.length > 0) {
      fetchBookingCounts();
    }
  }, [schedules]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const payload = {
        title: form.title || undefined,
        date: form.date,
        time: form.time || undefined,
        location: form.location,
        vaccines: form.vaccines.split(',').map(v => v.trim()).filter(Boolean),
        description: form.description || undefined,
      };
      await vaccinationAPI.createSchedule(payload);
      setSuccess('Schedule published');
      setShowCreateForm(false);
      setForm({ title: '', date: '', time: '', location: '', vaccines: '', description: '' });
      fetchSchedules();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to create schedule');
    }
  };

  const openView = async (schedule: any) => {
    setSelectedSchedule(schedule);
    setShowViewModal(true);
    setBookingsError('');
    setBookings([]);
    try {
      setBookingsLoading(true);
      const res = await vaccinationAPI.listBookings(schedule.id);
      setBookings(res.bookings || []);
    } catch (e: any) {
      setBookingsError(e?.response?.data?.error || 'Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const openEdit = (schedule: any) => {
    setSelectedSchedule(schedule);
    setEditForm({
      title: schedule.title || '',
      date: schedule.date || '',
      time: schedule.time || '',
      location: schedule.location || '',
      vaccines: Array.isArray(schedule.vaccines) ? schedule.vaccines.join(', ') : (schedule.vaccines || ''),
      description: schedule.description || ''
    });
    setShowEditModal(true);
  };

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    setError(''); setSuccess('');
    try {
      await vaccinationAPI.updateSchedule(selectedSchedule.id, {
        title: editForm.title || undefined,
        date: editForm.date || undefined,
        time: editForm.time || undefined,
        location: editForm.location || undefined,
        vaccines: editForm.vaccines.split(',').map(v => v.trim()).filter(Boolean),
        description: editForm.description || undefined,
      });
      setSuccess('Schedule updated');
      setShowEditModal(false);
      setSelectedSchedule(null);
      fetchSchedules();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to update schedule');
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'var(--blue-600)';
      case 'Completed': return 'var(--green-600)';
      case 'Cancelled': return 'var(--red-600)';
      case 'Postponed': return 'var(--yellow-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'var(--blue-50)';
      case 'Completed': return 'var(--green-50)';
      case 'Cancelled': return 'var(--red-50)';
      case 'Postponed': return 'var(--yellow-50)';
      default: return 'var(--gray-50)';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'Booked': return '#2563eb';
      case 'Completed': return '#16a34a';
      case 'Expired': return '#dc2626';
      case 'Cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getBookingStatusBg = (status: string) => {
    switch (status) {
      case 'Booked': return '#dbeafe';
      case 'Completed': return '#dcfce7';
      case 'Expired': return '#fee2e2';
      case 'Cancelled': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  };

  const getBookingStatusIcon = (status: string) => {
    switch (status) {
      case 'Booked': return <Calendar size={14} />;
      case 'Completed': return <CheckCircle size={14} />;
      case 'Expired': return <XCircle size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      default: return <Calendar size={14} />;
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await vaccinationAPI.updateBookingStatus(bookingId, newStatus);
      setSuccess('Booking status updated');
      // Refresh bookings for the current schedule
      if (selectedSchedule) {
        const res = await vaccinationAPI.listBookings(selectedSchedule.id);
        setBookings(res.bookings || []);
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to update booking status');
    }
  };

  return (
    <AshaLayout title="Vaccination Schedules">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', margin: 0 }}>
              Publish and manage vaccination schedules for your community.
            </p>
          </div>
          <button 
            onClick={() => setShowCreateForm(true)}
            style={{ 
              backgroundColor: '#2563eb', 
              color: 'white', 
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
          >
            <Plus size={16} />
            Create New Schedule
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {schedules.filter((s: any) => s.status === 'Scheduled').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Upcoming Schedules</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {schedules.reduce((sum: number, s: any) => sum + (scheduleBookings[s.id] || 0), 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Registrations</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {schedules.filter((s: any) => s.status === 'Completed').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Completed This Month</div>
          </div>
        </div>

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

        {/* Create Schedule Form */}
        {showCreateForm && (
          <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--blue-200)' }}>
            <div className="card-header">
              <h2 className="card-title" style={{ color: 'var(--blue-700)' }}>Create New Vaccination Schedule</h2>
            </div>
            <div className="card-content">
              <form onSubmit={onCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Schedule Title
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter schedule title..."
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Date <span style={{ color: 'var(--red-500)' }}>*</span>
                  </label>
                  <input 
                    type="date" 
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Time
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., 10:00 AM - 4:00 PM"
                    value={form.time}
                    onChange={(e) => setForm({...form, time: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Location <span style={{ color: 'var(--red-500)' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Venue address..."
                    value={form.location}
                    onChange={(e) => setForm({...form, location: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Available Vaccines <span style={{ color: 'var(--red-500)' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., DPT, OPV, Measles (comma-separated)"
                    value={form.vaccines}
                    onChange={(e) => setForm({...form, vaccines: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Description
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Additional details about the vaccination schedule..."
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid var(--gray-300)', 
                      borderRadius: '0.5rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
                  <button 
                    type="submit"
                    style={{ 
                      backgroundColor: '#2563eb', 
                      color: 'white', 
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Publish Schedule
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: '#6b7280', 
                      border: '1px solid #d1d5db',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Vaccination Schedules List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Published Vaccination Schedules</h2>
          </div>
          <div className="card-content">
            {loading ? (
              <p style={{ color: 'var(--gray-600)' }}>Loading vaccination schedules...</p>
            ) : schedules.length === 0 ? (
              <p style={{ color: 'var(--gray-600)' }}>No vaccination schedules created yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {schedules.map((schedule: any) => (
                <div 
                  key={schedule.id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid var(--gray-200)',
                    borderLeft: `4px solid ${getStatusColor(schedule.status)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Syringe size={20} color="var(--blue-600)" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                          {schedule.title}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getStatusColor(schedule.status),
                          backgroundColor: getStatusBg(schedule.status),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {schedule.status}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 1rem', color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                        {schedule.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    {/* Schedule Details */}
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Calendar size={16} color="var(--blue-600)" />
                        <strong style={{ color: 'var(--blue-700)' }}>Schedule Details</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                          <Calendar size={12} />
                          <span>{schedule.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                          <Clock size={12} />
                          <span>{schedule.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={12} />
                          <span>{schedule.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vaccination Info */}
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Syringe size={16} color="var(--green-600)" />
                        <strong style={{ color: 'var(--green-700)' }}>Vaccination Info</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div><strong>Vaccines:</strong> {Array.isArray(schedule.vaccines) ? schedule.vaccines.join(', ') : schedule.vaccines || 'Not specified'}</div>
                      </div>
                    </div>

                    {/* Registration Stats */}
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--purple-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Users size={16} color="var(--purple-600)" />
                        <strong style={{ color: 'var(--purple-700)' }}>Registration Stats</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div><strong>Registered:</strong> {scheduleBookings[schedule.id] || 0} children</div>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          Created: {new Date(schedule.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      Created: {new Date(schedule.createdAt).toLocaleDateString()}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
                      <button 
                        style={{ 
                          backgroundColor: '#2563eb', 
                          color: 'white', 
                          border: 'none',
                          fontSize: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          borderRadius: '0.375rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => openView(schedule)}
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                      <button 
                        style={{ 
                          backgroundColor: '#16a34a', 
                          color: 'white', 
                          border: 'none',
                          fontSize: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          borderRadius: '0.375rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => openEdit(schedule)}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* View Modal */}
        {showViewModal && selectedSchedule && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div className="card" style={{ width: 'min(900px, 95vw)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">Schedule Details</h3>
                <button onClick={() => { setShowViewModal(false); setSelectedSchedule(null); }} style={{ border: 'none', background: 'transparent', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
              </div>
              <div className="card-content" style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <strong>{selectedSchedule.title}</strong>
                  <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{selectedSchedule.description}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  <div><strong>Date:</strong> {selectedSchedule.date}</div>
                  <div><strong>Time:</strong> {selectedSchedule.time || '—'}</div>
                  <div><strong>Location:</strong> {selectedSchedule.location}</div>
                  <div><strong>Status:</strong> {selectedSchedule.status}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Vaccines:</strong> {Array.isArray(selectedSchedule.vaccines) ? selectedSchedule.vaccines.join(', ') : selectedSchedule.vaccines}</div>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong>Bookings</strong>
                    <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{bookings.length} total</span>
                  </div>
                  {bookingsLoading ? (
                    <div style={{ color: 'var(--gray-600)' }}>Loading bookings...</div>
                  ) : bookingsError ? (
                    <div style={{ color: 'var(--red-600)' }}>{bookingsError}</div>
                  ) : bookings.length === 0 ? (
                    <div style={{ color: 'var(--gray-600)' }}>No bookings yet.</div>
                  ) : (
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {bookings.map((b: any) => (
                        <div key={b.id} className="card" style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <div style={{ fontWeight: 600 }}>{b.childName}</div>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  color: getBookingStatusColor(b.status),
                                  backgroundColor: getBookingStatusBg(b.status),
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.25rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}>
                                  {getBookingStatusIcon(b.status)}
                                  {b.status}
                                </span>
                              </div>
                              <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{Array.isArray(b.vaccines) ? b.vaccines.join(', ') : b.vaccines}</div>
                              {b.user && (
                                <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                  Parent: {b.user.name} ({b.user.email})
                                </div>
                              )}
                            </div>
                            <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</div>
                          </div>
                          
                          {/* Status Update Controls */}
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {['Booked', 'Completed', 'Expired', 'Cancelled'].map(status => (
                              <button
                                key={status}
                                onClick={() => updateBookingStatus(b.id, status)}
                                disabled={b.status === status}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.25rem 0.5rem',
                                  border: `1px solid ${getBookingStatusColor(status)}`,
                                  backgroundColor: b.status === status ? getBookingStatusColor(status) : 'white',
                                  color: b.status === status ? 'white' : getBookingStatusColor(status),
                                  borderRadius: '0.25rem',
                                  cursor: b.status === status ? 'not-allowed' : 'pointer',
                                  opacity: b.status === status ? 0.7 : 1,
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (b.status !== status) {
                                    e.currentTarget.style.backgroundColor = getBookingStatusColor(status);
                                    e.currentTarget.style.color = 'white';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (b.status !== status) {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.color = getBookingStatusColor(status);
                                  }
                                }}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button onClick={() => { setShowViewModal(false); setSelectedSchedule(null); }} style={{ border: '1px solid #d1d5db', background: 'white', color: 'var(--gray-700)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedSchedule && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div className="card" style={{ width: 'min(800px, 95vw)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">Edit Schedule</h3>
                <button onClick={() => { setShowEditModal(false); setSelectedSchedule(null); }} style={{ border: 'none', background: 'transparent', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
              </div>
              <div className="card-content">
                <form onSubmit={onUpdate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                    <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date</label>
                    <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Time</label>
                    <input type="text" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Location</label>
                    <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Vaccines (comma-separated)</label>
                    <input type="text" value={editForm.vaccines} onChange={(e) => setEditForm({ ...editForm, vaccines: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                    <textarea rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem', resize: 'vertical' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem' }}>
                    <button type="button" onClick={() => { setShowEditModal(false); setSelectedSchedule(null); }} style={{ border: '1px solid #d1d5db', background: 'white', color: 'var(--gray-700)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ background: '#16a34a', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Save Changes</button>
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

export default VaccinationSchedules;