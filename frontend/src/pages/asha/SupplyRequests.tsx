import React, { useState, useEffect } from 'react';
import AshaLayout from './AshaLayout';
import { supplyAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, XCircle, User, MapPin, Phone, Calendar, Truck } from 'lucide-react';

interface SupplyRequest {
  _id: string;
  supplyName: string;
  description: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    beneficiaryCategory: string;
    phone: string;
    address: string;
  };
  reviewNotes?: string;
  expectedDeliveryDate?: string;
}

const SupplyRequests: React.FC = () => {
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulingRequest, setSchedulingRequest] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');

  useEffect(() => {
    fetchApprovedRequests();
  }, []);

  const fetchApprovedRequests = async () => {
    try {
      const response = await supplyAPI.getApprovedRequests();
      setRequests(response.requests || []);
    } catch (error: any) {
      toast.error('Failed to fetch approved supply requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleDelivery = async (requestId: string) => {
    if (!deliveryDate) {
      toast.error('Please select a delivery date');
      return;
    }

    try {
      await supplyAPI.scheduleDelivery(requestId, deliveryDate);
      toast.success('Delivery scheduled successfully');
      setSchedulingRequest(null);
      setDeliveryDate('');
      fetchApprovedRequests(); // Refresh the list
    } catch (error: any) {
      toast.error('Failed to schedule delivery');
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--yellow-600)';
      case 'approved': return 'var(--green-600)';
      case 'rejected': return 'var(--red-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--yellow-50)';
      case 'approved': return 'var(--green-50)';
      case 'rejected': return 'var(--red-50)';
      default: return 'var(--gray-50)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} color="var(--yellow-600)" />;
      case 'approved': return <CheckCircle size={16} color="var(--green-600)" />;
      case 'rejected': return <XCircle size={16} color="var(--red-600)" />;
      default: return <Clock size={16} color="var(--gray-600)" />;
    }
  };

  if (loading) {
    return (
      <AshaLayout title="Supply Requests">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading approved supply requests...
        </div>
      </AshaLayout>
    );
  }

  return (
    <AshaLayout title="Supply Requests">
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem' }}>
            Schedule delivery dates for approved medical supply requests.
          </p>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {requests.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Approved Requests</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {requests.filter(r => r.expectedDeliveryDate).length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Scheduled</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {requests.filter(r => !r.expectedDeliveryDate).length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending Schedule</div>
          </div>
        </div>

        {/* Supply Requests List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Approved Supply Requests</h2>
          </div>
          <div className="card-content">
            {requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                No approved supply requests pending delivery scheduling
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {requests.map((request) => (
                  <div
                    key={request._id}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      border: '1px solid var(--gray-200)',
                      borderLeft: `4px solid var(--green-600)`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <User size={18} color="var(--gray-600)" />
                          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                            {request.user.name}
                          </h3>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'var(--blue-600)',
                            backgroundColor: 'var(--blue-50)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem'
                          }}>
                            {request.category}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                          <strong>Supply:</strong> {request.supplyName}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                          <strong>Description:</strong> {request.description}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          <strong>Approved:</strong> {new Date(request.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {request.expectedDeliveryDate ? (
                          <div style={{ textAlign: 'center' }}>
                            <Truck size={16} color="var(--green-600)" />
                            <div style={{ fontSize: '0.75rem', color: 'var(--green-600)', fontWeight: '600' }}>
                              Scheduled
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                              {new Date(request.expectedDeliveryDate).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center' }}>
                            <Clock size={16} color="var(--yellow-600)" />
                            <div style={{ fontSize: '0.75rem', color: 'var(--yellow-600)', fontWeight: '600' }}>
                              Pending
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} color="var(--gray-500)" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          {request.user.address || 'Address not provided'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={16} color="var(--gray-500)" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          {request.user.phone || 'Phone not provided'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} color="var(--gray-500)" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          {request.user.beneficiaryCategory}
                        </span>
                      </div>
                    </div>

                    {!request.expectedDeliveryDate && (
                      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                        {schedulingRequest === request._id ? (
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <Calendar size={16} color="var(--gray-600)" />
                            <input
                              type="date"
                              value={deliveryDate}
                              onChange={(e) => setDeliveryDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              style={{
                                padding: '0.5rem',
                                border: '1px solid var(--gray-300)',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem'
                              }}
                            />
                            <button
                              className="btn btn-primary"
                              onClick={() => handleScheduleDelivery(request._id)}
                              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                            >
                              Schedule
                            </button>
                            <button
                              className="btn"
                              onClick={() => {
                                setSchedulingRequest(null);
                                setDeliveryDate('');
                              }}
                              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-primary"
                            onClick={() => setSchedulingRequest(request._id)}
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                          >
                            <Calendar size={16} style={{ marginRight: '0.5rem' }} />
                            Schedule Delivery
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AshaLayout>
  );
};

export default SupplyRequests;