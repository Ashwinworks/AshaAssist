import React, { useState } from 'react';
import AshaLayout from './AshaLayout';
import { Search, Edit, Plus, Heart, Activity, Thermometer, Pill, FileText, Clock } from 'lucide-react';

const PalliativeRecords: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  const palliativeRecords = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      age: 67,
      address: 'House No. 78, Ward 12, Sector B',
      phone: '+91 98765 43214',
      condition: 'Terminal Cancer',
      careLevel: 'High',
      lastVisit: '2024-01-14',
      nextVisit: '2024-01-18',
      primaryCaregiver: 'Sunita Kumar (Daughter)',
      vitals: {
        painLevel: '6/10',
        bloodPressure: '140/90',
        temperature: '99.2°F',
        oxygenSaturation: '94%'
      },
      medications: [
        { name: 'Morphine', dosage: '10mg', frequency: 'Every 4 hours', lastGiven: '2024-01-14 10:00 AM' },
        { name: 'Ondansetron', dosage: '4mg', frequency: 'Twice daily', lastGiven: '2024-01-14 08:00 AM' }
      ],
      symptoms: ['Pain', 'Nausea', 'Fatigue'],
      services: ['Pain Management', 'Emotional Support', 'Family Counseling'],
      notes: 'Patient requires frequent pain assessment. Family needs emotional support.'
    },
    {
      id: 2,
      name: 'Kamala Devi',
      age: 74,
      address: 'House No. 56, Ward 12, Sector A',
      phone: '+91 98765 43216',
      condition: 'End-stage Heart Disease',
      careLevel: 'Medium',
      lastVisit: '2024-01-12',
      nextVisit: '2024-01-19',
      primaryCaregiver: 'Ravi Devi (Son)',
      vitals: {
        painLevel: '3/10',
        bloodPressure: '110/70',
        temperature: '98.6°F',
        oxygenSaturation: '92%'
      },
      medications: [
        { name: 'Furosemide', dosage: '20mg', frequency: 'Once daily', lastGiven: '2024-01-14 09:00 AM' },
        { name: 'Digoxin', dosage: '0.25mg', frequency: 'Once daily', lastGiven: '2024-01-14 09:00 AM' }
      ],
      symptoms: ['Shortness of breath', 'Swelling', 'Weakness'],
      services: ['Symptom Management', 'Mobility Support', 'Nutrition Counseling'],
      notes: 'Stable condition. Monitor fluid retention and breathing difficulties.'
    }
  ];

  const filteredRecords = palliativeRecords.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCareColor = (level: string) => {
    switch (level) {
      case 'High': return 'var(--red-600)';
      case 'Medium': return 'var(--yellow-600)';
      case 'Low': return 'var(--green-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getCareBg = (level: string) => {
    switch (level) {
      case 'High': return 'var(--red-50)';
      case 'Medium': return 'var(--yellow-50)';
      case 'Low': return 'var(--green-50)';
      default: return 'var(--gray-50)';
    }
  };

  const getPainColor = (painLevel: string) => {
    const level = parseInt(painLevel.split('/')[0]);
    if (level >= 7) return 'var(--red-600)';
    if (level >= 4) return 'var(--yellow-600)';
    return 'var(--green-600)';
  };

  return (
    <AshaLayout title="Palliative Records">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', margin: 0 }}>
              Manage patient health status, vitals, and palliative care services.
            </p>
          </div>
          <button 
            className="btn"
            style={{ 
              backgroundColor: 'var(--blue-600)', 
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
            Add New Patient
          </button>
        </div>

        {/* Search */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-content" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Search size={20} color="var(--gray-400)" />
              <input 
                type="text" 
                placeholder="Search by name or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  flex: 1,
                  padding: '0.75rem', 
                  border: '1px solid var(--gray-300)', 
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {palliativeRecords.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Active Patients</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--red-600)', marginBottom: '0.5rem' }}>
              {palliativeRecords.filter(r => r.careLevel === 'High').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>High Care Level</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {palliativeRecords.filter(r => {
                const painLevel = parseInt(r.vitals.painLevel.split('/')[0]);
                return painLevel <= 3;
              }).length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Well-Managed Pain</div>
          </div>
        </div>

        {/* Records List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Palliative Care Records</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredRecords.map((record) => (
                <div 
                  key={record.id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid var(--gray-200)',
                    borderLeft: `4px solid ${getCareColor(record.careLevel)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Heart size={20} color="var(--blue-600)" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                          {record.name}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getCareColor(record.careLevel),
                          backgroundColor: getCareBg(record.careLevel),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {record.careLevel} Care
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        <div><strong>Age:</strong> {record.age} years</div>
                        <div><strong>Condition:</strong> {record.condition}</div>
                        <div><strong>Phone:</strong> {record.phone}</div>
                        <div><strong>Caregiver:</strong> {record.primaryCaregiver}</div>
                      </div>
                    </div>
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
                      <Edit size={14} />
                      Update Record
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    {/* Current Vitals */}
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Activity size={16} color="var(--blue-600)" />
                        <strong style={{ color: 'var(--blue-700)' }}>Current Vitals</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ color: getPainColor(record.vitals.painLevel), fontWeight: '600' }}>
                            Pain: {record.vitals.painLevel}
                          </span>
                        </div>
                        <div>BP: {record.vitals.bloodPressure}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Thermometer size={12} color="var(--gray-500)" />
                          <span>{record.vitals.temperature}</span>
                        </div>
                        <div>O2: {record.vitals.oxygenSaturation}</div>
                      </div>
                    </div>

                    {/* Current Medications */}
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Pill size={16} color="var(--green-600)" />
                        <strong style={{ color: 'var(--green-700)' }}>Current Medications</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {record.medications.slice(0, 2).map((med, index) => (
                          <div key={index} style={{ fontSize: '0.875rem' }}>
                            <div style={{ fontWeight: '500', color: 'var(--gray-800)' }}>
                              {med.name} - {med.dosage}
                            </div>
                            <div style={{ color: 'var(--gray-600)', fontSize: '0.75rem' }}>
                              {med.frequency} • Last: {med.lastGiven}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Visit Schedule */}
                    <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--purple-25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Clock size={16} color="var(--purple-600)" />
                        <strong style={{ color: 'var(--purple-700)' }}>Visit Schedule</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                        <div><strong>Last Visit:</strong> {record.lastVisit}</div>
                        <div><strong>Next Visit:</strong> {record.nextVisit}</div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <strong>Services:</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
                            {record.services.join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Symptoms */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Activity size={16} color="var(--red-600)" />
                      <strong style={{ color: 'var(--red-700)' }}>Current Symptoms</strong>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {record.symptoms.map((symptom, index) => (
                        <span 
                          key={index}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: 'var(--red-700)',
                            backgroundColor: 'var(--red-50)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid var(--red-200)'
                          }}
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {record.notes && (
                    <div style={{ padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FileText size={16} color="var(--gray-600)" />
                        <strong style={{ color: 'var(--gray-700)' }}>Care Notes</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        {record.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AshaLayout>
  );
};

export default PalliativeRecords;