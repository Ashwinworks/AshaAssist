import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Search, Star, User, TrendingUp, TrendingDown } from 'lucide-react';
import { adminAPI } from '../../services/api';

interface AdminFeedbackItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  beneficiaryCategory: string;
  rating: number;
  timeliness?: number;
  communication?: number;
  supportiveness?: number;
  comments?: string;
  ashaWorkerId?: string;
  createdAt: string;
}

const Feedbacks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbacks, setFeedbacks] = useState<AdminFeedbackItem[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await adminAPI.listAllFeedback();
        if (!mounted) return;
        setFeedbacks(data.feedbacks || []);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load feedback');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((fb) => {
      const matchesSearch = [fb.userName, fb.userEmail, fb.comments || '']
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRating = filterRating === 'all' || String(fb.rating) === filterRating;
      return matchesSearch && matchesRating; // single worker – no worker filter
    });
  }, [feedbacks, searchTerm, filterRating]);

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'var(--green-600)';
    if (rating >= 3) return 'var(--yellow-600)';
    return 'var(--red-600)';
  };

  const renderStars = (rating: number) => (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={16}
          color={index < rating ? 'var(--yellow-500)' : 'var(--gray-300)'}
          fill={index < rating ? 'var(--yellow-500)' : 'none'}
        />
      ))}
    </>
  );

  // Single ASHA worker summary computed from all feedbacks
  const workerSummary = useMemo(() => {
    const total = feedbacks.length;
    const avg = total ? feedbacks.reduce((s, i) => s + (i.rating || 0), 0) / total : 0;
    const positive = feedbacks.filter((i) => i.rating >= 4).length;
    const negative = feedbacks.filter((i) => i.rating <= 2).length;
    return { name: 'ASHA Worker', totalFeedbacks: total, avgRating: avg, positiveCount: positive, negativeCount: negative };
  }, [feedbacks]);

  return (
    <AdminLayout title="Feedbacks & Ratings">
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem' }}>
            Monitor user feedback and ratings to improve service quality.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-content" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '300px' }}>
                <Search size={20} color="var(--gray-400)" />
                <input
                  type="text"
                  placeholder="Search by user name, email, or comment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  minWidth: '120px',
                }}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {feedbacks.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Feedbacks</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {feedbacks.length ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1) : '0.0'}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Average Rating</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {filteredFeedbacks.filter((f) => f.rating >= 3 && f.rating < 4).length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Neutral (3-star)</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--red-600)', marginBottom: '0.5rem' }}>
              {filteredFeedbacks.filter((f) => f.rating <= 2).length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Negative</div>
          </div>
        </div>

        {/* Single ASHA Worker Summary */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">ASHA Worker Summary</h3>
          </div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--gray-25)', border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <User size={18} color="var(--blue-600)" />
                  <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)' }}>{workerSummary.name}</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{renderStars(Math.round(workerSummary.avgRating))}</div>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: getRatingColor(workerSummary.avgRating) }}>{workerSummary.avgRating.toFixed(1)}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>({workerSummary.totalFeedbacks} reviews)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--green-600)' }}>
                    <TrendingUp size={14} />
                    <span>Positive: {workerSummary.positiveCount}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--red-600)' }}>
                    <TrendingDown size={14} />
                    <span>Negative: {workerSummary.negativeCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedbacks List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">User Feedbacks</h2>
          </div>
          <div className="card-content">
            {loading && <div>Loading...</div>}
            {error && !loading && <div style={{ color: 'var(--red-600)' }}>{error}</div>}
            {!loading && !error && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filteredFeedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="card"
                    style={{ padding: '1.5rem', border: '1px solid var(--gray-200)', borderLeft: `4px solid ${getRatingColor(feedback.rating)}` }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <User size={18} color="var(--blue-600)" />
                          <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                            {feedback.userName || 'User'}
                          </h4>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: 'var(--blue-600)',
                              backgroundColor: 'var(--blue-50)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                            }}
                          >
                            {feedback.beneficiaryCategory || 'General'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {renderStars(feedback.rating)}
                          <span style={{ fontWeight: 600, color: getRatingColor(feedback.rating) }}>{feedback.rating}</span>
                          <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>· {new Date(feedback.createdAt).toLocaleString()}</span>
                        </div>
                        {feedback.comments && <p style={{ color: 'var(--gray-700)', marginTop: '0.75rem' }}>{feedback.comments}</p>}
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', color: 'var(--gray-600)' }}>
                          <span>Timeliness: <strong>{feedback.timeliness ?? '-'}</strong></span>
                          <span>Communication: <strong>{feedback.communication ?? '-'}</strong></span>
                          <span>Supportiveness: <strong>{feedback.supportiveness ?? '-'}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Feedbacks;