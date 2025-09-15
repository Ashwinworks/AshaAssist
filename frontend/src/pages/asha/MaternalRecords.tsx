import React, { useState, useEffect, useMemo } from 'react';
import AshaLayout from './AshaLayout';
import { Search, Edit, Plus, Calendar, Baby, Heart, Activity, FileText, Filter, User, Phone, Mail, Clock } from 'lucide-react';
import { maternityAPI } from '../../services/api';

// Types for maternal records
interface MaternalRecord {
  id: string;
  visitDate: string;
  week?: number;
  center?: string;
  notes?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

const MaternalRecords: React.FC = () => {
  const [records, setRecords] = useState<MaternalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUserName, setFilterUserName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MaternalRecord | null>(null);

  // Load records from backend
  useEffect(() => {
    loadRecords();
  }, [filterUserName, dateFrom, dateTo]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterUserName) params.userName = filterUserName;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      
      const { records } = await maternityAPI.getAllRecords(params);
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
      record.center?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()))
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

  return (
    <AshaLayout title="Maternal Records">
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--gray-900)', margin: '0 0 0.5rem 0' }}>
              Maternal Records
            </h1>
            <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', margin: 0 }}>
              View and manage maternal health records from all patients.
            </p>
          </div>
          <button 
            className="btn"
            onClick={loadRecords}
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
            <FileText size={16} />
            Refresh Records
          </button>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} color="var(--pink-600)" />
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
                    placeholder="Search by patient name, center, or notes..."
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
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--pink-600)', marginBottom: '0.5rem' }}>
              {records.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Records</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {getUniqueUsers().length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Active Patients</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {records.filter(r => r.week && r.week > 0).length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Prenatal Visits</div>
          </div>
        </div>

        {/* Records List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Baby size={20} color="var(--pink-600)" />
              Maternal Records ({filteredRecords.length})
            </h2>
          </div>
          <div className="card-content">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-600)' }}>
                <div style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Loading records...</div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-600)' }}>
                <Baby size={48} color="var(--gray-400)" style={{ marginBottom: '1rem' }} />
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
                      borderLeft: '4px solid var(--pink-600)'
                    }}
                  >
                    {/* Record Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <Baby size={20} color="var(--pink-600)" />
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                            {record.user.name}
                          </h3>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'var(--pink-700)',
                            backgroundColor: 'var(--pink-100)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem'
                          }}>
                            {formatDate(record.visitDate)}
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

                    {/* Visit Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      {/* Visit Information */}
                      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--pink-50)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <Calendar size={16} color="var(--pink-600)" />
                          <strong style={{ color: 'var(--pink-700)' }}>Visit Information</strong>
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Visit Date:</strong> {formatDate(record.visitDate)}
                          </div>
                          {record.week && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <strong>Pregnancy Week:</strong> {record.week}
                            </div>
                          )}
                          {record.center && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <strong>Center:</strong> {record.center}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-50)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <Clock size={16} color="var(--blue-600)" />
                          <strong style={{ color: 'var(--blue-700)' }}>Record Details</strong>
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Created:</strong> {formatDate(record.createdAt)}
                          </div>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Record ID:</strong> {record.id}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {record.notes && (
                      <div style={{ padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.5rem' }}>
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
            )}
          </div>
        </div>
      </div>
    </AshaLayout>
  );
};

export default MaternalRecords;