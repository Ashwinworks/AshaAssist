import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import { adminAPI } from '../../services/api';
import { Users, Search, Filter, Phone, Mail, CheckCircle, XCircle, ChevronLeft, ChevronRight, RefreshCw, Trash2 } from 'lucide-react';

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'user' | 'asha_worker' | 'admin';
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
    if (!window.confirm(`Are you sure you want to permanently remove user "${u.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      // Remove from list optimistically
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setTotal((prev) => prev - 1);
      
      // TODO: Add delete user API call when backend supports it
      // await adminAPI.deleteUser(u.id);
      
      alert('User removal functionality will be implemented when backend supports it.');
    } catch (e) {
      // Revert on error
      fetchUsers();
      alert('Failed to remove user');
    }
  };

  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '—');

  return (
    <AdminLayout title="User Management">
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.0rem', margin: 0 }}>
            Manage registered users. Search, filter by category and status, and activate/deactivate accounts.
          </p>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-content" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <form onSubmit={onSearch} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1, minWidth: 260 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', top: 10, left: 10, color: 'var(--gray-500)' }} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, email, phone"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                />
              </div>
              <button className="btn" type="submit" style={{ backgroundColor: 'var(--blue-600)', color: 'white', border: 'none', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={16} />
                Apply
              </button>
            </form>

            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value as any); setPage(1); }}
              style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: '0.375rem' }}
            >
              <option value="all">All Categories</option>
              <option value="maternity">Maternity</option>
              <option value="palliative">Palliative</option>
            </select>

            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as any); setPage(1); }}
              style={{ padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: '0.375rem' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button className="btn" onClick={() => fetchUsers()} title="Refresh"
              style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-800)', border: '1px solid var(--gray-300)', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} />
              Refresh
            </button>
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
                    <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
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
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
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
                                backgroundColor: u.isActive ? '#dc2626' : '#16a34a',
                                color: 'white',
                                border: 'none',
                                padding: '0.4rem 0.75rem',
                                fontSize: '0.8125rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                cursor: 'pointer',
                                fontWeight: '500'
                              }}
                            >
                              {u.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              className="btn"
                              onClick={() => removeUser(u)}
                              style={{
                                backgroundColor: '#dc2626',
                                color: 'white',
                                border: 'none',
                                padding: '0.4rem 0.75rem',
                                fontSize: '0.8125rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                cursor: 'pointer',
                                fontWeight: '500'
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