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
  Users,
  MapPin,
  Clock,
  Stethoscope,
} from 'lucide-react';

// Admin page to review/approve local health camps announced by ASHA workers
const LocalCampsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // pending | approved | rejected | all

  // Mock data (replace later with API data)
  const localCamps = [
    {
      id: 1,
      title: 'Free Blood Pressure & Diabetes Screening Camp',
      organizer: 'Government Hospital Ward 12',
      date: '2024-01-24',
      time: '9:00 AM - 4:00 PM',
      location: 'Ward 12 Community Center, Main Hall',
      services: ['Blood Pressure Check', 'Blood Sugar Test', 'BMI Measurement', 'Health Counseling'],
      targetAudience: 'Adults above 30 years',
      expectedParticipants: 150,
      registeredParticipants: 89,
      status: 'Scheduled',
      approvalStatus: 'Approved',
      description:
        'Free health screening camp for early detection of hypertension and diabetes. All tests are completely free of cost.',
      publishedDate: '2024-01-12',
      lastUpdated: '2024-01-16',
      approvedBy: 'Admin',
      approvalDate: '2024-01-12',
    },
    {
      id: 2,
      title: 'Eye Care and Vision Testing Camp',
      organizer: 'Lions Club & District Hospital',
      date: '2024-01-27',
      time: '10:00 AM - 3:00 PM',
      location: 'Government School, Ward 12, Sector A',
      services: ['Vision Testing', 'Eye Examination', 'Cataract Screening', 'Free Spectacles'],
      targetAudience: 'All age groups, especially elderly',
      expectedParticipants: 100,
      registeredParticipants: 67,
      status: 'Scheduled',
      approvalStatus: 'Pending',
      description:
        'Comprehensive eye care camp with free vision testing and spectacles for those in need.',
      publishedDate: null,
      lastUpdated: '2024-01-15',
      approvedBy: null,
      approvalDate: null,
    },
    {
      id: 3,
      title: "Women's Health and Wellness Camp",
      organizer: 'State Health Department',
      date: '2024-01-20',
      time: '11:00 AM - 5:00 PM',
      location: "Women's Health Center, Ward 12",
      services: ['Cervical Cancer Screening', 'Breast Examination', 'Anemia Testing', 'Nutrition Counseling'],
      targetAudience: 'Women aged 18-65 years',
      expectedParticipants: 80,
      registeredParticipants: 80,
      status: 'Completed',
      approvalStatus: 'Approved',
      description:
        "Comprehensive women's health screening with focus on preventive care and early detection.",
      publishedDate: '2024-01-08',
      lastUpdated: '2024-01-20',
      approvedBy: 'Admin',
      approvalDate: '2024-01-08',
    },
  ];

  const filteredCamps = localCamps.filter((camp) => {
    const matchesSearch =
      camp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && camp.approvalStatus.toLowerCase() === filterStatus;
  });

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'var(--green-600)';
      case 'Pending':
        return 'var(--yellow-600)';
      case 'Rejected':
        return 'var(--red-600)';
      default:
        return 'var(--gray-600)';
    }
  };

  const getApprovalBg = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'var(--green-50)';
      case 'Pending':
        return 'var(--yellow-50)';
      case 'Rejected':
        return 'var(--red-50)';
      default:
        return 'var(--gray-50)';
    }
  };

  const getCampStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'var(--blue-600)';
      case 'Completed':
        return 'var(--green-600)';
      case 'Cancelled':
        return 'var(--red-600)';
      case 'Postponed':
        return 'var(--yellow-600)';
      default:
        return 'var(--gray-600)';
    }
  };

  const handleApprove = (campId: number) => {
    console.log(`Approving camp ${campId}`);
  };

  const handleReject = (campId: number) => {
    console.log(`Rejecting camp ${campId}`);
  };

  const handleDelete = (campId: number) => {
    console.log(`Deleting camp ${campId}`);
  };

  return (
    <AdminLayout title="Local Camps Management">
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem' }}>
            Review, approve, edit, or delete local health camps announced by ASHA workers.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-content" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '300px' }}
              >
                <Search size={20} color="var(--gray-400)" />
                <input
                  type="text"
                  placeholder="Search by title, organizer, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
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
                  minWidth: '130px',
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {localCamps.filter((c) => c.approvalStatus === 'Pending').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending Approval</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {localCamps.filter((c) => c.approvalStatus === 'Approved').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Approved</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {localCamps.reduce((sum, c) => sum + c.expectedParticipants, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Expected Participants</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {localCamps.reduce((sum, c) => sum + c.registeredParticipants, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Registered</div>
          </div>
        </div>

        {/* Local Camps List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Local Camps</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredCamps.map((camp) => (
                <div
                  key={camp.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    border: '1px solid var(--gray-200)',
                    borderLeft: `4px solid ${getApprovalColor(camp.approvalStatus)}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Stethoscope size={20} color="var(--green-600)" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                          {camp.title}
                        </h3>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: getCampStatusColor(camp.status),
                            backgroundColor: `${getCampStatusColor(camp.status)}20`,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                          }}
                        >
                          {camp.status}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: getApprovalColor(camp.approvalStatus),
                            backgroundColor: getApprovalBg(camp.approvalStatus),
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                          }}
                        >
                          {camp.approvalStatus}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 1rem', color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                        {camp.description}
                      </p>
                    </div>
                  </div>

                  {/* Camp Details */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Calendar size={16} color="var(--blue-600)" />
                        <strong style={{ color: 'var(--blue-700)' }}>Schedule Details</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Date: {camp.date}</div>
                        <div>Time: {camp.time}</div>
                        <div>Target: {camp.targetAudience}</div>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <MapPin size={16} color="var(--green-600)" />
                        <strong style={{ color: 'var(--green-700)' }}>Location & Organizer</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Location: {camp.location}</div>
                        <div>Organizer: {camp.organizer}</div>
                        <div>Updated: {camp.lastUpdated}</div>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--purple-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Users size={16} color="var(--purple-600)" />
                        <strong style={{ color: 'var(--purple-700)' }}>Participation</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Expected: {camp.expectedParticipants}</div>
                        <div>Registered: {camp.registeredParticipants}</div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <div
                            style={{
                              width: '100%',
                              height: '6px',
                              backgroundColor: 'var(--gray-200)',
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${(camp.registeredParticipants / camp.expectedParticipants) * 100}%`,
                                height: '100%',
                                backgroundColor: 'var(--purple-600)',
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                            {camp.registeredParticipants} of {camp.expectedParticipants} registered
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      justifyContent: 'flex-end',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      title="View"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid var(--gray-300)',
                        background: 'white',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Eye size={16} /> View
                    </button>
                    <button
                      title="Edit"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid var(--blue-300)',
                        background: 'var(--blue-50)',
                        color: 'var(--blue-700)',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit size={16} /> Edit
                    </button>
                    {camp.approvalStatus !== 'Approved' && (
                      <button
                        title="Approve"
                        onClick={() => handleApprove(camp.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid var(--green-300)',
                          background: 'var(--green-50)',
                          color: 'var(--green-700)',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                        }}
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                    )}
                    {camp.approvalStatus !== 'Rejected' && (
                      <button
                        title="Reject"
                        onClick={() => handleReject(camp.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid var(--yellow-300)',
                          background: 'var(--yellow-50)',
                          color: 'var(--yellow-700)',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                        }}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    )}
                    <button
                      title="Delete"
                      onClick={() => handleDelete(camp.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid var(--red-300)',
                        background: 'var(--red-50)',
                        color: 'var(--red-700)',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={16} /> Delete
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

export default LocalCampsManagement;