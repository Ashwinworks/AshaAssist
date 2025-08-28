import React from 'react';
import AdminLayout from '../AdminLayout';
import {
  Search,
  CheckCircle,
  Trash2,
  Calendar as CalendarIcon,
  User as UserIcon,
  Filter,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { healthBlogsAPI } from '../../../services/api';

interface BlogItem {
  id: string;
  title: string;
  content: string;
  category: 'maternity' | 'palliative' | 'general' | string;
  authorName: string;
  status: 'published' | 'draft' | string;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string | null;
  views?: number;
  likes?: number;
}

const categoryLabel: Record<string, string> = {
  maternity: 'Maternity',
  palliative: 'Palliative',
  general: 'General Health'
};

const getStatusColor = (status: string) => {
  switch ((status || '').toLowerCase()) {
    case 'published':
      return { fg: 'var(--green-600)', bg: 'var(--green-50)' };
    case 'draft':
    default:
      return { fg: 'var(--yellow-600)', bg: 'var(--yellow-50)' };
  }
};

const getCategoryColor = (category: string) => {
  switch ((category || '').toLowerCase()) {
    case 'maternity':
      return 'var(--pink-600)';
    case 'palliative':
      return 'var(--blue-600)';

    case 'general':
      return 'var(--purple-600)';
    default:
      return 'var(--gray-600)';
  }
};

const HealthBlogsManagement: React.FC = () => {
  const [blogs, setBlogs] = React.useState<BlogItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'published' | 'draft'>('all');
  const [filterCategory, setFilterCategory] = React.useState<'all' | 'maternity' | 'palliative' | 'general'>('all');

  // View modal state
  const [viewingBlog, setViewingBlog] = React.useState<BlogItem | null>(null);
  const [viewLoading, setViewLoading] = React.useState(false);

  const SERVER_BASE = React.useMemo(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api$/, '');
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      // Admin token will allow all statuses by default on backend
      const { blogs } = await healthBlogsAPI.list();
      setBlogs(blogs || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePublish = async (id: string) => {
    try {
      await healthBlogsAPI.update(id, { status: 'published' });
      toast.success('Blog published');
      await loadBlogs();
      // If modal open on same blog, update it too
      if (viewingBlog?.id === id) setViewingBlog({ ...viewingBlog, status: 'published' });
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to publish');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this blog permanently?')) return;
    try {
      await healthBlogsAPI.delete(id);
      toast.success('Blog deleted');
      await loadBlogs();
      if (viewingBlog?.id === id) setViewingBlog(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to delete');
    }
  };

  const openView = async (id: string) => {
    try {
      setViewLoading(true);
      const { blog } = await healthBlogsAPI.get(id);
      setViewingBlog(blog);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to load blog');
    } finally {
      setViewLoading(false);
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      (b.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.authorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.content || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || (b.status || '').toLowerCase() === filterStatus;
    const matchesCategory = filterCategory === 'all' || (b.category || '').toLowerCase() === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <AdminLayout title="Health Blogs Management">
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.05rem' }}>
            Review, read, publish, or delete health blogs created by ASHA workers.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-content" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 300 }}>
                <Search size={20} color="var(--gray-400)" />
                <input
                  type="text"
                  placeholder="Search by title, author, or content..."
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}>
                <Filter size={18} />
                <span style={{ fontSize: '0.9rem' }}>Filters</span>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  minWidth: 140
                }}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  minWidth: 160
                }}
              >
                <option value="all">All Categories</option>
                <option value="maternity">Maternity</option>
                <option value="palliative">Palliative</option>

                <option value="general">General Health</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="card" style={{ marginBottom: '1rem', border: '1px solid var(--red-200)', background: 'var(--red-50)' }}>
            <div className="card-content" style={{ color: 'var(--red-700)' }}>{error}</div>
          </div>
        )}

        {/* Health Blogs List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Health Blogs</h2>
          </div>
          <div className="card-content">
            {loading ? (
              <p style={{ color: 'var(--gray-600)' }}>Loading...</p>
            ) : filteredBlogs.length === 0 ? (
              <p style={{ color: 'var(--gray-600)' }}>No blogs found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredBlogs.map((blog) => {
                  const statusStyle = getStatusColor(blog.status);
                  const catColor = getCategoryColor(blog.category);
                  const catLabel = categoryLabel[(blog.category || '').toLowerCase()] || blog.category;
                  return (
                    <div
                      key={blog.id}
                      className="card"
                      style={{ padding: '1rem', border: '1px solid var(--gray-200)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          {/* Title row with small thumbnail icon */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'nowrap' }}>
                            {blog.imageUrl && (
                              <img
                                src={`${SERVER_BASE}${blog.imageUrl}`}
                                alt=""
                                style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--gray-200)' }}
                              />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>{blog.title}</h3>
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: catColor,
                                    backgroundColor: `${catColor}20`,
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem'
                                  }}
                                >
                                  {catLabel}
                                </span>
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: statusStyle.fg,
                                    backgroundColor: statusStyle.bg,
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem'
                                  }}
                                >
                                  {blog.status === 'published' ? 'Published' : 'Draft'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Excerpt */}
                          <p style={{ margin: '0 0 0.75rem', color: 'var(--gray-600)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {(blog.content || '').slice(0, 240)}{(blog.content || '').length > 240 ? '…' : ''}
                          </p>

                          {/* Meta */}
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'var(--gray-600)', fontSize: '0.85rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <UserIcon size={16} /> {blog.authorName}
                            </span>
                            {blog.createdAt && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <CalendarIcon size={16} /> Created: {blog.createdAt.slice(0, 10)}
                              </span>
                            )}
                            {blog.updatedAt && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <CalendarIcon size={16} /> Updated: {blog.updatedAt.slice(0, 10)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                          <button
                            className="btn"
                            onClick={() => openView(blog.id)}
                            style={{
                              backgroundColor: 'white',
                              color: 'var(--blue-700)',
                              border: '1px solid var(--blue-300)',
                              padding: '0.5rem 0.75rem'
                            }}
                          >
                            <Eye size={18} />
                            <span style={{ marginLeft: 6 }}>View</span>
                          </button>
                          {blog.status !== 'published' && (
                            <button
                              className="btn"
                              onClick={() => handlePublish(blog.id)}
                              style={{
                                backgroundColor: 'var(--green-600)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 0.75rem'
                              }}
                            >
                              <CheckCircle size={18} />
                              <span style={{ marginLeft: 6 }}>Publish</span>
                            </button>
                          )}
                          <button
                            className="btn"
                            onClick={() => handleDelete(blog.id)}
                            style={{
                              backgroundColor: 'white',
                              color: 'var(--red-600)',
                              border: '1px solid var(--red-300)',
                              padding: '0.5rem 0.75rem'
                            }}
                          >
                            <Trash2 size={18} />
                            <span style={{ marginLeft: 6 }}>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* View Modal (text-only, no image for cleaner admin read) */}
        {viewingBlog && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={() => setViewingBlog(null)}
          >
            <div
              className="card"
              style={{ width: 'min(900px, 90vw)', maxHeight: '90vh', overflow: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title" style={{ marginRight: '1rem' }}>{viewingBlog.title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {viewingBlog.status !== 'published' && (
                    <button
                      className="btn"
                      onClick={() => handlePublish(viewingBlog.id)}
                      style={{ backgroundColor: 'var(--green-600)', color: 'white', border: 'none', padding: '0.5rem 0.75rem' }}
                    >
                      <CheckCircle size={18} />
                      <span style={{ marginLeft: 6 }}>Publish</span>
                    </button>
                  )}
                  <button
                    className="btn"
                    onClick={() => handleDelete(viewingBlog.id)}
                    style={{ backgroundColor: 'white', color: 'var(--red-600)', border: '1px solid var(--red-300)', padding: '0.5rem 0.75rem' }}
                  >
                    <Trash2 size={18} />
                    <span style={{ marginLeft: 6 }}>Delete</span>
                  </button>
                  <button className="btn" onClick={() => setViewingBlog(null)} style={{ padding: '0.5rem 0.75rem' }}>
                    Close
                  </button>
                </div>
              </div>
              <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: getCategoryColor(viewingBlog.category),
                      backgroundColor: `${getCategoryColor(viewingBlog.category)}20`,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem'
                    }}
                  >
                    {categoryLabel[(viewingBlog.category || '').toLowerCase()] || viewingBlog.category}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: getStatusColor(viewingBlog.status).fg,
                      backgroundColor: getStatusColor(viewingBlog.status).bg,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem'
                    }}
                  >
                    {viewingBlog.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <UserIcon size={16} /> {viewingBlog.authorName}
                  </span>
                  {viewingBlog.createdAt && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <CalendarIcon size={16} /> Created: {viewingBlog.createdAt.slice(0, 10)}
                    </span>
                  )}
                  {viewingBlog.updatedAt && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <CalendarIcon size={16} /> Updated: {viewingBlog.updatedAt.slice(0, 10)}
                    </span>
                  )}
                </div>
                {viewLoading ? (
                  <p style={{ color: 'var(--gray-600)' }}>Loading content…</p>
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--gray-800)', fontSize: '0.975rem' }}>
                    {viewingBlog.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default HealthBlogsManagement;