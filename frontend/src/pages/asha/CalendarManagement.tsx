import React, { useEffect, useMemo, useState } from 'react';
import AshaLayout from './AshaLayout';
import { calendarAPI } from '../../services/api';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  place?: string;
  start: string; // ISO
  end?: string; // ISO
  allDay?: boolean;
  category?: string;
}

const formatISO = (d: Date) => d.toISOString();

const CalendarManagement: React.FC = () => {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [category, setCategory] = useState('');

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

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [monthKey]);

  const openNew = () => {
    setEditing(null);
    setTitle(''); setDescription(''); setPlace('');
    const startDefault = new Date(); startDefault.setMinutes(0,0,0);
    const endDefault = new Date(startDefault); endDefault.setHours(startDefault.getHours() + 1);
    setStart(formatISO(startDefault));
    setEnd(formatISO(endDefault));
    setAllDay(false); setCategory('');
    setModalOpen(true);
  };

  const openEdit = (ev: CalendarEvent) => {
    setEditing(ev);
    setTitle(ev.title || '');
    setDescription(ev.description || '');
    setPlace(ev.place || '');
    setStart(ev.start);
    setEnd(ev.end || ev.start);
    setAllDay(!!ev.allDay);
    setCategory(ev.category || '');
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      if (!title.trim() || !start) { toast.error('Title and start are required'); return; }
      if (editing) {
        await calendarAPI.update(editing.id, { title, description, place, start, end, allDay, category });
        toast.success('Event updated');
      } else {
        await calendarAPI.create({ title, description, place, start, end, allDay, category });
        toast.success('Event created');
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
      const key = new Date(e.start).toISOString().slice(0,10);
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return Object.entries(map).sort((a,b) => a[0].localeCompare(b[0]));
  }, [events]);

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
                          {new Date(ev.start).toLocaleString()} {ev.end ? `- ${new Date(ev.end).toLocaleString()}` : ''}
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
          <div style={{ position: 'fixed', inset: 0 as any, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: 520, background: 'white', padding: '1rem', border: '1px solid var(--gray-200)' }}>
              <div className="card-header">
                <h3 className="card-title">{editing ? 'Edit Event' : 'New Event'}</h3>
              </div>
              <div className="card-content" style={{ display: 'grid', gap: '0.75rem' }}>
                <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <input value={place} onChange={(e)=>setPlace(e.target.value)} placeholder="Place" style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description" rows={3} style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <label style={{ fontSize: 12, color: 'var(--gray-600)' }}>Start</label>
                <input type="datetime-local" value={start.slice(0,16)} onChange={(e)=>setStart(new Date(e.target.value).toISOString())} style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <label style={{ fontSize: 12, color: 'var(--gray-600)' }}>End</label>
                <input type="datetime-local" value={end.slice(0,16)} onChange={(e)=>setEnd(new Date(e.target.value).toISOString())} style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={allDay} onChange={(e)=>setAllDay(e.target.checked)} /> All day
                </label>
                <input value={category} onChange={(e)=>setCategory(e.target.value)} placeholder="Category (optional)" style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button className="btn" onClick={()=>setModalOpen(false)}>Cancel</button>
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