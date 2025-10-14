import React, { useEffect, useState } from 'react';
import AshaLayout from './AshaLayout';
import { Baby, AlertCircle, CheckCircle, Clock, User, Phone, ChevronRight } from 'lucide-react';
import { milestonesAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface MaternalUser {
  userId: string;
  userName: string;
  phone: string;
  childDOB: string | null;
  childAgeMonths: number | null;
  totalMilestones: number;
  achievedCount: number;
  pendingVerification: number;
  approvedCount: number;
  flaggedCount: number;
  overdueCount: number;
  lastRecordedDate: string | null;
}

const MilestoneMonitoring: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<MaternalUser[]>([]);
  const navigate = useNavigate();

  const fetchMaternalUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await milestonesAPI.getMaternalUsersMilestones();
      setUsers(data.users);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load maternal users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaternalUsers();
  }, []);

  const getPriorityColor = (user: MaternalUser) => {
    if (user.overdueCount > 0) return 'red';
    if (user.pendingVerification > 0) return 'yellow';
    if (user.flaggedCount > 0) return 'orange';
    return 'green';
  };

  const getPriorityLabel = (user: MaternalUser) => {
    if (user.overdueCount > 0) return 'Urgent - Overdue Milestones';
    if (user.pendingVerification > 0) return 'Pending Verification';
    if (user.flaggedCount > 0) return 'Has Flagged Milestones';
    return 'On Track';
  };

  return (
    <AshaLayout title="Milestone Monitoring">
      <div>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Baby size={32} color="var(--primary-600)" />
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--gray-900)', margin: 0 }}>
                Milestone Monitoring
              </h1>
              <p style={{ color: 'var(--gray-600)', fontSize: '1rem', margin: '0.25rem 0 0 0' }}>
                Monitor developmental milestones for all maternal users
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--red-50)', border: '1px solid var(--red-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <AlertCircle size={24} color="var(--red-600)" />
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--red-700)' }}>
                Urgent Attention
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--red-900)' }}>
              {users.filter(u => u.overdueCount > 0).length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: '0.25rem' }}>
              Users with overdue milestones
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--yellow-50)', border: '1px solid var(--yellow-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Clock size={24} color="var(--yellow-600)" />
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--yellow-700)' }}>
                Pending Verification
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-900)' }}>
              {users.reduce((sum, u) => sum + u.pendingVerification, 0)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--yellow-600)', marginTop: '0.25rem' }}>
              Milestones awaiting review
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--green-50)', border: '1px solid var(--green-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <CheckCircle size={24} color="var(--green-600)" />
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--green-700)' }}>
                On Track
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-900)' }}>
              {users.filter(u => u.overdueCount === 0 && u.pendingVerification === 0).length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--green-600)', marginTop: '0.25rem' }}>
              Users with no issues
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--blue-50)', border: '1px solid var(--blue-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Baby size={24} color="var(--blue-600)" />
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--blue-700)' }}>
                Total Users
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-900)' }}>
              {users.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--blue-600)', marginTop: '0.25rem' }}>
              Maternal users monitored
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: 'var(--red-50)',
            color: 'var(--red-700)',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--red-200)'
          }}>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.125rem', color: 'var(--gray-600)' }}>Loading maternal users...</div>
          </div>
        ) : (
          /* Users List */
          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--gray-200)' }}>
              <h2 className="card-title" style={{ margin: 0 }}>Maternal Users</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: '0.5rem 0 0 0' }}>
                Click on a user to view detailed milestone information
              </p>
            </div>
            <div className="card-content" style={{ padding: 0 }}>
              {users.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                  No maternal users found
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {users.map((user, index) => {
                    const priorityColor = getPriorityColor(user);
                    const priorityLabel = getPriorityLabel(user);
                    
                    const colorStyles: any = {
                      red: { bg: 'var(--red-50)', text: 'var(--red-700)', border: 'var(--red-200)' },
                      yellow: { bg: 'var(--yellow-50)', text: 'var(--yellow-700)', border: 'var(--yellow-200)' },
                      orange: { bg: 'var(--orange-50)', text: 'var(--orange-700)', border: 'var(--orange-200)' },
                      green: { bg: 'var(--green-50)', text: 'var(--green-700)', border: 'var(--green-200)' }
                    };
                    
                    const style = colorStyles[priorityColor];

                    return (
                      <div
                        key={user.userId}
                        onClick={() => navigate(`/asha/milestone-monitoring/${user.userId}`)}
                        style={{
                          padding: '1.5rem',
                          borderBottom: index < users.length - 1 ? '1px solid var(--gray-200)' : 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1.5rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-50)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Priority Indicator */}
                        <div style={{
                          width: '4px',
                          height: '60px',
                          backgroundColor: style.border,
                          borderRadius: '2px',
                          flexShrink: 0
                        }} />

                        {/* User Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <User size={20} color="var(--gray-600)" />
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)', margin: 0 }}>
                              {user.userName}
                            </h3>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Phone size={16} color="var(--gray-500)" />
                            <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                              {user.phone}
                            </span>
                            {user.childAgeMonths !== null && (
                              <>
                                <span style={{ color: 'var(--gray-400)' }}>•</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                  Child: {Math.floor(user.childAgeMonths)} months old
                                </span>
                              </>
                            )}
                          </div>

                          {/* Priority Badge */}
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: style.bg,
                            color: style.text,
                            border: `1px solid ${style.border}`
                          }}>
                            {priorityLabel}
                          </div>
                        </div>

                        {/* Statistics */}
                        <div style={{ display: 'flex', gap: '2rem', flexShrink: 0 }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--gray-900)' }}>
                              {user.achievedCount}/{user.totalMilestones}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                              Recorded
                            </div>
                          </div>

                          {user.overdueCount > 0 && (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--red-600)' }}>
                                {user.overdueCount}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--red-600)' }}>
                                Overdue
                              </div>
                            </div>
                          )}

                          {user.pendingVerification > 0 && (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--yellow-600)' }}>
                                {user.pendingVerification}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--yellow-600)' }}>
                                Pending
                              </div>
                            </div>
                          )}

                          {user.approvedCount > 0 && (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--green-600)' }}>
                                {user.approvedCount}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--green-600)' }}>
                                Approved
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <ChevronRight size={24} color="var(--gray-400)" style={{ flexShrink: 0 }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AshaLayout>
  );
};

export default MilestoneMonitoring;
