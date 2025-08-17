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
  Syringe,
  MapPin,
  Users
} from 'lucide-react';

const VaccinationSchedulesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for demonstration
  const vaccinationSchedules = [
    {
      id: 1,
      title: 'Routine Immunization Drive - January 2024',
      author: 'Dr. Priya Sharma',
      authorId: 1,
      date: '2024-01-20',
      time: '10:00 AM - 4:00 PM',
      location: 'Ward 12 Community Center',
      vaccines: ['DPT', 'OPV', 'Measles', 'MMR'],
      targetAgeGroup: '0-5 years',
      expectedChildren: 45,
      registeredChildren: 32,
      status: 'Scheduled',
      approvalStatus: 'Approved',
      description: 'Monthly routine immunization for children in Ward 12. All vaccines will be available.',
      publishedDate: '2024-01-10',
      lastUpdated: '2024-01-15',
      approvedBy: 'Admin',
      approvalDate: '2024-01-10'
    },
    {
      id: 2,
      title: 'Catch-up Vaccination Camp',
      author: 'Sister Meera Devi',
      authorId: 2,
      date: '2024-01-25',
      time: '9:00 AM - 2:00 PM',
      location: 'Government Primary School, Sector A',
      vaccines: ['BCG', 'Hepatitis B', 'DPT Booster'],
      targetAgeGroup: '6 months - 2 years',
      expectedChildren: 25,
      registeredChildren: 18,
      status: 'Scheduled',
      approvalStatus: 'Pending',
      description: 'Special camp for children who missed their scheduled vaccinations.',
      publishedDate: null,
      lastUpdated: '2024-01-16',
      approvedBy: null,
      approvalDate: null
    },
    {
      id: 3,
      title: 'School Health Program - Vaccination',
      author: 'Sunita Kumari',
      authorId: 3,
      date: '2024-01-15',
      time: '11:00 AM - 3:00 PM',
      location: 'Government High School, Ward 12',
      vaccines: ['Tetanus', 'Hepatitis B'],
      targetAgeGroup: '10-16 years',
      expectedChildren: 120,
      registeredChildren: 98,
      status: 'Completed',
      approvalStatus: 'Approved',
      description: 'Annual vaccination program for school children.',
      publishedDate: '2024-01-05',
      lastUpdated: '2024-01-15',
      approvedBy: 'Admin',
      approvalDate: '2024-01-05'
    }
  ];

  const filteredSchedules = vaccinationSchedules.filter(schedule => {
    const matchesSearch = schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && schedule.approvalStatus.toLowerCase() === filterStatus;
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

  const getScheduleStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'var(--blue-600)';
      case 'Completed': return 'var(--green-600)';
      case 'Cancelled': return 'var(--red-600)';
      default: return 'var(--gray-600)';
    }
  };

  const handleApprove = (scheduleId: number) => {
    console.log(`Approving schedule ${scheduleId}`);
  };

  const handleReject = (scheduleId: number) => {
    console.log(`Rejecting schedule ${scheduleId}`);
  };

  const handleDelete = (scheduleId: number) => {
    console.log(`Deleting schedule ${scheduleId}`);
  };

  return (
    <AdminLayout title="Vaccination Schedules Management">
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem' }}>
            Review, approve, edit, or delete vaccination schedules created by ASHA workers.
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
                  placeholder="Search schedules by title, author, or location..."
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
              {vaccinationSchedules.filter(s => s.approvalStatus === 'Pending').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending Approval</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {vaccinationSchedules.filter(s => s.approvalStatus === 'Approved').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Approved</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {vaccinationSchedules.reduce((sum, s) => sum + s.expectedChildren, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Expected Children</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {vaccinationSchedules.reduce((sum, s) => sum + s.registeredChildren, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Registered</div>
          </div>
        </div>

        {/* Vaccination Schedules List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Vaccination Schedules</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredSchedules.map((schedule) => (
                <div 
                  key={schedule.id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid var(--gray-200)',
                    borderLeft: `4px solid ${getStatusColor(schedule.approvalStatus)}`
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
                          color: getScheduleStatusColor(schedule.status),
                          backgroundColor: `${getScheduleStatusColor(schedule.status)}20`,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {schedule.status}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getStatusColor(schedule.approvalStatus),
                          backgroundColor: getStatusBg(schedule.approvalStatus),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {schedule.approvalStatus}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 1rem', color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                        {schedule.description}
                      </p>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Calendar size={16} color="var(--blue-600)" />
                        <strong style={{ color: 'var(--blue-700)' }}>Schedule Details</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Date: {schedule.date}</div>
                        <div>Time: {schedule.time}</div>
                        <div>Target: {schedule.targetAgeGroup}</div>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <MapPin size={16} color="var(--green-600)" />
                        <strong style={{ color: 'var(--green-700)' }}>Location & Author</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Location: {schedule.location}</div>
                        <div>Author: {schedule.author}</div>
                        <div>Updated: {schedule.lastUpdated}</div>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--purple-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Users size={16} color="var(--purple-600)" />
                        <strong style={{ color: 'var(--purple-700)' }}>Registration</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Expected: {schedule.expectedChildren}</div>
                        <div>Registered: {schedule.registeredChildren}</div>
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

                  {/* Vaccines */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Syringe size={14} color="var(--gray-600)" />
                      <strong style={{ color: 'var(--gray-700)', fontSize: '0.875rem' }}>Available Vaccines:</strong>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {schedule.vaccines.map((vaccine, index) => (
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
                          {vaccine}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Approval Info */}
                  {schedule.approvalStatus === 'Approved' && (
                    <div style={{ padding: '1rem', backgroundColor: 'var(--green-50)', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid var(--green-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <CheckCircle size={16} color="var(--green-600)" />
                        <strong style={{ color: 'var(--green-800)', fontSize: '0.875rem' }}>Approval Info:</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--green-700)' }}>
                        Approved by {schedule.approvedBy} on {schedule.approvalDate}
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
                    {schedule.approvalStatus === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleApprove(schedule.id)}
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
                          onClick={() => handleReject(schedule.id)}
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
                      onClick={() => handleDelete(schedule.id)}
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

export default VaccinationSchedulesManagement;