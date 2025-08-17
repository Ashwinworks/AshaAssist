import React, { useState } from 'react';
import AshaLayout from './AshaLayout';
import { Search, Edit, Plus, Calendar, Baby, Heart, Activity, FileText } from 'lucide-react';

const MaternalRecords: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Mock data for demonstration
  const maternalRecords = [
    {
      id: 1,
      name: 'Priya Sharma',
      age: 28,
      address: 'House No. 45, Ward 12, Sector A',
      phone: '+91 98765 43210',
      pregnancyWeek: 32,
      expectedDelivery: '2024-03-15',
      lastVisit: '2024-01-10',
      riskLevel: 'Low',
      mcpCardNumber: 'MCP001234',
      antenatalVisits: 6,
      vaccinations: {
        tetanus: 'Complete',
        hepatitisB: 'Complete',
        influenza: 'Pending'
      },
      vitals: {
        weight: '68 kg',
        bloodPressure: '120/80',
        hemoglobin: '11.2 g/dl'
      },
      complications: 'None',
      notes: 'Regular checkups, healthy pregnancy progression'
    },
    {
      id: 2,
      name: 'Sunita Devi',
      age: 24,
      address: 'House No. 23, Ward 12, Sector C',
      phone: '+91 98765 43212',
      pregnancyWeek: 0, // Postnatal
      deliveryDate: '2024-01-10',
      lastVisit: '2024-01-14',
      riskLevel: 'Medium',
      mcpCardNumber: 'MCP001235',
      antenatalVisits: 8,
      deliveryDetails: {
        type: 'Normal',
        weight: '2.8 kg',
        complications: 'None'
      },
      postnatalCare: {
        breastfeeding: 'Established',
        familyPlanning: 'Counseled',
        immunizations: 'On schedule'
      },
      notes: 'Delivered healthy baby, recovering well'
    }
  ];

  const filteredRecords = maternalRecords.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.mcpCardNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'var(--red-600)';
      case 'Medium': return 'var(--yellow-600)';
      case 'Low': return 'var(--green-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case 'High': return 'var(--red-50)';
      case 'Medium': return 'var(--yellow-50)';
      case 'Low': return 'var(--green-50)';
      default: return 'var(--gray-50)';
    }
  };

  return (
    <AshaLayout title="Maternal Records">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', margin: 0 }}>
              Manage MCP cards, antenatal visits, and delivery records.
            </p>
          </div>
          <button 
            className="btn"
            style={{ 
              backgroundColor: 'var(--pink-600)', 
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
            Add New Record
          </button>
        </div>

        {/* Search */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-content" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Search size={20} color="var(--gray-400)" />
              <input 
                type="text" 
                placeholder="Search by name or MCP card number..."
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
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--pink-600)', marginBottom: '0.5rem' }}>
              {maternalRecords.filter(r => r.pregnancyWeek > 0).length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Active Pregnancies</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {maternalRecords.filter(r => r.pregnancyWeek === 0).length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Recent Deliveries</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--red-600)', marginBottom: '0.5rem' }}>
              {maternalRecords.filter(r => r.riskLevel === 'High').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>High Risk Cases</div>
          </div>
        </div>

        {/* Records List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Maternal Records</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredRecords.map((record) => (
                <div 
                  key={record.id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid var(--gray-200)',
                    borderLeft: `4px solid ${getRiskColor(record.riskLevel)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Baby size={20} color="var(--pink-600)" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                          {record.name}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getRiskColor(record.riskLevel),
                          backgroundColor: getRiskBg(record.riskLevel),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {record.riskLevel} Risk
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        <div><strong>Age:</strong> {record.age} years</div>
                        <div><strong>MCP Card:</strong> {record.mcpCardNumber}</div>
                        <div><strong>Phone:</strong> {record.phone}</div>
                        <div><strong>Last Visit:</strong> {record.lastVisit}</div>
                      </div>
                    </div>
                    <button 
                      className="btn"
                      onClick={() => setSelectedRecord(record)}
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
                      View Details
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {record.pregnancyWeek > 0 ? (
                      <>
                        <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--pink-25)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Heart size={16} color="var(--pink-600)" />
                            <strong style={{ color: 'var(--pink-700)' }}>Pregnancy Status</strong>
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                            <div>Week: {record.pregnancyWeek}</div>
                            <div>Expected Delivery: {record.expectedDelivery}</div>
                            <div>Antenatal Visits: {record.antenatalVisits}</div>
                          </div>
                        </div>
                        <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-25)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Activity size={16} color="var(--blue-600)" />
                            <strong style={{ color: 'var(--blue-700)' }}>Current Vitals</strong>
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                            <div>Weight: {record.vitals?.weight || 'N/A'}</div>
                            <div>BP: {record.vitals?.bloodPressure || 'N/A'}</div>
                            <div>Hb: {record.vitals?.hemoglobin || 'N/A'}</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-25)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Baby size={16} color="var(--green-600)" />
                            <strong style={{ color: 'var(--green-700)' }}>Delivery Details</strong>
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                            <div>Date: {record.deliveryDate}</div>
                            <div>Type: {record.deliveryDetails?.type}</div>
                            <div>Baby Weight: {record.deliveryDetails?.weight}</div>
                          </div>
                        </div>
                        <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--purple-25)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Heart size={16} color="var(--purple-600)" />
                            <strong style={{ color: 'var(--purple-700)' }}>Postnatal Care</strong>
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                            <div>Breastfeeding: {record.postnatalCare?.breastfeeding}</div>
                            <div>Family Planning: {record.postnatalCare?.familyPlanning}</div>
                            <div>Immunizations: {record.postnatalCare?.immunizations}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {record.notes && (
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FileText size={16} color="var(--gray-600)" />
                        <strong style={{ color: 'var(--gray-700)' }}>Notes</strong>
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

export default MaternalRecords;