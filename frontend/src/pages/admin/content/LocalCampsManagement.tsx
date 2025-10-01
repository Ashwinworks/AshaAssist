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
  Stethoscope,
  BookOpen,
  Tent,
} from 'lucide-react';
import { communityAPI } from '../../../services/api';

// Admin page to review/approve local health camps announced by ASHA workers
const LocalCampsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | pending | approved | rejected | scheduled | completed
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCamp, setEditingCamp] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchCamps = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1);
      const data = await communityAPI.listCamps(params);
      setCamps(data.camps || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load camps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const filteredCamps = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return camps;
    return camps.filter((camp) =>
      (camp.title || '').toLowerCase().includes(term) ||
      (camp.organizer || '').toLowerCase().includes(term) ||
      (camp.location || '').toLowerCase().includes(term)
    );
  }, [camps, searchTerm]);

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'var(--yellow-600)';
      case 'approved':
      case 'scheduled':
        return 'var(--blue-600)';
      case 'completed':
        return 'var(--green-600)';
      case 'rejected':
      case 'cancelled':
        return 'var(--red-600)';
      case 'postponed':
        return 'var(--orange-600)';
      default:
        return 'var(--gray-600)';
    }
  };

  const handleApprove = async (campId: string) => {
    try {
      await communityAPI.updateCamp(campId, { status: 'Approved' });
      fetchCamps();
    } catch (e) {
      alert('Failed to approve camp');
    }
  };

  const handleReject = async (campId: string) => {
    try {
      await communityAPI.updateCamp(campId, { status: 'Rejected' });
      fetchCamps();
    } catch (e) {
      alert('Failed to reject camp');
    }
  };

  const handleView = async (campId: string) => {
    setViewLoading(true);
    setViewModalOpen(true);
    try {
      const data = await communityAPI.getCamp(campId);
      setSelectedCamp(data.camp || {});
    } catch (e) {
      alert('Failed to load camp details');
      setViewModalOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEdit = async (campId: string) => {
    try {
      setEditLoading(true);
      const data = await communityAPI.getCamp(campId);
      const camp = data.camp || {};
      
      setEditingCamp(camp);
      setEditFormData({
        title: camp.title || '',
        date: camp.date || '',
        time: camp.time || '',
        location: camp.location || '',
        organizer: camp.organizer || '',
        campType: camp.campType || '',
        services: Array.isArray(camp.services) ? camp.services.join(', ') : '',
        targetAudience: camp.targetAudience || '',
        expectedParticipants: camp.expectedParticipants || 0,
        registeredParticipants: camp.registeredParticipants || 0,
        description: camp.description || '',
        requirements: camp.requirements || '',
        contactPerson: camp.contactPerson || '',
        status: camp.status || 'Pending',
      });
      setEditModalOpen(true);
    } catch (e) {
      alert('Failed to load camp details');
    } finally {
      setEditLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setEditLoading(true);
      const payload: any = {
        title: editFormData.title.trim(),
        date: editFormData.date.trim(),
        time: editFormData.time.trim(),
        location: editFormData.location.trim(),
        organizer: editFormData.organizer.trim(),
        campType: editFormData.campType.trim(),
        services: editFormData.services
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => !!s),
        targetAudience: editFormData.targetAudience.trim(),
        expectedParticipants: Number.isNaN(parseInt(editFormData.expectedParticipants)) ? 0 : parseInt(editFormData.expectedParticipants),
        registeredParticipants: Number.isNaN(parseInt(editFormData.registeredParticipants)) ? 0 : parseInt(editFormData.registeredParticipants),
        description: editFormData.description.trim(),
        requirements: editFormData.requirements.trim(),
        contactPerson: editFormData.contactPerson.trim(),
        status: editFormData.status.trim(),
      };

      await communityAPI.updateCamp(editingCamp.id, payload);
      await fetchCamps();
      setEditModalOpen(false);
      setEditingCamp(null);
      setEditFormData({});
    } catch (e) {
      alert('Failed to update camp');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditModalOpen(false);
    setEditingCamp(null);
    setEditFormData({});
  };

  const handleDelete = async (campId: string) => {
    if (!window.confirm('Delete this camp? This cannot be undone.')) return;
    try {
      await communityAPI.deleteCamp(campId);
      fetchCamps();
    } catch (e) {
      alert('Failed to delete camp');
    }
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
              {camps.filter((c) => (c.status || '').toLowerCase() === 'pending').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending Approval</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {camps.filter((c) => (c.status || '').toLowerCase() === 'approved').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Approved</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {camps.reduce((sum, c) => sum + (c.expectedParticipants || 0), 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Expected Participants</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {camps.reduce((sum, c) => sum + (c.registeredParticipants || 0), 0)}
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
              {filteredCamps.map((camp: any) => (
                <div
                  key={camp.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    border: '1px solid var(--gray-200)',
                    borderLeft: `4px solid ${getApprovalColor(camp.status)}`,
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
                          {camp.status === 'pending' ? 'Pending' : camp.status === 'approved' ? 'Approved' : camp.status === 'rejected' ? 'Rejected' : camp.status}
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
                        <div>Expected: {camp.expectedParticipants || 0}</div>
                        <div>Registered: {camp.registeredParticipants || 0}</div>
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
                                width: `${Math.min(100, ((camp.registeredParticipants || 0) / Math.max(1, (camp.expectedParticipants || 0))) * 100)}%`,
                                height: '100%',
                                backgroundColor: 'var(--purple-600)',
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                            {camp.registeredParticipants || 0} of {camp.expectedParticipants || 0} registered
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
                      onClick={() => handleView(camp.id)}
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
                      onClick={() => handleEdit(camp.id)}
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
                    {(camp.status || '').toLowerCase() !== 'approved' && (
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
                    {(camp.status || '').toLowerCase() !== 'rejected' && (
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

        {/* Edit Camp Modal */}
        {editModalOpen && (
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
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              margin: '1rem'
            }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">Edit Camp</h3>
                <button
                  onClick={handleCancelEdit}
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
              <div className="card-content" style={{ padding: '1.5rem' }}>
                {editLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="loading-spinner" />
                    <p>Loading...</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title *</label>
                      <input
                        type="text"
                        value={editFormData.title || ''}
                        onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date *</label>
                      <input
                        type="date"
                        value={editFormData.date || ''}
                        onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Time</label>
                      <input
                        type="text"
                        placeholder="e.g., 10:00 AM"
                        value={editFormData.time || ''}
                        onChange={(e) => setEditFormData({...editFormData, time: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Location *</label>
                      <input
                        type="text"
                        value={editFormData.location || ''}
                        onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Organizer</label>
                      <input
                        type="text"
                        value={editFormData.organizer || ''}
                        onChange={(e) => setEditFormData({...editFormData, organizer: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Camp Type</label>
                      <input
                        type="text"
                        value={editFormData.campType || ''}
                        onChange={(e) => setEditFormData({...editFormData, campType: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Services (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g., Health Checkup, Vaccination, Consultation"
                        value={editFormData.services || ''}
                        onChange={(e) => setEditFormData({...editFormData, services: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target Audience</label>
                      <input
                        type="text"
                        value={editFormData.targetAudience || ''}
                        onChange={(e) => setEditFormData({...editFormData, targetAudience: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Expected Participants</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.expectedParticipants || 0}
                        onChange={(e) => setEditFormData({...editFormData, expectedParticipants: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Registered Participants</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.registeredParticipants || 0}
                        onChange={(e) => setEditFormData({...editFormData, registeredParticipants: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Contact Person</label>
                      <input
                        type="text"
                        value={editFormData.contactPerson || ''}
                        onChange={(e) => setEditFormData({...editFormData, contactPerson: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
                      <select
                        value={editFormData.status || 'Pending'}
                        onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Postponed">Postponed</option>
                      </select>
                    </div>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                      <textarea
                        value={editFormData.description || ''}
                        onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Requirements</label>
                      <textarea
                        value={editFormData.requirements || ''}
                        onChange={(e) => setEditFormData({...editFormData, requirements: e.target.value})}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                  <button
                    onClick={handleCancelEdit}
                    disabled={editLoading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '1px solid var(--gray-300)',
                      background: 'white',
                      color: 'var(--gray-700)',
                      borderRadius: '0.5rem',
                      cursor: editLoading ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={editLoading || !editFormData.title || !editFormData.location}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      background: editLoading || !editFormData.title || !editFormData.location ? 'var(--gray-400)' : 'var(--blue-600)',
                      color: 'white',
                      borderRadius: '0.5rem',
                      cursor: editLoading || !editFormData.title || !editFormData.location ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Camp Modal */}
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
                <h3 className="card-title">Camp Details</h3>
                <button
                  onClick={() => { setViewModalOpen(false); setSelectedCamp(null); }}
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
                ) : selectedCamp ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Tent size={24} color="var(--purple-600)" />
                      <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>{selectedCamp.title}</h2>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: getStatusColor(selectedCamp.status),
                          backgroundColor: `${getStatusColor(selectedCamp.status)}20`,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {selectedCamp.status}
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
                          <div><strong>Date:</strong> {selectedCamp.date}</div>
                          <div><strong>Time:</strong> {selectedCamp.time}</div>
                          <div><strong>Camp Type:</strong> {selectedCamp.campType}</div>
                          <div><strong>Created:</strong> {selectedCamp.createdAt}</div>
                        </div>
                      </div>

                      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <MapPin size={16} color="var(--green-600)" />
                          <strong style={{ color: 'var(--green-700)' }}>Location & Organizer</strong>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                          <div><strong>Location:</strong> {selectedCamp.location}</div>
                          <div><strong>Organizer:</strong> {selectedCamp.organizer || '—'}</div>
                          <div><strong>Contact Person:</strong> {selectedCamp.contactPerson || '—'}</div>
                          <div><strong>Last Updated:</strong> {selectedCamp.lastUpdated}</div>
                        </div>
                      </div>

                      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--purple-25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Users size={16} color="var(--purple-600)" />
                          <strong style={{ color: 'var(--purple-700)' }}>Attendance</strong>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                          <div><strong>Expected Participants:</strong> {selectedCamp.expectedParticipants || 0}</div>
                          <div><strong>Registered:</strong> {selectedCamp.registeredParticipants || 0}</div>
                          <div><strong>Target Audience:</strong> {selectedCamp.targetAudience}</div>
                          <div><strong>Published Date:</strong> {selectedCamp.publishedDate}</div>
                        </div>
                      </div>
                    </div>

                    {selectedCamp.description && (
                      <div>
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Description</h4>
                        <p style={{ margin: 0, color: 'var(--gray-700)', lineHeight: '1.5' }}>{selectedCamp.description}</p>
                      </div>
                    )}

                    {selectedCamp.requirements && (
                      <div>
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Requirements</h4>
                        <p style={{ margin: 0, color: 'var(--gray-700)', lineHeight: '1.5' }}>{selectedCamp.requirements}</p>
                      </div>
                    )}

                    {Array.isArray(selectedCamp.services) && selectedCamp.services.length > 0 && (
                      <div>
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Services</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {selectedCamp.services.map((service: string, index: number) => (
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
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Failed to load camp details.</p>
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

export default LocalCampsManagement;