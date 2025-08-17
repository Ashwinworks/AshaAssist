import React, { useState } from 'react';
import AshaLayout from './AshaLayout';
import { Plus, FileText, Calendar, User, MapPin, Baby, Heart, Users } from 'lucide-react';

const VitalStatistics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('births');
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock data for demonstration
  const vitalRecords = {
    births: [
      {
        id: 1,
        childName: 'Arjun Kumar',
        parentNames: 'Priya Kumar & Rajesh Kumar',
        dateOfBirth: '2024-01-10',
        timeOfBirth: '08:30 AM',
        placeOfBirth: 'Government Hospital, Ward 12',
        weight: '3.2 kg',
        gender: 'Male',
        address: 'House No. 45, Ward 12, Sector A',
        registrationStatus: 'Pending',
        submittedDate: '2024-01-12'
      },
      {
        id: 2,
        childName: 'Kavya Sharma',
        parentNames: 'Sunita Sharma & Amit Sharma',
        dateOfBirth: '2024-01-08',
        timeOfBirth: '11:45 PM',
        placeOfBirth: 'Home Birth',
        weight: '2.9 kg',
        gender: 'Female',
        address: 'House No. 67, Ward 12, Sector B',
        registrationStatus: 'Submitted',
        submittedDate: '2024-01-09'
      }
    ],
    deaths: [
      {
        id: 1,
        deceasedName: 'Ramesh Patel',
        age: '72 years',
        dateOfDeath: '2024-01-05',
        timeOfDeath: '06:15 AM',
        placeOfDeath: 'Home',
        causeOfDeath: 'Natural causes - Heart failure',
        familyContact: 'Suresh Patel (Son)',
        address: 'House No. 89, Ward 12, Sector C',
        registrationStatus: 'Submitted',
        submittedDate: '2024-01-06'
      }
    ],
    marriages: [
      {
        id: 1,
        brideName: 'Meera Gupta',
        groomName: 'Vikash Singh',
        dateOfMarriage: '2024-01-15',
        placeOfMarriage: 'Community Hall, Ward 12',
        brideAge: '23 years',
        groomAge: '26 years',
        witnessNames: 'Ravi Gupta, Sunita Singh',
        address: 'House No. 34, Ward 12, Sector A',
        registrationStatus: 'Pending',
        submittedDate: '2024-01-16'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return 'var(--green-600)';
      case 'Pending': return 'var(--yellow-600)';
      case 'Rejected': return 'var(--red-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Submitted': return 'var(--green-50)';
      case 'Pending': return 'var(--yellow-50)';
      case 'Rejected': return 'var(--red-50)';
      default: return 'var(--gray-50)';
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'births': return <Baby size={16} />;
      case 'deaths': return <Heart size={16} />;
      case 'marriages': return <Users size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getTabColor = (tab: string) => {
    switch (tab) {
      case 'births': return 'var(--green-600)';
      case 'deaths': return 'var(--red-600)';
      case 'marriages': return 'var(--purple-600)';
      default: return 'var(--gray-600)';
    }
  };

  const renderBirthForm = () => (
    <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
          Child's Name
        </label>
        <input 
          type="text" 
          placeholder="Enter child's name..."
          style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
          Parent Names
        </label>
        <input 
          type="text" 
          placeholder="Mother's Name & Father's Name"
          style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
          Date of Birth
        </label>
        <input 
          type="date" 
          style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
          Time of Birth
        </label>
        <input 
          type="time" 
          style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
          Place of Birth
        </label>
        <input 
          type="text" 
          placeholder="Hospital/Home/Other"
          style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
          Weight at Birth
        </label>
        <input 
          type="text" 
          placeholder="e.g., 3.2 kg"
          style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
          Gender
        </label>
        <select style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}>
          <option value="">Select gender...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div style={{ gridColumn: '1 / -1' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
          Address
        </label>
        <textarea 
          rows={2}
          placeholder="Complete address..."
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid var(--gray-300)', 
            borderRadius: '0.5rem',
            resize: 'vertical'
          }}
        />
      </div>
    </form>
  );

  const renderRecords = () => {
    const records = vitalRecords[activeTab as keyof typeof vitalRecords];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {records.map((record: any) => (
          <div 
            key={record.id} 
            className="card" 
            style={{ 
              padding: '1.5rem', 
              border: '1px solid var(--gray-200)',
              borderLeft: `4px solid ${getTabColor(activeTab)}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {getTabIcon(activeTab)}
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                    {activeTab === 'births' && record.childName}
                    {activeTab === 'deaths' && record.deceasedName}
                    {activeTab === 'marriages' && `${record.brideName} & ${record.groomName}`}
                  </h3>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: getStatusColor(record.registrationStatus),
                    backgroundColor: getStatusBg(record.registrationStatus),
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem'
                  }}>
                    {record.registrationStatus}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {activeTab === 'births' && (
                <>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                      <strong>Parents:</strong> {record.parentNames}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                      <strong>Date & Time:</strong> {record.dateOfBirth} at {record.timeOfBirth}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      <strong>Place:</strong> {record.placeOfBirth}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                      <strong>Weight:</strong> {record.weight}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                      <strong>Gender:</strong> {record.gender}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      <strong>Submitted:</strong> {record.submittedDate}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'deaths' && (
                <>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                      <strong>Age:</strong> {record.age}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                      <strong>Date & Time:</strong> {record.dateOfDeath} at {record.timeOfDeath}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      <strong>Place:</strong> {record.placeOfDeath}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                      <strong>Cause:</strong> {record.causeOfDeath}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                      <strong>Family Contact:</strong> {record.familyContact}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      <strong>Submitted:</strong> {record.submittedDate}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'marriages' && (
                <>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                      <strong>Date:</strong> {record.dateOfMarriage}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                      <strong>Place:</strong> {record.placeOfMarriage}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      <strong>Ages:</strong> Bride {record.brideAge}, Groom {record.groomAge}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                      <strong>Witnesses:</strong> {record.witnessNames}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      <strong>Submitted:</strong> {record.submittedDate}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
              <MapPin size={14} color="var(--gray-500)" />
              <span>{record.address}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AshaLayout title="Vital Statistics">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', margin: 0 }}>
              Submit birth, death, and marriage reports for official registration.
            </p>
          </div>
          <button 
            className="btn"
            onClick={() => setShowAddForm(true)}
            style={{ 
              backgroundColor: getTabColor(activeTab), 
              color: 'white', 
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            <Plus size={16} />
            Add New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)} Record
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {vitalRecords.births.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Birth Records</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--red-600)', marginBottom: '0.5rem' }}>
              {vitalRecords.deaths.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Death Records</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {vitalRecords.marriages.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Marriage Records</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {Object.values(vitalRecords).flat().filter((r: any) => r.registrationStatus === 'Pending').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending Submission</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ borderBottom: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', gap: '0' }}>
              {['births', 'deaths', 'marriages'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '1rem 1.5rem',
                    border: 'none',
                    background: 'transparent',
                    borderBottom: activeTab === tab ? `3px solid ${getTabColor(tab)}` : '3px solid transparent',
                    color: activeTab === tab ? getTabColor(tab) : 'var(--gray-600)',
                    fontWeight: activeTab === tab ? '600' : '500',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textTransform: 'capitalize'
                  }}
                >
                  {getTabIcon(tab)}
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="card" style={{ marginBottom: '2rem', border: `2px solid ${getTabColor(activeTab)}` }}>
            <div className="card-header">
              <h2 className="card-title" style={{ color: getTabColor(activeTab), textTransform: 'capitalize' }}>
                Add New {activeTab.slice(0, -1)} Record
              </h2>
            </div>
            <div className="card-content">
              {renderBirthForm()}
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1.5rem', marginTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                <button 
                  type="submit"
                  className="btn"
                  style={{ 
                    backgroundColor: getTabColor(activeTab), 
                    color: 'white', 
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Submit Record
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn"
                  style={{ 
                    backgroundColor: 'transparent', 
                    color: 'var(--gray-600)', 
                    border: '1px solid var(--gray-300)',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Records List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ textTransform: 'capitalize' }}>
              {activeTab} Records
            </h2>
          </div>
          <div className="card-content">
            {renderRecords()}
          </div>
        </div>
      </div>
    </AshaLayout>
  );
};

export default VitalStatistics;