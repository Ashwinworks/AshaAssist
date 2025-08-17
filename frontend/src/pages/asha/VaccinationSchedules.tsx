import React, { useState } from 'react';
import AshaLayout from './AshaLayout';
import { Plus, Calendar, Syringe, MapPin, Clock, Users, Edit, Eye } from 'lucide-react';

const VaccinationSchedules: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock data for demonstration
  const vaccinationSchedules = [
    {
      id: 1,
      title: 'Routine Immunization Drive - January 2024',
      date: '2024-01-20',
      time: '10:00 AM - 4:00 PM',
      location: 'Ward 12 Community Center',
      vaccines: ['DPT', 'OPV', 'Measles', 'MMR'],
      targetAgeGroup: '0-5 years',
      expectedChildren: 45,
      registeredChildren: 32,
      status: 'Scheduled',
      description: 'Monthly routine immunization for children in Ward 12. All vaccines will be available.',
      publishedDate: '2024-01-10',
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      title: 'Catch-up Vaccination Camp',
      date: '2024-01-25',
      time: '9:00 AM - 2:00 PM',
      location: 'Government Primary School, Sector A',
      vaccines: ['BCG', 'Hepatitis B', 'DPT Booster'],
      targetAgeGroup: '6 months - 2 years',
      expectedChildren: 25,
      registeredChildren: 18,
      status: 'Scheduled',
      description: 'Special camp for children who missed their scheduled vaccinations.',
      publishedDate: '2024-01-12',
      lastUpdated: '2024-01-14'
    },
    {
      id: 3,
      title: 'School Health Program - Vaccination',
      date: '2024-01-15',
      time: '11:00 AM - 3:00 PM',
      location: 'Government High School, Ward 12',
      vaccines: ['Tetanus', 'Hepatitis B'],
      targetAgeGroup: '10-16 years',
      expectedChildren: 120,
      registeredChildren: 98,
      status: 'Completed',
      description: 'Annual vaccination program for school children.',
      publishedDate: '2024-01-05',
      lastUpdated: '2024-01-15'
    }
  ];

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
            className="btn"
            onClick={() => setShowCreateForm(true)}
            style={{ 
              backgroundColor: 'var(--blue-600)', 
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
            Create New Schedule
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {vaccinationSchedules.filter(s => s.status === 'Scheduled').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Upcoming Schedules</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {vaccinationSchedules.reduce((sum, s) => sum + s.registeredChildren, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Registrations</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {vaccinationSchedules.filter(s => s.status === 'Completed').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Completed This Month</div>
          </div>
        </div>

        {/* Create Schedule Form */}
        {showCreateForm && (
          <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--blue-200)' }}>
            <div className="card-header">
              <h2 className="card-title" style={{ color: 'var(--blue-700)' }}>Create New Vaccination Schedule</h2>
            </div>
            <div className="card-content">
              <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Schedule Title
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter schedule title..."
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Date
                  </label>
                  <input 
                    type="date" 
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
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Target Age Group
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., 0-5 years"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Available Vaccines
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., DPT, OPV, Measles"
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
                      backgroundColor: 'var(--blue-600)', 
                      color: 'white', 
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    Publish Schedule
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

        {/* Vaccination Schedules List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Published Vaccination Schedules</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {vaccinationSchedules.map((schedule) => (
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
                        <div><strong>Target Age:</strong> {schedule.targetAgeGroup}</div>
                        <div><strong>Vaccines:</strong> {schedule.vaccines.join(', ')}</div>
                      </div>
                    </div>

                    {/* Registration Stats */}
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--purple-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Users size={16} color="var(--purple-600)" />
                        <strong style={{ color: 'var(--purple-700)' }}>Registration Stats</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div><strong>Expected:</strong> {schedule.expectedChildren} children</div>
                        <div><strong>Registered:</strong> {schedule.registeredChildren} children</div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ 
                            width: '100%', 
                            height: '6px', 
                            backgroundColor: 'var(--gray-200)', 
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${(schedule.registeredChildren / schedule.expectedChildren) * 100}%`, 
                              height: '100%', 
                              backgroundColor: 'var(--purple-600)',
                              borderRadius: '3px'
                            }} />
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                            {Math.round((schedule.registeredChildren / schedule.expectedChildren) * 100)}% registered
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      Published: {schedule.publishedDate} • Last updated: {schedule.lastUpdated}
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
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                      <button 
                        className="btn"
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AshaLayout>
  );
};

export default VaccinationSchedules;