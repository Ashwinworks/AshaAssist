import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import {
  UserCheck,
  UserX,
  Phone,
  Users,
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface AshaOverview {
  worker: {
    id: string;
    name: string;
    email: string;
    phone: string;
    ward: string;
    isActive: boolean;
    createdAt?: string;
    lastLogin?: string;
  };
  stats: {
    totalFeedbacks: number;
    averageRating: number;
    complaintsReceived: number;
  };
}

const AshaManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AshaOverview | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '', confirmPassword: '' });
  const [credentialsSaving, setCredentialsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await adminAPI.getAshaOverview();
        setOverview(data);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load ASHA overview');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (isActive: boolean) => (isActive ? 'var(--green-600)' : 'var(--red-600)');
  const getStatusBg = (isActive: boolean) => (isActive ? 'var(--green-50)' : 'var(--red-50)');
  const getStatusIcon = (isActive: boolean) => (isActive ? <CheckCircle size={16} /> : <XCircle size={16} />);

  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '—');

  const handleEditStart = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleEditSave = async () => {
    if (!overview || !editingField) return;

    setSaving(true);
    try {
      const updateData: any = {};
      updateData[editingField] = editValue;

      await adminAPI.updateUser(overview.worker.id, updateData);
      
      // Update local state
      setOverview({
        ...overview,
        worker: {
          ...overview.worker,
          [editingField]: editValue
        }
      });

      toast.success(`${editingField === 'name' ? 'Name' : 'Phone number'} updated successfully`);
      setEditingField(null);
      setEditValue('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update ASHA worker');
    } finally {
      setSaving(false);
    }
  };

  const renderEditableField = (field: string, label: string, value: string, isEditable: boolean = true) => {
    if (editingField === field) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type={field === 'phone' ? 'tel' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            style={{
              padding: '0.25rem 0.5rem',
              border: '1px solid var(--gray-300)',
              borderRadius: '0.25rem',
              fontSize: '0.9rem',
              minWidth: '150px'
            }}
            autoFocus
          />
          <button
            onClick={handleEditSave}
            disabled={saving}
            style={{
              padding: '0.25rem',
              backgroundColor: 'var(--green-600)',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Save"
          >
            <Save size={14} />
          </button>
          <button
            onClick={handleEditCancel}
            disabled={saving}
            style={{
              padding: '0.25rem',
              backgroundColor: 'var(--gray-500)',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{value}</span>
        {isEditable && (
          <button
            onClick={() => handleEditStart(field, value)}
            style={{
              padding: '0.25rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--gray-500)'
            }}
            title={`Edit ${label.toLowerCase()}`}
          >
            <Edit3 size={12} />
          </button>
        )}
      </div>
    );
  };

  const handleCredentialsOpen = () => {
    if (overview) {
      setCredentials({
        email: overview.worker.email,
        password: '',
        confirmPassword: ''
      });
      setShowCredentialsModal(true);
    }
  };

  const handleCredentialsSave = async () => {
    if (!overview) return;

    // Validate passwords match if password is being changed
    if (credentials.password && credentials.password !== credentials.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setCredentialsSaving(true);
    try {
      const updateData: any = {};
      if (credentials.email !== overview.worker.email) {
        updateData.email = credentials.email;
      }
      if (credentials.password) {
        updateData.password = credentials.password;
      }

      if (Object.keys(updateData).length === 0) {
        toast.error('No changes to save');
        return;
      }

      await adminAPI.updateUserCredentials(overview.worker.id, updateData);
      
      // Update local state
      setOverview({
        ...overview,
        worker: {
          ...overview.worker,
          email: credentials.email
        }
      });

      toast.success('Credentials updated successfully');
      setShowCredentialsModal(false);
      setCredentials({ email: '', password: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update credentials');
    } finally {
      setCredentialsSaving(false);
    }
  };

  return (
    <AdminLayout title="ASHA Worker Management">
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.0rem', margin: 0 }}>
            Manage the ASHA worker profile, monitor performance, and track activity.
          </p>
        </div>

        {loading && (
          <div className="loading-container" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="loading-spinner" />
            <p>Loading...</p>
          </div>
        )}

        {error && (
          <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--red-600)', marginBottom: '1rem' }}>
            <p style={{ color: 'var(--red-700)', margin: 0 }}>{error}</p>
          </div>
        )}

        {!loading && !error && overview && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  {getStatusIcon(overview.worker.isActive)}
                  <strong>Status</strong>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: 600,
                  color: getStatusColor(overview.worker.isActive),
                  backgroundColor: getStatusBg(overview.worker.isActive),
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem'
                }}>
                  {overview.worker.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Star size={16} color="var(--yellow-600)" />
                  <strong>Average Rating</strong>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{overview.stats.averageRating.toFixed(1)}</div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>{overview.stats.totalFeedbacks} feedbacks</div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <MessageSquare size={16} color="var(--red-600)" />
                  <strong>Complaints Received</strong>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--red-700)' }}>{overview.stats.complaintsReceived}</div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Ratings 2 or below</div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Users size={16} color="var(--blue-600)" />
                  <strong>Ward</strong>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--blue-700)' }}>{overview.worker.ward || '—'}</div>
              </div>
            </div>

            {/* Profile */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">ASHA Worker Profile</h2>
              </div>
              <div className="card-content">
                <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--gray-200)', borderLeft: `4px solid ${getStatusColor(overview.worker.isActive)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <UserCheck size={20} color="var(--green-600)" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {renderEditableField('name', 'Name', overview.worker.name)}
                        </div>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: getStatusColor(overview.worker.isActive),
                          backgroundColor: getStatusBg(overview.worker.isActive),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {getStatusIcon(overview.worker.isActive)}
                          {overview.worker.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-700)' }}>
                        <div><strong>Email:</strong> {overview.worker.email}</div>
                        <div><strong>Phone:</strong> {renderEditableField('phone', 'Phone', overview.worker.phone)}</div>
                        <div><strong>Ward:</strong> {overview.worker.ward}</div>
                        <div><strong>Joined:</strong> {fmt(overview.worker.createdAt)}</div>
                        <div><strong>Last Login:</strong> {fmt(overview.worker.lastLogin)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                     <button
                       className="btn"
                       style={{
                         backgroundColor: overview.worker.isActive ? '#dc2626' : '#16a34a',
                         color: 'white',
                         border: 'none',
                         fontSize: '0.875rem',
                         padding: '0.5rem 1rem',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.5rem',
                         cursor: 'pointer',
                         fontWeight: '500'
                       }}
                       title="Activate/Deactivate ASHA worker"
                     >
                       {overview.worker.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                       {overview.worker.isActive ? 'Deactivate Account' : 'Activate Account'}
                     </button>
                     <button
                       className="btn"
                       onClick={handleCredentialsOpen}
                       style={{
                         backgroundColor: 'var(--blue-600)',
                         color: 'white',
                         border: 'none',
                         fontSize: '0.875rem',
                         padding: '0.5rem 1rem',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.5rem',
                         cursor: 'pointer',
                         fontWeight: '500'
                       }}
                       title="Edit login credentials (Admin only)"
                     >
                       <Edit3 size={14} />
                       Edit Credentials
                     </button>
                     <a
                       className="btn"
                       href={`tel:${overview.worker.phone}`}
                       style={{
                         backgroundColor: 'var(--purple-600)',
                         color: 'white',
                         border: 'none',
                         fontSize: '0.875rem',
                         padding: '0.5rem 1rem',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.5rem',
                         textDecoration: 'none'
                       }}
                     >
                       <Phone size={14} />
                       Contact
                     </a>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Credentials Modal */}
        {showCredentialsModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="card" style={{ width: '90%', maxWidth: '500px', background: 'white', padding: '1.5rem' }}>
              <div className="card-header">
                <h3 className="card-title">Edit ASHA Worker Credentials</h3>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                  Only administrators can modify login credentials
                </p>
              </div>
              <div className="card-content" style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                    placeholder="asha.worker@example.com"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter new password"
                  />
                </div>

                {credentials.password && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={credentials.confirmPassword}
                      onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--gray-300)',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                      placeholder="Confirm new password"
                    />
                  </div>
                )}

                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: 'var(--yellow-50)', 
                  border: '1px solid var(--yellow-200)', 
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  color: 'var(--yellow-800)'
                }}>
                  <strong>Security Notice:</strong> Changing credentials will require the ASHA worker to log in again with the new credentials.
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  className="btn"
                  onClick={() => setShowCredentialsModal(false)}
                  disabled={credentialsSaving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--gray-500)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn"
                  onClick={handleCredentialsSave}
                  disabled={credentialsSaving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--blue-600)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {credentialsSaving ? 'Saving...' : 'Save Credentials'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AshaManagement;