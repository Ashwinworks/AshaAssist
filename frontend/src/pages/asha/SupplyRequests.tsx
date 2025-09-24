import React from 'react';
import AshaLayout from './AshaLayout';
import { Clock, CheckCircle, XCircle, User, MapPin, Phone } from 'lucide-react';

const SupplyRequests: React.FC = () => {
  // Mock data for demonstration
  const supplyRequests = [
    {
      id: 1,
      familyName: 'Meera Patel',
      requestType: 'Maternity',
      items: ['Iron tablets', 'Folic acid', 'Calcium supplements'],
      quantity: '3 months supply',
      priority: 'High',
      address: 'House No. 67, Ward 12, Sector A',
      phone: '+91 98765 43213',
      requestedDate: '2024-01-14',
      status: 'Pending',
      submittedAt: '2024-01-14 09:15 AM'
    },
    {
      id: 2,
      familyName: 'Ramesh Singh',
      requestType: 'Palliative',
      items: ['Pain medication', 'Wound dressing', 'Antiseptic'],
      quantity: '1 month supply',
      priority: 'Urgent',
      address: 'House No. 89, Ward 12, Sector B',
      phone: '+91 98765 43214',
      requestedDate: '2024-01-15',
      status: 'Pending',
      submittedAt: '2024-01-15 11:45 AM'
    },
    {
      id: 3,
      familyName: 'Kavita Sharma',
      requestType: 'Child Health',
      items: ['ORS packets', 'Vitamin drops', 'Growth monitoring chart'],
      quantity: '2 months supply',
      priority: 'Medium',
      address: 'House No. 34, Ward 12, Sector C',
      phone: '+91 98765 43215',
      requestedDate: '2024-01-16',
      status: 'Approved',
      submittedAt: '2024-01-13 03:20 PM'
    }
  ];

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
      default: return <Clock size={16} color="var(--gray-600)" />;
    }
  };

  return (
    <AshaLayout title="Supply Requests">
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem' }}>
            Review and approve medical supply requests from families in your ward.
          </p>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--red-600)', marginBottom: '0.5rem' }}>
              2
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending Requests</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              1
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Approved Today</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              15
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>This Month</div>
          </div>
        </div>

        {/* Supply Requests List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Supply Requests</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {supplyRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid var(--gray-200)',
                    borderLeft: `4px solid ${getPriorityColor(request.priority)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
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
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                        <strong>Type:</strong> {request.requestType}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                        <strong>Items:</strong> {request.items.join(', ')}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        <strong>Quantity:</strong> {request.quantity}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(request.status)}
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
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
                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                      <button 
                        className="btn"
                        style={{ 
                          backgroundColor: 'var(--green-600)', 
                          color: 'white', 
                          border: 'none',
                          fontSize: '0.875rem',
                          padding: '0.5rem 1rem'
                        }}
                      >
                        Approve Request
                      </button>
                      <button 
                        className="btn"
                        style={{ 
                          backgroundColor: 'var(--blue-600)', 
                          color: 'white', 
                          border: 'none',
                          fontSize: '0.875rem',
                          padding: '0.5rem 1rem'
                        }}
                      >
                        Request More Info
                      </button>
                      <button 
                        className="btn"
                        style={{ 
                          backgroundColor: 'var(--red-600)', 
                          color: 'white', 
                          border: 'none',
                          fontSize: '0.875rem',
                          padding: '0.5rem 1rem'
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AshaLayout>
  );
};

export default SupplyRequests;