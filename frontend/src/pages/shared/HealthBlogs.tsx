import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MaternityLayout from '../maternity/MaternityLayout';
import PalliativeLayout from '../palliative/PalliativeLayout';
import { healthBlogsAPI } from '../../services/api';
import { BookOpen, User, Calendar, Tag, Eye, Clock } from 'lucide-react';

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
        month: 'short', 
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
      <div className="card-header">
        <h2 className="card-title" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          color: '#0f172a'
        }}>
          <BookOpen size={24} color="#3b82f6" />
          Health & Wellness Articles
        </h2>
        <p style={{ 
          color: '#64748b', 
          fontSize: '0.95rem', 
          marginTop: '0.5rem',
          marginBottom: '0'
        }}>
          Discover helpful articles and tips for your health and wellbeing
        </p>
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
            Loading health articles...
          </div>
        ) : blogs.length === 0 ? (
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
              No Health Articles Available
            </h3>
            <p style={{ margin: 0 }}>
              Check back later for new health and wellness content.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '1.75rem',
            marginTop: '1rem'
          }}>
            {blogs.map((blog) => {
              const categoryColors = getCategoryColor(blog.category);
              const readingTime = getReadingTime(blog.content);
              return (
                <div
                  key={blog.id}
                  className="card"
                  style={{
                    padding: '0',
                    border: '1px solid #e2e8f0',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-8px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 15px 30px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                  }}
                  onClick={() => window.location.href = `/${userType}/blogs/${blog.id}`}
                >
                  {/* Category Header with Gradient */}
                  <div style={{ 
                    padding: '1rem 1.25rem', 
                    background: categoryColors.bg,
                    borderBottom: `2px solid ${categoryColors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Tag size={16} color={categoryColors.icon} />
                      <span style={{ 
                        textTransform: 'uppercase', 
                        fontWeight: 700, 
                        color: categoryColors.text,
                        fontSize: '0.75rem',
                        letterSpacing: '0.5px'
                      }}>
                        {blog.category}
                      </span>
                    </div>
                    {blog.createdAt && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        color: categoryColors.text,
                        fontSize: '0.75rem'
                      }}>
                        <Calendar size={14} />
                        <span>{formatDate(blog.createdAt)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div style={{ 
                    padding: '1.5rem', 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <h3 style={{ 
                      margin: '0 0 1rem', 
                      fontSize: '1.35rem', 
                      fontWeight: 700, 
                      color: '#0f172a',
                      lineHeight: 1.4,
                      flex: 1
                    }}>
                      {blog.title}
                    </h3>
                    <p style={{ 
                      margin: '0 0 1.5rem', 
                      color: '#64748b', 
                      fontSize: '0.95rem', 
                      lineHeight: 1.6,
                      flex: 1
                    }}>
                      {(blog.content || '').slice(0, 180)}{(blog.content || '').length > 180 ? '…' : ''}
                    </p>
                    
                    {/* Meta Info */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: '1px solid #f1f5f9',
                      marginTop: 'auto'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        color: '#94a3b8',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={14} />
                          <span>{readingTime}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Eye size={14} />
                          <span>Read</span>
                        </div>
                      </div>
                      
                      {/* Author Info */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem'
                      }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          backgroundColor: '#e0f2fe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <User size={16} color="#0369a1" />
                        </div>
                        <div>
                          <div style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: 600, 
                            color: '#334155' 
                          }}>
                            {blog.authorName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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