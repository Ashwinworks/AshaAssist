import React, { useEffect, useState } from 'react';
import AnganvaadiLayout from './AnganvaadiLayout';
import { History, Calendar, Users, CheckCircle, AlertCircle, Filter, Download, Search } from 'lucide-react';
import { monthlyRationAPI } from '../../services/api';

const RationHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rations, setRations] = useState<any[]>([]);
  const [filteredRations, setFilteredRations] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRationHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await monthlyRationAPI.getRationHistory();
      setRations(data.rations || []);
      setFilteredRations(data.rations || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load ration history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRationHistory();
  }, []);

  // Apply filters whenever rations or filter criteria change
  useEffect(() => {
    let filtered = [...rations];

    // Filter by month
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(r => r.monthStartDate === selectedMonth);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(r => r.status === selectedStatus);
    }

    // Filter by search query (name, phone, email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.userName?.toLowerCase().includes(query) ||
        r.userPhone?.toLowerCase().includes(query) ||
        r.userEmail?.toLowerCase().includes(query)
      );
    }

    setFilteredRations(filtered);
  }, [rations, selectedMonth, selectedStatus, searchQuery]);

  // Get unique months from rations
  const uniqueMonths = Array.from(new Set(rations.map(r => r.monthStartDate))).sort().reverse();

  const getStatusColor = (status: string) => {
    return status === 'collected' ? 'var(--green-500)' : 'var(--yellow-500)';
  };

  const getStatusBgColor = (status: string) => {
    return status === 'collected' ? 'var(--green-50)' : 'var(--yellow-50)';
  };

  const getMonthName = (monthStartDate: string) => {
    return new Date(monthStartDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const exportToCSV = () => {
    const headers = ['Month', 'User Name', 'Phone', 'Status', 'Collection Date'];
    const csvData = filteredRations.map(r => [
      getMonthName(r.monthStartDate),
      r.userName,
      r.userPhone || 'N/A',
      r.status,
      r.collectionDate ? new Date(r.collectionDate).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ration-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const totalRations = filteredRations.length;
  const collectedCount = filteredRations.filter(r => r.status === 'collected').length;
  const pendingCount = filteredRations.filter(r => r.status === 'pending').length;
  const collectionRate = totalRations > 0 ? ((collectedCount / totalRations) * 100).toFixed(1) : '0';

  return (
    <AnganvaadiLayout title="Ration History">
      <div>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
          padding: '2rem',
          borderRadius: '1rem',
          marginBottom: '2rem',
          border: '1px solid #f472b6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <History size={32} color="#be185d" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#831843', margin: 0 }}>
              Ration Distribution History
            </h2>
          </div>
          <p style={{ color: '#9f1239', fontSize: '0.95rem', margin: 0 }}>
            View and track all monthly ration distributions and collection records
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--red-50)',
            color: 'var(--red-700)',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--red-200)'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.125rem', color: 'var(--gray-600)' }}>Loading ration history...</div>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderLeft: '4px solid var(--blue-500)' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
                  {totalRations}
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Records</div>
              </div>
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderLeft: '4px solid var(--green-500)' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
                  {collectedCount}
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Collected</div>
              </div>
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderLeft: '4px solid var(--yellow-500)' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
                  {pendingCount}
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Pending</div>
              </div>
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderLeft: '4px solid var(--purple-500)' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
                  {collectionRate}%
                </div>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Collection Rate</div>
              </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Filter size={20} color="var(--gray-600)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)' }}>Filters</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
                    Search User
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none'
                    }}>
                      <Search size={18} color="var(--gray-400)" />
                    </div>
                    <input
                      type="text"
                      placeholder="Name, phone, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 40px',
                        border: '1px solid var(--gray-300)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--purple-500)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--gray-300)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--purple-500)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--gray-300)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="all">All Months</option>
                    {uniqueMonths.map(month => (
                      <option key={month} value={month}>{getMonthName(month)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--purple-500)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--gray-300)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="collected">Collected</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={exportToCSV}
                    disabled={filteredRations.length === 0}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 1rem',
                      background: filteredRations.length === 0 ? '#9ca3af' : 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: filteredRations.length === 0 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: filteredRations.length === 0 ? 'none' : '0 2px 4px rgba(236, 72, 153, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      if (filteredRations.length > 0) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(236, 72, 153, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (filteredRations.length > 0) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(236, 72, 153, 0.2)';
                      }
                    }}
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* History Table */}
            {filteredRations.length > 0 ? (
              <div className="card" style={{ 
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                border: '1px solid #fbcfe8'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', borderBottom: '2px solid #f9a8d4' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)' }}>Month</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)' }}>User Name</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)' }}>Phone</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)' }}>Collection Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRations.map((ration: any) => (
                        <tr key={ration.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Calendar size={16} color="var(--gray-500)" />
                              <span style={{ fontSize: '0.875rem', color: 'var(--gray-900)', fontWeight: '500' }}>
                                {getMonthName(ration.monthStartDate)}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Users size={16} color="var(--gray-500)" />
                              <span style={{ fontSize: '0.875rem', color: 'var(--gray-900)' }}>
                                {ration.userName}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                            {ration.userPhone || 'N/A'}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: getStatusBgColor(ration.status),
                              color: getStatusColor(ration.status)
                            }}>
                              {ration.status === 'collected' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                              {ration.status?.toUpperCase()}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                            {ration.collectionDate ? new Date(ration.collectionDate).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <History size={48} style={{ color: 'var(--gray-400)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                  No Records Found
                </h3>
                <p style={{ color: 'var(--gray-600)' }}>
                  {searchQuery || selectedMonth !== 'all' || selectedStatus !== 'all' 
                    ? 'Try adjusting your filters to see more results.'
                    : 'No ration distribution history available yet.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </AnganvaadiLayout>
  );
};

export default RationHistory;
