import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { 
  Search, 
  Star, 
  User, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Filter,
  Eye,
  Flag,
  CheckCircle
} from 'lucide-react';

const Feedbacks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterWorker, setFilterWorker] = useState('all');

  // Mock data for demonstration
  const feedbacks = [
    {
      id: 1,
      userName: 'Priya Sharma',
      userType: 'Maternal',
      ashaWorker: 'Dr. Priya Sharma',
      ashaWorkerId: 1,
      rating: 5,
      comment: 'Excellent service! Dr. Priya was very caring and provided great support during my pregnancy. She visited regularly and answered all my questions patiently.',
      serviceType: 'Home Visit',
      date: '2024-01-15',
      status: 'Published',
      helpful: 12,
      reported: 0,
      response: null
    },
    {
      id: 2,
      userName: 'Ramesh Singh',
      userType: 'Palliative',
      ashaWorker: 'Sister Meera Devi',
      ashaWorkerId: 2,
      rating: 4,
      comment: 'Sister Meera has been very helpful in managing my father\'s pain medication. She is knowledgeable and compassionate. Only issue was sometimes she was late for appointments.',
      serviceType: 'Medication Management',
      date: '2024-01-14',
      status: 'Published',
      helpful: 8,
      reported: 0,
      response: 'Thank you for your feedback. I will ensure to be more punctual with appointments. - Sister Meera'
    },
    {
      id: 3,
      userName: 'Kavita Devi',
      userType: 'Maternal',
      ashaWorker: 'Sunita Kumari',
      ashaWorkerId: 3,
      rating: 2,
      comment: 'Not satisfied with the service. Sunita didn\'t visit as scheduled and when she did come, she seemed rushed. Need better communication.',
      serviceType: 'Antenatal Care',
      date: '2024-01-13',
      status: 'Under Review',
      helpful: 3,
      reported: 1,
      response: null
    },
    {
      id: 4,
      userName: 'Suresh Kumar',
      userType: 'General',
      ashaWorker: 'Dr. Priya Sharma',
      ashaWorkerId: 1,
      rating: 5,
      comment: 'Dr. Priya organized a wonderful health camp in our area. Very well organized and informative. The whole family benefited from the free health checkup.',
      serviceType: 'Health Camp',
      date: '2024-01-12',
      status: 'Published',
      helpful: 15,
      reported: 0,
      response: null
    },
    {
      id: 5,
      userName: 'Meera Patel',
      userType: 'Child Health',
      ashaWorker: 'Sister Meera Devi',
      ashaWorkerId: 2,
      rating: 4,
      comment: 'Good service for my child\'s vaccination. Sister Meera explained everything clearly and my child was comfortable. Clinic was clean and well-maintained.',
      serviceType: 'Vaccination',
      date: '2024-01-11',
      status: 'Published',
      helpful: 6,
      reported: 0,
      response: null
    },
    {
      id: 6,
      userName: 'Anonymous User',
      userType: 'General',
      ashaWorker: 'Sunita Kumari',
      ashaWorkerId: 3,
      rating: 1,
      comment: 'Very poor service. Unprofessional behavior and lack of knowledge. Would not recommend.',
      serviceType: 'General Consultation',
      date: '2024-01-10',
      status: 'Flagged',
      helpful: 1,
      reported: 3,
      response: null
    }
  ];

  const ashaWorkers = [
    { id: 1, name: 'Dr. Priya Sharma' },
    { id: 2, name: 'Sister Meera Devi' },
    { id: 3, name: 'Sunita Kumari' }
  ];

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.ashaWorker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === 'all' || feedback.rating.toString() === filterRating;
    const matchesWorker = filterWorker === 'all' || feedback.ashaWorkerId.toString() === filterWorker;
    
    return matchesSearch && matchesRating && matchesWorker;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'var(--green-600)';
      case 'Under Review': return 'var(--yellow-600)';
      case 'Flagged': return 'var(--red-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Published': return 'var(--green-50)';
      case 'Under Review': return 'var(--yellow-50)';
      case 'Flagged': return 'var(--red-50)';
      default: return 'var(--gray-50)';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'var(--green-600)';
    if (rating >= 3) return 'var(--yellow-600)';
    return 'var(--red-600)';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        color={index < rating ? 'var(--yellow-500)' : 'var(--gray-300)'}
        fill={index < rating ? 'var(--yellow-500)' : 'none'}
      />
    ));
  };

  const getWorkerStats = () => {
    const stats = ashaWorkers.map(worker => {
      const workerFeedbacks = feedbacks.filter(f => f.ashaWorkerId === worker.id);
      const avgRating = workerFeedbacks.length > 0 
        ? workerFeedbacks.reduce((sum, f) => sum + f.rating, 0) / workerFeedbacks.length 
        : 0;
      
      return {
        ...worker,
        totalFeedbacks: workerFeedbacks.length,
        avgRating: avgRating,
        positiveCount: workerFeedbacks.filter(f => f.rating >= 4).length,
        negativeCount: workerFeedbacks.filter(f => f.rating <= 2).length
      };
    });
    
    return stats;
  };

  const handleApproveFeedback = (feedbackId: number) => {
    console.log(`Approving feedback ${feedbackId}`);
  };

  const handleFlagFeedback = (feedbackId: number) => {
    console.log(`Flagging feedback ${feedbackId}`);
  };

  return (
    <AdminLayout title="Feedbacks & Ratings">
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.125rem' }}>
            Monitor user feedback and ratings for ASHA workers to improve service quality.
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
                  placeholder="Search by user name, ASHA worker, or comment..."
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
              <select 
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                style={{ 
                  padding: '0.75rem', 
                  border: '1px solid var(--gray-300)', 
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  minWidth: '120px'
                }}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              <select 
                value={filterWorker}
                onChange={(e) => setFilterWorker(e.target.value)}
                style={{ 
                  padding: '0.75rem', 
                  border: '1px solid var(--gray-300)', 
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  minWidth: '180px'
                }}
              >
                <option value="all">All ASHA Workers</option>
                {ashaWorkers.map(worker => (
                  <option key={worker.id} value={worker.id.toString()}>{worker.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--blue-600)', marginBottom: '0.5rem' }}>
              {feedbacks.length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Total Feedbacks</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--green-600)', marginBottom: '0.5rem' }}>
              {(feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Average Rating</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--yellow-600)', marginBottom: '0.5rem' }}>
              {feedbacks.filter(f => f.status === 'Under Review').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Under Review</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--red-600)', marginBottom: '0.5rem' }}>
              {feedbacks.filter(f => f.status === 'Flagged').length}
            </div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Flagged</div>
          </div>
        </div>

        {/* ASHA Worker Performance Summary */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">ASHA Worker Performance Summary</h3>
          </div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {getWorkerStats().map((worker) => (
                <div 
                  key={worker.id}
                  className="card" 
                  style={{ 
                    padding: '1.5rem', 
                    backgroundColor: 'var(--gray-25)',
                    border: '1px solid var(--gray-200)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <User size={18} color="var(--blue-600)" />
                    <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                      {worker.name}
                    </h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {renderStars(Math.round(worker.avgRating))}
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: '600', color: getRatingColor(worker.avgRating) }}>
                      {worker.avgRating.toFixed(1)}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                      ({worker.totalFeedbacks} reviews)
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--green-600)' }}>
                      <TrendingUp size={14} />
                      <span>Positive: {worker.positiveCount}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--red-600)' }}>
                      <TrendingDown size={14} />
                      <span>Negative: {worker.negativeCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feedbacks List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">User Feedbacks</h2>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredFeedbacks.map((feedback) => (
                <div 
                  key={feedback.id} 
                  className="card" 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid var(--gray-200)',
                    borderLeft: `4px solid ${getStatusColor(feedback.status)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <User size={18} color="var(--blue-600)" />
                        <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                          {feedback.userName}
                        </h4>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--blue-600)',
                          backgroundColor: 'var(--blue-50)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {feedback.userType}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: getStatusColor(feedback.status),
                          backgroundColor: getStatusBg(feedback.status),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {feedback.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                        <div><strong>ASHA Worker:</strong> {feedback.ashaWorker}</div>
                        <div><strong>Service:</strong> {feedback.serviceType}</div>
                        <div><strong>Date:</strong> {feedback.date}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {renderStars(feedback.rating)}
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: '600', color: getRatingColor(feedback.rating) }}>
                        {feedback.rating}
                      </span>
                    </div>
                  </div>

                  {/* Feedback Comment */}
                  <div style={{ 
                    padding: '1rem', 
                    backgroundColor: 'var(--gray-50)', 
                    borderRadius: '0.5rem', 
                    marginBottom: '1rem',
                    border: '1px solid var(--gray-200)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <MessageSquare size={16} color="var(--gray-600)" />
                      <strong style={{ color: 'var(--gray-700)', fontSize: '0.875rem' }}>Feedback:</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: '1.5' }}>
                      {feedback.comment}
                    </p>
                  </div>

                  {/* ASHA Response */}
                  {feedback.response && (
                    <div style={{ 
                      padding: '1rem', 
                      backgroundColor: 'var(--blue-50)', 
                      borderRadius: '0.5rem', 
                      marginBottom: '1rem',
                      border: '1px solid var(--blue-200)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <User size={16} color="var(--blue-600)" />
                        <strong style={{ color: 'var(--blue-700)', fontSize: '0.875rem' }}>ASHA Response:</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--blue-700)', lineHeight: '1.5' }}>
                        {feedback.response}
                      </p>
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    <div>👍 {feedback.helpful} found helpful</div>
                    {feedback.reported > 0 && (
                      <div style={{ color: 'var(--red-600)' }}>🚩 {feedback.reported} reports</div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                    <button 
                      className="btn"
                      style={{ 
                        backgroundColor: 'var(--blue-600)', 
                        color: 'white', 
                        border: 'none',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                    {feedback.status === 'Under Review' && (
                      <button 
                        onClick={() => handleApproveFeedback(feedback.id)}
                        className="btn"
                        style={{ 
                          backgroundColor: 'var(--green-600)', 
                          color: 'white', 
                          border: 'none',
                          fontSize: '0.875rem',
                          padding: '0.5rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                    )}
                    {feedback.status !== 'Flagged' && (
                      <button 
                        onClick={() => handleFlagFeedback(feedback.id)}
                        className="btn"
                        style={{ 
                          backgroundColor: 'var(--red-600)', 
                          color: 'white', 
                          border: 'none',
                          fontSize: '0.875rem',
                          padding: '0.5rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Flag size={14} />
                        Flag
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Feedbacks;