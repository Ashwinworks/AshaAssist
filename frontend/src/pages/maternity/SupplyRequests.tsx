import React, { useState, useEffect } from 'react';
import MaternityLayout from './MaternityLayout';
import { useAuth } from '../../context/AuthContext';
import { supplyAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Eye, Package, RefreshCw, Heart, Baby, Pill, CheckCircle, Clock, XCircle, Calendar, MapPin, Phone, FileText, History } from 'lucide-react';

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
  status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  reviewNotes?: string;
  expectedDeliveryDate?: string;
  scheduledAt?: string;
  scheduledBy?: string;
  deliveryLocation?: 'home' | 'ward';
  deliveryStatus?: 'pending' | 'delivered' | 'cancelled';
  deliveryCompletedAt?: string;
  deliveryCompletedBy?: string;
  anganwadiLocation?: {
    name: string;
    address?: string;
    ward: string;
  };
  anganwadiLocationId?: string;
}

const SupplyRequests: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'myRequests'>('browse');
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
      console.log('📦 User supply requests:', response.requests);
      // Log each request details for debugging
      response.requests?.forEach((req: any) => {
        console.log(`Request ${req.supplyName}:`, {
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
      case 'approved': return 'var(--blue-600)';
      case 'scheduled': return 'var(--purple-600)';
      case 'delivered': return 'var(--green-600)';
      case 'rejected': return 'var(--red-600)';
      case 'cancelled': return 'var(--gray-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--yellow-50)';
      case 'approved': return 'var(--blue-50)';
      case 'scheduled': return 'var(--purple-50)';
      case 'delivered': return 'var(--green-50)';
      case 'rejected': return 'var(--red-50)';
      case 'cancelled': return 'var(--gray-50)';
      default: return 'var(--gray-50)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Approval';
      case 'approved': return 'Approved';
      case 'scheduled': return 'Scheduled for Delivery';
      case 'delivered': return 'Delivered';
      case 'rejected': return 'Rejected';
      case 'cancelled': return 'Cancelled';
      default: return status;
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

  // Get icon for supply
  const getSupplyIcon = (supplyName: string) => {
    const name = supplyName.toLowerCase();
    if (name.includes('baby') || name.includes('diapers') || name.includes('blanket')) {
      return <Baby size={20} />;
    } else if (name.includes('tablet') || name.includes('iron') || name.includes('folic') || name.includes('calcium') || name.includes('ors') || name.includes('zinc')) {
      return <Pill size={20} />;
    } else if (name.includes('amrutham') || name.includes('kit')) {
      return <Package size={20} />;
    } else {
      return <Heart size={20} />;
    }
  };

  // Get category colors
  const getCategoryColor = (category: string) => {
    if (category === 'maternity') {
      return {
        bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        border: '#ec4899',
        text: '#be185d',
        icon: '#ec4899'
      };
    } else {
      return {
        bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        border: '#8b5cf6',
        text: '#6d28d9',
        icon: '#8b5cf6'
      };
    }
  };

  const categoryColors = getCategoryColor(user?.beneficiaryCategory || 'maternity');

  return (
    <MaternityLayout title="Supply Requests">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#0f172a'
          }}>
            <Package size={24} color={categoryColors.icon} />
            Request Essential Supplies
          </h2>
          <p style={{
            color: '#64748b',
            fontSize: '0.95rem',
            marginTop: '0.5rem',
            marginBottom: '0'
          }}>
            Request essential supplies for {user?.beneficiaryCategory === 'maternity' ? 'maternal and child health' : 'palliative care'}
          </p>
          <div style={{ marginTop: '1rem' }}>
            <button
              className="btn"
              onClick={fetchRequests}
              disabled={requestsLoading}
              style={{
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              title="Refresh requests"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
        <div className="card-content">
          {/* Tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '2rem' }}>
            <button
              onClick={() => setActiveTab('browse')}
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                border: 'none',
                background: activeTab === 'browse' ? categoryColors.bg : 'transparent',
                color: activeTab === 'browse' ? categoryColors.text : '#64748b',
                borderBottom: activeTab === 'browse' ? `3px solid ${categoryColors.border}` : '3px solid transparent',
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
              <Package size={18} />
              Browse Supplies
            </button>
            <button
              onClick={() => setActiveTab('myRequests')}
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                border: 'none',
                background: activeTab === 'myRequests' ? categoryColors.bg : 'transparent',
                color: activeTab === 'myRequests' ? categoryColors.text : '#64748b',
                borderBottom: activeTab === 'myRequests' ? `3px solid ${categoryColors.border}` : '3px solid transparent',
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
              My Requests ({requests.length})
            </button>
          </div>

          {requestsLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#64748b'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                border: '4px solid #e2e8f0',
                borderTop: `4px solid ${categoryColors.icon}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              Loading your supply requests...
            </div>
          ) : (
            <>
              {/* Browse Supplies Tab */}
              {activeTab === 'browse' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.75rem',
                  marginTop: '1rem'
                }}>
                  {supplies.map((supply, index) => (
                    <div
                      key={index}
                      className="card"
                      style={{
                        padding: '0',
                        border: '1px solid #e2e8f0',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-8px)';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 15px 30px rgba(0,0,0,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                      }}
                    >
                      {/* Header with Gradient */}
                      <div style={{
                        padding: '1rem 1.25rem',
                        background: categoryColors.bg,
                        borderBottom: `2px solid ${categoryColors.border}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ color: categoryColors.icon }}>
                            {getSupplyIcon(supply.name)}
                          </div>
                          <span style={{
                            fontWeight: 700,
                            color: categoryColors.text,
                            fontSize: '0.875rem'
                          }}>
                            {supply.name}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{
                        padding: '1.5rem',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <p style={{
                          margin: '0 0 1rem',
                          color: '#64748b',
                          fontSize: '0.95rem',
                          lineHeight: 1.6,
                          flex: 1
                        }}>
                          {supply.description}
                        </p>

                        <div style={{
                          padding: '0.75rem',
                          background: '#f8fafc',
                          borderRadius: '0.5rem',
                          marginBottom: '1rem',
                          border: '1px dashed #cbd5e1'
                        }}>
                          <p style={{
                            fontSize: '0.8rem',
                            color: '#475569',
                            margin: 0,
                            lineHeight: 1.5
                          }}>
                            <strong style={{ color: categoryColors.text }}>Eligibility:</strong> {supply.eligibility}
                          </p>
                        </div>

                        <button
                          className="btn"
                          onClick={() => handleRequestClick(supply)}
                          style={{
                            width: '100%',
                            background: `linear-gradient(135deg, ${categoryColors.icon} 0%, ${categoryColors.text} 100%)`,
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            padding: '0.75rem',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <Package size={18} />
                          Request Supply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* My Requests Tab */}
              {activeTab === 'myRequests' && (
                requests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <Package size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No supply requests yet</p>
                    <p style={{ fontSize: '0.875rem' }}>Switch to "Browse Supplies" to make your first request</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {requests.map((request) => (
                      <div
                        key={request._id}
                        className="card"
                        style={{
                          padding: '1.5rem',
                          border: '1px solid #e2e8f0',
                          borderLeft: `4px solid ${getStatusColor(request.status)}`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                                {request.supplyName}
                              </h3>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: getStatusColor(request.status),
                                backgroundColor: getStatusBgColor(request.status),
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                {request.status}
                              </span>
                            </div>

                            <p style={{ margin: '0.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>
                              <strong>Requested:</strong> {new Date(request.createdAt).toLocaleDateString()}
                            </p>

                            {request.description && (
                              <p style={{ margin: '0.5rem 0', color: '#475569', fontSize: '0.875rem' }}>
                                {request.description}
                              </p>
                            )}

                            {/* Delivery info */}
                            {request.expectedDeliveryDate && (
                              <div style={{
                                margin: '0.75rem 0',
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                borderRadius: '0.5rem',
                                border: '1px solid #86efac'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  fontSize: '0.875rem',
                                  color: '#15803d',
                                  fontWeight: 600,
                                  marginBottom: '0.5rem'
                                }}>
                                  <CheckCircle size={16} />
                                  <span>Expected: {new Date(request.expectedDeliveryDate).toLocaleDateString()}</span>
                                </div>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  fontSize: '0.875rem',
                                  color: '#0369a1',
                                  fontWeight: 600
                                }}>
                                  <MapPin size={16} />
                                  <span>
                                    {request.deliveryLocation === 'home' ? 'Home Delivery' :
                                      request.deliveryLocation === 'ward' ? 'Ward Collection' : 'TBD'}
                                  </span>
                                </div>
                                {request.deliveryLocation === 'ward' && (request as any).anganwadiLocation && (
                                  <div style={{
                                    marginTop: '0.5rem',
                                    padding: '0.5rem',
                                    backgroundColor: 'white',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.8rem',
                                    color: '#475569'
                                  }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                      📍 {(request as any).anganwadiLocation.name}
                                    </div>
                                    {(request as any).anganwadiLocation.address && (
                                      <div>{(request as any).anganwadiLocation.address}</div>
                                    )}
                                    <div>Ward: {(request as any).anganwadiLocation.ward}</div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Approved but not yet scheduled message */}
                            {request.status === 'approved' && !request.expectedDeliveryDate && (
                              <div style={{
                                padding: '0.75rem',
                                background: '#eff6ff',
                                borderRadius: '0.5rem',
                                border: '1px solid #bfdbfe',
                                marginTop: '0.75rem'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  color: '#1e40af',
                                  fontSize: '0.8rem',
                                  fontWeight: 600
                                }}>
                                  <Clock size={14} />
                                  <span>Approved - Waiting for ASHA worker to schedule delivery</span>
                                </div>
                              </div>
                            )}

                            {/* Rejection info */}
                            {request.status === 'rejected' && request.reviewNotes && (
                              <div style={{
                                padding: '0.75rem',
                                background: '#fef2f2',
                                borderRadius: '0.5rem',
                                border: '1px solid #fecaca',
                                marginTop: '0.75rem'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  color: '#dc2626',
                                  fontSize: '0.8rem',
                                  fontWeight: 600
                                }}>
                                  <XCircle size={14} />
                                  <span>{request.reviewNotes}</span>
                                </div>
                              </div>
                            )}

                            {/* Delivered info */}
                            {request.status === 'delivered' && request.deliveryCompletedAt && (
                              <div style={{
                                padding: '0.75rem',
                                background: '#f0fdf4',
                                borderRadius: '0.5rem',
                                border: '1px solid #86efac',
                                marginTop: '0.75rem'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  color: '#15803d',
                                  fontSize: '0.8rem',
                                  fontWeight: 600
                                }}>
                                  <CheckCircle size={14} />
                                  <span>Delivered: {new Date(request.deliveryCompletedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* View button */}
                          <button
                            className="btn"
                            onClick={() => openViewModal(request)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '0.5rem',
                              color: '#475569',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>

      {modalOpen && selectedSupply && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '90%',
            maxWidth: '550px',
            background: 'white',
            padding: 0,
            border: 'none',
            borderRadius: '0.75rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            {/* Modal Header with Gradient */}
            <div style={{
              padding: '1.5rem',
              background: categoryColors.bg,
              borderBottom: `2px solid ${categoryColors.border}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: categoryColors.icon }}>
                  {getSupplyIcon(selectedSupply.name)}
                </div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: categoryColors.text
                }}>
                  Request {selectedSupply.name}
                </h3>
              </div>
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.875rem',
                color: '#64748b'
              }}>
                Fill in the required details to submit your request
              </p>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem', display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#334155'
                }}>
                  <MapPin size={16} color={categoryColors.icon} />
                  Delivery Address *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No., Street, Ward, City, PIN Code"
                  rows={3}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = categoryColors.icon;
                    e.target.style.boxShadow = `0 0 0 3px ${categoryColors.icon}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#334155'
                }}>
                  <Phone size={16} color={categoryColors.icon} />
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = categoryColors.icon;
                    e.target.style.boxShadow = `0 0 0 3px ${categoryColors.icon}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#334155'
                }}>
                  <FileText size={16} color={categoryColors.icon} />
                  Upload Proof (Medical Certificate/Prescription) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                />
                {file && (
                  <p style={{
                    margin: '0.5rem 0 0 0',
                    fontSize: '0.8rem',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <CheckCircle size={14} />
                    {file.name}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#334155'
                }}>
                  <FileText size={16} color={categoryColors.icon} />
                  Description of Medical Need *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe your medical condition and why you need this supply..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = categoryColors.icon;
                    e.target.style.boxShadow = `0 0 0 3px ${categoryColors.icon}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
              <button
                className="btn"
                onClick={() => setModalOpen(false)}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'white',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleSubmit}
                disabled={loading || !description.trim() || !file || !address.trim() || !phone.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: (loading || !description.trim() || !file || !address.trim() || !phone.trim())
                    ? '#cbd5e1'
                    : `linear-gradient(135deg, ${categoryColors.icon} 0%, ${categoryColors.text} 100%)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  cursor: (loading || !description.trim() || !file || !address.trim() || !phone.trim())
                    ? 'not-allowed'
                    : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
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
                <strong>Category:</strong> {selectedRequest.category}
              </div>
              <div>
                <strong>Description:</strong>
                <p style={{ marginTop: '0.5rem' }}>{selectedRequest.description}</p>
              </div>
              <div>
                <strong>Status:</strong>
                <span
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    color: getStatusColor(selectedRequest.status),
                    backgroundColor: getStatusBgColor(selectedRequest.status),
                    marginLeft: '0.5rem'
                  }}
                >
                  {getStatusText(selectedRequest.status)}
                </span>
              </div>
              <div>
                <strong>Requested on:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}
              </div>
              {selectedRequest.expectedDeliveryDate && (
                <div>
                  <strong>Expected Delivery Date:</strong> {new Date(selectedRequest.expectedDeliveryDate).toLocaleDateString()}
                </div>
              )}
              {selectedRequest.deliveryLocation && (
                <div>
                  <strong>Delivery Method:</strong> {selectedRequest.deliveryLocation === 'home' ? 'Home Delivery' : selectedRequest.deliveryLocation === 'ward' ? 'Anganwadi Ward Collection' : selectedRequest.deliveryLocation}
                </div>
              )}
              {selectedRequest.scheduledAt && (
                <div>
                  <strong>Scheduled on:</strong> {new Date(selectedRequest.scheduledAt).toLocaleString()}
                </div>
              )}
              {selectedRequest.scheduledBy && (
                <div>
                  <strong>Scheduled By:</strong> {selectedRequest.scheduledBy}
                </div>
              )}
              {selectedRequest.deliveryCompletedAt && (
                <div>
                  <strong>Delivered on:</strong> {new Date(selectedRequest.deliveryCompletedAt).toLocaleString()}
                </div>
              )}
              {selectedRequest.deliveryCompletedBy && (
                <div>
                  <strong>Delivered By:</strong> {selectedRequest.deliveryCompletedBy}
                </div>
              )}
              {selectedRequest.status === 'rejected' && selectedRequest.reviewNotes && (
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
    </MaternityLayout>
  );
};

export default SupplyRequests;