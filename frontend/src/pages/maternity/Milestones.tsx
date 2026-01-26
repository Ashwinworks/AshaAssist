import React, { useEffect, useState, useRef } from 'react';
import MaternityLayout from './MaternityLayout';
import { Baby, Camera, Calendar, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { milestonesAPI } from '../../services/api';
import MilestoneModal from '../../components/MilestoneModal';
import MilestoneGuidelinesModal from '../../components/MilestoneGuidelinesModal';

interface Milestone {
  id: string;
  milestoneName: string;
  description: string;
  minMonths: number;
  maxMonths: number;
  order: number;
  icon: string;
  checklistItems?: string[];
  videoUrl?: string;
  tips?: string[];
  safetyWarnings?: string[];
  whatToExpect?: string;
  redFlags?: string[];
  achieved: boolean;
  achievedDate: string | null;
  childAgeInMonths: number | null;
  notes: string | null;
  photoUrl: string | null;
  recordId: string | null;
  statusText: string;
  statusColor: string;
}

const Milestones: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [childAgeMonths, setChildAgeMonths] = useState<number | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [formData, setFormData] = useState({
    achievedDate: '',
    notes: '',
    photoFile: null as File | null,
    photoPreview: '' as string
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [guidelinesModal, setGuidelinesModal] = useState<{ isOpen: boolean; milestone: Milestone | null }>({
    isOpen: false,
    milestone: null
  });

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await milestonesAPI.getMyProgress();
      setMilestones(data.milestones);
      setChildAgeMonths(data.childAgeMonths);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const openModal = (milestone: Milestone, mode: 'add' | 'edit' | 'view') => {
    setSelectedMilestone(milestone);
    setModalMode(mode);
    setShowModal(true);

    if (mode === 'edit' || mode === 'view') {
      setFormData({
        achievedDate: milestone.achievedDate || '',
        notes: milestone.notes || '',
        photoFile: null,
        photoPreview: milestone.photoUrl || ''
      });
    } else {
      setFormData({
        achievedDate: new Date().toISOString().split('T')[0],
        notes: '',
        photoFile: null,
        photoPreview: ''
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMilestone(null);
    setFormData({
      achievedDate: '',
      notes: '',
      photoFile: null,
      photoPreview: ''
    });
    setError('');
    setSuccessMessage('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        photoFile: file,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    try {
      setUploading(true);
      setError('');
      setSuccessMessage('');

      let photoUrl = formData.photoPreview;

      if (formData.photoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.photoFile);
        const uploadResult = await milestonesAPI.uploadMilestonePhoto(uploadFormData);
        photoUrl = uploadResult.fileUrl;
      }

      if (modalMode === 'add') {
        await milestonesAPI.recordMilestone({
          milestoneId: selectedMilestone.id,
          achievedDate: formData.achievedDate,
          notes: formData.notes,
          photoUrl: photoUrl
        });
        setSuccessMessage('Milestone recorded successfully!');
      } else if (modalMode === 'edit' && selectedMilestone.recordId) {
        await milestonesAPI.updateMilestoneRecord(selectedMilestone.recordId, {
          achievedDate: formData.achievedDate,
          notes: formData.notes,
          photoUrl: photoUrl
        });
        setSuccessMessage('Milestone updated successfully!');
      }

      await fetchMilestones();
      setTimeout(() => closeModal(), 1500);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to save milestone');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMilestone?.recordId) return;

    if (!window.confirm('Are you sure you want to delete this milestone record?')) return;

    try {
      setUploading(true);
      setError('');
      await milestonesAPI.deleteMilestoneRecord(selectedMilestone.recordId);
      setSuccessMessage('Milestone record deleted successfully!');
      await fetchMilestones();
      closeModal();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to delete milestone');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadgeStyle = (color: string) => {
    const colors: any = {
      green: { bg: 'var(--green-50)', text: 'var(--green-700)', border: 'var(--green-200)' },
      yellow: { bg: 'var(--yellow-50)', text: 'var(--yellow-700)', border: 'var(--yellow-200)' },
      red: { bg: 'var(--red-50)', text: 'var(--red-700)', border: 'var(--red-200)' },
      blue: { bg: 'var(--blue-50)', text: 'var(--blue-700)', border: 'var(--blue-200)' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <MaternityLayout title="Developmental Milestones">
      <div>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Baby size={32} color="var(--primary-600)" />
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--gray-900)', margin: 0 }}>
                Baby's Milestones
              </h1>
              {childAgeMonths !== null && (
                <p style={{ color: 'var(--gray-600)', fontSize: '1rem', margin: '0.25rem 0 0 0' }}>
                  Your baby is {Math.floor(childAgeMonths)} months old
                </p>
              )}
            </div>
          </div>
          <p style={{ color: 'var(--gray-600)', fontSize: '1rem', lineHeight: '1.6' }}>
            Track your baby's developmental journey by recording important milestones with photos and notes.
          </p>
        </div>

        {/* Messages */}
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

        {successMessage && !showModal && (
          <div style={{
            backgroundColor: 'var(--green-50)',
            color: 'var(--green-700)',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--green-200)'
          }}>
            {successMessage}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.125rem', color: 'var(--gray-600)' }}>Loading milestones...</div>
          </div>
        ) : (
          /* Milestones Grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {milestones.map((milestone) => {
              const statusStyle = getStatusBadgeStyle(milestone.statusColor);

              return (
                <div
                  key={milestone.id}
                  className="card"
                  style={{
                    border: milestone.achieved ? '2px solid var(--green-300)' : '1px solid var(--gray-200)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => openModal(milestone, milestone.achieved ? 'view' : 'add')}
                >
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.text,
                    border: `1px solid ${statusStyle.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {milestone.achieved && <CheckCircle size={12} />}
                    {milestone.statusText}
                  </div>

                  {/* Photo or Icon */}
                  <div style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: milestone.photoUrl ? 'transparent' : 'var(--purple-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '0.5rem 0.5rem 0 0',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {milestone.photoUrl ? (
                      <img
                        src={milestone.photoUrl}
                        alt={milestone.milestoneName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '4rem',
                        filter: milestone.achieved ? 'none' : 'grayscale(100%) opacity(0.5)'
                      }}>
                        {milestone.icon}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="card-content" style={{ padding: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: 'var(--gray-900)',
                      marginBottom: '0.5rem',
                      paddingRight: '5rem'
                    }}>
                      {milestone.milestoneName}
                    </h3>

                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--gray-600)',
                      marginBottom: '1rem',
                      lineHeight: '1.5'
                    }}>
                      {milestone.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: 'var(--gray-500)',
                      marginBottom: '0.75rem'
                    }}>
                      <Clock size={14} />
                      <span>Typical: {milestone.minMonths}-{milestone.maxMonths} months</span>
                    </div>

                    {milestone.achieved && milestone.achievedDate && (
                      <>
                        <div style={{
                          padding: '0.75rem',
                          backgroundColor: 'var(--green-50)',
                          borderRadius: '0.5rem',
                          border: '1px solid var(--green-200)',
                          marginTop: '1rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: 'var(--green-700)',
                            fontWeight: '600'
                          }}>
                            <Calendar size={14} />
                            Achieved on {new Date(milestone.achievedDate).toLocaleDateString()}
                          </div>
                          {milestone.childAgeInMonths && (
                            <div style={{
                              fontSize: '0.75rem',
                              color: 'var(--green-600)',
                              marginTop: '0.25rem'
                            }}>
                              At {Math.floor(milestone.childAgeInMonths)} months old
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                          <button
                            style={{
                              flex: 1,
                              padding: '0.625rem',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(milestone, 'view');
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                          >
                            <CheckCircle size={14} />
                            View
                          </button>
                          <button
                            style={{
                              flex: 1,
                              padding: '0.625rem',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(milestone, 'edit');
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                          >
                            <Camera size={14} />
                            Edit
                          </button>
                        </div>

                        {/* View Guidelines Button for achieved milestones */}
                        <button
                          style={{
                            width: '100%',
                            marginTop: '0.75rem',
                            padding: '0.625rem',
                            backgroundColor: 'var(--purple-600)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setGuidelinesModal({ isOpen: true, milestone });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--purple-700)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--purple-600)';
                          }}
                        >
                          <BookOpen size={14} />
                          Guidelines
                        </button>
                      </>
                    )}

                    {!milestone.achieved && (
                      <>
                        {/* View Guidelines Button */}
                        <button
                          style={{
                            width: '100%',
                            marginTop: '1rem',
                            padding: '0.75rem',
                            backgroundColor: 'var(--purple-600)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(124, 58, 237, 0.2)'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setGuidelinesModal({ isOpen: true, milestone });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--purple-700)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(124, 58, 237, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--purple-600)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(124, 58, 237, 0.2)';
                          }}
                        >
                          <BookOpen size={16} />
                          View Guidelines & Tips
                        </button>

                        <button
                          className="btn"
                          style={{
                            width: '100%',
                            marginTop: '1rem',
                            backgroundColor: '#7c3aed',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(milestone, 'add');
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d28d9'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
                        >
                          <Camera size={16} />
                          Record Milestone
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Milestone Modal */}
        <MilestoneModal
          show={showModal}
          mode={modalMode}
          milestone={selectedMilestone}
          formData={formData}
          uploading={uploading}
          error={error}
          successMessage={successMessage}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          onFileSelect={handleFileSelect}
          onFormChange={(field, value) => {
            if (field === 'photoPreview' && value === '') {
              setFormData(prev => ({ ...prev, photoFile: null, photoPreview: '' }));
            } else {
              setFormData(prev => ({ ...prev, [field]: value }));
            }
          }}
          onModeChange={setModalMode}
          fileInputRef={fileInputRef}
        />

        {/* Guidelines Modal */}
        <MilestoneGuidelinesModal
          isOpen={guidelinesModal.isOpen}
          milestone={guidelinesModal.milestone}
          onClose={() => setGuidelinesModal({ isOpen: false, milestone: null })}
        />
      </div>
    </MaternityLayout>
  );
};

export default Milestones;
