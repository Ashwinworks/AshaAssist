import React, { useMemo, useState } from 'react';
import MaternityLayout from './MaternityLayout';
import { ashaFeedbackAPI } from '../../services/api';
import { Star, MessageSquare, Send, Heart, Award, ThumbsUp, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const starStyle: React.CSSProperties = { cursor: 'pointer', transition: 'all 0.2s ease' };

const Feedback: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [timeliness, setTimeliness] = useState<number>(0);
  const [communication, setCommunication] = useState<number>(0);
  const [supportiveness, setSupportiveness] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const canSubmit = useMemo(() => rating > 0 && !submitting, [rating, submitting]);

  const submit = async () => {
    try {
      setSubmitting(true);
      setSuccessMsg('');
      setErrorMsg('');
      await ashaFeedbackAPI.submit({ rating, timeliness, communication, supportiveness, comments });
      toast.success('Feedback submitted successfully');
      setSuccessMsg('Thank you for your valuable feedback! It helps us improve maternal care services.');
      // reset minimal
      setComments('');
      setTimeliness(0); setCommunication(0); setSupportiveness(0); setRating(0); setHover(0);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value: number, onChange: (v: number) => void, size = 24) => (
    <div style={{ display: 'flex', gap: 8 }}>
      {[1,2,3,4,5].map((i) => (
        <Star
          key={i}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          size={size}
          style={starStyle}
          color={i <= (hover || value) ? '#f59e0b' : '#e2e8f0'}
          fill={i <= (hover || value) ? '#f59e0b' : 'none'}
        />
      ))}
    </div>
  );

  // Get feedback message based on rating
  const getFeedbackMessage = () => {
    if (rating >= 4) return "We're thrilled you had a great experience!";
    if (rating >= 3) return "Thanks for your feedback. We'll work to improve!";
    if (rating > 0) return "We're sorry to hear that. How can we do better?";
    return "How was your experience with your ASHA worker?";
  };

  // Get feedback icon based on rating
  const getFeedbackIcon = () => {
    if (rating >= 4) return <Heart size={24} color="#ef4444" fill="#ef4444" />;
    if (rating >= 3) return <ThumbsUp size={24} color="#3b82f6" />;
    if (rating > 0) return <Award size={24} color="#f59e0b" />;
    return <MessageSquare size={24} color="#64748b" />;
  };

  return (
    <MaternityLayout title="Feedback About ASHA">
      <div className="card" style={{ width: '100%' }}>
        {/* Header with gradient */}
        <div className="card-header" style={{ 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderBottom: '1px solid #bae6fd',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <Heart size={24} color="#0ea5e9" />
            </div>
            <div>
              <h2 className="card-title" style={{ margin: 0, color: '#0c4a6e' }}>Rate Your ASHA Worker</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#0369a1', fontSize: '0.9rem' }}>
                Your feedback helps improve maternal care services
              </p>
            </div>
          </div>
        </div>
        
        <div className="card-content" style={{ display: 'grid', gap: '1.5rem', padding: '1.5rem' }}>
          {/* Feedback Message Box */}
          <div style={{ 
            background: rating >= 4 ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : 
                       rating >= 3 ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' : 
                       rating > 0 ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' : 
                       'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: rating >= 4 ? '1px solid #fecaca' : 
                    rating >= 3 ? '1px solid #bae6fd' : 
                    rating > 0 ? '1px solid #fde68a' : 
                    '1px solid #cbd5e1',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            {getFeedbackIcon()}
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                color: rating >= 4 ? '#dc2626' : 
                       rating >= 3 ? '#0369a1' : 
                       rating > 0 ? '#b45309' : 
                       '#475569'
              }}>
                {getFeedbackMessage()}
              </h3>
              <p style={{ 
                margin: '0.25rem 0 0', 
                color: rating >= 4 ? '#991b1b' : 
                       rating >= 3 ? '#0c4a6e' : 
                       rating > 0 ? '#78350f' : 
                       '#64748b',
                fontSize: '0.9rem'
              }}>
                {rating > 0 ? `You selected ${rating} star${rating !== 1 ? 's' : ''}` : 'Please share your experience'}
              </p>
            </div>
          </div>

          {/* Overall rating */}
          <section style={{ 
            border: '1px solid var(--gray-200)', 
            borderRadius: '0.75rem', 
            padding: '1.5rem', 
            background: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--gray-800)', fontSize: '1.1rem' }}>Overall Rating</div>
                <div style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>How satisfied are you overall?</div>
              </div>
              {renderStars(rating, setRating, 32)}
            </div>
          </section>

          {/* Category ratings */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ 
              border: '1px solid var(--gray-200)', 
              borderRadius: '0.75rem', 
              padding: '1.25rem', 
              background: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 15px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }}>
              <div style={{ fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>Timeliness</div>
              <div style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Was the ASHA worker punctual?</div>
              {renderStars(timeliness, setTimeliness)}
            </div>
            <div style={{ 
              border: '1px solid var(--gray-200)', 
              borderRadius: '0.75rem', 
              padding: '1.25rem', 
              background: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 15px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }}>
              <div style={{ fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>Communication</div>
              <div style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Clarity and helpfulness of guidance.</div>
              {renderStars(communication, setCommunication)}
            </div>
            <div style={{ 
              border: '1px solid var(--gray-200)', 
              borderRadius: '0.75rem', 
              padding: '1.25rem', 
              background: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 15px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }}>
              <div style={{ fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>Supportiveness</div>
              <div style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Empathy and assistance provided.</div>
              {renderStars(supportiveness, setSupportiveness)}
            </div>
          </section>

          {/* Comments */}
          <section style={{ 
            border: '1px solid var(--gray-200)', 
            borderRadius: '0.75rem', 
            padding: '1.5rem', 
            background: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageSquare size={18} color={'var(--gray-700)'} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>Comments (optional)</div>
                <div style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Share details that could help improve services</div>
              </div>
            </div>
            <textarea
              placeholder="What did you like or dislike? How can we improve your experience?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={5}
              style={{ 
                width: '100%', 
                resize: 'vertical', 
                borderRadius: '0.5rem', 
                padding: '1rem', 
                border: '1px solid var(--gray-300)', 
                outline: 'none',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-500)';
                e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--gray-300)';
                e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
              }}
            />
          </section>

          {/* Alerts */}
          {successMsg && (
            <div style={{ 
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
              color: 'var(--green-700)', 
              border: '1px solid var(--green-200)', 
              padding: '1rem 1.25rem', 
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <Heart size={20} color="#16a34a" fill="#16a34a" />
              <div>
                <div style={{ fontWeight: 600 }}>Feedback Submitted!</div>
                <div style={{ fontSize: '0.9rem' }}>{successMsg}</div>
              </div>
            </div>
          )}
          {errorMsg && (
            <div style={{ 
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', 
              color: 'var(--red-700)', 
              border: '1px solid var(--red-200)', 
              padding: '1rem 1.25rem', 
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <MessageSquare size={20} color="#dc2626" />
              <div>
                <div style={{ fontWeight: 600 }}>Error</div>
                <div style={{ fontSize: '0.9rem' }}>{errorMsg}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => { 
                setComments(''); 
                setTimeliness(0); 
                setCommunication(0); 
                setSupportiveness(0); 
                setRating(0); 
                setHover(0); 
                setErrorMsg(''); 
                setSuccessMsg(''); 
              }}
              type="button"
              style={{
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'white', 
                color: 'var(--gray-700)',
                border: '1px solid var(--gray-300)', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
              }}
            >
              <X size={18} /> Clear Form
            </button>
            <button
              onClick={submit}
              disabled={!canSubmit || submitting}
              style={{
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: canSubmit ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : '#cbd5e1',
                color: 'white',
                border: 'none', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.5rem',
                cursor: canSubmit ? 'pointer' : 'not-allowed', 
                opacity: canSubmit ? 1 : 0.7,
                fontWeight: 600,
                transition: 'all 0.2s ease',
                boxShadow: canSubmit ? '0 4px 6px rgba(2, 132, 199, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                if (canSubmit) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 8px rgba(2, 132, 199, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (canSubmit) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(2, 132, 199, 0.3)';
                }
              }}
            >
              <Send size={18} /> {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      </div>
    </MaternityLayout>
  );
};

export default Feedback;