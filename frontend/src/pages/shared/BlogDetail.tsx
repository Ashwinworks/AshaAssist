import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import MaternityLayout from '../maternity/MaternityLayout';
import PalliativeLayout from '../palliative/PalliativeLayout';
import AshaLayout from '../asha/AshaLayout';
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
  updatedAt?: string;
}

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const userType = location.pathname.includes('/palliative/') ? 'palliative' : location.pathname.includes('/asha/') ? 'asha' : 'maternity';
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SERVER_BASE = useMemo(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api$/, '');
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const { blog } = await healthBlogsAPI.get(id);
        setBlog(blog);
      } catch (e: any) {
        setError(e?.response?.data?.error || e?.message || 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const content = (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="card-title" style={{ margin: 0 }}>Article</h2>
        <button
          onClick={() => navigate(-1)}
          className="btn"
          style={{ border: '1px solid var(--gray-300)', color: 'var(--gray-700)', background: 'transparent' }}
        >
          Back
        </button>
      </div>
      <div className="card-content">
        {error && (
          <div className="card" style={{ marginBottom: '1rem', border: '1px solid var(--red-200)', background: 'var(--red-50)' }}>
            <div className="card-content" style={{ color: 'var(--red-700)' }}>{error}</div>
          </div>
        )}
        {loading ? (
          <p style={{ color: 'var(--gray-600)' }}>Loading...</p>
        ) : !blog ? (
          <p style={{ color: 'var(--gray-600)' }}>Blog not found</p>
        ) : (
          <article>
            <h1 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{blog.title}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
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

            <div style={{ color: 'var(--gray-800)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {blog.content}
            </div>
          </article>
        )}
      </div>
    </div>
  );

  if (userType === 'palliative') {
    return (
      <PalliativeLayout title="Health Blog">
        {content}
      </PalliativeLayout>
    );
  }
  if (userType === 'asha') {
    return (
      <AshaLayout title="Health Blog">
        {content}
      </AshaLayout>
    );
  }

  return (
    <MaternityLayout title="Health Blog">
      {content}
    </MaternityLayout>
  );
};

export default BlogDetail;