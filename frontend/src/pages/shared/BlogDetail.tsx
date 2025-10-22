import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import MaternityLayout from '../maternity/MaternityLayout';
import PalliativeLayout from '../palliative/PalliativeLayout';
import AshaLayout from '../asha/AshaLayout';
import { healthBlogsAPI } from '../../services/api';
import { BookOpen, User, Calendar, Tag, ArrowLeft, Clock, Eye } from 'lucide-react';

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

  // Function to get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'maternity':
        return { 
          bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', 
          border: '#ec4899', 
          text: '#be185d',
          icon: '#ec4899'
        };
      case 'palliative':
        return { 
          bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', 
          border: '#8b5cf6', 
          text: '#6d28d9',
          icon: '#8b5cf6'
        };
      case 'general':
      default:
        return { 
          bg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
          border: '#0ea5e9', 
          text: '#0369a1',
          icon: '#0ea5e9'
        };
    }
  };

  // Function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString.slice(0, 10);
    }
  };

  // Function to get reading time
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const content = (
    <div className="card">
      <div className="card-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1.5rem'
      }}>
        <h2 className="card-title" style={{ 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#0f172a'
        }}>
          <BookOpen size={24} color="#3b82f6" />
          Health Article
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="btn"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            border: '1px solid #cbd5e1',
            color: '#334155',
            background: 'white',
            borderRadius: '0.375rem',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          }}
        >
          <ArrowLeft size={16} />
          Back to Articles
        </button>
      </div>
      <div className="card-content">
        {error && (
          <div className="card" style={{ 
            marginBottom: '1rem', 
            border: '1px solid #fecaca', 
            background: '#fffbeb',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <div className="card-content" style={{ 
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontWeight: 500 }}>{error}</span>
            </div>
          </div>
        )}
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#64748b' 
          }}>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              border: '4px solid #e2e8f0', 
              borderTop: '4px solid #3b82f6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            Loading article...
          </div>
        ) : !blog ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#64748b',
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            border: '1px dashed #cbd5e1'
          }}>
            <BookOpen size={48} style={{ 
              margin: '0 auto 1rem', 
              color: '#94a3b8' 
            }} />
            <h3 style={{ 
              margin: '0 0 0.5rem', 
              color: '#475569', 
              fontWeight: 600 
            }}>
              Article Not Found
            </h3>
            <p style={{ margin: 0 }}>
              The article you're looking for doesn't exist or has been removed.
            </p>
          </div>
        ) : (
          <article style={{ 
            maxWidth: '800px', 
            margin: '0 auto',
            padding: '2rem 0'
          }}>
            {/* Category Badge with Gradient */}
            <div style={{ 
              display: 'inline-block',
              padding: '0.5rem 1.25rem',
              background: getCategoryColor(blog.category).bg,
              border: `2px solid ${getCategoryColor(blog.category).border}`,
              borderRadius: '9999px',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={16} color={getCategoryColor(blog.category).icon} />
                <span style={{ 
                  textTransform: 'uppercase', 
                  fontWeight: 700, 
                  color: getCategoryColor(blog.category).text,
                  fontSize: '0.875rem',
                  letterSpacing: '0.5px'
                }}>
                  {blog.category}
                </span>
              </div>
            </div>
            
            <h1 style={{ 
              marginTop: 0, 
              marginBottom: '1.5rem', 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              color: '#0f172a',
              lineHeight: 1.3
            }}>
              {blog.title}
            </h1>
            
            {/* Author and Date Info */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              alignItems: 'center', 
              gap: '1.5rem',
              padding: '1.25rem',
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem'
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <User size={22} color="#0369a1" />
                </div>
                <div>
                  <div style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 700, 
                    color: '#334155' 
                  }}>
                    {blog.authorName}
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#94a3b8' 
                  }}>
                    Health Expert
                  </div>
                </div>
              </div>
              
              {blog.createdAt && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  color: '#64748b',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'white',
                  borderRadius: '9999px',
                  border: '1px solid #e2e8f0'
                }}>
                  <Calendar size={18} />
                  <span style={{ fontWeight: 500 }}>{formatDate(blog.createdAt)}</span>
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                color: '#64748b',
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0'
              }}>
                <Clock size={18} />
                <span style={{ fontWeight: 500 }}>{getReadingTime(blog.content)}</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                color: '#64748b',
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0'
              }}>
                <Eye size={18} />
                <span style={{ fontWeight: 500 }}>Popular</span>
              </div>
            </div>
            
            {/* Article Content */}
            <div style={{ 
              color: '#334155', 
              lineHeight: 1.8, 
              fontSize: '1.125rem',
              whiteSpace: 'pre-wrap'
            }}>
              {blog.content.split('\n').map((paragraph, index) => (
                <p key={index} style={{ 
                  marginBottom: '1.75rem',
                  fontSize: '1.1rem',
                  lineHeight: 1.8
                }}>
                  {paragraph}
                </p>
              ))}
            </div>
            
            {/* Article Footer */}
            <div style={{ 
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '2px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ 
                  margin: '0 0 0.5rem', 
                  color: '#475569', 
                  fontWeight: 600 
                }}>
                  Share this article
                </h4>
                <p style={{ 
                  margin: 0, 
                  color: '#94a3b8', 
                  fontSize: '0.9rem' 
                }}>
                  Help others by sharing this valuable information
                </p>
              </div>
              <button
                className="btn"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  background: 'white',
                  borderRadius: '0.375rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                }}
              >
                <BookOpen size={18} />
                Read More Articles
              </button>
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