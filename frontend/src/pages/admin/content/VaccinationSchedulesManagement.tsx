import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../AdminLayout';
import {
  Search,
  Eye,
  Trash2,
  Calendar,
  Syringe,
  MapPin,
  Users
} from 'lucide-react';
import { adminAPI, vaccinationAPI } from '../../../services/api';

const VaccinationSchedulesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Array<any>>([]);
  const [openBookingsFor, setOpenBookingsFor] = useState<string | null>(null);
  const [bookingsMap, setBookingsMap] = useState<Record<string, any[]>>({});
  const [bookingsLoading, setBookingsLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminAPI.getVaccinationOverview();
        setSchedules(data.schedules || []);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load vaccination overview');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredSchedules = useMemo(() => {
    const list = schedules || [];
    return list.filter((schedule: any) => {
      const matchesSearch = (schedule.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (schedule.location || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (filterStatus === 'all') return matchesSearch;
      return matchesSearch && (schedule.status || 'Scheduled').toLowerCase() === filterStatus.toLowerCase();
    });
  }, [schedules, searchTerm, filterStatus]);

  const getScheduleStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'var(--blue-600)';
      case 'Completed': return 'var(--green-600)';
      case 'Cancelled': return 'var(--red-600)';
      default: return 'var(--gray-600)';
    }
  };

  const handleDelete = (scheduleId: string) => {
    console.log(`Deleting schedule ${scheduleId}`);
  };

  const totals = useMemo(() => {
    let total = 0, booked = 0, completed = 0, expired = 0, cancelled = 0;
    for (const s of schedules) {
      total += s?.stats?.totalBookings || 0;
      booked += s?.stats?.booked || 0;
      completed += s?.stats?.completed || 0;
      expired += s?.stats?.expired || 0;
      cancelled += s?.stats?.cancelled || 0;
    }
    return { total, booked, completed, expired, cancelled };
  }, [schedules]);

  const toggleBookings = async (scheduleId: string) => {
    if (openBookingsFor === scheduleId) {
      setOpenBookingsFor(null);
      return;
    }
    setOpenBookingsFor(scheduleId);
    if (!bookingsMap[scheduleId]) {
      try {
        setBookingsLoading(prev => ({ ...prev, [scheduleId]: true }));
        const res = await vaccinationAPI.listBookings(scheduleId);
        setBookingsMap(prev => ({ ...prev, [scheduleId]: res.bookings || [] }));
      } catch (e) {
        // Silently fail in UI; could add a toast if available
        setBookingsMap(prev => ({ ...prev, [scheduleId]: [] }));
      } finally {
        setBookingsLoading(prev => ({ ...prev, [scheduleId]: false }));
      }
    }
  };

  return (
    <AdminLayout title="Vaccination Schedules Management">
      <div>
        {loading && (
          <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>Loading...</div>
        )}
        {error && (
          <div className="card" style={{ padding: '1rem', marginBottom: '1rem', borderLeft: '4px solid var(--red-600)' }}>
            <div style={{ color: 'var(--red-700)' }}>{error}</div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-content" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '300px' }}>
                <Search size={20} color="var(--gray-400)" />
                <input
                  type="text"
                  placeholder="Search schedules by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  minWidth: '130px'
                }}
              >
                <option value="all">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {schedules.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Schedules</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {totals.total}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Bookings</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {totals.completed}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Completed</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {totals.booked}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Booked (Pending)</div>
          </div>
        </div>

        {/* Vaccination Schedules List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Vaccination Schedules</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredSchedules.map((schedule: any) => (
                <div
                  key={schedule.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    border: '1px solid var(--gray-200)'
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
                          color: getScheduleStatusColor(schedule.status),
                          backgroundColor: `${getScheduleStatusColor(schedule.status)}20`,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {schedule.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Calendar size={16} color="var(--blue-600)" />
                        <strong style={{ color: 'var(--blue-700)' }}>Schedule Details</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Date: {schedule.date || '-'}</div>
                        <div>Time: {schedule.time || '-'}</div>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <MapPin size={16} color="var(--green-600)" />
                        <strong style={{ color: 'var(--green-700)' }}>Location</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Location: {schedule.location || '-'}</div>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--purple-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Users size={16} color="var(--purple-600)" />
                        <strong style={{ color: 'var(--purple-700)' }}>Bookings</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Total: {schedule.stats?.totalBookings ?? 0}</div>
                        <div>Booked: {schedule.stats?.booked ?? 0}</div>
                        <div>Completed: {schedule.stats?.completed ?? 0}</div>
                        <div>Expired: {schedule.stats?.expired ?? 0}</div>
                        <div>Cancelled: {schedule.stats?.cancelled ?? 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                    <button
                      className="btn"
                      style={{
                        backgroundColor: '#1d4ed8',
                        color: 'white',
                        border: '1px solid #1e40af',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 2px 6px rgba(29, 78, 216, 0.35)'
                      }}
                      onClick={() => toggleBookings(schedule.id)}
                    >
                      <Eye size={14} />
                      {openBookingsFor === schedule.id ? 'Hide Bookings' : 'View Bookings'}
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="btn"
                      style={{
                        backgroundColor: 'var(--red-600)',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>

                  {openBookingsFor === schedule.id && (
                    <div className="card" style={{ marginTop: '0.75rem', padding: '0.75rem', border: '1px solid var(--gray-200)' }}>
                      {bookingsLoading[schedule.id] ? (
                        <div>Loading bookings...</div>
                      ) : (
                        <div style={{ overflowX: 'auto' }}>
                          <table className="table" style={{ width: '100%' }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>User</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Email</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Child Name</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Vaccines</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Booked At</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(bookingsMap[schedule.id] || []).map((b: any) => (
                                <tr key={b.id}>
                                  <td style={{ padding: '0.5rem' }}>{b.user?.name || '—'}</td>
                                  <td style={{ padding: '0.5rem' }}>{b.user?.email || '—'}</td>
                                  <td style={{ padding: '0.5rem' }}>{b.childName || '—'}</td>
                                  <td style={{ padding: '0.5rem' }}>{Array.isArray(b.vaccines) ? b.vaccines.join(', ') : '—'}</td>
                                  <td style={{ padding: '0.5rem' }}>{b.status}</td>
                                  <td style={{ padding: '0.5rem' }}>{b.createdAt ? new Date(b.createdAt).toLocaleString() : '—'}</td>
                                </tr>
                              ))}
                              {(!bookingsMap[schedule.id] || bookingsMap[schedule.id].length === 0) && (
                                <tr>
                                  <td style={{ padding: '0.75rem', color: 'var(--gray-600)' }} colSpan={6}>No bookings yet.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {(!loading && !error && filteredSchedules.length === 0) && (
                <div className="card" style={{ padding: '1rem', textAlign: 'center', color: 'var(--gray-600)' }}>No schedules found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default VaccinationSchedulesManagement;