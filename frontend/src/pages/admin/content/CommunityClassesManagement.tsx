import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { 
  Search, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Calendar, 
  User, 
  Users,
  MapPin,
  Clock,
  BookOpen
} from 'lucide-react';

const CommunityClassesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for demonstration
  const communityClasses = [
    {
      id: 1,
      title: 'Maternal Health Awareness Session',
      author: 'Dr. Priya Sharma',
      authorId: 1,
      date: '2024-01-22',
      time: '2:00 PM - 4:00 PM',
      location: 'Ward 12 Community Hall',
      topic: 'Prenatal Care and Nutrition',
      targetAudience: 'Pregnant women and new mothers',
      expectedAttendees: 30,
      registeredAttendees: 22,
      status: 'Scheduled',
      approvalStatus: 'Approved',
      description: 'Comprehensive session on prenatal care, nutrition during pregnancy, and postnatal recovery.',
      materials: ['Presentation slides', 'Nutrition charts', 'Information pamphlets'],
      publishedDate: '2024-01-12',
      lastUpdated: '2024-01-15',
      approvedBy: 'Admin',
      approvalDate: '2024-01-12'
    },
    {
      id: 2,
      title: 'Child Immunization Workshop',
      author: 'Sister Meera Devi',
      authorId: 2,
      date: '2024-01-28',
      time: '10:00 AM - 12:00 PM',
      location: 'Government School, Sector A',
      topic: 'Importance of Timely Vaccination',
      targetAudience: 'Parents with children under 5',
      expectedAttendees: 40,
      registeredAttendees: 28,
      status: 'Scheduled',
      approvalStatus: 'Pending',
      description: 'Educational workshop on vaccination schedules, importance of immunization, and addressing vaccine hesitancy.',
      materials: ['Vaccination schedule charts', 'Q&A handouts', 'Certificate of attendance'],
      publishedDate: null,
      lastUpdated: '2024-01-17',
      approvedBy: null,
      approvalDate: null
    },
    {
      id: 3,
      title: 'Elderly Care and Palliative Support',
      author: 'Sunita Kumari',
      authorId: 3,
      date: '2024-01-18',
      time: '3:00 PM - 5:00 PM',
      location: 'Community Center, Ward 12',
      topic: 'Home Care for Elderly Patients',
      targetAudience: 'Family caregivers',
      expectedAttendees: 25,
      registeredAttendees: 25,
      status: 'Completed',
      approvalStatus: 'Approved',
      description: 'Training session for family members on providing quality care for elderly and bedridden patients.',
      materials: ['Care guidelines', 'Emergency contact list', 'Basic medical supplies info'],
      publishedDate: '2024-01-08',
      lastUpdated: '2024-01-18',
      approvedBy: 'Admin',
      approvalDate: '2024-01-08'
    }
  ];

  const filteredClasses = communityClasses.filter(classItem => {
    const matchesSearch = classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.topic.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && classItem.approvalStatus.toLowerCase() === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'var(--green-600)';
      case 'Pending': return 'var(--yellow-600)';
      case 'Rejected': return 'var(--red-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Approved': return 'var(--green-50)';
      case 'Pending': return 'var(--yellow-50)';
      case 'Rejected': return 'var(--red-50)';
      default: return 'var(--gray-50)';
    }
  };

  const getClassStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'var(--blue-600)';
      case 'Completed': return 'var(--green-600)';
      case 'Cancelled': return 'var(--red-600)';
      default: return 'var(--gray-600)';
    }
  };

  const handleApprove = (classId: number) => {
    console.log(`Approving class ${classId}`);
  };

  const handleReject = (classId: number) => {
    console.log(`Rejecting class ${classId}`);
  };

  const handleDelete = (classId: number) => {
    console.log(`Deleting class ${classId}`);
  };

  return (
    <AdminLayout title="Community Classes Management">
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem' }}>
            Review, approve, edit, or delete community health education classes organized by ASHA workers.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-content" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '300px' }}>
                <Search size={20} color="var(--gray-400)" />
                <input 
                  type="text" 
                  placeholder="Search classes by title, author, or topic..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {communityClasses.filter(c => c.approvalStatus === 'Pending').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending Approval</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {communityClasses.filter(c => c.approvalStatus === 'Approved').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Approved</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {communityClasses.reduce((sum, c) => sum + c.expectedAttendees, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Expected Attendees</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {communityClasses.reduce((sum, c) => sum + c.registeredAttendees, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Registered</div>
          </div>
        </div>

        {/* Community Classes List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Community Classes</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredClasses.map((classItem) => (
                <div 
                  key={classItem.id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid var(--gray-200)',
                    borderLeft: `4px solid ${getStatusColor(classItem.approvalStatus)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <BookOpen size={20} color="var(--purple-600)" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                          {classItem.title}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getClassStatusColor(classItem.status),
                          backgroundColor: `${getClassStatusColor(classItem.status)}20`,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {classItem.status}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getStatusColor(classItem.approvalStatus),
                          backgroundColor: getStatusBg(classItem.approvalStatus),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {classItem.approvalStatus}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 1rem', color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                        {classItem.description}
                      </p>
                    </div>
                  </div>

                  {/* Class Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Calendar size={16} color="var(--blue-600)" />
                        <strong style={{ color: 'var(--blue-700)' }}>Schedule Details</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Date: {classItem.date}</div>
                        <div>Time: {classItem.time}</div>
                        <div>Topic: {classItem.topic}</div>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <MapPin size={16} color="var(--green-600)" />
                        <strong style={{ color: 'var(--green-700)' }}>Location & Instructor</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Location: {classItem.location}</div>
                        <div>Instructor: {classItem.author}</div>
                        <div>Updated: {classItem.lastUpdated}</div>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--purple-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Users size={16} color="var(--purple-600)" />
                        <strong style={{ color: 'var(--purple-700)' }}>Attendance</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Target: {classItem.targetAudience}</div>
                        <div>Expected: {classItem.expectedAttendees}</div>
                        <div>Registered: {classItem.registeredAttendees}</div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ 
                            width: '100%', 
                            height: '6px', 
                            backgroundColor: 'var(--gray-200)', 
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${(classItem.registeredAttendees / classItem.expectedAttendees) * 100}%`, 
                              height: '100%', 
                              backgroundColor: 'var(--purple-600)',
                              borderRadius: '3px'
                            }} />
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                            {Math.round((classItem.registeredAttendees / classItem.expectedAttendees) * 100)}% registered
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Materials */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <BookOpen size={14} color="var(--gray-600)" />
                      <strong style={{ color: 'var(--gray-700)', fontSize: '0.875rem' }}>Materials & Resources:</strong>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {classItem.materials.map((material, index) => (
                        <span 
                          key={index}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: 'var(--purple-700)',
                            backgroundColor: 'var(--purple-50)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid var(--purple-200)'
                          }}
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Approval Info */}
                  {classItem.approvalStatus === 'Approved' && (
                    <div style={{ padding: '1rem', backgroundColor: 'var(--green-50)', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid var(--green-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <CheckCircle size={16} color="var(--green-600)" />
                        <strong style={{ color: 'var(--green-800)', fontSize: '0.875rem' }}>Approval Info:</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--green-700)' }}>
                        Approved by {classItem.approvedBy} on {classItem.approvalDate}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                    <button 
                      className="btn"
                      style={{ 
                        backgroundColor: 'var(--blue-600)', 
                        color: 'white', 
                        border: 'none',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                    <button 
                      className="btn"
                      style={{ 
                        backgroundColor: 'var(--purple-600)', 
                        color: 'white', 
                        border: 'none',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    {classItem.approvalStatus === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleApprove(classItem.id)}
                          className="btn"
                          style={{ 
                            backgroundColor: 'var(--green-600)', 
                            color: 'white', 
                            border: 'none',
                            fontSize: '0.875rem',
                            padding: '0.5rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(classItem.id)}
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
                          <XCircle size={14} />
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleDelete(classItem.id)}
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CommunityClassesManagement;