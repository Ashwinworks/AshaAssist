import React, { useEffect, useMemo, useState } from 'react';
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
  BookOpen
} from 'lucide-react';
import { communityAPI } from '../../../services/api';

const CommunityClassesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1);
      const data = await communityAPI.listClasses(params);
      setClasses(data.classes || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const filteredClasses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return classes;
    return classes.filter((c) =>
      (c.title || '').toLowerCase().includes(term) ||
      (c.instructor || '').toLowerCase().includes(term) ||
      (c.location || '').toLowerCase().includes(term)
    );
  }, [classes, searchTerm]);

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

  const handleApprove = async (classId: string) => {
    try {
      await communityAPI.updateClass(classId, { status: 'Approved' });
      fetchClasses();
    } catch (e) {
      alert('Failed to approve class');
    }
  };

  const handleReject = async (classId: string) => {
    try {
      await communityAPI.updateClass(classId, { status: 'Rejected' });
      fetchClasses();
    } catch (e) {
      alert('Failed to reject class');
    }
  };

  const handleView = async (classId: string) => {
    try {
      setViewLoading(true);
      setViewModalOpen(true);
      const data = await communityAPI.getClass(classId);
      setSelectedClass(data.class);
    } catch (e) {
      alert('Failed to load class details');
      setViewModalOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEdit = async (classId: string) => {
    try {
      setViewLoading(true);
      // Fetch latest details to prefill prompts
      const data = await communityAPI.getClass(classId);
      const item = data.class || {};

      const newTitle = window.prompt('Edit title', item.title || '');
      if (newTitle === null) return; // Cancel

      const newLocation = window.prompt('Edit location', item.location || '');
      if (newLocation === null) return; // Cancel

      const newStatus = window.prompt('Edit status (Pending, Approved, Rejected, Scheduled, Completed, Cancelled)', item.status || 'Pending');
      if (newStatus === null) return; // Cancel

      const payload: any = {
        title: newTitle.trim(),
        location: (newLocation || '').trim(),
        status: (newStatus || '').trim()
      };

      // Only send defined values
      await communityAPI.updateClass(classId, payload);
      await fetchClasses();
    } catch (e) {
      alert('Failed to update class');
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (classId: string) => {
    if (!window.confirm('Delete this class? This cannot be undone.')) return;
    try {
      await communityAPI.deleteClass(classId);
      fetchClasses();
    } catch (e) {
      alert('Failed to delete class');
    }
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

        {/* Loading / Error */}
        {loading && (
          <div className="card-content" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="loading-spinner" />
            <p>Loading...</p>
          </div>
        )}
        {error && (
          <div className="card-content" style={{ padding: '1rem' }}>
            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--red-600)' }}>
              <p style={{ color: 'var(--red-700)', margin: 0 }}>{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {classes.filter((c) => (c.status || '').toLowerCase() === 'pending').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending Approval</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {classes.filter((c) => (c.status || '').toLowerCase() === 'approved').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Approved</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {classes.reduce((sum, c) => sum + (c.maxParticipants || 0), 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Expected Attendees</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {classes.reduce((sum, c) => sum + (c.registeredParticipants || 0), 0)}
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
              {filteredClasses.map((classItem: any) => (
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
                        <BookOpen size={20} color="var(--purple-600)" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>{classItem.title}</h3>
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
                        <div>Topic: {(classItem.topics && classItem.topics[0]) || '—'}</div>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <MapPin size={16} color="var(--green-600)" />
                        <strong style={{ color: 'var(--green-700)' }}>Location & Instructor</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Location: {classItem.location}</div>
                        <div>Instructor: {classItem.instructor || '—'}</div>
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
                        <div>Expected: {classItem.maxParticipants || 0}</div>
                        <div>Registered: {classItem.registeredParticipants || 0}</div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ 
                            width: '100%', 
                            height: '6px', 
                            backgroundColor: 'var(--gray-200)', 
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${Math.min(100, ((classItem.registeredParticipants || 0) / Math.max(1, (classItem.maxParticipants || 0))) * 100)}%`, 
                              height: '100%', 
                              backgroundColor: 'var(--purple-600)',
                              borderRadius: '3px'
                            }} />
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                            {Math.round(((classItem.registeredParticipants || 0) / Math.max(1, (classItem.maxParticipants || 0))) * 100)}% registered
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Topics */}
                  {Array.isArray(classItem.topics) && classItem.topics.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <BookOpen size={14} color="var(--gray-600)" />
                        <strong style={{ color: 'var(--gray-700)', fontSize: '0.875rem' }}>Topics:</strong>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {classItem.topics.map((topic: string, index: number) => (
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
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

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
                      onClick={() => handleView(classItem.id)}
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
                      onClick={() => handleEdit(classItem.id)}
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
                    {(classItem.status || '').toLowerCase() === 'pending' && (
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

        {/* View Class Modal */}
        {viewModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="card" style={{
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              margin: '1rem'
            }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">Class Details</h3>
                <button
                  onClick={() => { setViewModalOpen(false); setSelectedClass(null); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--gray-500)'
                  }}
                >
                  ×
                </button>
              </div>
              <div className="card-content">
                {viewLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="loading-spinner" />
                    <p>Loading...</p>
                  </div>
                ) : selectedClass ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <BookOpen size={24} color="var(--purple-600)" />
                      <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>{selectedClass.title}</h2>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: getStatusColor(selectedClass.status),
                          backgroundColor: `${getStatusColor(selectedClass.status)}20`,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {selectedClass.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Calendar size={16} color="var(--blue-600)" />
                          <strong style={{ color: 'var(--blue-700)' }}>Schedule Details</strong>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                          <div><strong>Date:</strong> {selectedClass.date}</div>
                          <div><strong>Time:</strong> {selectedClass.time}</div>
                          <div><strong>Category:</strong> {selectedClass.category}</div>
                          <div><strong>Created:</strong> {selectedClass.createdAt}</div>
                        </div>
                      </div>

                      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <MapPin size={16} color="var(--green-600)" />
                          <strong style={{ color: 'var(--green-700)' }}>Location & Instructor</strong>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                          <div><strong>Location:</strong> {selectedClass.location}</div>
                          <div><strong>Instructor:</strong> {selectedClass.instructor || '—'}</div>
                          <div><strong>Target Audience:</strong> {selectedClass.targetAudience}</div>
                          <div><strong>Last Updated:</strong> {selectedClass.lastUpdated}</div>
                        </div>
                      </div>

                      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--purple-25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Users size={16} color="var(--purple-600)" />
                          <strong style={{ color: 'var(--purple-700)' }}>Attendance</strong>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                          <div><strong>Max Participants:</strong> {selectedClass.maxParticipants || 0}</div>
                          <div><strong>Registered:</strong> {selectedClass.registeredParticipants || 0}</div>
                          <div><strong>Published Date:</strong> {selectedClass.publishedDate}</div>
                        </div>
                      </div>
                    </div>

                    {selectedClass.description && (
                      <div>
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Description</h4>
                        <p style={{ margin: 0, color: 'var(--gray-700)', lineHeight: '1.5' }}>{selectedClass.description}</p>
                      </div>
                    )}

                    {Array.isArray(selectedClass.topics) && selectedClass.topics.length > 0 && (
                      <div>
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Topics</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {selectedClass.topics.map((topic: string, index: number) => (
                            <span
                              key={index}
                              style={{
                                backgroundColor: 'var(--blue-100)',
                                color: 'var(--blue-800)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.875rem'
                              }}
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Failed to load class details.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CommunityClassesManagement;