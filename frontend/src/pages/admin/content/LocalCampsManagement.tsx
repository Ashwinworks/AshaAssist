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
} from 'lucide-react';
import { communityAPI } from '../../../services/api';

// Admin page to review/approve local health camps announced by ASHA workers
const LocalCampsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | pending | approved | rejected | scheduled | completed
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const data = await communityAPI.getCamp(campId);
      const camp = data.camp || {};
      alert(`Camp Details\n\nTitle: ${camp.title}\nDate: ${camp.date}\nTime: ${camp.time}\nLocation: ${camp.location}\nOrganizer: ${camp.organizer || ''}\nStatus: ${camp.status || ''}`);
    } catch (e) {
      alert('Failed to load camp details');
    }
  };

  const handleEdit = async (campId: string) => {
    try {
      // Get latest to prefill
      const data = await communityAPI.getCamp(campId);
      const item = data.camp || {};

      const newTitle = window.prompt('Edit title', item.title || '');
      if (newTitle === null) return;

      const newDate = window.prompt('Edit date (YYYY-MM-DD)', item.date || '');
      if (newDate === null) return;

      const newTime = window.prompt('Edit time (e.g., 10:00 AM)', item.time || '');
      if (newTime === null) return;

      const newLocation = window.prompt('Edit location', item.location || '');
      if (newLocation === null) return;

      const newOrganizer = window.prompt('Edit organizer', item.organizer || '');
      if (newOrganizer === null) return;

      const newCampType = window.prompt('Edit camp type', item.campType || '');
      if (newCampType === null) return;

      const newServices = window.prompt('Edit services (comma-separated)', Array.isArray(item.services) ? item.services.join(', ') : '');
      if (newServices === null) return;

      const newTargetAudience = window.prompt('Edit target audience', item.targetAudience || '');
      if (newTargetAudience === null) return;

      const newExpected = window.prompt('Edit expected participants', String(item.expectedParticipants ?? ''));
      if (newExpected === null) return;

      const newRegistered = window.prompt('Edit registered participants', String(item.registeredParticipants ?? ''));
      if (newRegistered === null) return;

      const newDescription = window.prompt('Edit description', item.description || '');
      if (newDescription === null) return;

      const newRequirements = window.prompt('Edit requirements', item.requirements || '');
      if (newRequirements === null) return;

      const newContactPerson = window.prompt('Edit contact person', item.contactPerson || '');
      if (newContactPerson === null) return;

      const newStatus = window.prompt('Edit status (Pending, Approved, Rejected, Scheduled, Completed, Cancelled, Postponed)', item.status || 'Pending');
      if (newStatus === null) return;

      const payload: any = {
        title: (newTitle || '').trim(),
        date: (newDate || '').trim(),
        time: (newTime || '').trim(),
        location: (newLocation || '').trim(),
        organizer: (newOrganizer || '').trim(),
        campType: (newCampType || '').trim(),
        services: (newServices || '')
          .split(',')
          .map((s) => s.trim())
          .filter((s) => !!s),
        targetAudience: (newTargetAudience || '').trim(),
        expectedParticipants: Number.isNaN(parseInt(newExpected)) ? 0 : parseInt(newExpected),
        registeredParticipants: Number.isNaN(parseInt(newRegistered)) ? 0 : parseInt(newRegistered),
        description: (newDescription || '').trim(),
        requirements: (newRequirements || '').trim(),
        contactPerson: (newContactPerson || '').trim(),
        status: (newStatus || '').trim(),
      };

      await communityAPI.updateCamp(campId, payload);
      await fetchCamps();
    } catch (e) {
      alert('Failed to update camp');
    }
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
      </div>
    </AdminLayout>
  );
};

export default LocalCampsManagement;