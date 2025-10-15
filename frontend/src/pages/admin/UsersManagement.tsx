import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import { adminAPI } from '../../services/api';
import { Users, Search, Filter, Phone, Mail, CheckCircle, XCircle, ChevronLeft, ChevronRight, RefreshCw, Trash2, X } from 'lucide-react';

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'user' | 'asha_worker' | 'admin' | 'anganvaadi';
  beneficiaryCategory?: 'maternity' | 'palliative';
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
}

const UsersManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);

  // Filters & paging
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [category, setCategory] = useState<'all' | 'maternity' | 'palliative'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  // Style objects for consistent styling
  const searchInputStyle = {
    width: '100%',
    padding: '0.875rem 0.875rem 0.875rem 2.75rem',
    border: '2px solid var(--gray-200)',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    backgroundColor: 'white',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  };

  const filterSelectStyle = {
    padding: '0.875rem 1rem',
    border: '2px solid var(--gray-200)',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    minWidth: '140px',
    backgroundColor: 'white',
    color: 'var(--gray-700)',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 0.75rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1rem',
    paddingRight: '2.5rem'
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { type: 'user', page, pageSize };
      if (q.trim()) params.q = q.trim();
      if (status !== 'all') params.status = status;
      if (category !== 'all') params.category = category;
      const data = await adminAPI.listUsers(params);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const toggleStatus = async (u: UserRow) => {
    try {
      // Optimistic update
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isActive: !u.isActive } : x)));
      await adminAPI.updateUserStatus(u.id, !u.isActive);
    } catch (e) {
      // Revert on error
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isActive: u.isActive } : x)));
      alert('Failed to update status');
    }
  };

  const removeUser = async (u: UserRow) => {
    if (!window.confirm(`Deactivate user "${u.name}"? They will not be able to log in until reactivated.`)) {
      return;
    }

    try {
      // Optimistic update to inactive
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isActive: false } : x)));
      await adminAPI.updateUserStatus(u.id, false);
    } catch (e) {
      // Revert on error
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isActive: u.isActive } : x)));
      alert('Failed to deactivate user');
    }
  };

  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '—');

  return (
    <AdminLayout title="User Management">
      <div>
        {/* Colorful Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
          padding: '2rem',
          borderRadius: '1rem',
          marginBottom: '2rem',
          border: '1px solid #c4b5fd'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <Users size={32} color="#7c3aed" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#5b21b6', margin: 0 }}>
              User Management
            </h2>
          </div>
          <p style={{ color: '#6d28d9', fontSize: '0.95rem', margin: 0 }}>
            Manage registered users. Search, filter by category and status, and activate/deactivate accounts
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-content" style={{ padding: '1.5rem' }}>
            <div className="search-container" style={{ 
              display: 'flex', 
              gap: '1.5rem', 
              alignItems: 'center', 
              flexWrap: 'wrap',
              justifyContent: 'flex-start'
            }}>
              {/* Search Input Container */}
              <div className="search-input-container" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                flex: 2, 
                minWidth: '400px',
                position: 'relative'
              }}>
                <form onSubmit={onSearch} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    position: 'relative',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Search 
                      size={20} 
                      color="var(--gray-400)" 
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        zIndex: 1,
                        pointerEvents: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      style={searchInputStyle}
                      onFocus={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = 'var(--primary-500)';
                        (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = 'var(--gray-200)';
                        (e.target as HTMLInputElement).style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                      }}
                      onMouseEnter={(e) => {
                        if (document.activeElement !== e.target) {
                          (e.target as HTMLInputElement).style.borderColor = 'var(--gray-300)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (document.activeElement !== e.target) {
                          (e.target as HTMLInputElement).style.borderColor = 'var(--gray-200)';
                        }
                      }}
                    />
                    {q && (
                      <button
                        type="button"
                        onClick={() => setQ('')}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          borderRadius: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--gray-400)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--gray-100)';
                          e.currentTarget.style.color = 'var(--gray-600)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--gray-400)';
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Filter Dropdowns */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: '0 0 auto' }}>
                <div style={{ position: 'relative' }}>
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value as any); setPage(1); }}
                    style={filterSelectStyle}
                    onFocus={(e) => {
                      (e.target as HTMLSelectElement).style.borderColor = 'var(--primary-500)';
                      (e.target as HTMLSelectElement).style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLSelectElement).style.borderColor = 'var(--gray-200)';
                      (e.target as HTMLSelectElement).style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseEnter={(e) => {
                      if (document.activeElement !== e.target) {
                        (e.target as HTMLSelectElement).style.borderColor = 'var(--gray-300)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (document.activeElement !== e.target) {
                        (e.target as HTMLSelectElement).style.borderColor = 'var(--gray-200)';
                      }
                    }}
                  >
                    <option value="all">All Categories</option>
                    <option value="maternity">Maternity</option>
                    <option value="palliative">Palliative</option>
                  </select>
                </div>

                <div style={{ position: 'relative' }}>
                  <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value as any); setPage(1); }}
                    style={filterSelectStyle}
                    onFocus={(e) => {
                      (e.target as HTMLSelectElement).style.borderColor = 'var(--primary-500)';
                      (e.target as HTMLSelectElement).style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLSelectElement).style.borderColor = 'var(--gray-200)';
                      (e.target as HTMLSelectElement).style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseEnter={(e) => {
                      if (document.activeElement !== e.target) {
                        (e.target as HTMLSelectElement).style.borderColor = 'var(--gray-300)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (document.activeElement !== e.target) {
                        (e.target as HTMLSelectElement).style.borderColor = 'var(--gray-200)';
                      }
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <button 
                  className="btn" 
                  onClick={() => fetchUsers()} 
                  title="Refresh"
                  style={{ 
                    backgroundColor: 'var(--gray-100)', 
                    color: 'var(--gray-800)', 
                    border: '2px solid var(--gray-200)', 
                    padding: '0.875rem 1rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    borderRadius: '0.75rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--gray-200)';
                    e.currentTarget.style.borderColor = 'var(--gray-300)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--gray-100)';
                    e.currentTarget.style.borderColor = 'var(--gray-200)';
                  }}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Search Results Summary */}
            {q && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--blue-50)',
                border: '1px solid var(--blue-200)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--blue-700)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Search size={16} />
                <span>
                  Found {users.length} user{users.length !== 1 ? 's' : ''} 
                  {q && ` matching "${q}"`}
                  {category !== 'all' && ` in ${category} category`}
                  {status !== 'all' && ` with ${status} status`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--blue-600)" />
              Users
            </h2>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total: {total}</div>
          </div>

          {loading && (
            <div className="card-content" style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="loading-spinner" />
              <p>Loading...</p>
            </div>
          )}

          {error && (
            <div className="card-content" style={{ padding: '1rem' }}>
              <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--red-600)' }}>
                <p style={{ color: 'var(--red-700)', margin: 0 }}>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="card-content" style={{ padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderBottom: '2px solid #cbd5e1'
                    }}>
                      <th style={th}>Name</th>
                      <th style={th}>Email</th>
                      <th style={th}>Phone</th>
                      <th style={th}>Category</th>
                      <th style={th}>Status</th>
                      <th style={th}>Joined</th>
                      <th style={th}>Last Login</th>
                      <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ padding: '1rem', textAlign: 'center', color: 'var(--gray-600)' }}>
                          No users found
                        </td>
                      </tr>
                    )}
                    {users.map((u) => (
                      <tr key={u.id} style={{
                        borderBottom: '1px solid var(--gray-100)',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      >
                        <td style={td}>
                          <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{u.name}</div>
                          <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.8125rem' }}>
                            <span style={{ textTransform: 'capitalize' }}>{u.userType}</span>
                            {u.beneficiaryCategory && <span>• {u.beneficiaryCategory}</span>}
                          </div>
                        </td>
                        <td style={td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--gray-700)' }}>
                            <Mail size={14} />
                            {u.email}
                          </div>
                        </td>
                        <td style={td}>
                          {u.phone ? (
                            <a href={`tel:${u.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--purple-700)', textDecoration: 'none' }}>
                              <Phone size={14} />
                              {u.phone}
                            </a>
                          ) : (
                            <span style={{ color: 'var(--gray-500)' }}>—</span>
                          )}
                        </td>
                        <td style={td}>
                          <span style={{ textTransform: 'capitalize', color: 'var(--blue-700)', fontWeight: 600 }}>
                            {u.beneficiaryCategory || '—'}
                          </span>
                        </td>
                        <td style={td}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontWeight: 600,
                              color: u.isActive ? 'var(--green-700)' : 'var(--red-700)',
                              backgroundColor: u.isActive ? 'var(--green-50)' : 'var(--red-50)'
                            }}
                          >
                            {u.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={td}>{fmt(u.createdAt)}</td>
                        <td style={td}>{fmt(u.lastLogin)}</td>
                        <td style={{ ...td, textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              className="btn"
                              onClick={() => toggleStatus(u)}
                              style={{
                                background: u.isActive 
                                  ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                                  : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                color: u.isActive ? '#991b1b' : '#166534',
                                border: u.isActive ? '1px solid #fca5a5' : '1px solid #86efac',
                                padding: '0.4rem 0.75rem',
                                fontSize: '0.8125rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                                borderRadius: '0.375rem',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {u.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              className="btn"
                              onClick={() => removeUser(u)}
                              style={{
                                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                                color: '#991b1b',
                                border: '1px solid #fca5a5',
                                padding: '0.4rem 0.75rem',
                                fontSize: '0.8125rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                                borderRadius: '0.375rem',
                                transition: 'all 0.2s ease'
                              }}
                              title="Remove user permanently"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderTop: '1px solid var(--gray-200)' }}>
                <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                  Page {page} of {totalPages}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
                    style={{ padding: '0.35rem 0.5rem', border: '1px solid var(--gray-300)', borderRadius: '0.375rem' }}>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                  <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                    style={{ backgroundColor: 'white', color: 'var(--gray-800)', border: '1px solid var(--gray-300)', padding: '0.4rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', opacity: page <= 1 ? 0.6 : 1 }}>
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button className="btn" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    style={{ backgroundColor: 'white', color: 'var(--gray-800)', border: '1px solid var(--gray-300)', padding: '0.4rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', opacity: page >= totalPages ? 0.6 : 1 }}>
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.75rem 1rem',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--gray-600)',
  textTransform: 'uppercase'
};

const td: React.CSSProperties = {
  padding: '0.75rem 1rem',
  color: 'var(--gray-800)'
};

export default UsersManagement;