import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MaternityLayout from '../maternity/MaternityLayout';
import PalliativeLayout from '../palliative/PalliativeLayout';
import { healthBlogsAPI } from '../../services/api';

interface BlogItem {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  imageUrl?: string | null;
  status: 'published' | 'draft' | string;
  createdAt?: string;
}

const HealthBlogs: React.FC = () => {
  const location = useLocation();
  const userType = location.pathname.includes('/palliative/') ? 'palliative' : 'maternity';
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SERVER_BASE = useMemo(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api$/, '');
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { blogs } = await healthBlogsAPI.list();
        // Show published blogs where category matches userType OR general
        setBlogs((blogs || [])
          .filter((b: any) => (b.status || 'published') === 'published')
          .filter((b: any) => (b.category || 'general') === userType || (b.category || 'general') === 'general')
        );
      } catch (e: any) {
        setError(e?.response?.data?.error || e?.message || 'Failed to load blogs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userType]);

  const content = (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Health & Wellness Articles</h2>
      </div>
      <div className="card-content">
        {error && (
          <div className="card" style={{ marginBottom: '1rem', border: '1px solid var(--red-200)', background: 'var(--red-50)' }}>
            <div className="card-content" style={{ color: 'var(--red-700)' }}>{error}</div>
          </div>
        )}
        {loading ? (
          <p style={{ color: 'var(--gray-600)' }}>Loading...</p>
        ) : blogs.length === 0 ? (
          <p style={{ color: 'var(--gray-600)' }}>
            No health blogs available yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {blogs.map((blog) => (
              <a
                key={blog.id}
                href={`/${userType}/blogs/${blog.id}`}
                className="card"
                style={{
                  padding: '1rem',
                  border: '1px solid var(--gray-200)',
                  textDecoration: 'none',
                  transition: 'box-shadow 0.15s ease, transform 0.05s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>{blog.title}</h3>
                    <p style={{ margin: '0.5rem 0', color: 'var(--gray-600)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                      {(blog.content || '').slice(0, 220)}{(blog.content || '').length > 220 ? '…' : ''}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                      <span style={{ textTransform: 'capitalize' }}>{blog.category}</span>
                      <span>•</span>
                      <span>By {blog.authorName}</span>
                      {blog.createdAt && (
                        <>
                          <span>•</span>
                          <span>{blog.createdAt.slice(0, 10)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (userType === 'palliative') {
    return (
      <PalliativeLayout title="Health Blogs">
        {content}
      </PalliativeLayout>
    );
  }

  return (
    <MaternityLayout title="Health Blogs">
      {content}
    </MaternityLayout>
  );
};

export default HealthBlogs;