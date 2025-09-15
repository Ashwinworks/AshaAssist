import React, { useState, useEffect, useMemo } from 'react';
import AshaLayout from './AshaLayout';
import { Search, Edit, Plus, Baby, Syringe, Calendar, CheckCircle, AlertCircle, Clock, Filter, User, Phone, Mail } from 'lucide-react';
import { vaccinationAPI } from '../../services/api';

// Types for vaccination records
interface VaccinationRecord {
  id: string;
  vaccines: string[];
  childName?: string;
  status: string;
  date?: string;
  location?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  schedule: {
    id: string;
    title?: string;
    date?: string;
    time?: string;
    location?: string;
  };
}

const VaccinationRecords: React.FC = () => {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUserName, setFilterUserName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Load records from backend
  useEffect(() => {
    loadRecords();
  }, [filterStatus, filterUserName, dateFrom, dateTo]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      if (filterUserName) params.userName = filterUserName;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      
      const { records } = await vaccinationAPI.getAllRecords(params);
      setRecords(records);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(record =>
      record.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.childName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.schedule.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vaccines.some(vaccine => vaccine.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [records, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUniqueUsers = () => {
    const userMap = new Map();
    records.forEach(record => {
      if (!userMap.has(record.user.id)) {
        userMap.set(record.user.id, record.user);
      }
    });
    return Array.from(userMap.values());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle size={16} color="var(--green-600)" />;
      case 'Pending': return <Clock size={16} color="var(--blue-600)" />;
      case 'Cancelled': return <AlertCircle size={16} color="var(--red-600)" />;
      default: return <Clock size={16} color="var(--gray-600)" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'var(--green-600)';
      case 'Pending': return 'var(--blue-600)';
      case 'Cancelled': return 'var(--red-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Completed': return 'var(--green-50)';
      case 'Pending': return 'var(--blue-50)';
      case 'Cancelled': return 'var(--red-50)';
      default: return 'var(--gray-50)';
    }
  };

  return (
    <AshaLayout title="Child Vaccination Records">
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--gray-900)', margin: '0 0 0.5rem 0' }}>
              Child Vaccination Records
            </h1>
            <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', margin: 0 }}>
              View and manage vaccination records from all patients.
            </p>
          </div>
          <button 
            className="btn"
            onClick={loadRecords}
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
            <Syringe size={16} />
            Refresh Records
          </button>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} color="var(--blue-600)" />
              Filters & Search
            </h3>
          </div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                  Search Records
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', top: 12, left: 12, color: 'var(--gray-400)' }} />
                  <input 
                    type="text" 
                    placeholder="Search by patient name, child name, or vaccines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem', 
                      border: '1px solid var(--gray-300)', 
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '0.75rem', 
                    border: '1px solid var(--gray-300)', 
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                  Patient Name
                </label>
                <select
                  value={filterUserName}
                  onChange={(e) => setFilterUserName(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '0.75rem', 
                    border: '1px solid var(--gray-300)', 
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">All Patients</option>
                  {getUniqueUsers().map(user => (
                    <option key={user.id} value={user.name}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                  Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '0.75rem', 
                    border: '1px solid var(--gray-300)', 
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                  Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '0.75rem', 
                    border: '1px solid var(--gray-300)', 
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {records.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Records</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {records.filter(r => r.status === 'Completed').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Completed</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {records.filter(r => r.status === 'Pending').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {getUniqueUsers().length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Active Patients</div>
          </div>
        </div>

        {/* Records List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Syringe size={20} color="var(--blue-600)" />
              Vaccination Records ({filteredRecords.length})
            </h2>
          </div>
          <div className="card-content">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-600)' }}>
                <div style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Loading records...</div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-600)' }}>
                <Syringe size={48} color="var(--gray-400)" style={{ marginBottom: '1rem' }} />
                <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No records found</div>
                <div style={{ fontSize: '0.875rem' }}>Try adjusting your search criteria or check back later.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filteredRecords.map((record) => (
                  <div 
                    key={record.id} 
                    className="card" 
                    style={{ 
                      padding: '1.5rem', 
                      border: '1px solid var(--gray-200)',
                      borderLeft: '4px solid var(--blue-600)'
                    }}
                  >
                    {/* Record Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <Syringe size={20} color="var(--blue-600)" />
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                            {record.childName || 'Vaccination Record'}
                          </h3>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: getStatusColor(record.status),
                            backgroundColor: getStatusBg(record.status),
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem'
                          }}>
                            {record.status}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={14} />
                            <strong>Patient:</strong> {record.user.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={14} />
                            <strong>Email:</strong> {record.user.email}
                          </div>
                          {record.user.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Phone size={14} />
                              <strong>Phone:</strong> {record.user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vaccination Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      {/* Vaccines */}
                      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-50)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <Syringe size={16} color="var(--blue-600)" />
                          <strong style={{ color: 'var(--blue-700)' }}>Vaccines</strong>
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          {record.vaccines.map((vaccine, index) => (
                            <div key={index} style={{ 
                              marginBottom: '0.25rem',
                              padding: '0.25rem 0.5rem',
                              backgroundColor: 'var(--blue-100)',
                              borderRadius: '0.25rem',
                              display: 'inline-block',
                              marginRight: '0.5rem'
                            }}>
                              {vaccine}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Schedule Info */}
                      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-50)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <Calendar size={16} color="var(--green-600)" />
                          <strong style={{ color: 'var(--green-700)' }}>Schedule Details</strong>
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          {record.schedule.title && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <strong>Title:</strong> {record.schedule.title}
                            </div>
                          )}
                          {record.schedule.date && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <strong>Date:</strong> {formatDate(record.schedule.date)}
                            </div>
                          )}
                          {record.schedule.time && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <strong>Time:</strong> {record.schedule.time}
                            </div>
                          )}
                          {record.schedule.location && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <strong>Location:</strong> {record.schedule.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Record Info */}
                    <div style={{ padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Clock size={16} color="var(--gray-600)" />
                        <strong style={{ color: 'var(--gray-700)' }}>Record Information</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        <div style={{ marginBottom: '0.25rem' }}>
                          <strong>Created:</strong> {formatDate(record.createdAt)}
                        </div>
                        <div style={{ marginBottom: '0.25rem' }}>
                          <strong>Record ID:</strong> {record.id}
                        </div>
                        {record.date && (
                          <div>
                            <strong>Vaccination Date:</strong> {formatDate(record.date)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AshaLayout>
  );
};

export default VaccinationRecords;