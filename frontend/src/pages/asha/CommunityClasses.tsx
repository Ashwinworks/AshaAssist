import React, { useEffect, useMemo, useState } from 'react';
import AshaLayout from './AshaLayout';
import { Plus, GraduationCap, Calendar, MapPin, Clock, Users, Edit, Eye } from 'lucide-react';
import { communityAPI, locationsAPI } from '../../services/api';

const CommunityClasses: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: '',
    date: '',
    time: '',
    location: '',
    instructor: '',
    maxParticipants: '',
    targetAudience: '',
    topics: '',
    description: ''
  });
  const [viewing, setViewing] = useState<any | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '', category: '', date: '', time: '', location: '', instructor: '', maxParticipants: '', targetAudience: '', topics: '', description: ''
  });

  const communityClasses = classes;

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await communityAPI.listClasses();
      setClasses(res.classes || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      setLocationsLoading(true);
      const res = await locationsAPI.getLocations();
      if (res.locations && Array.isArray(res.locations)) {
        setLocations(res.locations);
      } else {
        setLocations([]);
      }
    } catch (e: any) {
      console.error('Failed to load locations:', e?.response?.data?.error || e.message);
      setLocations([]);
    } finally {
      setLocationsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchLocations();
  }, []);

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Maternity Care': return 'var(--pink-600)';
      case 'Child Health': return 'var(--green-600)';
      case 'Palliative Care': return 'var(--blue-600)';
      case 'Reproductive Health': return 'var(--purple-600)';
      default: return 'var(--gray-600)';
    }
  };

  return (
    <AshaLayout title="Community Class Details">
      <div>
        {error && (
          <div className="card" style={{ border: '1px solid var(--red-200)', background: 'var(--red-50)', color: 'var(--red-700)', padding: '0.75rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', margin: 0 }}>
              Organize and announce health education classes for your community.
            </p>
          </div>
          <button 
            className="btn"
            onClick={() => setShowCreateForm(true)}
            style={{ 
              backgroundColor: 'var(--purple-600)', 
              color: 'white', 
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            <Plus size={16} />
            Create New Class
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {communityClasses.filter(c => c.status === 'Scheduled').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Upcoming Classes</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {communityClasses.reduce((sum, c) => sum + c.registeredParticipants, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Registrations</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {communityClasses.filter(c => c.status === 'Completed').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Completed This Month</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {Math.round(communityClasses.reduce((sum, c) => sum + (c.registeredParticipants / c.maxParticipants), 0) / communityClasses.length * 100)}%
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Average Attendance</div>
          </div>
        </div>

        {/* Create Class Form */}
        {showCreateForm && (
          <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--purple-200)' }}>
            <div className="card-header">
              <h2 className="card-title" style={{ color: 'var(--purple-700)' }}>Create New Community Class</h2>
            </div>
            <div className="card-content">
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setError('');
                    const created = await communityAPI.createClass({
                      title: form.title,
                      category: form.category || 'General Health',
                      date: form.date,
                      time: form.time,
                      location: form.location,
                      instructor: form.instructor,
                      maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
                      targetAudience: form.targetAudience,
                      description: form.description,
                      topics: form.topics ? form.topics.split(',').map(t => t.trim()).filter(Boolean) : []
                    });
                    // Show immediately
                    if (created?.class) {
                      setClasses(prev => [created.class, ...prev]);
                    }
                    setShowCreateForm(false);
                    setForm({ title: '', category: '', date: '', time: '', location: '', instructor: '', maxParticipants: '', targetAudience: '', topics: '', description: '' });
                    // Optionally refresh for consistency
                    // fetchClasses();
                  } catch (err: any) {
                    setError(err?.response?.data?.error || 'Failed to publish class');
                  }
                }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}
              >
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Class Title
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter class title..."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Category
                  </label>
                  <select 
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  >
                    <option value="">Select category...</option>
                    <option value="maternity">Maternity Care</option>
                    <option value="child">Child Health</option>
                    <option value="palliative">Palliative Care</option>
                    <option value="reproductive">Reproductive Health</option>
                    <option value="general">General Health</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Date
                  </label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Time
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., 3:00 PM - 5:00 PM"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Location
                    {!locationsLoading && locations.length > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginLeft: '0.5rem' }}>
                        ({locations.length} available)
                      </span>
                    )}
                  </label>
                  <select
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    disabled={locationsLoading}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem', backgroundColor: 'white' }}
                  >
                    <option value="">{locationsLoading ? 'Loading locations...' : 'Select a location...'}</option>
                    {locations.length === 0 && !locationsLoading && (
                      <option value="" disabled>No locations available</option>
                    )}
                    {locations.map((loc: any) => (
                      <option key={loc._id} value={loc.name}>
                        {loc.name} {loc.ward ? `(${loc.ward})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Instructor
                  </label>
                  <input 
                    type="text" 
                    placeholder="Instructor name and credentials"
                    value={form.instructor}
                    onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Max Participants
                  </label>
                  <input 
                    type="number" 
                    placeholder="Maximum number of participants"
                    value={form.maxParticipants}
                    onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Target Audience
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., Pregnant women and families"
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Topics to be Covered
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., Balanced Diet, Iron & Folic Acid, Weight Management"
                    value={form.topics}
                    onChange={(e) => setForm({ ...form, topics: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Description
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Detailed description of the class..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                    className="btn"
                    style={{ 
                      backgroundColor: 'var(--purple-600)', 
                      color: 'white', 
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    Publish Class
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn"
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: 'var(--gray-600)', 
                      border: '1px solid var(--gray-300)',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Community Classes List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Published Community Classes</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {communityClasses.map((classItem) => (
                <div 
                  key={classItem.id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid var(--gray-200)',
                    borderLeft: `4px solid ${getStatusColor(classItem.status)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <GraduationCap size={20} color="var(--purple-600)" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                          {classItem.title}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getCategoryColor(classItem.category),
                          backgroundColor: `${getCategoryColor(classItem.category)}20`,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {classItem.category}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getStatusColor(classItem.status),
                          backgroundColor: getStatusBg(classItem.status),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {classItem.status}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 1rem', color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                        {classItem.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    {/* Class Details */}
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Calendar size={16} color="var(--blue-600)" />
                        <strong style={{ color: 'var(--blue-700)' }}>Class Details</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                          <Calendar size={12} />
                          <span>{classItem.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                          <Clock size={12} />
                          <span>{classItem.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={12} />
                          <span>{classItem.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Instructor & Audience */}
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <GraduationCap size={16} color="var(--green-600)" />
                        <strong style={{ color: 'var(--green-700)' }}>Instructor & Audience</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div><strong>Instructor:</strong> {classItem.instructor}</div>
                        <div><strong>Target:</strong> {classItem.targetAudience}</div>
                      </div>
                    </div>

                    {/* Registration Stats */}
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--purple-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Users size={16} color="var(--purple-600)" />
                        <strong style={{ color: 'var(--purple-700)' }}>Registration</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div><strong>Capacity:</strong> {classItem.maxParticipants} participants</div>
                        <div><strong>Registered:</strong> {classItem.registeredParticipants} participants</div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ 
                            width: '100%', 
                            height: '6px', 
                            backgroundColor: 'var(--gray-200)', 
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${(classItem.registeredParticipants / classItem.maxParticipants) * 100}%`, 
                              height: '100%', 
                              backgroundColor: 'var(--purple-600)',
                              borderRadius: '3px'
                            }} />
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                            {Math.round((classItem.registeredParticipants / classItem.maxParticipants) * 100)}% filled
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Topics */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--gray-700)', fontSize: '0.875rem' }}>Topics to be Covered:</strong>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {classItem.topics.map((topic: string, index: number) => (
                        <span 
                          key={index}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: 'var(--blue-700)',
                            backgroundColor: 'var(--blue-50)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid var(--blue-200)'
                          }}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      Published: {classItem.publishedDate} • Last updated: {classItem.lastUpdated}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
                      <button 
                        className="btn"
                        style={{ 
                          backgroundColor: 'var(--blue-600)', 
                          color: 'white', 
                          border: 'none',
                          fontSize: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      onClick={() => setViewing(classItem)}
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                      <button 
                        className="btn"
                        onClick={() => {
                          setEditing(classItem);
                          setEditForm({
                            title: classItem.title || '',
                            category: classItem.category || '',
                            date: classItem.date || '',
                            time: classItem.time || '',
                            location: classItem.location || '',
                            instructor: classItem.instructor || '',
                            maxParticipants: String(classItem.maxParticipants ?? ''),
                            targetAudience: classItem.targetAudience || '',
                            topics: Array.isArray(classItem.topics) ? classItem.topics.join(', ') : '',
                            description: classItem.description || ''
                          });
                        }}
                        style={{ 
                          backgroundColor: 'var(--green-600)', 
                          color: 'white', 
                          border: 'none',
                          fontSize: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        className="btn"
                        onClick={async () => {
                          try {
                            await communityAPI.deleteClass(classItem.id);
                            setClasses(prev => prev.filter(c => c.id !== classItem.id));
                          } catch (err: any) {
                            setError(err?.response?.data?.error || 'Failed to delete class');
                          }
                        }}
                        style={{
                          backgroundColor: 'var(--red-600)',
                          color: 'white',
                          border: 'none',
                          fontSize: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View Modal */}
        {viewing && (
          <div style={{ position: 'fixed', inset: 0 as any, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div className="card" style={{ width: 'min(720px, 92vw)' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title" style={{ margin: 0 }}>{viewing.title}</h3>
                <button className="btn" onClick={() => setViewing(null)}>Close</button>
              </div>
              <div className="card-content" style={{ display: 'grid', gap: '0.5rem' }}>
                <div><strong>Category:</strong> {viewing.category}</div>
                <div><strong>Date:</strong> {viewing.date} • <strong>Time:</strong> {viewing.time}</div>
                <div><strong>Location:</strong> {viewing.location}</div>
                {viewing.instructor && <div><strong>Instructor:</strong> {viewing.instructor}</div>}
                {viewing.targetAudience && <div><strong>Target Audience:</strong> {viewing.targetAudience}</div>}
                {Array.isArray(viewing.topics) && viewing.topics.length > 0 && (
                  <div>
                    <strong>Topics:</strong> {viewing.topics.join(', ')}
                  </div>
                )}
                {viewing.description && <div style={{ whiteSpace: 'pre-wrap' }}>{viewing.description}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editing && (
          <div style={{ position: 'fixed', inset: 0 as any, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div className="card" style={{ width: 'min(720px, 92vw)' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title" style={{ margin: 0 }}>Edit Class</h3>
                <button className="btn" onClick={() => setEditing(null)}>Close</button>
              </div>
              <div className="card-content">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await communityAPI.updateClass(editing.id, {
                      title: editForm.title,
                      category: editForm.category,
                      date: editForm.date,
                      time: editForm.time,
                      location: editForm.location,
                      instructor: editForm.instructor,
                      maxParticipants: editForm.maxParticipants ? parseInt(editForm.maxParticipants) : undefined,
                      targetAudience: editForm.targetAudience,
                      description: editForm.description,
                      topics: editForm.topics ? editForm.topics.split(',').map(t => t.trim()).filter(Boolean) : undefined,
                    });
                    setClasses(prev => prev.map(c => c.id === editing.id ? { ...c, ...{
                      title: editForm.title,
                      category: editForm.category,
                      date: editForm.date,
                      time: editForm.time,
                      location: editForm.location,
                      instructor: editForm.instructor,
                      maxParticipants: editForm.maxParticipants ? parseInt(editForm.maxParticipants) : c.maxParticipants,
                      targetAudience: editForm.targetAudience,
                      description: editForm.description,
                      topics: editForm.topics ? editForm.topics.split(',').map(t => t.trim()).filter(Boolean) : c.topics,
                    } } : c));
                    setEditing(null);
                  } catch (err: any) {
                    setError(err?.response?.data?.error || 'Failed to update class');
                  }
                }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                  <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="Title" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                  <input value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} placeholder="Category" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                  <input type="date" min={new Date().toISOString().split('T')[0]} value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                  <input value={editForm.time} onChange={e => setEditForm({ ...editForm, time: e.target.value })} placeholder="Time" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                  <select
                    value={editForm.location}
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                    disabled={locationsLoading}
                    style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8, backgroundColor: 'white' }}
                  >
                    <option value="">{locationsLoading ? 'Loading...' : 'Select location...'}</option>
                    {locations.map((loc: any) => (
                      <option key={loc._id} value={loc.name}>
                        {loc.name} {loc.ward ? `(${loc.ward})` : ''}
                      </option>
                    ))}
                  </select>
                  <input value={editForm.instructor} onChange={e => setEditForm({ ...editForm, instructor: e.target.value })} placeholder="Instructor" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                  <input type="number" value={editForm.maxParticipants} onChange={e => setEditForm({ ...editForm, maxParticipants: e.target.value })} placeholder="Max Participants" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                  <input value={editForm.targetAudience} onChange={e => setEditForm({ ...editForm, targetAudience: e.target.value })} placeholder="Target Audience" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                  <input value={editForm.topics} onChange={e => setEditForm({ ...editForm, topics: e.target.value })} placeholder="Topics (comma separated)" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                  <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" rows={3} style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8, gridColumn: '1 / -1' }} />
                  <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
                    <button className="btn" type="submit" style={{ background: 'var(--green-600)', color: 'white', border: 'none' }}>Save</button>
                    <button className="btn" type="button" onClick={() => setEditing(null)} style={{ border: '1px solid var(--gray-300)', background: 'white' }}>Cancel</button>
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

export default CommunityClasses;