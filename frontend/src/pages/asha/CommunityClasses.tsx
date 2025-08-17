import React, { useState } from 'react';
import AshaLayout from './AshaLayout';
import { Plus, GraduationCap, Calendar, MapPin, Clock, Users, Edit, Eye } from 'lucide-react';

const CommunityClasses: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock data for demonstration
  const communityClasses = [
    {
      id: 1,
      title: 'Maternal Nutrition During Pregnancy',
      category: 'Maternity Care',
      date: '2024-01-22',
      time: '3:00 PM - 5:00 PM',
      location: 'Community Hall, Ward 12',
      instructor: 'Dr. Priya Sharma (Nutritionist)',
      maxParticipants: 30,
      registeredParticipants: 24,
      targetAudience: 'Pregnant women and their families',
      status: 'Scheduled',
      description: 'Learn about proper nutrition during pregnancy, essential vitamins, and healthy meal planning for expecting mothers.',
      topics: ['Balanced Diet', 'Iron & Folic Acid', 'Weight Management', 'Food Safety'],
      publishedDate: '2024-01-10',
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      title: 'Newborn Care and Breastfeeding',
      category: 'Child Health',
      date: '2024-01-25',
      time: '10:00 AM - 12:00 PM',
      location: 'Primary Health Center, Ward 12',
      instructor: 'Sister Meera (Certified Lactation Consultant)',
      maxParticipants: 25,
      registeredParticipants: 19,
      targetAudience: 'New mothers and pregnant women',
      status: 'Scheduled',
      description: 'Comprehensive training on newborn care, proper breastfeeding techniques, and early childhood development.',
      topics: ['Breastfeeding Positions', 'Newborn Hygiene', 'Sleep Patterns', 'Warning Signs'],
      publishedDate: '2024-01-12',
      lastUpdated: '2024-01-14'
    },
    {
      id: 3,
      title: 'Managing Chronic Pain in Elderly',
      category: 'Palliative Care',
      date: '2024-01-18',
      time: '2:00 PM - 4:00 PM',
      location: 'Senior Citizens Center, Sector B',
      instructor: 'Dr. Rajesh Kumar (Palliative Care Specialist)',
      maxParticipants: 20,
      registeredParticipants: 20,
      targetAudience: 'Elderly patients and their caregivers',
      status: 'Completed',
      description: 'Learn effective pain management techniques, medication compliance, and comfort care strategies.',
      topics: ['Pain Assessment', 'Medication Management', 'Physical Therapy', 'Emotional Support'],
      publishedDate: '2024-01-05',
      lastUpdated: '2024-01-18'
    },
    {
      id: 4,
      title: 'Family Planning and Contraception',
      category: 'Reproductive Health',
      date: '2024-01-28',
      time: '11:00 AM - 1:00 PM',
      location: 'Women\'s Health Center, Ward 12',
      instructor: 'Dr. Sunita Devi (Gynecologist)',
      maxParticipants: 35,
      registeredParticipants: 12,
      targetAudience: 'Couples and women of reproductive age',
      status: 'Scheduled',
      description: 'Comprehensive session on family planning methods, contraceptive options, and reproductive health.',
      topics: ['Contraceptive Methods', 'Family Planning', 'Reproductive Health', 'Counseling'],
      publishedDate: '2024-01-16',
      lastUpdated: '2024-01-16'
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
              <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Class Title
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter class title..."
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Category
                  </label>
                  <select style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}>
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
                    Instructor
                  </label>
                  <input 
                    type="text" 
                    placeholder="Instructor name and credentials"
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
                      {classItem.topics.map((topic, index) => (
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

export default CommunityClasses;