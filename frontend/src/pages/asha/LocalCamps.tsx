import React, { useState } from 'react';
import AshaLayout from './AshaLayout';
import { Plus, MapPin, Calendar, Clock, Users, Activity, Edit, Eye, Stethoscope } from 'lucide-react';

const LocalCamps: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock data for demonstration
  const healthCamps = [
    {
      id: 1,
      title: 'Free Blood Pressure & Diabetes Screening Camp',
      campType: 'Screening',
      date: '2024-01-24',
      time: '9:00 AM - 4:00 PM',
      location: 'Ward 12 Community Center, Main Hall',
      organizer: 'Government Hospital Ward 12',
      services: ['Blood Pressure Check', 'Blood Sugar Test', 'BMI Measurement', 'Health Counseling'],
      targetAudience: 'Adults above 30 years',
      expectedParticipants: 150,
      registeredParticipants: 89,
      status: 'Scheduled',
      description: 'Free health screening camp for early detection of hypertension and diabetes. All tests are completely free of cost.',
      requirements: 'Bring Aadhaar card and any previous medical reports',
      contactPerson: 'Dr. Rajesh Kumar - 9876543210',
      publishedDate: '2024-01-12',
      lastUpdated: '2024-01-16'
    },
    {
      id: 2,
      title: 'Eye Care and Vision Testing Camp',
      campType: 'Specialized',
      date: '2024-01-27',
      time: '10:00 AM - 3:00 PM',
      location: 'Government School, Ward 12, Sector A',
      organizer: 'Lions Club & District Hospital',
      services: ['Vision Testing', 'Eye Examination', 'Cataract Screening', 'Free Spectacles'],
      targetAudience: 'All age groups, especially elderly',
      expectedParticipants: 100,
      registeredParticipants: 67,
      status: 'Scheduled',
      description: 'Comprehensive eye care camp with free vision testing and spectacles for those in need.',
      requirements: 'No prior registration required',
      contactPerson: 'Dr. Priya Sharma - 9876543211',
      publishedDate: '2024-01-14',
      lastUpdated: '2024-01-15'
    },
    {
      id: 3,
      title: 'Women\'s Health and Wellness Camp',
      campType: 'Specialized',
      date: '2024-01-20',
      time: '11:00 AM - 5:00 PM',
      location: 'Women\'s Health Center, Ward 12',
      organizer: 'State Health Department',
      services: ['Cervical Cancer Screening', 'Breast Examination', 'Anemia Testing', 'Nutrition Counseling'],
      targetAudience: 'Women aged 18-65 years',
      expectedParticipants: 80,
      registeredParticipants: 80,
      status: 'Completed',
      description: 'Comprehensive women\'s health screening with focus on preventive care and early detection.',
      requirements: 'Women only, bring health card if available',
      contactPerson: 'Dr. Sunita Devi - 9876543212',
      publishedDate: '2024-01-08',
      lastUpdated: '2024-01-20'
    },
    {
      id: 4,
      title: 'General Health Check-up Camp',
      campType: 'General',
      date: '2024-01-30',
      time: '8:00 AM - 2:00 PM',
      location: 'Primary Health Center, Ward 12',
      organizer: 'Rotary Club & PHC Ward 12',
      services: ['General Check-up', 'Blood Tests', 'ECG', 'Consultation', 'Medicine Distribution'],
      targetAudience: 'All community members',
      expectedParticipants: 200,
      registeredParticipants: 45,
      status: 'Scheduled',
      description: 'Comprehensive health check-up camp with basic diagnostic tests and free medicines.',
      requirements: 'Fasting required for blood tests (8-10 hours)',
      contactPerson: 'Dr. Amit Singh - 9876543213',
      publishedDate: '2024-01-18',
      lastUpdated: '2024-01-18'
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
              <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Camp Title
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter camp title..."
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Camp Type
                  </label>
                  <select style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}>
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
                    Organizer
                  </label>
                  <input 
                    type="text" 
                    placeholder="Organizing institution/NGO"
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
                      {camp.services.map((service, index) => (
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

export default LocalCamps;