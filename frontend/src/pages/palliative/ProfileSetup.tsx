import React, { useState } from 'react';
import PalliativeLayout from './PalliativeLayout';
import { useAuth } from '../../context/AuthContext';
import { authAPI, api } from '../../services/api';
import toast from 'react-hot-toast';

const ProfileSetup: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!profilePicture) {
      toast.error('Please select a profile picture first');
      return;
    }

    setIsUploading(true);
    try {
      // First, upload the profile picture
      const formData = new FormData();
      formData.append('file', profilePicture);

      const uploadResponse = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { fileUrl } = uploadResponse.data;

      // Then, update the user profile with the picture URL
      const profileData = {
        profilePicture: fileUrl
      };

      const response = await authAPI.updateProfile(profileData);
      
      // Update user context with new profile picture
      if (user && response.user) {
        updateUser(response.user);
      }
      
      toast.success('Profile picture uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      const message = error.response?.data?.error || 'Failed to upload profile picture';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PalliativeLayout title="Profile Setup">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Complete Your Profile</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '2rem' }}>
            Please complete your personal and medical details to access all palliative care features.
          </p>
          
          <div style={{ 
            padding: '2rem', 
            backgroundColor: 'var(--gray-50)', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Profile Picture</h3>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '1rem'
            }}>
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Profile preview" 
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '2px solid var(--primary-200)'
                  }} 
                />
              ) : user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Current profile" 
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '2px solid var(--primary-200)'
                  }} 
                />
              ) : (
                <div style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--gray-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed var(--gray-300)'
                }}>
                  <span style={{ color: 'var(--gray-500)' }}>No Image</span>
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <label 
                  htmlFor="profile-picture" 
                  className="btn btn-secondary"
                  style={{ cursor: 'pointer', margin: 0 }}
                >
                  Choose Picture
                </label>
                <input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                
                {profilePicture && (
                  <button
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={isUploading}
                    style={{ margin: '0.5rem 0 0 0' }}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Picture'}
                  </button>
                )}
              </div>
            </div>
            
            <div style={{ 
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: 'var(--blue-50)',
              borderRadius: '0.5rem',
              border: '1px solid var(--blue-200)'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--blue-800)' }}>Other Profile Details</h4>
              <p style={{ color: 'var(--blue-700)', margin: 0 }}>
                Additional profile information will be implemented here, including:
              </p>
              <ul style={{ color: 'var(--blue-700)', margin: '0.5rem 0 0 1.5rem' }}>
                <li>Personal information</li>
                <li>Medical history</li>
                <li>Current conditions</li>
                <li>Medications</li>
                <li>Emergency contacts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PalliativeLayout>
  );
};

export default ProfileSetup;