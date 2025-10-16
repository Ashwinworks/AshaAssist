import React, { useState, useEffect } from 'react';
import AshaLayout from './AshaLayout';
import { supplyAPI, locationsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, XCircle, User, MapPin, Phone, Calendar, Truck, Home, Building2, History, Package } from 'lucide-react';

interface SupplyRequest {
  _id: string;
  userId: string;
  supplyName: string;
  description: string;
  category: string;
  proofFile?: string;
  status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'delivered';
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
  expectedDeliveryDate?: string;
  scheduledAt?: string;
  scheduledBy?: string;
  deliveryLocation?: 'home' | 'ward';
  deliveryStatus?: 'pending' | 'scheduled' | 'delivered';
  user: {
    name: string;
    email: string;
    beneficiaryCategory: string;
    phone: string;
    address: string;
  };
}

const SupplyRequests: React.FC = () => {
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [scheduledRequests, setScheduledRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulingRequest, setSchedulingRequest] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState<'home' | 'ward'>('home');
  const [selectedAnganwadiId, setSelectedAnganwadiId] = useState<string>('');
  const [locations, setLocations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'scheduled'>('pending');

  useEffect(() => {
    fetchApprovedRequests();
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await locationsAPI.getLocations();
      setLocations(response.locations || []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const fetchApprovedRequests = async () => {
    try {
      // First try to get approved requests
      let allRequests: SupplyRequest[] = [];
      
      try {
        const approvedResponse = await supplyAPI.getApprovedRequests();
        const approvedRequests = approvedResponse.requests || [];
        console.log('Approved requests:', approvedRequests);
        
        // Also try to get scheduled requests if they exist in a separate endpoint
        try {
          const scheduledResponse = await supplyAPI.getScheduledRequests();
          const scheduledRequests = scheduledResponse.requests || [];
          console.log('Scheduled requests from dedicated endpoint:', scheduledRequests);
          
          // Combine both approved and scheduled requests
          allRequests = [...approvedRequests, ...scheduledRequests];
          console.log('Combined approved + scheduled requests:', allRequests);
        } catch (scheduledError) {
          console.log('No dedicated scheduled endpoint, using only approved requests');
          allRequests = approvedRequests;
        }
        
      } catch (approvedError) {
        console.log('Approved endpoint failed, trying all requests:', approvedError);
        // If approved endpoint fails, try to get all requests
        try {
          const allResponse = await supplyAPI.getAllRequests();
          const allRequestsData = allResponse.requests || [];
          // Filter for approved AND scheduled requests (backend might change status)
          allRequests = allRequestsData.filter((req: SupplyRequest) => 
            req.status === 'approved' || req.status === 'scheduled'
          );
          console.log('All requests (filtered for approved/scheduled):', allRequests);
        } catch (allError) {
          console.error('Both endpoints failed:', allError);
          throw allError;
        }
      }
      
      console.log('Final all requests:', allRequests);
      console.log('Total requests:', allRequests.length);
      
      // Log each request in detail to see what fields are present
      allRequests.forEach((req, index) => {
        console.log(`Request ${index + 1}:`, {
          _id: req._id,
          supplyName: req.supplyName,
          status: req.status,
          expectedDeliveryDate: req.expectedDeliveryDate,
          scheduledAt: req.scheduledAt,
          hasExpectedDeliveryDate: !!req.expectedDeliveryDate,
          fullRequest: req
        });
      });
      
      // Filter to show only unscheduled requests in the pending tab
      // Check multiple possible field names for delivery date
      const unscheduledRequests = allRequests.filter(
        (req: any) => !req.expectedDeliveryDate && !req.deliveryDate && !req.scheduledDate
      );
      console.log('Unscheduled requests:', unscheduledRequests);
      
      // Also update scheduled requests from the same data
      // Check multiple possible field names for delivery date
      const scheduledRequests = allRequests.filter(
        (req: any) => req.expectedDeliveryDate || req.deliveryDate || req.scheduledDate
      );
      console.log('Scheduled requests:', scheduledRequests);
      
      // If we found scheduled requests using alternative field names, normalize them
      scheduledRequests.forEach((req: any) => {
        if (!req.expectedDeliveryDate) {
          req.expectedDeliveryDate = req.deliveryDate || req.scheduledDate;
        }
      });
      
      setRequests(unscheduledRequests);
      setScheduledRequests(scheduledRequests);
      
    } catch (error: any) {
      toast.error('Failed to fetch supply requests');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduledRequests = async () => {
    try {
      // Try to get scheduled requests from a dedicated endpoint first
      const response = await supplyAPI.getScheduledRequests();
      setScheduledRequests(response.requests || []);
    } catch (error: any) {
      console.error('Scheduled requests endpoint not available, using approved requests:', error);
      // Fallback: get all approved requests and filter for scheduled ones
      try {
        const response = await supplyAPI.getApprovedRequests();
        const scheduledRequests = (response.requests || []).filter(
          (req: SupplyRequest) => req.expectedDeliveryDate
        );
        setScheduledRequests(scheduledRequests);
      } catch (fallbackError: any) {
        console.error('Failed to fetch scheduled requests:', fallbackError);
        toast.error('Failed to fetch scheduled requests');
      }
    }
  };

  const handleScheduleDelivery = async (requestId: string) => {
    if (!deliveryDate) {
      toast.error('Please select a delivery date');
      return;
    }

    if (deliveryLocation === 'ward' && !selectedAnganwadiId) {
      toast.error('Please select an Anganwadi location for ward collection');
      return;
    }

    try {
      console.log('Scheduling delivery with:', {
        requestId,
        deliveryDate,
        deliveryLocation,
        anganwadiLocationId: selectedAnganwadiId
      });
      
      let response;
      try {
        // Try the new API with location first
        response = await supplyAPI.scheduleDeliveryWithLocation(
          requestId, 
          deliveryDate, 
          deliveryLocation,
          deliveryLocation === 'ward' ? selectedAnganwadiId : undefined
        );
        console.log('Schedule delivery with location response:', response);
      } catch (locationError: any) {
        console.log('Location-based scheduling failed, trying basic scheduling:', locationError);
        // Fallback to basic scheduling without location
        response = await supplyAPI.scheduleDelivery(requestId, deliveryDate);
        console.log('Basic schedule delivery response:', response);
      }
      
      toast.success(`Delivery scheduled successfully for ${deliveryLocation === 'home' ? 'home delivery' : 'Anganwadi ward collection'}`);
      setSchedulingRequest(null);
      setDeliveryDate('');
      setDeliveryLocation('home');
      setSelectedAnganwadiId('');
      
      // Wait a moment for backend to update, then refresh
      setTimeout(() => {
        fetchApprovedRequests();
      }, 500);
      
    } catch (error: any) {
      console.error('Schedule delivery error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`Failed to schedule delivery: ${error.response?.data?.error || error.message}`);
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
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {requests.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending Schedule</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {scheduledRequests.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Scheduled</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {scheduledRequests.filter(r => r.deliveryLocation === 'home').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Home Delivery</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {scheduledRequests.filter(r => r.deliveryLocation === 'ward').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Ward Collection</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)' }}>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                border: 'none',
                background: activeTab === 'pending' ? 'var(--blue-50)' : 'transparent',
                color: activeTab === 'pending' ? 'var(--blue-700)' : 'var(--gray-600)',
                borderBottom: activeTab === 'pending' ? '2px solid var(--blue-600)' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Clock size={18} />
              Pending Schedule ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                border: 'none',
                background: activeTab === 'scheduled' ? 'var(--green-50)' : 'transparent',
                color: activeTab === 'scheduled' ? 'var(--green-700)' : 'var(--gray-600)',
                borderBottom: activeTab === 'scheduled' ? '2px solid var(--green-600)' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <History size={18} />
              Scheduled & History ({scheduledRequests.length})
            </button>
          </div>
        </div>

        {/* Supply Requests List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              {activeTab === 'pending' ? (
                <>
                  <Clock size={20} color="var(--blue-600)" style={{ marginRight: '0.5rem' }} />
                  Pending Schedule
                </>
              ) : (
                <>
                  <History size={20} color="var(--green-600)" style={{ marginRight: '0.5rem' }} />
                  Scheduled & History
                </>
              )}
            </h2>
          </div>
          <div className="card-content">
            {activeTab === 'pending' ? (
              requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                  <Package size={48} color="var(--gray-300)" style={{ marginBottom: '1rem' }} />
                  <p>No approved supply requests pending delivery scheduling</p>
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)' }}>
                                Delivery Location:
                              </label>
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                  <input
                                    type="radio"
                                    name="deliveryLocation"
                                    value="home"
                                    checked={deliveryLocation === 'home'}
                                    onChange={(e) => {
                                      setDeliveryLocation(e.target.value as 'home' | 'ward');
                                      setSelectedAnganwadiId('');
                                    }}
                                    style={{ marginRight: '0.25rem' }}
                                  />
                                  <Home size={16} color="var(--blue-600)" />
                                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                    Home Delivery
                                  </span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                  <input
                                    type="radio"
                                    name="deliveryLocation"
                                    value="ward"
                                    checked={deliveryLocation === 'ward'}
                                    onChange={(e) => setDeliveryLocation(e.target.value as 'home' | 'ward')}
                                    style={{ marginRight: '0.25rem' }}
                                  />
                                  <Building2 size={16} color="var(--purple-600)" />
                                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                    Anganwadi Ward Collection
                                  </span>
                                </label>
                              </div>
                            </div>

                            {deliveryLocation === 'ward' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)' }}>
                                  Select Anganwadi Location:
                                </label>
                                <select
                                  value={selectedAnganwadiId}
                                  onChange={(e) => setSelectedAnganwadiId(e.target.value)}
                                  style={{
                                    padding: '0.5rem',
                                    border: '1px solid var(--gray-300)',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    backgroundColor: 'white'
                                  }}
                                >
                                  <option value="">-- Select Anganwadi --</option>
                                  {locations.map((location) => (
                                    <option key={location._id} value={location._id}>
                                      {location.name} - {location.ward} {location.address && `(${location.address})`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <button
                                className="btn btn-primary"
                                onClick={() => handleScheduleDelivery(request._id)}
                                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                              >
                                Schedule Delivery
                              </button>
                              <button
                                className="btn"
                                onClick={() => {
                                  setSchedulingRequest(null);
                                  setDeliveryDate('');
                                  setDeliveryLocation('home');
                                }}
                                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                              >
                                Cancel
                              </button>
                            </div>
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
              )
            ) : (
              // Scheduled requests tab
              scheduledRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                  <History size={48} color="var(--gray-300)" style={{ marginBottom: '1rem' }} />
                  <p>No scheduled supply requests</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {scheduledRequests.map((request) => (
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
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Truck size={16} color="var(--green-600)" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--green-600)', fontWeight: '600' }}>
                              Scheduled
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                            {request.expectedDeliveryDate ? new Date(request.expectedDeliveryDate).toLocaleDateString() : 'Date not set'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>
                            {request.deliveryLocation === 'home' ? (
                              <>
                                <Home size={14} color="var(--blue-600)" />
                                <span style={{ fontSize: '0.75rem', color: 'var(--blue-600)', fontWeight: '600' }}>
                                  Home Delivery
                                </span>
                              </>
                            ) : (
                              <>
                                <Building2 size={14} color="var(--purple-600)" />
                                <span style={{ fontSize: '0.75rem', color: 'var(--purple-600)', fontWeight: '600' }}>
                                  Ward Collection
                                </span>
                              </>
                            )}
                          </div>
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

                      {/* Action buttons for scheduled requests */}
                      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <button
                            className="btn"
                            onClick={() => supplyAPI.updateDeliveryStatus(request._id, 'delivered').then(() => {
                              toast.success('Marked as delivered');
                              fetchApprovedRequests(); // Refresh both lists
                            })}
                            style={{ 
                              fontSize: '0.875rem', 
                              padding: '0.5rem 1rem',
                              backgroundColor: 'var(--green-600)',
                              color: 'white',
                              border: 'none'
                            }}
                          >
                            <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                            Mark as Delivered
                          </button>
                          <button
                            className="btn"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this delivery?')) {
                                supplyAPI.updateDeliveryStatus(request._id, 'cancelled').then(() => {
                                  toast.success('Delivery cancelled');
                                  fetchApprovedRequests(); // Refresh both lists
                                });
                              }
                            }}
                            style={{ 
                              fontSize: '0.875rem', 
                              padding: '0.5rem 1rem',
                              backgroundColor: 'var(--red-600)',
                              color: 'white',
                              border: 'none'
                            }}
                          >
                            <XCircle size={16} style={{ marginRight: '0.5rem' }} />
                            Cancel Delivery
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </AshaLayout>
  );
};

export default SupplyRequests;