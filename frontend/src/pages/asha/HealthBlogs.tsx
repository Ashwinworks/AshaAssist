import React, { useState } from 'react';
import AshaLayout from './AshaLayout';
import { Plus, Edit, Eye, Calendar, User, Tag } from 'lucide-react';

const HealthBlogs: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock data for demonstration
  const publishedBlogs = [
    {
      id: 1,
      title: 'Importance of Prenatal Care During Pregnancy',
      category: 'Maternity',
      excerpt: 'Regular prenatal checkups are crucial for monitoring the health of both mother and baby...',
      publishedDate: '2024-01-10',
      views: 245,
      status: 'Published'
    },
    {
      id: 2,
      title: 'Managing Pain in Palliative Care Patients',
      category: 'Palliative',
      excerpt: 'Effective pain management is essential for improving quality of life in palliative care...',
      publishedDate: '2024-01-08',
      views: 189,
      status: 'Published'
    },
    {
      id: 3,
      title: 'Vaccination Schedule for Children Under 5',
      category: 'Child Health',
      excerpt: 'Complete vaccination schedule and importance of timely immunization for children...',
      publishedDate: '2024-01-05',
      views: 312,
      status: 'Published'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Maternity': return 'var(--pink-600)';
      case 'Palliative': return 'var(--blue-600)';
      case 'Child Health': return 'var(--green-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'Maternity': return 'var(--pink-50)';
      case 'Palliative': return 'var(--blue-50)';
      case 'Child Health': return 'var(--green-50)';
      default: return 'var(--gray-50)';
    }
  };

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
            className="btn"
            onClick={() => setShowCreateForm(true)}
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
            Create New Blog
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {publishedBlogs.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Published Blogs</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {publishedBlogs.reduce((sum, blog) => sum + blog.views, 0)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Views</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--purple-600)', marginBottom: '0.5rem' }}>
              3
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Categories</div>
          </div>
        </div>

        {/* Create Blog Form */}
        {showCreateForm && (
          <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--green-200)' }}>
            <div className="card-header">
              <h2 className="card-title" style={{ color: 'var(--green-700)' }}>Create New Health Blog</h2>
            </div>
            <div className="card-content">
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Blog Title
                  </label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Enter blog title..."
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Category
                  </label>
                  <select 
                    className="form-select"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '0.5rem' }}
                  >
                    <option value="">Select category...</option>
                    <option value="maternity">Maternity Care</option>
                    <option value="palliative">Palliative Care</option>
                    <option value="child">Child Health</option>
                    <option value="general">General Health</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-700)' }}>
                    Content
                  </label>
                  <textarea 
                    className="form-textarea"
                    rows={8}
                    placeholder="Write your blog content here..."
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid var(--gray-300)', 
                      borderRadius: '0.5rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
                  <button 
                    type="submit"
                    className="btn"
                    style={{ 
                      backgroundColor: 'var(--green-600)', 
                      color: 'white', 
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    Publish Blog
                  </button>
                  <button 
                    type="button"
                    className="btn"
                    style={{ 
                      backgroundColor: 'var(--gray-600)', 
                      color: 'white', 
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    Save as Draft
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn"
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: 'var(--gray-600)', 
                      border: '1px solid var(--gray-300)',
                      fontSize: '0.875rem',
                      fontWeight: '600'
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {publishedBlogs.map((blog) => (
                <div 
                  key={blog.id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid var(--gray-200)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                          {blog.title}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getCategoryColor(blog.category),
                          backgroundColor: getCategoryBg(blog.category),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {blog.category}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 1rem', color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: '1.4' }}>
                        {blog.excerpt}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={14} />
                          <span>Published: {blog.publishedDate}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Eye size={14} />
                          <span>{blog.views} views</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                    <button 
                      className="btn"
                      style={{ 
                        backgroundColor: 'var(--blue-600)', 
                        color: 'white', 
                        border: 'none',
                        fontSize: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button 
                      className="btn"
                      style={{ 
                        backgroundColor: 'var(--green-600)', 
                        color: 'white', 
                        border: 'none',
                        fontSize: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AshaLayout>
  );
};

export default HealthBlogs;