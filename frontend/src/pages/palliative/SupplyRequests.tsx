import React, { useState, useEffect } from 'react';
import PalliativeLayout from './PalliativeLayout';
import { useAuth } from '../../context/AuthContext';
import { supplyAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Eye, Package, RefreshCw } from 'lucide-react';

interface Supply {
  name: string;
  description: string;
  eligibility: string;
}

interface SupplyRequest {
  _id: string;
  supplyName: string;
  description: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'delivered';
  createdAt: string;
  updatedAt: string;
  reviewNotes?: string;
  expectedDeliveryDate?: string;
  scheduledAt?: string;
  scheduledBy?: string;
  deliveryLocation?: 'home' | 'ward';
  anganwadiLocation?: {
    name: string;
    address?: string;
    ward: string;
  };
  anganwadiLocationId?: string;
}

const SupplyRequests: React.FC = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SupplyRequest | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const response = await supplyAPI.getUserRequests();
      console.log('Palliative - Fetched supply requests:', response.requests);
      response.requests?.forEach((req: any) => {
        console.log('Request:', {
          id: req._id,
          supply: req.supplyName,
          status: req.status,
          expectedDeliveryDate: req.expectedDeliveryDate,
          deliveryLocation: req.deliveryLocation,
          anganwadiLocation: req.anganwadiLocation
        });
      });
      setRequests(response.requests || []);
    } catch (error: any) {
      toast.error('Failed to fetch requests');
      console.error(error);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const maternalSupplies: Supply[] = [
    {
      name: 'Amrutham Podi',
      description: 'Nutritional supplement powder for mothers and children',
      eligibility: 'Available for maternal and child health programs'
    },
    {
      name: 'Baby kits',
      description: 'Essential newborn care kit including clothes, diapers, and hygiene items',
      eligibility: 'For expecting mothers and newborns'
    },
    {
      name: 'Diapers',
      description: 'Disposable diapers for infants',
      eligibility: 'For maternal care and newborn hygiene'
    },
    {
      name: 'Iron tablets',
      description: 'Iron supplements to prevent anemia during pregnancy',
      eligibility: 'For pregnant women with low hemoglobin'
    },
    {
      name: 'Folic Acid Tablets',
      description: 'Essential vitamin supplement for fetal development',
      eligibility: 'For pregnant women in first trimester'
    },
    {
      name: 'Calcium Tablets',
      description: 'Calcium supplements for bone health during pregnancy',
      eligibility: 'For pregnant women and nursing mothers'
    },
    {
      name: 'ORS Packets & Zinc Tablets',
      description: 'Oral rehydration solution and zinc supplements for dehydration and immunity',
      eligibility: 'For maternal and child health emergencies'
    },
    {
      name: 'Thermal Blanket for Newborns',
      description: 'Specialized blanket to maintain newborn body temperature',
      eligibility: 'For newborn care in delivery and postpartum'
    }
  ];

  const palliativeSupplies: Supply[] = [
    {
      name: 'Adult diapers',
      description: 'Adult incontinence products',
      eligibility: 'For palliative care patients with mobility issues'
    },
    {
      name: 'Water beds',
      description: 'Pressure-relieving mattresses for bedridden patients',
      eligibility: 'For patients with pressure sores or long-term bed rest'
    },
    {
      name: 'Tablets',
      description: 'Prescribed medications for pain management and treatment',
      eligibility: 'As per medical prescription for palliative care'
    },
    {
      name: 'Wheelchairs',
      description: 'Manual or powered wheelchairs for mobility assistance',
      eligibility: 'For patients with severe mobility limitations'
    },
    {
      name: 'Walking sticks',
      description: 'Supportive walking aids for balance and stability',
      eligibility: 'For patients with walking difficulties'
    },
    {
      name: 'Adjustable Hospital Bed',
      description: 'Hospital-grade bed with adjustable positions',
      eligibility: 'For home care of bedridden palliative patients'
    },
    {
      name: 'Crutches / Walkers',
      description: 'Mobility aids for support during walking',
      eligibility: 'For patients requiring walking assistance'
    },
    {
      name: 'BP Monitor & Glucometer Kits',
      description: 'Blood pressure monitor and glucose testing kit',
      eligibility: 'For monitoring vital signs in palliative care'
    },
    {
      name: 'Urine Bags',
      description: 'Urinary collection bags for incontinence management',
      eligibility: 'For patients with urinary incontinence'
    }
  ];

  const supplies = user?.beneficiaryCategory === 'maternity' ? maternalSupplies : palliativeSupplies;

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

  const handleRequestClick = (supply: Supply) => {
    setSelectedSupply(supply);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedSupply || !description.trim()) {
      toast.error('Please provide a description of your medical need');
      return;
    }

    if (!file) {
      toast.error('Please upload proof (medical certificate or prescription)');
      return;
    }

    if (!address.trim()) {
      toast.error('Please provide your delivery address');
      return;
    }

    if (!phone.trim()) {
      toast.error('Please provide your contact number');
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('supplyName', selectedSupply.name);
      formData.append('description', description);
      formData.append('proof', file);
      formData.append('category', user?.beneficiaryCategory || '');
      formData.append('address', address);
      formData.append('phone', phone);

      await supplyAPI.submitRequest(formData);
      toast.success('Supply request submitted successfully!');
      setModalOpen(false);
      setDescription('');
      setFile(null);
      setAddress('');
      setPhone('');
      setSelectedSupply(null);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (request: SupplyRequest) => {
    setSelectedRequest(request);
    setViewModalOpen(true);
  };

  const getRequestForSupply = (supplyName: string) => {
    return requests.find(request => request.supplyName === supplyName);
  };

  return (
    <PalliativeLayout title="Supply Requests">
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">Request Medical Supplies</h2>
            <button
              className="btn"
              onClick={fetchRequests}
              disabled={requestsLoading}
              style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              title="Refresh requests"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            Request medical supplies, comfort items, mobility aids, and other essential equipment for palliative care.
            Select from the available supplies below and submit your request with necessary documentation.
          </p>

          {requestsLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Loading your requests...
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {supplies.map((supply, index) => {
                const existingRequest = getRequestForSupply(supply.name);
                return (
                  <div key={index} className="card" style={{ margin: 0 }}>
                    <div className="card-header">
                      <h3 className="card-title" style={{ fontSize: '1rem' }}>{supply.name}</h3>
                      {existingRequest && (
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            color: getStatusColor(existingRequest.status),
                            backgroundColor: getStatusBgColor(existingRequest.status),
                            marginLeft: '0.5rem'
                          }}
                        >
                          {existingRequest.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="card-content">
                      <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                        {supply.description}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--blue-600)', marginBottom: '1rem' }}>
                        <strong>Eligibility:</strong> {supply.eligibility}
                      </p>

                      {existingRequest ? (
                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                            Requested on: {new Date(existingRequest.createdAt).toLocaleDateString()}
                          </p>
                          {(existingRequest.status === 'approved' || existingRequest.status === 'scheduled') && existingRequest.expectedDeliveryDate && (
                            <div style={{ margin: '0.5rem 0', padding: '0.75rem', backgroundColor: 'var(--green-50)', borderRadius: '0.5rem', border: '1px solid var(--green-200)' }}>
                              <p style={{ fontSize: '0.875rem', color: 'var(--green-700)', fontWeight: 'bold', margin: '0.25rem 0' }}>
                                📅 Expected Delivery: {new Date(existingRequest.expectedDeliveryDate).toLocaleDateString()}
                              </p>
                              <p style={{ fontSize: '0.875rem', color: 'var(--blue-700)', fontWeight: '600', margin: '0.25rem 0' }}>
                                {existingRequest.deliveryLocation === 'home' ? (
                                  <>🏠 Home Delivery</>
                                ) : existingRequest.deliveryLocation === 'ward' ? (
                                  <>🏢 Anganwadi Ward Collection</>
                                ) : (
                                  <>📍 To be determined</>
                                )}
                              </p>
                              {existingRequest.deliveryLocation === 'ward' && (existingRequest as any).anganwadiLocation && (
                                <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.375rem' }}>
                                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', fontWeight: '600', margin: '0.25rem 0' }}>
                                    📍 Collection Point:
                                  </p>
                                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: '0.25rem 0' }}>
                                    {(existingRequest as any).anganwadiLocation.name}
                                  </p>
                                  {(existingRequest as any).anganwadiLocation.address && (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: '0.25rem 0' }}>
                                      {(existingRequest as any).anganwadiLocation.address}
                                    </p>
                                  )}
                                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: '0.25rem 0' }}>
                                    Ward: {(existingRequest as any).anganwadiLocation.ward}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                          {existingRequest.status === 'rejected' && existingRequest.reviewNotes && (
                            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: 'var(--red-600)' }}>
                              <strong>Rejection Reason:</strong> {existingRequest.reviewNotes}
                            </p>
                          )}
                          {existingRequest.status === 'approved' && !existingRequest.expectedDeliveryDate && (
                            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: 'var(--orange-600)' }}>
                              Approved - Delivery scheduling in progress
                            </p>
                          )}
                          <button
                            className="btn"
                            onClick={() => openViewModal(existingRequest)}
                            style={{ width: '100%', marginTop: '0.5rem' }}
                          >
                            <Eye size={16} style={{ marginRight: '0.5rem' }} />
                            View Details
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleRequestClick(supply)}
                          style={{ width: '100%' }}
                        >
                          Request
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalOpen && selectedSupply && (
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
              <h3 className="card-title">Request {selectedSupply.name}</h3>
            </div>
            <div className="card-content" style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Delivery Address *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No., Street, Ward, City, PIN Code"
                  rows={3}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 8 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 8 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Upload Proof (Medical Certificate/Prescription) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 8 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Description of Medical Need *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe your medical condition and why you need this supply..."
                  rows={4}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 8 }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn" onClick={() => setModalOpen(false)} disabled={loading}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading || !description.trim() || !file || !address.trim() || !phone.trim()}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Request Modal */}
      {viewModalOpen && selectedRequest && (
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
                <strong>Status:</strong> {selectedRequest.status}
              </div>
              <div>
                <strong>Description:</strong>
                <p style={{ marginTop: '0.5rem' }}>{selectedRequest.description}</p>
              </div>
              <div>
                <strong>Requested on:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}
              </div>
              {selectedRequest.expectedDeliveryDate && (
                <div>
                  <strong>Expected Delivery:</strong> {new Date(selectedRequest.expectedDeliveryDate).toLocaleDateString()}
                </div>
              )}
              {selectedRequest.deliveryLocation && (
                <div>
                  <strong>Delivery Method:</strong> {selectedRequest.deliveryLocation === 'home' ? 'Home Delivery' : selectedRequest.deliveryLocation === 'ward' ? 'Anganvaadi Ward Collection' : selectedRequest.deliveryLocation}
                </div>
              )}
              {selectedRequest.scheduledAt && (
                <div>
                  <strong>Scheduled At:</strong> {new Date(selectedRequest.scheduledAt).toLocaleString()}
                </div>
              )}
              {selectedRequest.scheduledBy && (
                <div>
                  <strong>Scheduled By:</strong> {selectedRequest.scheduledBy}
                </div>
              )}
              {selectedRequest.reviewNotes && (
                <div>
                  <strong>Review Notes:</strong>
                  <p style={{ marginTop: '0.5rem' }}>{selectedRequest.reviewNotes}</p>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn" onClick={() => setViewModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </PalliativeLayout>
  );
};

export default SupplyRequests;