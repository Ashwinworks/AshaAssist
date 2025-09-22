import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MaternityLayout from '../maternity/MaternityLayout';
import PalliativeLayout from '../palliative/PalliativeLayout';
import { calendarAPI } from '../../services/api';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  place?: string;
  date: string; // YYYY-MM-DD
  allDay?: boolean;
  category?: string;
}

// Build a month matrix for the current view
function buildMonthMatrix(year: number, monthIndex: number) {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const startDay = (first.getUTCDay() + 7) % 7; // 0=Sun
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const cells: { date: Date; inMonth: boolean }[] = [];

  // Previous month spill
  for (let i = 0; i < startDay; i++) {
    const d = new Date(Date.UTC(year, monthIndex, 1 - (startDay - i)));
    cells.push({ date: d, inMonth: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(Date.UTC(year, monthIndex, d)), inMonth: true });
  }
  // Next month spill to complete 6 rows * 7 days = 42
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setUTCDate(last.getUTCDate() + 1);
    cells.push({ date: next, inMonth: false });
  }
  return cells;
}

const Calendar: React.FC = () => {
  const location = useLocation();
  const userType = location.pathname.includes('/palliative/') ? 'palliative' : 'maternity';

  const today = new Date();
  // Simplified to month-only view
  const [view] = useState<'month'>('month');
  const [cursor, setCursor] = useState(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthKey = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await calendarAPI.list(monthKey);
        if (!mounted) return;
        setEvents(res.events || []);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load calendar events');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [monthKey]);

  const monthCells = useMemo(() => buildMonthMatrix(cursor.getUTCFullYear(), cursor.getUTCMonth()), [cursor]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(ev => {
      const key = ev.date; // Already in YYYY-MM-DD format
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [events]);

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button onClick={() => setCursor(new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() - 1, 1)))} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={16} /> Prev
        </button>
        <button onClick={() => setCursor(new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1)))} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Next <ChevronRight size={16} />
        </button>
        <button onClick={() => setCursor(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)))} className="btn" style={{ marginLeft: 8 }}>Today</button>
      </div>
      <h3 style={{ margin: 0 }}>
        {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
      </h3>
      <div />
    </div>
  );

  const weekdayHeader = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: 4 }}>
      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
        <div
          key={d}
          style={{
            textAlign: 'center',
            fontWeight: 700,
            color: d === 'Sun' ? 'var(--red-700)' : 'var(--gray-700)'
          }}
        >
          {d}
        </div>
      ))}
    </div>
  );

  const monthView = (
    <div>
      {weekdayHeader}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {monthCells.map(({ date, inMonth }, idx) => {
          const key = date.toISOString().slice(0,10);
          const dayEvents = eventsByDay[key] || [];
          const isToday = new Date().toDateString() === new Date(date).toDateString();
          return (
            <div
              key={idx}
              className="card"
              style={{
                padding: '0.5rem',
                background: inMonth
                  ? (date.getUTCDay() === 0 ? 'rgba(254, 226, 226, 0.6)' : 'white')
                  : 'var(--gray-50)',
                border: isToday
                  ? '2px solid var(--primary-600)'
                  : date.getUTCDay() === 0
                    ? '1px solid var(--red-200)'
                    : '1px solid var(--gray-200)',
                boxShadow: isToday ? '0 0 0 3px rgba(59,130,246,0.2)' : 'none',
                cursor: 'pointer',
                minHeight: 96,
                transition: 'transform 120ms ease, box-shadow 120ms ease',
              }}
              onClick={() => setSelectedDate(date)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = isToday ? '0 0 0 3px rgba(59,130,246,0.2)' : 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 800, color: inMonth ? (date.getUTCDay() === 0 ? 'var(--red-700)' : 'var(--gray-900)') : 'var(--gray-400)' }}>
                  {date.getUTCDate()}
                </span>
                {date.getUTCDay() === 0 && inMonth && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--red-600)', fontWeight: 600 }}>Holiday</span>
                )}
              </div>
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {dayEvents.slice(0,3).map(ev => (
                  <div
                    key={ev.id}
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 6px',
                      borderRadius: 6,
                      background: 'var(--blue-50)',
                      color: 'var(--blue-700)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      border: '1px solid var(--blue-100)'
                    }}
                    title={ev.title}
                  >
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const selectedKey = selectedDate ? selectedDate.toISOString().slice(0,10) : '';
  const selectedList = selectedDate ? (eventsByDay[selectedKey] || []) : [];

  const content = (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Health Events Calendar</h2>
      </div>
      <div className="card-content">
        {header}
        {loading && <div>Loading...</div>}
        {error && !loading && <div style={{ color: 'var(--red-600)' }}>{error}</div>}
        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: selectedDate ? '2fr 1fr' : '1fr', gap: '1rem' }}>
            <div>
              {view === 'month' && monthView}
              {view !== 'month' && (
                <div style={{ padding: '2rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 8, textAlign: 'center', color: 'var(--gray-600)' }}>
                  {view === 'week' ? 'Week view will show here' : 'Day view will show here'}
                </div>
              )}
            </div>
            {selectedDate && (
              <div className="card" style={{ border: '1px solid var(--gray-200)' }}>
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 className="card-title" style={{ margin: 0 }}>{selectedDate.toLocaleDateString()}</h3>
                  <button className="btn" aria-label="Close details" title="Close" onClick={() => setSelectedDate(null)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, padding: 0 }}>
                    <X size={18} />
                  </button>
                </div>
                <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedList.length === 0 && <div style={{ color: 'var(--gray-500)' }}>No events</div>}
                  {selectedList.map(ev => (
                    <div key={ev.id} className="card" style={{ padding: '0.75rem', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontWeight: 700 }}>{ev.title}</div>
                      {ev.place && <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{ev.place}</div>}
                      <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                        {ev.allDay ? 'All day event' : 'Event scheduled'}
                      </div>
                      {ev.description && <p style={{ marginTop: 6 }}>{ev.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (userType === 'palliative') {
    return (
      <PalliativeLayout title={'Calendar'}>
        {content}
      </PalliativeLayout>
    );
  }

  return (
    <MaternityLayout title={'Integrated Calendar'}>
      {content}
    </MaternityLayout>
  );
};

export default Calendar;