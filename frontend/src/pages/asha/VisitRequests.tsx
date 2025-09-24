import React, { useState, useEffect } from 'react';
import AshaLayout from './AshaLayout';
import { Clock, MapPin, User, Phone, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface VisitRequest {
  id: string;
  familyName: string;
  requestType: string;
  priority: string;
  reason: string;
  address: string;
  phone: string;
  requestedDate?: string;
  status: string;
  submittedAt: string;
  scheduledDateTime?: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

const VisitRequests: React.FC = () => {
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingRequest, setSchedulingRequest] = useState<VisitRequest | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    scheduledDate: '',
    scheduledTime: ''
  });

  const fetchVisitRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('/api/visit-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setVisitRequests(data.requests || []);
      } else {
        setError(data.error || 'Failed to fetch visit requests');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/visit-requests/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setStats(data.stats || { pending: 0, approved: 0, total: 0 });
      }
    } catch (error) {
      // Silently fail for stats
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string, scheduledDate?: string, scheduledTime?: string) => {
    try {
      setUpdatingStatus(requestId);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const requestBody: any = { status: newStatus };
      if (scheduledDate) requestBody.scheduledDate = scheduledDate;
      if (scheduledTime) requestBody.scheduledTime = scheduledTime;

      const response = await fetch(`/api/visit-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the data
        await fetchVisitRequests();
        await fetchStats();
        // Close modal if it was open
        setShowScheduleModal(false);
        setSchedulingRequest(null);
        setScheduleForm({ scheduledDate: '', scheduledTime: '' });
      } else {
        setError(data.error || 'Failed to update request status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleScheduleClick = (request: VisitRequest) => {
    setSchedulingRequest(request);
    setScheduleForm({
      scheduledDate: '',
      scheduledTime: ''
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingRequest) return;

    if (!scheduleForm.scheduledDate) {
      setError('Please select a date');
      return;
    }

    updateRequestStatus(
      schedulingRequest.id,
      'Scheduled',
      scheduleForm.scheduledDate,
      scheduleForm.scheduledTime || undefined
    );
  };

  useEffect(() => {
    fetchVisitRequests();
    fetchStats();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'var(--red-600)';
      case 'High': return 'var(--orange-600)';
      case 'Medium': return 'var(--yellow-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'var(--red-50)';
      case 'High': return 'var(--orange-50)';
      case 'Medium': return 'var(--yellow-50)';
      default: return 'var(--gray-50)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={16} color="var(--yellow-600)" />;
      case 'Approved': return <CheckCircle size={16} color="var(--green-600)" />;
      case 'Rejected': return <XCircle size={16} color="var(--red-600)" />;
      case 'Completed': return <CheckCircle size={16} color="var(--blue-600)" />;
      default: return <Clock size={16} color="var(--gray-600)" />;
    }
  };

  if (loading) {
    return (
      <AshaLayout title="Home Visit Requests">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={48} style={{ color: 'var(--gray-400)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--gray-600)' }}>Loading visit requests...</p>
        </div>
      </AshaLayout>
    );
  }

  return (
    <AshaLayout title="Home Visit Requests">
      <div>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem' }}>
              Review and manage home visit requests from families in your ward.
            </p>
          </div>
          <button
            onClick={() => { fetchVisitRequests(); fetchStats(); }}
            className="btn"
            style={{
              backgroundColor: 'var(--blue-600)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--red-50)',
            border: '1px solid var(--red-200)',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} color="var(--red-600)" />
            <span style={{ color: 'var(--red-700)' }}>{error}</span>
          </div>
        )}

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {stats.pending}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending Requests</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {stats.approved}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Approved Requests</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {stats.total}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Requests</div>
          </div>
        </div>

        {/* Visit Requests List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Visit Requests</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {visitRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid var(--gray-200)',
                    borderLeft: `4px solid ${getPriorityColor(request.priority)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <User size={18} color="var(--gray-600)" />
                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                          {request.familyName}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getPriorityColor(request.priority),
                          backgroundColor: getPriorityBg(request.priority),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {request.priority}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                        <strong>Type:</strong> {request.requestType} Care
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                        <strong>Reason:</strong> {request.reason}
                      </div>
                      {request.status === 'Scheduled' && request.scheduledDateTime && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--green-700)', marginBottom: '0.25rem', fontWeight: '500' }}>
                          <strong>🗓️ Scheduled:</strong> {request.scheduledDate}
                          {request.scheduledTime && ` at ${request.scheduledTime}`}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(request.status)}
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} color="var(--gray-500)" />
                      <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        {request.address}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={16} color="var(--gray-500)" />
                      <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        {request.phone}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} color="var(--gray-500)" />
                      <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        Requested: {request.requestedDate}
                      </span>
                    </div>
                  </div>

                  {request.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'Approved')}
                        disabled={updatingStatus === request.id}
                        className="btn"
                        style={{
                          backgroundColor: 'var(--green-600)',
                          color: 'white',
                          border: 'none',
                          fontSize: '0.875rem',
                          padding: '0.5rem 1rem',
                          minWidth: '160px',
                          opacity: updatingStatus === request.id ? 0.6 : 1
                        }}
                      >
                        {updatingStatus === request.id ? 'Updating...' : 'Approve Visit'}
                      </button>
                      <button
                        onClick={() => handleScheduleClick(request)}
                        disabled={updatingStatus === request.id}
                        className="btn"
                        style={{
                          backgroundColor: 'var(--blue-600)',
                          color: 'white',
                          border: 'none',
                          fontSize: '0.875rem',
                          padding: '0.5rem 1rem',
                          minWidth: '160px',
                          opacity: updatingStatus === request.id ? 0.6 : 1
                        }}
                      >
                        Schedule Later
                      </button>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'Rejected')}
                        disabled={updatingStatus === request.id}
                        className="btn"
                        style={{
                          backgroundColor: 'var(--red-600)',
                          color: 'white',
                          border: 'none',
                          fontSize: '0.875rem',
                          padding: '0.5rem 1rem',
                          minWidth: '120px',
                          opacity: updatingStatus === request.id ? 0.6 : 1
                        }}
                      >
                        {updatingStatus === request.id ? 'Updating...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Visit Modal */}
        {showScheduleModal && schedulingRequest && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                  Schedule Visit for {schedulingRequest.familyName}
                </h2>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--gray-500)',
                    padding: '0.25rem'
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleScheduleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ marginBottom: '1rem', color: 'var(--gray-600)' }}>
                    <strong>Request Type:</strong> {schedulingRequest.requestType} Care<br/>
                    <strong>Reason:</strong> {schedulingRequest.reason}
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Visit Date *
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Visit Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                  <small style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                    Leave empty if time is not fixed
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="btn"
                    style={{
                      backgroundColor: 'var(--gray-200)',
                      color: 'var(--gray-700)',
                      border: 'none',
                      padding: '0.75rem 1.5rem'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStatus === schedulingRequest.id}
                    className="btn"
                    style={{
                      backgroundColor: updatingStatus === schedulingRequest.id ? 'var(--gray-400)' : 'var(--blue-600)',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      cursor: updatingStatus === schedulingRequest.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {updatingStatus === schedulingRequest.id ? 'Scheduling...' : 'Schedule Visit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AshaLayout>
  );
};

export default VisitRequests;