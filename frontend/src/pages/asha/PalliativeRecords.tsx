import React, { useState, useEffect, useMemo } from 'react';
import AshaLayout from './AshaLayout';
import { 
  Search, Edit, Plus, Heart, Activity, Thermometer, Pill, FileText, Clock, 
  Filter, Eye, Download, X, Image as ImageIcon, Calendar, User, Phone, Mail,
  Stethoscope, HeartPulse, Droplets, Syringe, Clipboard
} from 'lucide-react';
import { palliativeAPI } from '../../services/api';

// Types for palliative health records
interface PalliativeRecord {
  id: string;
  date: string;
  testType: string;
  notes?: string;
  value?: number;
  unit?: string;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  subvalues?: Record<string, string | number>;
  attachments?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  createdAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

const TEST_OPTIONS = [
  'Blood Pressure',
  'Random Blood Sugar',
  'Fasting Blood Sugar',
  'Postprandial Blood Sugar',
  'HbA1c',
  'Cholesterol Profile',
  'Serum Creatinine',
  'Urea',
  'Electrolytes (Na/K)',
  'Liver Function Test',
  'ECG',
  'SpO2',
  'Pulse Rate',
  'Body Temperature',
  'Weight/BMI',
  'Urine Routine',
];

const PalliativeRecords: React.FC = () => {
  const [records, setRecords] = useState<PalliativeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTestType, setFilterTestType] = useState('');
  const [filterUserName, setFilterUserName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewingDocument, setViewingDocument] = useState<{ name: string; url: string; type: string } | null>(null);

  // Load records from backend
  useEffect(() => {
    loadRecords();
  }, [filterTestType, filterUserName, dateFrom, dateTo]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterTestType) params.testType = filterTestType;
      if (filterUserName) params.userName = filterUserName;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      
      console.log('Loading palliative records with params:', params);
      const { records } = await palliativeAPI.getAllRecords(params);
      console.log('Received records:', records);
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
      record.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [records, searchTerm]);

  const getFileTypeFromUrl = (url: string, name: string): string => {
    const lowerUrl = url.toLowerCase();
    const lowerName = name.toLowerCase();
    
    if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || lowerUrl.includes('.png') || 
        lowerUrl.includes('.gif') || lowerUrl.includes('.webp') || lowerUrl.includes('.bmp') ||
        lowerName.includes('.jpg') || lowerName.includes('.jpeg') || lowerName.includes('.png') || 
        lowerName.includes('.gif') || lowerName.includes('.webp') || lowerName.includes('.bmp')) {
      return 'image';
    }
    
    if (lowerUrl.includes('.pdf') || lowerName.includes('.pdf')) {
      return 'pdf';
    }
    
    return 'other';
  };

  const viewDocument = (attachment: { name: string; url: string; type?: string }) => {
    const fileType = attachment.type || getFileTypeFromUrl(attachment.url, attachment.name);
    const fullUrl = attachment.url.startsWith('http') ? attachment.url : `http://localhost:5000${attachment.url}`;
    setViewingDocument({ ...attachment, url: fullUrl, type: fileType });
  };

  const closeDocumentViewer = () => {
    setViewingDocument(null);
  };

  const getTestIcon = (testType: string) => {
    switch (testType) {
      case 'Blood Pressure':
        return <HeartPulse size={16} color="var(--red-600)" />;
      case 'Random Blood Sugar':
      case 'Fasting Blood Sugar':
      case 'Postprandial Blood Sugar':
      case 'HbA1c':
        return <Droplets size={16} color="var(--purple-700)" />;
      case 'Cholesterol Profile':
        return <Syringe size={16} color="var(--blue-700)" />;
      case 'ECG':
      case 'SpO2':
      case 'Pulse Rate':
        return <Activity size={16} color="var(--rose-600)" />;
      case 'Body Temperature':
        return <Thermometer size={16} color="var(--orange-600)" />;
      default:
        return <Stethoscope size={16} color="var(--gray-600)" />;
    }
  };

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
    <AshaLayout title="Palliative Health Records">
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--gray-900)', margin: '0 0 0.5rem 0' }}>
              Palliative Health Records
            </h1>
            <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', margin: 0 }}>
              View and manage palliative health records from all patients.
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
            <Clipboard size={16} />
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
                    placeholder="Search by patient name, test type, or notes..."
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
                  Test Type
                </label>
                <select
                  value={filterTestType}
                  onChange={(e) => setFilterTestType(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '0.75rem', 
                    border: '1px solid var(--gray-300)', 
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">All Test Types</option>
                  {TEST_OPTIONS.map(test => (
                    <option key={test} value={test}>{test}</option>
                  ))}
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
              {getUniqueUsers().length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Active Patients</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              {records.filter(r => r.attachments && r.attachments.length > 0).length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Records with Documents</div>
          </div>
        </div>

        {/* Records List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Stethoscope size={20} color="var(--blue-600)" />
              Health Records ({filteredRecords.length})
            </h2>
          </div>
          <div className="card-content">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-600)' }}>
                <div style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Loading records...</div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-600)' }}>
                <Clipboard size={48} color="var(--gray-400)" style={{ marginBottom: '1rem' }} />
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
                          {getTestIcon(record.testType)}
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                            {record.testType}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                            color: 'var(--blue-700)',
                            backgroundColor: 'var(--blue-100)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                            {formatDate(record.date)}
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

                    {/* Test Results */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      {/* Test Values */}
                      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--blue-50)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <Activity size={16} color="var(--blue-600)" />
                          <strong style={{ color: 'var(--blue-700)' }}>Test Results</strong>
                      </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          {record.testType === 'Blood Pressure' && record.systolic && record.diastolic && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <strong>Blood Pressure:</strong> {record.systolic}/{record.diastolic} mmHg
                              {record.pulse && <span> | Pulse: {record.pulse} bpm</span>}
                            </div>
                          )}
                          {record.testType === 'Cholesterol Profile' && record.subvalues && (
                            <div>
                              {Object.entries(record.subvalues).map(([key, value]) => (
                                <div key={key} style={{ marginBottom: '0.25rem' }}>
                                  <strong>{key}:</strong> {value} mg/dL
                          </div>
                        ))}
                      </div>
                          )}
                          {record.value !== undefined && (
                            <div>
                              <strong>Value:</strong> {record.value} {record.unit || ''}
                    </div>
                          )}
                    </div>
                  </div>

                      {/* Attachments */}
                      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--green-50)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <FileText size={16} color="var(--green-600)" />
                          <strong style={{ color: 'var(--green-700)' }}>Attachments</strong>
                    </div>
                        {record.attachments && record.attachments.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {record.attachments.map((attachment, index) => {
                              const fileType = attachment.type || getFileTypeFromUrl(attachment.url, attachment.name);
                              return (
                                <button
                          key={index}
                                  onClick={() => viewDocument(attachment)}
                          style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--blue-100)',
                                    color: 'var(--blue-700)',
                                    border: '1px solid var(--blue-300)',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    textAlign: 'left',
                                    width: '100%'
                                  }}
                                >
                                  {fileType === 'image' ? <ImageIcon size={14} /> : <FileText size={14} />}
                                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {attachment.name}
                        </span>
                                  <Eye size={12} />
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>No attachments</div>
                        )}
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

        {/* Document Viewer Modal */}
        {viewingDocument && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: '100%',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--gray-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {viewingDocument.type === 'image' ? <ImageIcon size={20} color="var(--blue-600)" /> : <FileText size={20} color="var(--red-600)" />}
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                    {viewingDocument.name}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <a
                    href={viewingDocument.url}
                    download={viewingDocument.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'var(--green-100)',
                      color: 'var(--green-700)',
                      border: '1px solid var(--green-300)',
                      padding: '0.5rem 0.75rem',
                      textDecoration: 'none'
                    }}
                  >
                    <Download size={16} />
                    Download
                  </a>
                  <button
                    onClick={closeDocumentViewer}
                    className="btn"
                    style={{
                      background: 'var(--gray-100)',
                      color: 'var(--gray-700)',
                      border: '1px solid var(--gray-300)',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div style={{
                flex: 1,
                padding: '1.5rem',
                overflow: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {viewingDocument.type === 'image' ? (
                  <img
                    src={viewingDocument.url}
                    alt={viewingDocument.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: '0.25rem',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    onError={(e) => {
                      console.error('Image load error:', e);
                      console.error('Failed URL:', viewingDocument.url);
                    }}
                  />
                ) : viewingDocument.type === 'pdf' ? (
                  <iframe
                    src={viewingDocument.url}
                    style={{
                      width: '100%',
                      height: '70vh',
                      border: 'none',
                      borderRadius: '0.25rem'
                    }}
                    title={viewingDocument.name}
                    onError={(e) => {
                      console.error('PDF load error:', e);
                      console.error('Failed URL:', viewingDocument.url);
                    }}
                  />
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--gray-600)'
                  }}>
                    <FileText size={48} color="var(--gray-400)" />
                    <p style={{ margin: '1rem 0 0', fontSize: '1.125rem' }}>
                      Preview not available for this file type
                    </p>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                      File: {viewingDocument.name} | Type: {viewingDocument.type} | URL: {viewingDocument.url}
                    </p>
                    <a
                      href={viewingDocument.url}
                      download={viewingDocument.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'var(--blue-600)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        marginTop: '1rem',
                        textDecoration: 'none'
                      }}
                    >
                      <Download size={16} />
                      Download File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AshaLayout>
  );
};

export default PalliativeRecords;