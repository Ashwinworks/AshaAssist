import React, { useState, useEffect } from 'react';
import MaternityLayout from './MaternityLayout';
import { useAuth } from '../../context/AuthContext';
import { authAPI, api } from '../../services/api';
import toast from 'react-hot-toast';
import { User, Heart, Baby, Phone, ChevronRight, Save, Check } from 'lucide-react';

interface ProfileSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const ProfileSetup: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    name: '', phone: '', dateOfBirth: '', address: '', bloodGroup: '', height: '', weight: ''
  });

  const [medicalHistory, setMedicalHistory] = useState({
    chronicConditions: '', allergies: '', currentMedications: '', previousSurgeries: '', familyHistory: ''
  });

  const [pregnancyDetails, setPregnancyDetails] = useState({
    lmpDate: '', eddDate: '', gravida: '', para: '', previousComplications: '', currentConditions: ''
  });

  const [emergencyContact, setEmergencyContact] = useState({
    name: '', relationship: '', phone: '', alternatePhone: ''
  });

  // Load existing data
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        name: user.name || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        bloodGroup: user.bloodGroup || '',
        height: user.height || '',
        weight: user.weight || ''
      });
      if (user.medicalHistory) setMedicalHistory({
        chronicConditions: user.medicalHistory.chronicConditions || '',
        allergies: user.medicalHistory.allergies || '',
        currentMedications: user.medicalHistory.currentMedications || '',
        previousSurgeries: user.medicalHistory.previousSurgeries || '',
        familyHistory: user.medicalHistory.familyHistory || ''
      });
      if (user.pregnancyDetails) setPregnancyDetails({
        lmpDate: user.pregnancyDetails.lmpDate || '',
        eddDate: user.pregnancyDetails.eddDate || '',
        gravida: user.pregnancyDetails.gravida || '',
        para: user.pregnancyDetails.para || '',
        previousComplications: user.pregnancyDetails.previousComplications || '',
        currentConditions: user.pregnancyDetails.currentConditions || ''
      });
      if (user.emergencyContact) setEmergencyContact({
        name: user.emergencyContact.name || '',
        relationship: user.emergencyContact.relationship || '',
        phone: user.emergencyContact.phone || '',
        alternatePhone: user.emergencyContact.alternatePhone || ''
      });
    }
  }, [user]);

  // Calculate EDD from LMP
  useEffect(() => {
    if (pregnancyDetails.lmpDate) {
      const lmp = new Date(pregnancyDetails.lmpDate);
      const edd = new Date(lmp);
      edd.setDate(edd.getDate() + 280);
      setPregnancyDetails(prev => ({ ...prev, eddDate: edd.toISOString().split('T')[0] }));
    }
  }, [pregnancyDetails.lmpDate]);

  const sections: ProfileSection[] = [
    { id: 'personal', title: 'Personal Information', description: 'Basic details and contact info', icon: <User size={20} />, color: '#2563eb', bgColor: '#dbeafe' },
    { id: 'medical', title: 'Medical History', description: 'Health conditions and allergies', icon: <Heart size={20} />, color: '#db2777', bgColor: '#fce7f3' },
    { id: 'pregnancy', title: 'Pregnancy Details', description: 'Current pregnancy information', icon: <Baby size={20} />, color: '#d97706', bgColor: '#fef3c7' },
    { id: 'emergency', title: 'Emergency Contacts', description: 'Contact person for emergencies', icon: <Phone size={20} />, color: '#16a34a', bgColor: '#dcfce7' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
      if (file.size > 5 * 1024 * 1024) { toast.error('File size should be less than 5MB'); return; }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!profilePicture) { toast.error('Please select a profile picture first'); return; }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', profilePicture);
      const uploadResponse = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const response = await authAPI.updateProfile({ profilePicture: uploadResponse.data.fileUrl });
      if (user && response.user) updateUser(response.user);
      toast.success('Profile picture uploaded!');
      setProfilePicture(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload');
    } finally {
      setIsUploading(false);
    }
  };

  const saveSection = async (sectionId: string) => {
    setIsSaving(true);
    try {
      let data: any = {};
      if (sectionId === 'personal') {
        data = { ...personalInfo };
      } else if (sectionId === 'medical') {
        data = { medicalHistory };
      } else if (sectionId === 'pregnancy') {
        data = { pregnancyDetails, lmpDate: pregnancyDetails.lmpDate, eddDate: pregnancyDetails.eddDate };
      } else if (sectionId === 'emergency') {
        data = { emergencyContact, profileCompleted: true, isFirstLogin: false };
      }

      const response = await authAPI.updateProfile(data);
      if (response.user) updateUser(response.user);
      toast.success(`${sections.find(s => s.id === sectionId)?.title} saved!`);
      setActiveSection(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' };
  const labelStyle = { display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' };

  const renderSectionForm = (sectionId: string) => {
    if (sectionId === 'personal') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div><label style={labelStyle}>Full Name *</label><input style={inputStyle} value={personalInfo.name} onChange={e => setPersonalInfo({ ...personalInfo, name: e.target.value })} placeholder="Enter full name" /></div>
          <div><label style={labelStyle}>Phone *</label><input style={inputStyle} value={personalInfo.phone} onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })} placeholder="Phone number" /></div>
          <div><label style={labelStyle}>Date of Birth</label><input type="date" style={inputStyle} value={personalInfo.dateOfBirth} onChange={e => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })} /></div>
          <div><label style={labelStyle}>Blood Group</label>
            <select style={inputStyle} value={personalInfo.bloodGroup} onChange={e => setPersonalInfo({ ...personalInfo, bloodGroup: e.target.value })}>
              <option value="">Select</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Height (cm)</label><input type="number" style={inputStyle} value={personalInfo.height} onChange={e => setPersonalInfo({ ...personalInfo, height: e.target.value })} placeholder="e.g., 165" /></div>
          <div><label style={labelStyle}>Weight (kg)</label><input type="number" style={inputStyle} value={personalInfo.weight} onChange={e => setPersonalInfo({ ...personalInfo, weight: e.target.value })} placeholder="e.g., 60" /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Address</label><textarea style={{ ...inputStyle, minHeight: '80px' }} value={personalInfo.address} onChange={e => setPersonalInfo({ ...personalInfo, address: e.target.value })} placeholder="Full address" /></div>
        </div>
      );
    }

    if (sectionId === 'medical') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div><label style={labelStyle}>Chronic Conditions</label><textarea style={{ ...inputStyle, minHeight: '70px' }} value={medicalHistory.chronicConditions} onChange={e => setMedicalHistory({ ...medicalHistory, chronicConditions: e.target.value })} placeholder="e.g., Diabetes, Hypertension (leave blank if none)" /></div>
          <div><label style={labelStyle}>Allergies</label><textarea style={{ ...inputStyle, minHeight: '70px' }} value={medicalHistory.allergies} onChange={e => setMedicalHistory({ ...medicalHistory, allergies: e.target.value })} placeholder="Drug or food allergies" /></div>
          <div><label style={labelStyle}>Current Medications</label><textarea style={{ ...inputStyle, minHeight: '70px' }} value={medicalHistory.currentMedications} onChange={e => setMedicalHistory({ ...medicalHistory, currentMedications: e.target.value })} placeholder="List current medications" /></div>
          <div><label style={labelStyle}>Previous Surgeries</label><textarea style={{ ...inputStyle, minHeight: '70px' }} value={medicalHistory.previousSurgeries} onChange={e => setMedicalHistory({ ...medicalHistory, previousSurgeries: e.target.value })} placeholder="List any surgeries with year" /></div>
          <div><label style={labelStyle}>Family Medical History</label><textarea style={{ ...inputStyle, minHeight: '70px' }} value={medicalHistory.familyHistory} onChange={e => setMedicalHistory({ ...medicalHistory, familyHistory: e.target.value })} placeholder="Family history of diseases" /></div>
        </div>
      );
    }

    if (sectionId === 'pregnancy') {
      return (
        <div>
          <div style={{ backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#92400e' }}>
            💡 EDD is automatically calculated from LMP (Last Menstrual Period)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div><label style={labelStyle}>Last Menstrual Period (LMP) *</label><input type="date" style={inputStyle} value={pregnancyDetails.lmpDate} onChange={e => setPregnancyDetails({ ...pregnancyDetails, lmpDate: e.target.value })} /></div>
            <div><label style={labelStyle}>Expected Delivery Date (EDD)</label><input type="date" style={{ ...inputStyle, backgroundColor: '#f3f4f6' }} value={pregnancyDetails.eddDate} readOnly /></div>
            <div><label style={labelStyle}>Gravida (Total Pregnancies)</label><input type="number" style={inputStyle} value={pregnancyDetails.gravida} onChange={e => setPregnancyDetails({ ...pregnancyDetails, gravida: e.target.value })} placeholder="e.g., 1" min="1" /></div>
            <div><label style={labelStyle}>Para (Previous Deliveries)</label><input type="number" style={inputStyle} value={pregnancyDetails.para} onChange={e => setPregnancyDetails({ ...pregnancyDetails, para: e.target.value })} placeholder="e.g., 0" min="0" /></div>
          </div>
          <div style={{ marginTop: '1rem' }}><label style={labelStyle}>Previous Pregnancy Complications</label><textarea style={{ ...inputStyle, minHeight: '70px' }} value={pregnancyDetails.previousComplications} onChange={e => setPregnancyDetails({ ...pregnancyDetails, previousComplications: e.target.value })} placeholder="e.g., Gestational diabetes, preeclampsia" /></div>
          <div style={{ marginTop: '1rem' }}><label style={labelStyle}>Current Pregnancy Conditions</label><textarea style={{ ...inputStyle, minHeight: '70px' }} value={pregnancyDetails.currentConditions} onChange={e => setPregnancyDetails({ ...pregnancyDetails, currentConditions: e.target.value })} placeholder="Any current conditions" /></div>
        </div>
      );
    }

    if (sectionId === 'emergency') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div><label style={labelStyle}>Contact Name *</label><input style={inputStyle} value={emergencyContact.name} onChange={e => setEmergencyContact({ ...emergencyContact, name: e.target.value })} placeholder="Full name" /></div>
          <div><label style={labelStyle}>Relationship *</label>
            <select style={inputStyle} value={emergencyContact.relationship} onChange={e => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}>
              <option value="">Select</option>
              {['Spouse', 'Parent', 'Sibling', 'In-law', 'Friend', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Phone Number *</label><input style={inputStyle} value={emergencyContact.phone} onChange={e => setEmergencyContact({ ...emergencyContact, phone: e.target.value })} placeholder="Primary phone" /></div>
          <div><label style={labelStyle}>Alternate Phone</label><input style={inputStyle} value={emergencyContact.alternatePhone} onChange={e => setEmergencyContact({ ...emergencyContact, alternatePhone: e.target.value })} placeholder="Optional" /></div>
        </div>
      );
    }

    return null;
  };

  const isSectionComplete = (sectionId: string): boolean => {
    if (!user) return false;
    if (sectionId === 'personal') return !!(user.name && user.phone);
    if (sectionId === 'medical') return !!user.medicalHistory;
    if (sectionId === 'pregnancy') return !!user.pregnancyDetails?.lmpDate;
    if (sectionId === 'emergency') return !!user.emergencyContact?.name;
    return false;
  };

  return (
    <MaternityLayout title="Profile Setup">
      <div className="card">
        <div className="card-header"><h2 className="card-title">Complete Your Profile</h2></div>
        <div className="card-content">
          <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>Complete all sections to access full maternity care features.</p>

          {/* Profile Picture */}
          <div style={{ padding: '1.5rem', backgroundColor: '#fdf2f8', borderRadius: '0.75rem', marginBottom: '2rem', border: '1px solid #fbcfe8' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Profile Picture</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              {previewUrl || user?.profilePicture ? (
                <img src={previewUrl || user?.profilePicture} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ec4899' }} />
              ) : (
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #f9a8d4' }}>
                  <User size={36} color="#ec4899" />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="profile-picture" className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0, display: 'inline-block' }}>Choose Picture</label>
                <input id="profile-picture" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                {profilePicture && <button className="btn btn-primary" onClick={handleUpload} disabled={isUploading} style={{ margin: 0 }}>{isUploading ? 'Uploading...' : 'Upload'}</button>}
              </div>
            </div>
          </div>

          {/* Profile Sections */}
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Profile Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sections.map(section => (
              <div key={section.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', overflow: 'hidden' }}>
                <button
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                  style={{
                    width: '100%', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                    backgroundColor: activeSection === section.id ? '#f9fafb' : 'white', border: 'none', cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: section.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: section.color }}>{section.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>{section.title}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{section.description}</div>
                  </div>
                  {isSectionComplete(section.id) && <Check size={20} color="#10b981" />}
                  <ChevronRight size={20} color="#9ca3af" style={{ transform: activeSection === section.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {activeSection === section.id && (
                  <div style={{ padding: '1.25rem', borderTop: '1px solid #e5e7eb', backgroundColor: '#fafafa' }}>
                    {renderSectionForm(section.id)}
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                      <button className="btn btn-primary" onClick={() => saveSection(section.id)} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Save size={16} />{isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button className="btn btn-secondary" onClick={() => setActiveSection(null)} style={{ margin: 0 }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Completion Status */}
          {user?.profileCompleted && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '0.5rem', border: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Check size={24} color="#16a34a" />
              <div><strong style={{ color: '#166534' }}>Profile Complete!</strong><p style={{ margin: 0, fontSize: '0.875rem', color: '#15803d' }}>You have full access to all maternity care features.</p></div>
            </div>
          )}
        </div>
      </div>
    </MaternityLayout>
  );
};

export default ProfileSetup;