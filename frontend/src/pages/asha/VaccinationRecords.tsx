import React, { useState } from 'react';
import AshaLayout from './AshaLayout';
import { Search, Edit, Plus, Baby, Syringe, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const VaccinationRecords: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for demonstration
  const vaccinationRecords = [
    {
      id: 1,
      childName: 'Aarav Kumar',
      parentName: 'Priya Kumar',
      age: '14 months',
      dateOfBirth: '2022-11-15',
      address: 'House No. 45, Ward 12, Sector A',
      phone: '+91 98765 43210',
      vaccinations: [
        { vaccine: 'BCG', scheduledAge: 'Birth', status: 'Completed', dateGiven: '2022-11-16', nextDue: null },
        { vaccine: 'OPV-1', scheduledAge: '6 weeks', status: 'Completed', dateGiven: '2022-12-27', nextDue: null },
        { vaccine: 'DPT-1', scheduledAge: '6 weeks', status: 'Completed', dateGiven: '2022-12-27', nextDue: null },
        { vaccine: 'OPV-2', scheduledAge: '10 weeks', status: 'Completed', dateGiven: '2023-01-24', nextDue: null },
        { vaccine: 'DPT-2', scheduledAge: '10 weeks', status: 'Completed', dateGiven: '2023-01-24', nextDue: null },
        { vaccine: 'OPV-3', scheduledAge: '14 weeks', status: 'Completed', dateGiven: '2023-02-21', nextDue: null },
        { vaccine: 'DPT-3', scheduledAge: '14 weeks', status: 'Completed', dateGiven: '2023-02-21', nextDue: null },
        { vaccine: 'Measles-1', scheduledAge: '9 months', status: 'Completed', dateGiven: '2023-08-15', nextDue: null },
        { vaccine: 'MMR', scheduledAge: '12 months', status: 'Overdue', dateGiven: null, nextDue: '2023-11-15' },
        { vaccine: 'DPT Booster', scheduledAge: '16-24 months', status: 'Pending', dateGiven: null, nextDue: '2024-03-15' }
      ],
      overallStatus: 'Partially Complete'
    },
    {
      id: 2,
      childName: 'Kavya Sharma',
      parentName: 'Sunita Sharma',
      age: '8 months',
      dateOfBirth: '2023-05-20',
      address: 'House No. 67, Ward 12, Sector B',
      phone: '+91 98765 43213',
      vaccinations: [
        { vaccine: 'BCG', scheduledAge: 'Birth', status: 'Completed', dateGiven: '2023-05-21', nextDue: null },
        { vaccine: 'OPV-1', scheduledAge: '6 weeks', status: 'Completed', dateGiven: '2023-07-01', nextDue: null },
        { vaccine: 'DPT-1', scheduledAge: '6 weeks', status: 'Completed', dateGiven: '2023-07-01', nextDue: null },
        { vaccine: 'OPV-2', scheduledAge: '10 weeks', status: 'Completed', dateGiven: '2023-07-29', nextDue: null },
        { vaccine: 'DPT-2', scheduledAge: '10 weeks', status: 'Completed', dateGiven: '2023-07-29', nextDue: null },
        { vaccine: 'OPV-3', scheduledAge: '14 weeks', status: 'Completed', dateGiven: '2023-08-26', nextDue: null },
        { vaccine: 'DPT-3', scheduledAge: '14 weeks', status: 'Completed', dateGiven: '2023-08-26', nextDue: null },
        { vaccine: 'Measles-1', scheduledAge: '9 months', status: 'Due', dateGiven: null, nextDue: '2024-02-20' }
      ],
      overallStatus: 'On Track'
    }
  ];

  const filteredRecords = vaccinationRecords.filter(record => {
    const matchesSearch = record.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'overdue') return matchesSearch && record.vaccinations.some(v => v.status === 'Overdue');
    if (filterStatus === 'due') return matchesSearch && record.vaccinations.some(v => v.status === 'Due');
    if (filterStatus === 'complete') return matchesSearch && record.overallStatus === 'Complete';
    
    return matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle size={16} color="var(--green-600)" />;
      case 'Overdue': return <AlertCircle size={16} color="var(--red-600)" />;
      case 'Due': return <Clock size={16} color="var(--yellow-600)" />;
      case 'Pending': return <Clock size={16} color="var(--blue-600)" />;
      default: return <Clock size={16} color="var(--gray-600)" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'var(--green-600)';
      case 'Overdue': return 'var(--red-600)';
      case 'Due': return 'var(--yellow-600)';
      case 'Pending': return 'var(--blue-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Completed': return 'var(--green-50)';
      case 'Overdue': return 'var(--red-50)';
      case 'Due': return 'var(--yellow-50)';
      case 'Pending': return 'var(--blue-50)';
      default: return 'var(--gray-50)';
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'var(--green-600)';
      case 'On Track': return 'var(--blue-600)';
      case 'Partially Complete': return 'var(--yellow-600)';
      case 'Behind Schedule': return 'var(--red-600)';
      default: return 'var(--gray-600)';
    }
  };

  return (
    <AshaLayout title="Child Vaccination Records">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', margin: 0 }}>
              Track and manage vaccination schedules for children under 5.
            </p>
          </div>
          <button 
            className="btn"
            style={{ 
              backgroundColor: 'var(--green-600)', 
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
            Add New Child
          </button>
        </div>

        {/* Search and Filter */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-content" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '300px' }}>
                <Search size={20} color="var(--gray-400)" />
                <input 
                  type="text" 
                  placeholder="Search by child or parent name..."
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
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ 
                  padding: '0.75rem', 
                  border: '1px solid var(--gray-300)', 
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  minWidth: '150px'
                }}
              >
                <option value="all">All Children</option>
                <option value="overdue">Overdue</option>
                <option value="due">Due Soon</option>
                <option value="complete">Up to Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {vaccinationRecords.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Children</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--red-600)', marginBottom: '0.5rem' }}>
              {vaccinationRecords.filter(r => r.vaccinations.some(v => v.status === 'Overdue')).length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Overdue Vaccines</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {vaccinationRecords.filter(r => r.vaccinations.some(v => v.status === 'Due')).length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Due This Month</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {vaccinationRecords.reduce((sum, r) => sum + r.vaccinations.filter(v => v.status === 'Completed').length, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Vaccines Given</div>
          </div>
        </div>

        {/* Records List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Vaccination Records</h2>
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
                    borderLeft: `4px solid ${getOverallStatusColor(record.overallStatus)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Baby size={20} color="var(--green-600)" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                          {record.childName}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getOverallStatusColor(record.overallStatus),
                          backgroundColor: getStatusBg(record.overallStatus),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {record.overallStatus}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        <div><strong>Parent:</strong> {record.parentName}</div>
                        <div><strong>Age:</strong> {record.age}</div>
                        <div><strong>DOB:</strong> {record.dateOfBirth}</div>
                        <div><strong>Phone:</strong> {record.phone}</div>
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

                  {/* Vaccination Status Grid */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Syringe size={16} color="var(--green-600)" />
                      <strong style={{ color: 'var(--green-700)' }}>Vaccination Status</strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      {record.vaccinations.map((vaccination, index) => (
                        <div 
                          key={index}
                          className="card" 
                          style={{ 
                            padding: '0.75rem', 
                            backgroundColor: getStatusBg(vaccination.status),
                            border: `1px solid ${getStatusColor(vaccination.status)}20`
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--gray-800)' }}>
                              {vaccination.vaccine}
                            </span>
                            {getStatusIcon(vaccination.status)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                            <div>Age: {vaccination.scheduledAge}</div>
                            {vaccination.status === 'Completed' && vaccination.dateGiven && (
                              <div>Given: {vaccination.dateGiven}</div>
                            )}
                            {(vaccination.status === 'Due' || vaccination.status === 'Overdue' || vaccination.status === 'Pending') && vaccination.nextDue && (
                              <div style={{ color: getStatusColor(vaccination.status), fontWeight: '500' }}>
                                Due: {vaccination.nextDue}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons for Overdue/Due Vaccines */}
                  {record.vaccinations.some(v => v.status === 'Overdue' || v.status === 'Due') && (
                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
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
                        <Syringe size={14} />
                        Mark as Vaccinated
                      </button>
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
                        <Calendar size={14} />
                        Schedule Visit
                      </button>
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

export default VaccinationRecords;