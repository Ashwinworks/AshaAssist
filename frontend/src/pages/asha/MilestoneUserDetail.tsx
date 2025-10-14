import React, { useEffect, useState } from 'react';
import AshaLayout from './AshaLayout';
import { Baby, ArrowLeft, CheckCircle, AlertTriangle, Clock, User, Phone, Calendar, Image as ImageIcon, FileText, Save } from 'lucide-react';
import { milestonesAPI } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

interface Milestone {
  id: string;
  milestoneName: string;
  description: string;
  minMonths: number;
  maxMonths: number;
  order: number;
  icon: string;
  achieved: boolean;
  achievedDate: string | null;
  childAgeInMonths: number | null;
  notes: string | null;
  photoUrl: string | null;
  recordId: string | null;
  verificationStatus: string | null;
  verifiedBy: string | null;
  verificationNotes: string | null;
  verificationDate: string | null;
  statusText: string;
  statusColor: string;
}

interface UserInfo {
  userId: string;
  userName: string;
  phone: string;
  childDOB: string | null;
  childAgeMonths: number | null;
}

const MilestoneUserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchUserMilestones = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError('');
      const data = await milestonesAPI.getUserMilestoneDetails(userId);
      setUser(data.user);
      setMilestones(data.milestones);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load user milestones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserMilestones();
  }, [userId]);

  const handleVerify = async (milestone: Milestone, status: 'approved' | 'flagged') => {
    if (!milestone.recordId) return;

    try {
      setVerifying(true);
      setError('');
      await milestonesAPI.verifyMilestone(milestone.recordId, status, verificationNotes);
      setSuccessMessage(`Milestone ${status} successfully!`);
      setSelectedMilestone(null);
      setVerificationNotes('');
      
      // Refresh data
      await fetchUserMilestones();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.error || `Failed to ${status} milestone`);
    } finally {
      setVerifying(false);
    }
  };

  const getStatusBadgeStyle = (color: string) => {
    const styles: any = {
      red: { bg: 'var(--red-50)', text: 'var(--red-700)', border: 'var(--red-200)' },
      yellow: { bg: 'var(--yellow-50)', text: 'var(--yellow-700)', border: 'var(--yellow-200)' },
      orange: { bg: 'var(--orange-50)', text: 'var(--orange-700)', border: 'var(--orange-200)' },
      green: { bg: 'var(--green-50)', text: 'var(--green-700)', border: 'var(--green-200)' },
      blue: { bg: 'var(--blue-50)', text: 'var(--blue-700)', border: 'var(--blue-200)' }
    };
    return styles[color] || styles.blue;
  };

  return (
    <AshaLayout title="Milestone Details">
      <div>
        {/* Back Button */}
        <button
          onClick={() => navigate('/asha/milestone-monitoring')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--gray-300)',
            borderRadius: '0.5rem',
            color: 'var(--gray-700)',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-50)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ArrowLeft size={16} />
          Back to Monitoring
        </button>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            backgroundColor: 'var(--green-50)',
            color: 'var(--green-700)',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--green-200)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}

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
            <div style={{ fontSize: '1.125rem', color: 'var(--gray-600)' }}>Loading milestones...</div>
          </div>
        ) : (
          <>
            {/* User Info Card */}
            {user && (
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <Baby size={32} color="var(--primary-600)" />
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--gray-900)', margin: 0 }}>
                        {user.userName}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                          <Phone size={16} />
                          {user.phone}
                        </div>
                        {user.childAgeMonths !== null && (
                          <>
                            <span style={{ color: 'var(--gray-400)' }}>•</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                              <Calendar size={16} />
                              Child: {Math.floor(user.childAgeMonths)} months old
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--gray-200)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--gray-900)' }}>
                        {milestones.filter(m => m.achieved).length}/{milestones.length}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
                        Recorded
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--yellow-600)' }}>
                        {milestones.filter(m => m.verificationStatus === 'pending').length}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--yellow-600)', marginTop: '0.25rem' }}>
                        Pending
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--green-600)' }}>
                        {milestones.filter(m => m.verificationStatus === 'approved').length}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--green-600)', marginTop: '0.25rem' }}>
                        Approved
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--red-600)' }}>
                        {milestones.filter(m => m.statusColor === 'red' && !m.achieved).length}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: '0.25rem' }}>
                        Overdue
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Milestones List */}
            <div className="card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <h2 className="card-title" style={{ margin: 0 }}>Developmental Milestones</h2>
              </div>
              <div className="card-content" style={{ padding: 0 }}>
                {milestones.map((milestone, index) => {
                  const statusStyle = getStatusBadgeStyle(milestone.statusColor);
                  
                  return (
                    <div
                      key={milestone.id}
                      style={{
                        padding: '1.5rem',
                        borderBottom: index < milestones.length - 1 ? '1px solid var(--gray-200)' : 'none'
                      }}
                    >
                      {/* Milestone Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)', margin: '0 0 0.5rem 0' }}>
                            {milestone.milestoneName}
                          </h3>
                          <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: '0 0 0.5rem 0' }}>
                            {milestone.description}
                          </p>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                            Expected: {milestone.minMonths}-{milestone.maxMonths} months
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`,
                          whiteSpace: 'nowrap'
                        }}>
                          {milestone.statusText}
                        </div>
                      </div>

                      {/* Achievement Details */}
                      {milestone.achieved && (
                        <div style={{
                          backgroundColor: 'var(--gray-50)',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          marginTop: '1rem'
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {/* Achieved Date */}
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.25rem' }}>
                                Achieved Date
                              </div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--gray-900)' }}>
                                {milestone.achievedDate ? new Date(milestone.achievedDate).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>

                            {/* Child Age */}
                            {milestone.childAgeInMonths !== null && (
                              <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.25rem' }}>
                                  Child Age
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--gray-900)' }}>
                                  {Math.floor(milestone.childAgeInMonths)} months
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          {milestone.notes && (
                            <div style={{ marginTop: '1rem' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={14} />
                                Parent's Notes
                              </div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)', fontStyle: 'italic' }}>
                                "{milestone.notes}"
                              </div>
                            </div>
                          )}

                          {/* Photo */}
                          {milestone.photoUrl && (
                            <div style={{ marginTop: '1rem' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ImageIcon size={14} />
                                Photo
                              </div>
                              <img
                                src={`http://localhost:5000${milestone.photoUrl}`}
                                alt={milestone.milestoneName}
                                style={{
                                  maxWidth: '300px',
                                  maxHeight: '300px',
                                  borderRadius: '0.5rem',
                                  border: '1px solid var(--gray-200)'
                                }}
                              />
                            </div>
                          )}

                          {/* Verification Section */}
                          {milestone.verificationStatus === 'pending' && (
                            <div style={{
                              marginTop: '1rem',
                              paddingTop: '1rem',
                              borderTop: '1px solid var(--gray-200)'
                            }}>
                              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.75rem' }}>
                                Verification
                              </div>
                              
                              <textarea
                                placeholder="Add verification notes (optional for approval, required for flagging)..."
                                value={selectedMilestone?.id === milestone.id ? verificationNotes : ''}
                                onChange={(e) => {
                                  setSelectedMilestone(milestone);
                                  setVerificationNotes(e.target.value);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  border: '1px solid var(--gray-300)',
                                  borderRadius: '0.5rem',
                                  fontSize: '0.875rem',
                                  fontFamily: 'inherit',
                                  resize: 'vertical',
                                  minHeight: '80px',
                                  marginBottom: '0.75rem'
                                }}
                              />

                              <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                  onClick={() => handleVerify(milestone, 'approved')}
                                  disabled={verifying}
                                  style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    backgroundColor: 'var(--green-600)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: verifying ? 'not-allowed' : 'pointer',
                                    opacity: verifying ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                  }}
                                >
                                  <CheckCircle size={16} />
                                  {verifying ? 'Approving...' : 'Approve'}
                                </button>

                                <button
                                  onClick={() => handleVerify(milestone, 'flagged')}
                                  disabled={verifying}
                                  style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    backgroundColor: 'var(--red-600)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: verifying ? 'not-allowed' : 'pointer',
                                    opacity: verifying ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                  }}
                                >
                                  <AlertTriangle size={16} />
                                  {verifying ? 'Flagging...' : 'Flag - Needs Attention'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Already Verified */}
                          {milestone.verificationStatus === 'approved' && (
                            <div style={{
                              marginTop: '1rem',
                              padding: '0.75rem',
                              backgroundColor: 'var(--green-50)',
                              borderRadius: '0.5rem',
                              border: '1px solid var(--green-200)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--green-700)', fontSize: '0.875rem', fontWeight: '600' }}>
                                <CheckCircle size={16} />
                                Approved
                              </div>
                              {milestone.verificationNotes && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--green-600)', marginTop: '0.5rem' }}>
                                  Notes: {milestone.verificationNotes}
                                </div>
                              )}
                            </div>
                          )}

                          {milestone.verificationStatus === 'flagged' && (
                            <div style={{
                              marginTop: '1rem',
                              padding: '0.75rem',
                              backgroundColor: 'var(--red-50)',
                              borderRadius: '0.5rem',
                              border: '1px solid var(--red-200)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--red-700)', fontSize: '0.875rem', fontWeight: '600' }}>
                                <AlertTriangle size={16} />
                                Flagged - Needs Medical Attention
                              </div>
                              {milestone.verificationNotes && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--red-600)', marginTop: '0.5rem' }}>
                                  Notes: {milestone.verificationNotes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AshaLayout>
  );
};

export default MilestoneUserDetail;
