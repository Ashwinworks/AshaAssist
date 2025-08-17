import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  UserCheck, 
  UserX, 
  Phone, 
  MapPin, 
  Calendar,
  Users,
  Activity,
  Star,
  CheckCircle,
  XCircle
} from 'lucide-react';

const AshaManagement: React.FC = () => {
  const [showEditForm, setShowEditForm] = useState(false);

  // Single ASHA worker data
  const ashaWorker = {
    id: 1,
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@ashaassist.com',
    phone: '+91 98765 43210',
    ward: 'Ward 12',
    sector: 'All Sectors (A, B, C)',
    address: 'House No. 123, Ward 12, Sector A',
    joinDate: '2023-06-15',
    status: 'Active',
    assignedHouseholds: 125, // Total of all households in the ward
    completedTasks: 721, // Total of all completed tasks
    pendingTasks: 35, // Total pending tasks
    rating: 4.8,
    totalFeedbacks: 208, // Total feedbacks from all users
    specializations: ['Maternity Care', 'Palliative Care', 'Child Health', 'Elderly Care', 'Vaccination'],
    lastActive: '2024-01-18 10:30 AM',
    performance: {
      homeVisits: 277, // Total home visits
      suppliesDistributed: 493, // Total supplies distributed
      classesOrganized: 36, // Total classes organized
      blogsPublished: 25 // Total blogs published
    }
  };



  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'var(--green-600)' : 'var(--red-600)';
  };

  const getStatusBg = (status: string) => {
    return status === 'Active' ? 'var(--green-50)' : 'var(--red-50)';
  };

  const getStatusIcon = (status: string) => {
    return status === 'Active' ? <CheckCircle size={16} /> : <XCircle size={16} />;
  };

  const toggleWorkerStatus = () => {
    // In real app, this would make an API call to deactivate the ASHA worker
    console.log(`Toggling status for ASHA worker ${ashaWorker.id}`);
    // For now, just show confirmation
    if (ashaWorker.status === 'Active') {
      const confirmed = window.confirm('Are you sure you want to deactivate the ASHA worker? This will affect all healthcare services in the ward.');
      if (confirmed) {
        console.log('ASHA worker deactivated');
        // Update status logic would go here
      }
    }
  };

  return (
    <AdminLayout title="ASHA Worker Management">
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', margin: 0 }}>
            Manage the ASHA worker profile, monitor performance, and track assignments for Ward 12.
          </p>
        </div>



        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {ashaWorker.status === 'Active' ? '1' : '0'}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>ASHA Worker Status</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {ashaWorker.assignedHouseholds}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Assigned Households</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {ashaWorker.completedTasks}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Tasks Completed</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {ashaWorker.rating}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Current Rating</div>
          </div>
        </div>



        {/* ASHA Worker Profile */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">ASHA Worker Profile</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div 
                className="card" 
                style={{ 
                  padding: '1.5rem', 
                  border: '1px solid var(--gray-200)',
                  borderLeft: `4px solid ${getStatusColor(ashaWorker.status)}`
                }}
              >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <UserCheck size={20} color="var(--green-600)" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                          {ashaWorker.name}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getStatusColor(ashaWorker.status),
                          backgroundColor: getStatusBg(ashaWorker.status),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {getStatusIcon(ashaWorker.status)}
                          {ashaWorker.status}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        <div><strong>Email:</strong> {ashaWorker.email}</div>
                        <div><strong>Phone:</strong> {ashaWorker.phone}</div>
                        <div><strong>Ward:</strong> {ashaWorker.ward}</div>
                        <div><strong>Joined:</strong> {ashaWorker.joinDate}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={16} color="var(--yellow-500)" fill="var(--yellow-500)" />
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)' }}>
                          {ashaWorker.rating}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          ({ashaWorker.totalFeedbacks})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Users size={16} color="var(--blue-600)" />
                        <strong style={{ color: 'var(--blue-700)' }}>Assignments</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Households: {ashaWorker.assignedHouseholds}</div>
                        <div>Completed: {ashaWorker.completedTasks}</div>
                        <div>Pending: {ashaWorker.pendingTasks}</div>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Activity size={16} color="var(--green-600)" />
                        <strong style={{ color: 'var(--green-700)' }}>Performance</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Home Visits: {ashaWorker.performance.homeVisits}</div>
                        <div>Supplies: {ashaWorker.performance.suppliesDistributed}</div>
                        <div>Classes: {ashaWorker.performance.classesOrganized}</div>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--purple-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <MapPin size={16} color="var(--purple-600)" />
                        <strong style={{ color: 'var(--purple-700)' }}>Location & Contact</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div>Sector: {ashaWorker.sector}</div>
                        <div>Last Active: {ashaWorker.lastActive}</div>
                      </div>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--gray-700)', fontSize: '0.875rem' }}>Specializations:</strong>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {ashaWorker.specializations.map((spec, index) => (
                        <span 
                          key={index}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: 'var(--blue-700)',
                            backgroundColor: 'var(--blue-50)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid var(--blue-200)'
                          }}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
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
                      <Eye size={14} />
                      View Details
                    </button>
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
                      <Edit size={14} />
                      Edit Profile
                    </button>
                    <button 
                      onClick={toggleWorkerStatus}
                      className="btn"
                      style={{ 
                        backgroundColor: ashaWorker.status === 'Active' ? 'var(--red-600)' : 'var(--green-600)', 
                        color: 'white', 
                        border: 'none',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {ashaWorker.status === 'Active' ? <UserX size={14} /> : <UserCheck size={14} />}
                      {ashaWorker.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                    </button>
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
                      Contact
                    </button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AshaManagement;