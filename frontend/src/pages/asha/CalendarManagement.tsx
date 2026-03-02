import React, { useEffect, useMemo, useState } from 'react';
import AshaLayout from './AshaLayout';
import { calendarAPI, locationsAPI } from '../../services/api';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Users, Send, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  place?: string;
  date: string;
  allDay?: boolean;
  category?: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  userType: string;
  hasEmail: boolean;
}

type NotifyMode = 'all' | 'selected' | 'none';

const USER_TYPE_LABELS: Record<string, string> = {
  maternity_user: 'Maternity',
  palliative_user: 'Palliative',
  asha_worker: 'ASHA Worker',
  admin: 'Admin',
};

const CalendarManagement: React.FC = () => {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);

  // Event fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [category, setCategory] = useState('');

  // Notification targeting
  const [notifyMode, setNotifyMode] = useState<NotifyMode>('all');
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const monthKey = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`;

  const load = async () => {
    try {
      setLoading(true);
      const res = await calendarAPI.list(monthKey);
      setEvents(res.events || []);
      setError('');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      setLocationsLoading(true);
      const res = await locationsAPI.getLocations();
      setLocations(Array.isArray(res.locations) ? res.locations : []);
    } catch {
      setLocations([]);
    } finally {
      setLocationsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await calendarAPI.listUsersForNotification();
      console.log('[CalendarManagement] Users for notification:', res);
      setAllUsers(res.users || []);
      if (!res.users || res.users.length === 0) {
        toast('No users found in the system', { icon: 'ℹ️' });
      }
    } catch (e: any) {
      console.error('[CalendarManagement] fetchUsers error:', e);
      toast.error('Could not load users: ' + (e?.response?.data?.error || e.message || 'Unknown error'));
      setAllUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [monthKey]);
  useEffect(() => { fetchLocations(); /* eslint-disable-next-line */ }, []);

  const openNew = () => {
    setEditing(null);
    setTitle(''); setDescription(''); setPlace('');
    const todayDate = new Date();
    setDate(todayDate.toISOString().slice(0, 10));
    setAllDay(false); setCategory('');
    setNotifyMode('all');
    setSelectedUserIds([]);
    setUserSearch('');
    setModalOpen(true);
    fetchUsers();
  };

  const openEdit = (ev: CalendarEvent) => {
    setEditing(ev);
    setTitle(ev.title || '');
    setDescription(ev.description || '');
    setPlace(ev.place || '');
    setDate(ev.date);
    setAllDay(!!ev.allDay);
    setCategory(ev.category || '');
    // Don't show notify section when editing — notification is for new events only
    setNotifyMode('none');
    setSelectedUserIds([]);
    setModalOpen(true);
  };

  const toggleUser = (id: string) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedUserIds(filteredUsers.map(u => u.id));
  const clearAll = () => setSelectedUserIds([]);

  const filteredUsers = allUsers.filter(u =>
    !userSearch ||
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const submit = async () => {
    try {
      if (!title.trim() || !date) { toast.error('Title and date are required'); return; }

      const selectedDate = new Date(date + 'T00:00:00');
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      if (selectedDate < todayDate) {
        toast.error('Cannot schedule events on past dates');
        return;
      }

      if (!editing && notifyMode === 'selected' && selectedUserIds.length === 0) {
        toast.error('Please select at least one user to notify, or choose "All users" or "No email"');
        return;
      }

      // Build notifyUsers value for new events
      let notifyUsers: 'all' | string[] | 'none' = 'all';
      if (!editing) {
        if (notifyMode === 'none') notifyUsers = 'none';
        else if (notifyMode === 'selected') notifyUsers = selectedUserIds;
      }

      const eventData = { title, description, place, date, allDay, category, ...(!editing ? { notifyUsers } : {}) };

      if (editing) {
        await calendarAPI.update(editing.id, eventData);
        toast.success('Event updated');
      } else {
        await calendarAPI.create(eventData as any);
        const recipientText = notifyMode === 'all'
          ? 'all users'
          : notifyMode === 'selected'
            ? `${selectedUserIds.length} user(s)`
            : 'no one (email skipped)';
        toast.success(`Event created! Email notification sent to ${recipientText}`);
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Save failed');
    }
  };

  const remove = async (ev: CalendarEvent) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await calendarAPI.delete(ev.id);
      toast.success('Event deleted');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Delete failed');
    }
  };

  const grouped = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(e => {
      const key = e.date;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [events]);

  /** Styles */
  const inputStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--gray-300)',
    borderRadius: 8,
    width: '100%',
    boxSizing: 'border-box',
    fontSize: 14,
  };

  const modeBtn = (mode: NotifyMode, icon: React.ReactNode, label: string, sub: string) => (
    <button
      type="button"
      onClick={() => { setNotifyMode(mode); if (mode !== 'selected') setSelectedUserIds([]); }}
      style={{
        flex: 1,
        padding: '10px 8px',
        border: `2px solid ${notifyMode === mode ? 'var(--primary, #1a6b4a)' : 'var(--gray-200)'}`,
        borderRadius: 10,
        background: notifyMode === mode ? '#f0f9f4' : 'white',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4, color: notifyMode === mode ? '#1a6b4a' : '#6b7280' }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 13, color: notifyMode === mode ? '#1a6b4a' : '#374151' }}>{label}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>
    </button>
  );

  return (
    <AshaLayout title="Calendar Management">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn" onClick={() => setCursor(new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() - 1, 1)))}><ChevronLeft size={16} /></button>
            <button className="btn" onClick={() => setCursor(new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1)))}><ChevronRight size={16} /></button>
            <span style={{ fontWeight: 700 }}>{cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</span>
          </div>
          <button className="btn btn-primary" onClick={openNew} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> New Event
          </button>
        </div>

        {loading && <div>Loading...</div>}
        {error && !loading && <div style={{ color: 'var(--red-600)' }}>{error}</div>}

        {!loading && !error && (
          <div className="card" style={{ padding: '1rem' }}>
            {grouped.length === 0 && <div style={{ color: 'var(--gray-600)' }}>No events this month</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {grouped.map(([day, list]) => (
                <div key={day}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{new Date(day).toLocaleDateString()}</div>
                  {list.map(ev => (
                    <div key={ev.id} className="card" style={{ padding: '0.75rem', border: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{ev.title}</div>
                        <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                          {ev.place ? `${ev.place} • ` : ''}
                          {ev.allDay ? 'All day' : 'Event scheduled'}
                        </div>
                        {ev.description && <div style={{ marginTop: 4 }}>{ev.description}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" onClick={() => openEdit(ev)}><Edit2 size={16} /></button>
                        <button className="btn" onClick={() => remove(ev)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0 as any, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: 560, maxHeight: '90vh', overflowY: 'auto', background: 'white', padding: '1.5rem', border: '1px solid var(--gray-200)' }}>
              <div className="card-header" style={{ marginBottom: '1rem' }}>
                <h3 className="card-title">{editing ? 'Edit Event' : 'New Event'}</h3>
              </div>

              {/* Event fields */}
              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" style={inputStyle} />
                <select value={place} onChange={e => setPlace(e.target.value)} disabled={locationsLoading} style={{ ...inputStyle, backgroundColor: 'white' }}>
                  <option value="">{locationsLoading ? 'Loading locations...' : 'Select a location...'}</option>
                  {locations.length === 0 && !locationsLoading && <option value="" disabled>No locations available</option>}
                  {locations.map((loc: any) => (
                    <option key={loc._id} value={loc.name}>{loc.name} {loc.ward ? `(${loc.ward})` : ''}</option>
                  ))}
                </select>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={2} style={inputStyle} />
                <div>
                  <label style={{ fontSize: 12, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={inputStyle} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} /> All day event
                </label>
                <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category (optional)" style={inputStyle} />
              </div>

              {/* Email notification section — only for new events */}
              {!editing && (
                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
                    <Send size={15} color="#1a6b4a" />
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#1a6b4a' }}>Email Notification</span>
                    <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>Who should receive an email?</span>
                  </div>

                  {/* Mode selector */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem' }}>
                    {modeBtn('all', <Users size={18} />, 'All Users', 'Everyone')}
                    {modeBtn('selected', <UserCheck size={18} />, 'Selected', 'Choose users')}
                    {modeBtn('none', <span style={{ fontSize: 18 }}>🔕</span>, 'No Email', 'Skip email')}
                  </div>

                  {/* User picker */}
                  {notifyMode === 'selected' && (
                    <div style={{ border: '1px solid var(--gray-200)', borderRadius: 10, overflow: 'hidden' }}>
                      {/* Search + bulk controls */}
                      <div style={{ padding: '8px 10px', background: '#f8fafb', borderBottom: '1px solid var(--gray-200)', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          value={userSearch}
                          onChange={e => setUserSearch(e.target.value)}
                          placeholder="Search by name or email..."
                          style={{ ...inputStyle, padding: '5px 10px', flex: 1 }}
                        />
                        <button type="button" onClick={selectAll} className="btn" style={{ fontSize: 12, padding: '4px 8px', whiteSpace: 'nowrap' }}>All</button>
                        <button type="button" onClick={clearAll} className="btn" style={{ fontSize: 12, padding: '4px 8px', whiteSpace: 'nowrap' }}>Clear</button>
                      </div>

                      {/* User list */}
                      <div style={{ maxHeight: 220, overflowY: 'auto', padding: '6px 0' }}>
                        {usersLoading && <div style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 13 }}>Loading users...</div>}
                        {!usersLoading && filteredUsers.length === 0 && (
                          <div style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 13 }}>No users found</div>
                        )}
                        {filteredUsers.map(u => (
                          <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', cursor: 'pointer', background: selectedUserIds.includes(u.id) ? '#f0f9f4' : 'white', transition: 'background 0.1s' }}>
                            <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUser(u.id)} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, color: '#1a202c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                              <div style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                            </div>
                            <span style={{ fontSize: 11, background: '#e8f5e9', color: '#1a6b4a', padding: '2px 7px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                              {USER_TYPE_LABELS[u.userType] || u.userType}
                            </span>
                          </label>
                        ))}
                      </div>

                      {/* Selected count */}
                      <div style={{ padding: '6px 14px', background: '#f0f9f4', borderTop: '1px solid #d1fae5', fontSize: 12, color: '#1a6b4a', fontWeight: 600 }}>
                        {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button className="btn" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={submit}>{editing ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AshaLayout>
  );
};

export default CalendarManagement;