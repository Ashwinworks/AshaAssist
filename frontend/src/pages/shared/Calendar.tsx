import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MaternityLayout from '../maternity/MaternityLayout';
import PalliativeLayout from '../palliative/PalliativeLayout';
import { calendarAPI } from '../../services/api';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';

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

  // Function to get category color
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'community_class':
        return { bg: '#f5f3ff', border: '#8b5cf6', text: '#6d28d9' };
      case 'local_camp':
        return { bg: '#f0fdf4', border: '#10b981', text: '#047857' };
      case 'vaccination':
        return { bg: '#fffbeb', border: '#f59e0b', text: '#d97706' };
      case 'visit':
        return { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' };
      default:
        return { bg: '#f0f9ff', border: '#0ea5e9', text: '#0369a1' };
    }
  };

  const header = (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      marginBottom: '1.5rem',
      padding: '1rem',
      backgroundColor: '#f8fafc',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          onClick={() => setCursor(new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() - 1, 1)))} 
          className="btn" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: '1px solid #cbd5e1',
            backgroundColor: 'white',
            color: '#334155',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          <ChevronLeft size={18} /> Prev
        </button>
        <button 
          onClick={() => setCursor(new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1)))} 
          className="btn" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: '1px solid #cbd5e1',
            backgroundColor: 'white',
            color: '#334155',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          Next <ChevronRight size={18} />
        </button>
        <button 
          onClick={() => setCursor(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)))} 
          className="btn" 
          style={{ 
            marginLeft: '0.75rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: '1px solid #cbd5e1',
            backgroundColor: 'white',
            color: '#334155',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          Today
        </button>
      </div>
      <h2 style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>
        {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
      </h2>
      <div />
    </div>
  );

  const weekdayHeader = (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(7, 1fr)', 
      gap: '0.25rem', 
      marginBottom: '0.5rem',
      padding: '0.5rem 0'
    }}>
      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
        <div
          key={d}
          style={{
            textAlign: 'center',
            fontWeight: 600,
            color: d === 'Sun' ? '#dc2626' : '#64748b',
            fontSize: '0.875rem',
            padding: '0.5rem 0'
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
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '0.25rem'
      }}>
        {monthCells.map(({ date, inMonth }, idx) => {
          const key = date.toISOString().slice(0,10);
          const dayEvents = eventsByDay[key] || [];
          const isToday = new Date().toDateString() === new Date(date).toDateString();
          return (
            <div
              key={idx}
              className="card"
              style={{
                padding: '0.75rem',
                background: inMonth
                  ? (isToday ? '#dbeafe' : (date.getUTCDay() === 0 ? 'rgba(254, 226, 226, 0.6)' : 'white'))
                  : '#f1f5f9',
                border: isToday
                  ? '2px solid #3b82f6'
                  : date.getUTCDay() === 0
                    ? '1px solid #fecaca'
                    : '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                minHeight: '120px',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow: isToday ? '0 0 0 3px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onClick={() => setSelectedDate(date)}
              onMouseEnter={(e) => { 
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = isToday 
                  ? '0 4px 6px rgba(59, 130, 246, 0.3)' 
                  : '0 4px 6px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => { 
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = isToday 
                  ? '0 0 0 3px rgba(59, 130, 246, 0.3)' 
                  : '0 1px 3px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ 
                  fontWeight: isToday ? 700 : 600, 
                  color: inMonth 
                    ? (isToday ? '#1d4ed8' : (date.getUTCDay() === 0 ? '#dc2626' : '#0f172a'))
                    : '#94a3b8',
                  fontSize: '1rem'
                }}>
                  {date.getUTCDate()}
                </span>
                {date.getUTCDay() === 0 && inMonth && (
                  <span style={{ 
                    fontSize: '0.65rem', 
                    color: '#dc2626', 
                    fontWeight: 600,
                    backgroundColor: '#fee2e2',
                    padding: '0.125rem 0.25rem',
                    borderRadius: '0.25rem'
                  }}>
                    Sun
                  </span>
                )}
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.25rem',
                maxHeight: '70px',
                overflowY: 'auto'
              }}>
                {dayEvents.slice(0,3).map(ev => {
                  const colors = getCategoryColor(ev.category);
                  return (
                  <div
                    key={ev.id}
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      background: colors.bg,
                      color: colors.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      borderLeft: `3px solid ${colors.border}`,
                      fontWeight: 500
                    }}
                    title={ev.title}
                  >
                    {ev.title}
                  </div>
                )})}
                {dayEvents.length > 3 && (
                  <div style={{ 
                    fontSize: '0.7rem', 
                    color: '#64748b',
                    fontWeight: 500,
                    textAlign: 'center'
                  }}>
                    +{dayEvents.length - 3} more
                  </div>
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
        <h2 className="card-title" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          color: '#0f172a'
        }}>
          <CalendarIcon size={24} color="#3b82f6" />
          Health Events Calendar
        </h2>
      </div>
      <div className="card-content">
        {header}
        {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading calendar events...</div>}
        {error && !loading && <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#dc2626',
          backgroundColor: '#fef2f2',
          borderRadius: '0.5rem',
          border: '1px solid #fecaca'
        }}>{error}</div>}
        {!loading && !error && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: selectedDate ? '2fr 1fr' : '1fr', 
            gap: '1.5rem' 
          }}>
            <div>
              {view === 'month' && monthView}
              {view !== 'month' && (
                <div style={{ 
                  padding: '2rem', 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '0.5rem', 
                  textAlign: 'center', 
                  color: '#64748b' 
                }}>
                  {view === 'week' ? 'Week view will show here' : 'Day view will show here'}
                </div>
              )}
            </div>
            {selectedDate && (
              <div className="card" style={{ 
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}>
                <div className="card-header" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '0.5rem 0.5rem 0 0',
                  padding: '1rem'
                }}>
                  <h3 className="card-title" style={{ 
                    margin: 0, 
                    color: '#0f172a',
                    fontWeight: 600
                  }}>
                    {selectedDate.toLocaleDateString(undefined, { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <button 
                    className="btn" 
                    aria-label="Close details" 
                    title="Close" 
                    onClick={() => setSelectedDate(null)} 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '2rem', 
                      height: '2rem', 
                      padding: 0,
                      border: '1px solid #cbd5e1',
                      borderRadius: '0.25rem',
                      backgroundColor: 'white',
                      color: '#64748b',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="card-content" style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}>
                  {selectedList.length === 0 && <div style={{ 
                    color: '#64748b',
                    textAlign: 'center',
                    padding: '2rem'
                  }}>
                    No events scheduled for this day
                  </div>}
                  {selectedList.map(ev => {
                    const colors = getCategoryColor(ev.category);
                    return (
                      <div 
                        key={ev.id} 
                        className="card" 
                        style={{ 
                          padding: '1rem', 
                          border: `1px solid ${colors.border}`,
                          borderRadius: '0.5rem',
                          backgroundColor: colors.bg,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          marginBottom: '0.75rem'
                        }}>
                          <h4 style={{ 
                            margin: 0, 
                            color: colors.text,
                            fontWeight: 600,
                            fontSize: '1rem'
                          }}>
                            {ev.title}
                          </h4>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: colors.text,
                            backgroundColor: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontWeight: 500
                          }}>
                            {ev.category === 'community_class' ? 'Class' : 
                             ev.category === 'local_camp' ? 'Camp' : 
                             ev.category === 'vaccination' ? 'Vaccination' : 
                             ev.category === 'visit' ? 'Visit' : 'Event'}
                          </span>
                        </div>
                        
                        {ev.place && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            marginBottom: '0.5rem',
                            color: '#64748b'
                          }}>
                            <MapPin size={16} />
                            <span style={{ fontSize: '0.875rem' }}>{ev.place}</span>
                          </div>
                        )}
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          color: '#64748b',
                          marginBottom: '0.75rem'
                        }}>
                          <Clock size={16} />
                          <span style={{ fontSize: '0.875rem' }}>
                            {ev.allDay ? 'All day event' : 'Scheduled event'}
                          </span>
                        </div>
                        
                        {ev.description && (
                          <p style={{ 
                            margin: '0.75rem 0 0', 
                            color: '#475569',
                            fontSize: '0.875rem',
                            lineHeight: '1.5'
                          }}>
                            {ev.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
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