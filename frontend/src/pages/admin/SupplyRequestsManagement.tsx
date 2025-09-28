import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Eye, Check, X, Download, Filter } from 'lucide-react';

interface SupplyRequest {
  _id: string;
  supplyName: string;
  description: string;
  category: string;
  proofFile: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    beneficiaryCategory: string;
  };
  reviewedBy?: string;
  reviewNotes?: string;
}

const SupplyRequestsManagement: React.FC = () => {
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SupplyRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);

      const response = await adminAPI.getSupplyRequests(`?${params.toString()}`);
      setRequests(response.requests || []);
    } catch (error: any) {
      toast.error('Failed to fetch supply requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await adminAPI.updateSupplyRequest(requestId, {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewNotes: reviewNotes.trim()
      });

      toast.success(`Request ${action}d successfully`);
      setActionModalOpen(false);
      setReviewNotes('');
      fetchRequests();
    } catch (error: any) {
      toast.error(`Failed to ${action} request`);
      console.error(error);
    }
  };

  const openActionModal = (request: SupplyRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setActionModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--yellow-600)';
      case 'approved': return 'var(--green-600)';
      case 'rejected': return 'var(--red-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--yellow-50)';
      case 'approved': return 'var(--green-50)';
      case 'rejected': return 'var(--red-50)';
      default: return 'var(--gray-50)';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Supply Requests Management">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading supply requests...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Supply Requests Management">
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">Supply Requests</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 4 }}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 4 }}
              >
                <option value="">All Categories</option>
                <option value="maternity">Maternity</option>
                <option value="palliative">Palliative</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card-content">
          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
              No supply requests found
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {requests.map((request) => (
                <div key={request._id} className="card" style={{ margin: 0, padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{request.supplyName}</h3>
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            color: getStatusColor(request.status),
                            backgroundColor: getStatusBgColor(request.status)
                          }}
                        >
                          {request.status.toUpperCase()}
                        </span>
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            backgroundColor: 'var(--blue-100)',
                            color: 'var(--blue-700)'
                          }}
                        >
                          {request.category}
                        </span>
                      </div>
                      <p style={{ margin: '0.5rem 0', color: 'var(--gray-600)' }}>
                        <strong>User:</strong> {request.user.name} ({request.user.email})
                      </p>
                      <p style={{ margin: '0.5rem 0', color: 'var(--gray-700)' }}>
                        {request.description}
                      </p>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                        Requested on: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      {request.reviewNotes && (
                        <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          <strong>Review Notes:</strong> {request.reviewNotes}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        className="btn"
                        onClick={() => {
                          setSelectedRequest(request);
                          setModalOpen(true);
                        }}
                        style={{ padding: '0.5rem' }}
                      >
                        <Eye size={16} />
                      </button>
                      <a
                        href={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${request.proofFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn"
                        style={{ padding: '0.5rem' }}
                      >
                        <Download size={16} />
                      </a>
                      {request.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-success"
                            onClick={() => openActionModal(request, 'approve')}
                            style={{ padding: '0.5rem' }}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => openActionModal(request, 'reject')}
                            style={{ padding: '0.5rem' }}
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {modalOpen && selectedRequest && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '600px', background: 'white', padding: '1rem', border: '1px solid var(--gray-200)' }}>
            <div className="card-header">
              <h3 className="card-title">{selectedRequest.supplyName}</h3>
            </div>
            <div className="card-content" style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <strong>User:</strong> {selectedRequest.user.name} ({selectedRequest.user.email})
              </div>
              <div>
                <strong>Category:</strong> {selectedRequest.category}
              </div>
              <div>
                <strong>Description:</strong>
                <p style={{ marginTop: '0.5rem' }}>{selectedRequest.description}</p>
              </div>
              <div>
                <strong>Status:</strong> {selectedRequest.status}
              </div>
              <div>
                <strong>Requested on:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}
              </div>
              {selectedRequest.reviewNotes && (
                <div>
                  <strong>Review Notes:</strong>
                  <p style={{ marginTop: '0.5rem' }}>{selectedRequest.reviewNotes}</p>
                </div>
              )}
              <div>
                <strong>Proof Document:</strong>
                <a
                  href={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${selectedRequest.proofFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--blue-600)', textDecoration: 'underline' }}
                >
                  View Document
                </a>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn" onClick={() => setModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModalOpen && selectedRequest && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px', background: 'white', padding: '1rem', border: '1px solid var(--gray-200)' }}>
            <div className="card-header">
              <h3 className="card-title">{actionType === 'approve' ? 'Approve' : 'Reject'} Request</h3>
            </div>
            <div className="card-content" style={{ display: 'grid', gap: '1rem' }}>
              <p>
                Are you sure you want to <strong>{actionType}</strong> the request for <strong>{selectedRequest.supplyName}</strong> by {selectedRequest.user.name}?
              </p>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about this decision..."
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 8 }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn" onClick={() => setActionModalOpen(false)}>
                Cancel
              </button>
              <button
                className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={() => handleAction(selectedRequest._id, actionType)}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SupplyRequestsManagement;