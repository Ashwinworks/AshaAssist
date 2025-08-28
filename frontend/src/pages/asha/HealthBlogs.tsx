import React, { useEffect, useMemo, useState } from 'react';
import AshaLayout from './AshaLayout';
import { Plus, Edit, Eye, Calendar, Image as ImageIcon } from 'lucide-react';
import { healthBlogsAPI } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

interface BlogItem {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  imageUrl?: string | null;
  status: 'published' | 'draft' | string;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  likes?: number;
}

const HealthBlogs: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const SERVER_BASE = useMemo(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api$/, '');
  }, []);

  const resetForm = () => {
    setTitle('');
    setCategory('general');
    setContent('');
    setAuthorName('');
    setStatus('published');
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const loadBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const { blogs } = await healthBlogsAPI.list();
      setBlogs(blogs);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const publishedBlogs = useMemo(() => blogs.filter(b => (b.status || 'published') === 'published'), [blogs]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const startEdit = (blog: BlogItem) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setCategory(blog.category);
    setContent(blog.content);
    setAuthorName(blog.authorName);
    setStatus((blog.status as 'published' | 'draft') || 'published');
    setImageFile(null);
    setImagePreview(blog.imageUrl ? `${SERVER_BASE}${blog.imageUrl}` : null);
    setShowCreateForm(true);
  };

  const deleteBlog = async (id: string) => {
    if (!window.confirm('Delete this blog?')) return;
    try {
      setSubmitting(true);
      await healthBlogsAPI.delete(id);
      await loadBlogs();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Failed to delete blog');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !authorName.trim()) {
      setError('Please fill title, content, and author name');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      if (editingId) {
        await healthBlogsAPI.update(editingId, {
          title: title.trim(),
          content: content.trim(),
          category: category as any,
          authorName: authorName.trim(),
          status,
        });
      } else {
        await healthBlogsAPI.create({
          title: title.trim(),
          content: content.trim(),
          category: category as any,
          authorName: authorName.trim(),
          status,
          imageFile,
        });
      }
      resetForm();
      setShowCreateForm(false);
      await loadBlogs();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || (editingId ? 'Failed to update blog' : 'Failed to create blog'));
    } finally {
      setSubmitting(false);
    }
  };

  const navigate = useNavigate();

  return (
    <AshaLayout title="Health Blogs">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem', margin: 0 }}>
              Create and manage health blogs for your community.
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              backgroundColor: 'var(--green-600, #16a34a)',
              color: '#ffffff',
              border: '1px solid var(--green-600, #16a34a)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <Plus size={16} />
            Create New Blog
          </button>
        </div>

        {error && (
          <div className="card" style={{ marginBottom: '1rem', border: '1px solid var(--red-200)', background: 'var(--red-50)' }}>
            <div className="card-content" style={{ color: 'var(--red-700)' }}>{error}</div>
          </div>
        )}

        {/* Create Blog Form */}
        {showCreateForm && (
          <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--green-200)' }}>
            <div className="card-header">
              <h2 className="card-title" style={{ color: 'var(--green-700)' }}>{editingId ? 'Edit Health Blog' : 'Create New Health Blog'}</h2>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--gray-700)' }}>
                    Blog Title
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter blog title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--gray-700)' }}>
                    Author Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter author name..."
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--gray-700)' }}>
                    Category
                  </label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  >
                    <option value="maternity">Maternity Care</option>
                    <option value="palliative">Palliative Care</option>

                    <option value="general">General Health</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--gray-700)' }}>
                    Content
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={8}
                    placeholder="Write your blog content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '0.5rem',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--gray-700)' }}>
                    Photo (optional)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <label className="btn" style={{ backgroundColor: 'var(--gray-100)', border: '1px dashed var(--gray-400)', color: 'var(--gray-700)', cursor: 'pointer' }}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                      />
                      <ImageIcon size={16} /> Choose Image
                    </label>
                    {imagePreview && (
                      <img src={imagePreview} alt="preview" style={{ height: 64, borderRadius: 8, border: '1px solid var(--gray-200)' }} />
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--gray-700)' }}>
                    Status
                  </label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  >
                    <option value="published">Publish</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      backgroundColor: 'var(--green-600, #16a34a)',
                      color: '#ffffff',
                      border: '1px solid var(--green-600, #16a34a)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.6rem 1rem',
                      borderRadius: '0.5rem',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.8 : 1,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    {submitting ? 'Saving...' : status === 'draft' ? 'Save Draft' : 'Publish Blog'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); resetForm(); }}
                    className="btn"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--gray-600)',
                      border: '1px solid var(--gray-300)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Published Blogs */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Published Blogs</h2>
          </div>
          <div className="card-content">
            {loading ? (
              <p style={{ color: 'var(--gray-600)' }}>Loading...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {publishedBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="card"
                    style={{
                      display: 'block',
                      padding: '1.5rem',
                      border: '1px solid var(--gray-200)',
                      textDecoration: 'none',
                      transition: 'box-shadow 0.15s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {blog.imageUrl && (
                        <img
                          src={`${SERVER_BASE}${blog.imageUrl}`}
                          alt={blog.title}
                          style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--gray-200)' }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                            {blog.title}
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                            <Calendar size={14} style={{ marginRight: 4 }} /> {blog.createdAt?.slice(0, 10)}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.5rem', color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: 1.4 }}>
                          {(blog.content || '').slice(0, 160)}{(blog.content || '').length > 160 ? '…' : ''}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          <span style={{ textTransform: 'capitalize' }}>{blog.category}</span>
                          <span>•</span>
                          <span>By {blog.authorName}</span>
                          {typeof blog.views === 'number' && (
                            <>
                              <span>•</span>
                              <span><Eye size={14} style={{ marginRight: 4 }} /> {blog.views}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                      <Link
                        to={`/asha/health-blogs/${blog.id}`}
                        style={{
                          backgroundColor: 'var(--blue-600, #2563eb)',
                          color: '#ffffff',
                          border: '1px solid var(--blue-600, #2563eb)',
                          fontSize: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          borderRadius: 6,
                          cursor: 'pointer',
                          textDecoration: 'none'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye size={14} />
                        View
                      </Link>
                      <button
                        style={{
                          backgroundColor: 'var(--green-600, #16a34a)',
                          color: '#ffffff',
                          border: '1px solid var(--green-600, #16a34a)',
                          fontSize: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                        onClick={() => startEdit(blog)}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        style={{
                          backgroundColor: 'var(--red-600, #dc2626)',
                          color: '#ffffff',
                          border: '1px solid var(--red-600, #dc2626)',
                          fontSize: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                        onClick={() => deleteBlog(blog.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {!loading && publishedBlogs.length === 0 && (
                  <p style={{ color: 'var(--gray-600)' }}>No blogs yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AshaLayout>
  );
};

export default HealthBlogs;