import React, { useEffect, useState } from 'react';
import AshaLayout from './AshaLayout';
import { Plus, MapPin, Calendar, Clock, Users, Activity, Edit, Eye, Stethoscope } from 'lucide-react';
import { communityAPI } from '../../services/api';

const LocalCamps: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [camps, setCamps] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: '',
    campType: '',
    date: '',
    time: '',
    location: '',
    organizer: '',
    services: '',
    targetAudience: '',
    expectedParticipants: '',
    contactPerson: '',
    requirements: '',
    description: ''
  });
  const [viewing, setViewing] = useState<any | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '', campType: '', date: '', time: '', location: '', organizer: '', services: '', targetAudience: '', expectedParticipants: '', contactPerson: '', requirements: '', description: ''
  });

  const healthCamps = camps;

  const fetchCamps = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await communityAPI.listCamps();
      setCamps(res.camps || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load camps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
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

  const getCampTypeColor = (type: string) => {
    switch (type) {
      case 'Screening': return 'var(--green-600)';
      case 'Specialized': return 'var(--purple-600)';
      case 'General': return 'var(--blue-600)';
      default: return 'var(--gray-600)';
    }
  };

  return (
    <AshaLayout title="Local Camp Announcements">
      <div>
        {error && (
          <div className="card" style={{ border: '1px solid var(--red-200)', background: 'var(--red-50)', color: 'var(--red-700)', padding: '0.75rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', margin: 0 }}>
              Announce free health camps and medical screening programs for your community.
            </p>
          </div>
          <button 
            className="btn"
            onClick={() => setShowCreateForm(true)}
            style={{ 
              backgroundColor: 'var(--green-600)', 
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
            Announce New Camp
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {healthCamps.filter(c => c.status === 'Scheduled').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Upcoming Camps</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {healthCamps.reduce((sum, c) => sum + c.registeredParticipants, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Registrations</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {healthCamps.filter(c => c.status === 'Completed').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Completed This Month</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {healthCamps.reduce((sum, c) => sum + c.expectedParticipants, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Expected Beneficiaries</div>
          </div>
        </div>

        {/* Create Camp Form */}
        {showCreateForm && (
          <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--green-200)' }}>
            <div className="card-header">
              <h2 className="card-title" style={{ color: 'var(--green-700)' }}>Announce New Health Camp</h2>
            </div>
            <div className="card-content">
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setError('');
                    const created = await communityAPI.createCamp({
                      title: form.title,
                      campType: form.campType || 'General',
                      date: form.date,
                      time: form.time,
                      location: form.location,
                      organizer: form.organizer,
                      services: form.services ? form.services.split(',').map(s => s.trim()).filter(Boolean) : [],
                      targetAudience: form.targetAudience,
                      expectedParticipants: form.expectedParticipants ? parseInt(form.expectedParticipants) : undefined,
                      contactPerson: form.contactPerson,
                      requirements: form.requirements,
                      description: form.description,
                    });
                    // Show immediately
                    if (created?.camp) {
                      setCamps(prev => [created.camp, ...prev]);
                    }
                    setShowCreateForm(false);
                    setForm({ title: '', campType: '', date: '', time: '', location: '', organizer: '', services: '', targetAudience: '', expectedParticipants: '', contactPerson: '', requirements: '', description: '' });
                    // Optionally refresh for consistency
                    // fetchCamps();
                  } catch (err: any) {
                    setError(err?.response?.data?.error || 'Failed to publish camp');
                  }
                }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}
              >
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Camp Title
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter camp title..."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Camp Type
                  </label>
                  <select 
                    value={form.campType}
                    onChange={(e) => setForm({ ...form, campType: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  >
                    <option value="">Select type...</option>
                    <option value="general">General Health Check-up</option>
                    <option value="screening">Health Screening</option>
                    <option value="specialized">Specialized Care</option>
                    <option value="vaccination">Vaccination Camp</option>
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
                    placeholder="e.g., 9:00 AM - 4:00 PM"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Location
                  </label>
                  <input 
                    type="text" 
                    placeholder="Venue address..."
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Organizer
                  </label>
                  <input 
                    type="text" 
                    placeholder="Organizing institution/NGO"
                    value={form.organizer}
                    onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Target Audience
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., Adults above 30 years"
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Contact Person
                  </label>
                  <input 
                    type="text" 
                    placeholder="Name and phone number"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Services Offered
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., Blood Pressure Check, Blood Sugar Test, BMI Measurement"
                    value={form.services}
                    onChange={(e) => setForm({ ...form, services: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Requirements/Instructions
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., Bring Aadhaar card, Fasting required"
                    value={form.requirements}
                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Description
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Detailed description of the health camp..."
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
                      backgroundColor: 'var(--green-600)', 
                      color: 'white', 
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    Publish Announcement
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

        {/* Health Camps List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Published Health Camp Announcements</h2>
          </div>
              <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {healthCamps.map((camp) => (
                <div 
                  key={camp.id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid var(--gray-200)',
                    borderLeft: `4px solid ${getStatusColor(camp.status)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Stethoscope size={20} color="var(--green-600)" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                          {camp.title}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getCampTypeColor(camp.campType),
                          backgroundColor: `${getCampTypeColor(camp.campType)}20`,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {camp.campType}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getStatusColor(camp.status),
                          backgroundColor: getStatusBg(camp.status),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {camp.status}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 1rem', color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                        {camp.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    {/* Camp Details */}
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Calendar size={16} color="var(--blue-600)" />
                        <strong style={{ color: 'var(--blue-700)' }}>Camp Details</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                          <Calendar size={12} />
                          <span>{camp.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                          <Clock size={12} />
                          <span>{camp.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={12} />
                          <span>{camp.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Organizer & Contact */}
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Users size={16} color="var(--green-600)" />
                        <strong style={{ color: 'var(--green-700)' }}>Organizer & Contact</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div><strong>Organizer:</strong> {camp.organizer}</div>
                        <div><strong>Contact:</strong> {camp.contactPerson}</div>
                        <div><strong>Target:</strong> {camp.targetAudience}</div>
                      </div>
                    </div>

                    {/* Participation Stats */}
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--purple-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Activity size={16} color="var(--purple-600)" />
                        <strong style={{ color: 'var(--purple-700)' }}>Participation</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div><strong>Expected:</strong> {camp.expectedParticipants} people</div>
                        <div><strong>Registered:</strong> {camp.registeredParticipants} people</div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ 
                            width: '100%', 
                            height: '6px', 
                            backgroundColor: 'var(--gray-200)', 
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${Math.min((camp.registeredParticipants / camp.expectedParticipants) * 100, 100)}%`, 
                              height: '100%', 
                              backgroundColor: 'var(--purple-600)',
                              borderRadius: '3px'
                            }} />
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                            {Math.round((camp.registeredParticipants / camp.expectedParticipants) * 100)}% registered
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--gray-700)', fontSize: '0.875rem' }}>Services Offered:</strong>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {camp.services.map((service: string, index: number) => (
                        <span 
                          key={index}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: 'var(--green-700)',
                            backgroundColor: 'var(--green-50)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid var(--green-200)'
                          }}
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  {camp.requirements && (
                    <div style={{ padding: '1rem', backgroundColor: 'var(--yellow-50)', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid var(--yellow-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <strong style={{ color: 'var(--yellow-800)', fontSize: '0.875rem' }}>Requirements:</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--yellow-700)' }}>
                        {camp.requirements}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      Published: {camp.publishedDate} • Last updated: {camp.lastUpdated}
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
                      onClick={() => setViewing(camp)}
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                      <button 
                        className="btn"
                        onClick={() => {
                          setEditing(camp);
                          setEditForm({
                            title: camp.title || '',
                            campType: camp.campType || '',
                            date: camp.date || '',
                            time: camp.time || '',
                            location: camp.location || '',
                            organizer: camp.organizer || '',
                            services: Array.isArray(camp.services) ? camp.services.join(', ') : '',
                            targetAudience: camp.targetAudience || '',
                            expectedParticipants: String(camp.expectedParticipants ?? ''),
                            contactPerson: camp.contactPerson || '',
                            requirements: camp.requirements || '',
                            description: camp.description || ''
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
                            await communityAPI.deleteCamp(camp.id);
                            setCamps(prev => prev.filter(x => x.id !== camp.id));
                          } catch (err: any) {
                            setError(err?.response?.data?.error || 'Failed to delete camp');
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
              <div><strong>Type:</strong> {viewing.campType}</div>
              <div><strong>Date:</strong> {viewing.date} • <strong>Time:</strong> {viewing.time}</div>
              <div><strong>Location:</strong> {viewing.location}</div>
              {viewing.organizer && <div><strong>Organizer:</strong> {viewing.organizer}</div>}
              {viewing.contactPerson && <div><strong>Contact:</strong> {viewing.contactPerson}</div>}
              {viewing.targetAudience && <div><strong>Target Audience:</strong> {viewing.targetAudience}</div>}
              {Array.isArray(viewing.services) && viewing.services.length > 0 && (
                <div>
                  <strong>Services:</strong> {viewing.services.join(', ')}
                </div>
              )}
              {viewing.requirements && <div><strong>Requirements:</strong> {viewing.requirements}</div>}
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
              <h3 className="card-title" style={{ margin: 0 }}>Edit Camp</h3>
              <button className="btn" onClick={() => setEditing(null)}>Close</button>
            </div>
            <div className="card-content">
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await communityAPI.updateCamp(editing.id, {
                    title: editForm.title,
                    campType: editForm.campType,
                    date: editForm.date,
                    time: editForm.time,
                    location: editForm.location,
                    organizer: editForm.organizer,
                    services: editForm.services ? editForm.services.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                    targetAudience: editForm.targetAudience,
                    expectedParticipants: editForm.expectedParticipants ? parseInt(editForm.expectedParticipants) : undefined,
                    contactPerson: editForm.contactPerson,
                    requirements: editForm.requirements,
                    description: editForm.description,
                  });
                  setCamps(prev => prev.map(x => x.id === editing.id ? { ...x, ...{
                    title: editForm.title,
                    campType: editForm.campType,
                    date: editForm.date,
                    time: editForm.time,
                    location: editForm.location,
                    organizer: editForm.organizer,
                    services: editForm.services ? editForm.services.split(',').map(s => s.trim()).filter(Boolean) : x.services,
                    targetAudience: editForm.targetAudience,
                    expectedParticipants: editForm.expectedParticipants ? parseInt(editForm.expectedParticipants) : x.expectedParticipants,
                    contactPerson: editForm.contactPerson,
                    requirements: editForm.requirements,
                    description: editForm.description,
                  } } : x));
                  setEditing(null);
                } catch (err: any) {
                  setError(err?.response?.data?.error || 'Failed to update camp');
                }
              }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="Title" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <input value={editForm.campType} onChange={e => setEditForm({ ...editForm, campType: e.target.value })} placeholder="Camp Type" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <input type="date" min={new Date().toISOString().split('T')[0]} value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <input value={editForm.time} onChange={e => setEditForm({ ...editForm, time: e.target.value })} placeholder="Time" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} placeholder="Location" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <input value={editForm.organizer} onChange={e => setEditForm({ ...editForm, organizer: e.target.value })} placeholder="Organizer" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <input value={editForm.services} onChange={e => setEditForm({ ...editForm, services: e.target.value })} placeholder="Services (comma separated)" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <input value={editForm.targetAudience} onChange={e => setEditForm({ ...editForm, targetAudience: e.target.value })} placeholder="Target Audience" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <input type="number" value={editForm.expectedParticipants} onChange={e => setEditForm({ ...editForm, expectedParticipants: e.target.value })} placeholder="Expected Participants" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <input value={editForm.contactPerson} onChange={e => setEditForm({ ...editForm, contactPerson: e.target.value })} placeholder="Contact Person" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
                <input value={editForm.requirements} onChange={e => setEditForm({ ...editForm, requirements: e.target.value })} placeholder="Requirements" style={{ padding: '0.6rem', border: '1px solid var(--gray-300)', borderRadius: 8 }} />
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
    </AshaLayout>
  );
};

export default LocalCamps;