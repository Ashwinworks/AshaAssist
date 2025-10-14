import React from 'react';
import { X, Upload, Edit2, Trash2, Calendar as CalendarIcon } from 'lucide-react';

interface MilestoneModalProps {
  show: boolean;
  mode: 'add' | 'edit' | 'view';
  milestone: any;
  formData: {
    achievedDate: string;
    notes: string;
    photoFile: File | null;
    photoPreview: string;
  };
  uploading: boolean;
  error: string;
  successMessage: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFormChange: (field: string, value: any) => void;
  onModeChange: (mode: 'edit') => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({
  show,
  mode,
  milestone,
  formData,
  uploading,
  error,
  successMessage,
  onClose,
  onSubmit,
  onDelete,
  onFileSelect,
  onFormChange,
  onModeChange,
  fileInputRef
}) => {
  if (!show || !milestone) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 10
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--gray-900)',
            margin: 0
          }}>
            {mode === 'add' ? 'Record' : mode === 'edit' ? 'Edit' : 'View'} Milestone
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: 'var(--gray-400)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Milestone Info */}
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--purple-50)',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--purple-200)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{milestone.icon}</div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--gray-900)',
              marginBottom: '0.25rem'
            }}>
              {milestone.milestoneName}
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--gray-600)',
              margin: 0
            }}>
              {milestone.description}
            </p>
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div style={{
              backgroundColor: 'var(--red-50)',
              color: 'var(--red-700)',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              border: '1px solid var(--red-200)'
            }}>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{
              backgroundColor: 'var(--green-50)',
              color: 'var(--green-700)',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              border: '1px solid var(--green-200)'
            }}>
              {successMessage}
            </div>
          )}

          {mode !== 'view' ? (
            /* Edit/Add Form */
            <form onSubmit={onSubmit}>
              {/* Date Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)',
                  marginBottom: '0.5rem'
                }}>
                  Achievement Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.achievedDate}
                  onChange={(e) => onFormChange('achievedDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Photo Upload */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)',
                  marginBottom: '0.5rem'
                }}>
                  Photo
                </label>
                
                {formData.photoPreview && (
                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <img
                      src={formData.photoPreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--gray-300)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => onFormChange('photoPreview', '')}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        backgroundColor: 'var(--red-600)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileSelect}
                  style={{ display: 'none' }}
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px dashed var(--gray-300)',
                    borderRadius: '0.5rem',
                    backgroundColor: 'var(--gray-50)',
                    color: 'var(--gray-700)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Upload size={16} />
                  {formData.photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--gray-500)',
                  marginTop: '0.5rem',
                  margin: '0.5rem 0 0 0'
                }}>
                  Maximum file size: 5MB
                </p>
              </div>

              {/* Notes Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)',
                  marginBottom: '0.5rem'
                }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => onFormChange('notes', e.target.value)}
                  rows={4}
                  placeholder="Add any special notes about this milestone..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                {mode === 'edit' && (
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={uploading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'var(--red-600)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      opacity: uploading ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={uploading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--gray-200)',
                    color: 'var(--gray-700)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    opacity: uploading ? 0.5 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--primary-600)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    opacity: uploading ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {uploading ? 'Saving...' : mode === 'add' ? 'Record Milestone' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div>
              {formData.photoPreview && (
                <img
                  src={formData.photoPreview}
                  alt={milestone.milestoneName}
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'cover',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--gray-300)'
                  }}
                />
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--gray-700)',
                  marginBottom: '0.5rem'
                }}>
                  Achievement Date
                </div>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--gray-50)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--gray-900)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CalendarIcon size={16} />
                  {new Date(formData.achievedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {formData.notes && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--gray-700)',
                    marginBottom: '0.5rem'
                  }}>
                    Notes
                  </div>
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--gray-50)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--gray-900)',
                    lineHeight: '1.6'
                  }}>
                    {formData.notes}
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--gray-200)',
                    color: 'var(--gray-700)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => onModeChange('edit')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--primary-600)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestoneModal;
