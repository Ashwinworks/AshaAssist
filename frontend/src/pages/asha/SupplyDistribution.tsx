import React, { useState } from 'react';
import AshaLayout from './AshaLayout';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Search } from 'lucide-react';

const SupplyDistribution: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for demonstration
  const approvedSupplies = [
    {
      id: 1,
      requestId: 'REQ001',
      familyName: 'Meera Patel',
      requestType: 'Maternity',
      items: [
        { name: 'Iron tablets', quantity: '90 tablets', distributed: 90, total: 90 },
        { name: 'Folic acid', quantity: '90 tablets', distributed: 90, total: 90 },
        { name: 'Calcium supplements', quantity: '90 tablets', distributed: 0, total: 90 }
      ],
      address: 'House No. 67, Ward 12, Sector A',
      phone: '+91 98765 43213',
      approvedDate: '2024-01-14',
      deliveryStatus: 'Partially Delivered',
      lastDelivery: '2024-01-16',
      nextDelivery: '2024-01-20',
      priority: 'High',
      notes: 'Calcium supplements out of stock, will deliver next week'
    },
    {
      id: 2,
      requestId: 'REQ002',
      familyName: 'Ramesh Singh',
      requestType: 'Palliative',
      items: [
        { name: 'Pain medication', quantity: '30 tablets', distributed: 30, total: 30 },
        { name: 'Wound dressing', quantity: '10 pieces', distributed: 10, total: 10 },
        { name: 'Antiseptic', quantity: '2 bottles', distributed: 2, total: 2 }
      ],
      address: 'House No. 89, Ward 12, Sector B',
      phone: '+91 98765 43214',
      approvedDate: '2024-01-15',
      deliveryStatus: 'Delivered',
      lastDelivery: '2024-01-17',
      nextDelivery: null,
      priority: 'Urgent',
      notes: 'All items delivered successfully'
    },
    {
      id: 3,
      requestId: 'REQ003',
      familyName: 'Kavita Sharma',
      requestType: 'Child Health',
      items: [
        { name: 'ORS packets', quantity: '20 packets', distributed: 0, total: 20 },
        { name: 'Vitamin drops', quantity: '2 bottles', distributed: 0, total: 2 },
        { name: 'Growth monitoring chart', quantity: '1 piece', distributed: 0, total: 1 }
      ],
      address: 'House No. 34, Ward 12, Sector C',
      phone: '+91 98765 43215',
      approvedDate: '2024-01-16',
      deliveryStatus: 'Pending',
      lastDelivery: null,
      nextDelivery: '2024-01-19',
      priority: 'Medium',
      notes: 'Scheduled for delivery tomorrow'
    },
    {
      id: 4,
      requestId: 'REQ004',
      familyName: 'Sunita Devi',
      requestType: 'Maternity',
      items: [
        { name: 'Postnatal vitamins', quantity: '60 tablets', distributed: 60, total: 60 },
        { name: 'Iron syrup', quantity: '2 bottles', distributed: 2, total: 2 }
      ],
      address: 'House No. 23, Ward 12, Sector C',
      phone: '+91 98765 43212',
      approvedDate: '2024-01-13',
      deliveryStatus: 'Delivered',
      lastDelivery: '2024-01-15',
      nextDelivery: null,
      priority: 'Medium',
      notes: 'Delivery completed, family satisfied'
    }
  ];

  const filteredSupplies = approvedSupplies.filter(supply => {
    const matchesSearch = supply.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.requestId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'pending') return matchesSearch && supply.deliveryStatus === 'Pending';
    if (filterStatus === 'partial') return matchesSearch && supply.deliveryStatus === 'Partially Delivered';
    if (filterStatus === 'delivered') return matchesSearch && supply.deliveryStatus === 'Delivered';
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'var(--green-600)';
      case 'Partially Delivered': return 'var(--yellow-600)';
      case 'Pending': return 'var(--blue-600)';
      case 'Delayed': return 'var(--red-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Delivered': return 'var(--green-50)';
      case 'Partially Delivered': return 'var(--yellow-50)';
      case 'Pending': return 'var(--blue-50)';
      case 'Delayed': return 'var(--red-50)';
      default: return 'var(--gray-50)';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'var(--red-600)';
      case 'High': return 'var(--orange-600)';
      case 'Medium': return 'var(--yellow-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getCompletionPercentage = (items: any[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.total, 0);
    const distributedItems = items.reduce((sum, item) => sum + item.distributed, 0);
    return totalItems > 0 ? Math.round((distributedItems / totalItems) * 100) : 0;
  };

  return (
    <AshaLayout title="Supply Distribution">
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem' }}>
            Track and update delivery status for approved supply requests.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-content" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '300px' }}>
                <Search size={20} color="var(--gray-400)" />
                <input 
                  type="text" 
                  placeholder="Search by family name or request ID..."
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
                  minWidth: '150px'
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="partial">Partially Delivered</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {approvedSupplies.filter(s => s.deliveryStatus === 'Pending').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending Deliveries</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {approvedSupplies.filter(s => s.deliveryStatus === 'Partially Delivered').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Partial Deliveries</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {approvedSupplies.filter(s => s.deliveryStatus === 'Delivered').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Completed</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {approvedSupplies.reduce((sum, s) => sum + s.items.length, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Items</div>
          </div>
        </div>

        {/* Supply Distribution List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Approved Supply Requests</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredSupplies.map((supply) => (
                <div 
                  key={supply.id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid var(--gray-200)',
                    borderLeft: `4px solid ${getStatusColor(supply.deliveryStatus)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Package size={18} color="var(--blue-600)" />
                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                          {supply.familyName}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--gray-600)',
                          backgroundColor: 'var(--gray-100)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {supply.requestId}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getPriorityColor(supply.priority),
                          backgroundColor: `${getPriorityColor(supply.priority)}20`,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {supply.priority}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        <div><strong>Type:</strong> {supply.requestType}</div>
                        <div><strong>Approved:</strong> {supply.approvedDate}</div>
                        <div><strong>Phone:</strong> {supply.phone}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: getStatusColor(supply.deliveryStatus),
                        backgroundColor: getStatusBg(supply.deliveryStatus),
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.375rem'
                      }}>
                        {supply.deliveryStatus}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Package size={16} color="var(--blue-600)" />
                      <strong style={{ color: 'var(--blue-700)' }}>Items to Distribute</strong>
                      <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        {getCompletionPercentage(supply.items)}% Complete
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
                      {supply.items.map((item, index) => (
                        <div 
                          key={index}
                          className="card" 
                          style={{ 
                            padding: '0.75rem', 
                            backgroundColor: item.distributed === item.total ? 'var(--green-25)' : 'var(--gray-25)',
                            border: `1px solid ${item.distributed === item.total ? 'var(--green-200)' : 'var(--gray-200)'}`
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--gray-800)' }}>
                              {item.name}
                            </span>
                            {item.distributed === item.total ? (
                              <CheckCircle size={16} color="var(--green-600)" />
                            ) : (
                              <Clock size={16} color="var(--yellow-600)" />
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                            <div>Quantity: {item.quantity}</div>
                            <div>Distributed: {item.distributed}/{item.total}</div>
                          </div>
                          {item.distributed < item.total && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <div style={{ 
                                width: '100%', 
                                height: '4px', 
                                backgroundColor: 'var(--gray-200)', 
                                borderRadius: '2px',
                                overflow: 'hidden'
                              }}>
                                <div style={{ 
                                  width: `${(item.distributed / item.total) * 100}%`, 
                                  height: '100%', 
                                  backgroundColor: 'var(--blue-600)',
                                  borderRadius: '2px'
                                }} />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <MapPin size={16} color="var(--blue-600)" />
                        <strong style={{ color: 'var(--blue-700)' }}>Delivery Address</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        {supply.address}
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Truck size={16} color="var(--green-600)" />
                        <strong style={{ color: 'var(--green-700)' }}>Delivery Schedule</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        {supply.lastDelivery && <div>Last: {supply.lastDelivery}</div>}
                        {supply.nextDelivery && <div>Next: {supply.nextDelivery}</div>}
                        {!supply.nextDelivery && supply.deliveryStatus === 'Delivered' && (
                          <div style={{ color: 'var(--green-600)', fontWeight: '500' }}>Completed</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {supply.notes && (
                    <div style={{ padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <strong style={{ color: 'var(--gray-700)', fontSize: '0.875rem' }}>Notes:</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        {supply.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                    {supply.deliveryStatus !== 'Delivered' && (
                      <>
                        <button 
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
                          Mark as Delivered
                        </button>
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
                          <Package size={14} />
                          Update Items
                        </button>
                      </>
                    )}
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
                      <Phone size={14} />
                      Contact Family
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AshaLayout>
  );
};

export default SupplyDistribution;