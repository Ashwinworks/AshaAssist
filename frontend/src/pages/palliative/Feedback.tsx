import React, { useMemo, useState } from 'react';
import PalliativeLayout from './PalliativeLayout';
import { ashaFeedbackAPI } from '../../services/api';
import { Star, MessageSquare, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

const starStyle: React.CSSProperties = { cursor: 'pointer', transition: 'transform 0.1s' };

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
      setSuccessMsg('');
      setComments('');
      setTimeliness(0); setCommunication(0); setSupportiveness(0); setRating(0); setHover(0);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || 'Failed to submit feedback');
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
          color={i <= (hover || value) ? 'var(--primary-600)' : 'var(--gray-300)'}
          fill={i <= (hover || value) ? 'var(--primary-600)' : 'none'}
        />
      ))}
    </div>
  );

  return (
    <PalliativeLayout title="Feedback">
      <div className="card" style={{ width: '100%' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="card-title" style={{ margin: 0 }}>Rate Your Care Services</h2>
        </div>
        <div className="card-content" style={{ display: 'grid', gap: '1.25rem' }}>
          <p style={{ color: 'var(--gray-600)', margin: 0 }}>
            Share your experience with ASHA and palliative services. Colors use the app theme (no pink here).
          </p>

          {/* Overall rating */}
          <section style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: '1rem', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>Overall Rating</div>
                <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>How satisfied are you overall?</div>
              </div>
              {renderStars(rating, setRating, 28)}
            </div>
          </section>

          {/* Category ratings */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: '1rem', background: 'white' }}>
              <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>Timeliness</div>
              <div style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 6 }}>Was the ASHA worker punctual?</div>
              {renderStars(timeliness, setTimeliness)}
            </div>
            <div style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: '1rem', background: 'white' }}>
              <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>Communication</div>
              <div style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 6 }}>Clarity and helpfulness of guidance.</div>
              {renderStars(communication, setCommunication)}
            </div>
            <div style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: '1rem', background: 'white' }}>
              <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>Supportiveness</div>
              <div style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 6 }}>Empathy and assistance provided.</div>
              {renderStars(supportiveness, setSupportiveness)}
            </div>
          </section>

          {/* Comments */}
          <section style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: '1rem', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <MessageSquare size={18} color={'var(--gray-700)'} />
              <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>Comments (optional)</div>
            </div>
            <textarea
              placeholder="Share details that could help improve services..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              style={{ width: '100%', resize: 'vertical', borderRadius: 8, padding: '0.75rem', border: '1px solid var(--gray-300)', outline: 'none' }}
            />
          </section>

          {/* Alerts */}
          {successMsg && (
            <div style={{ background: 'var(--green-50)', color: 'var(--green-700)', border: '1px solid var(--green-200)', padding: '0.75rem 1rem', borderRadius: 10 }}>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div style={{ background: 'var(--red-50)', color: 'var(--red-700)', border: '1px solid var(--red-200)', padding: '0.75rem 1rem', borderRadius: 10 }}>
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => { setComments(''); setTimeliness(0); setCommunication(0); setSupportiveness(0); setRating(0); setHover(0); setErrorMsg(''); setSuccessMsg(''); }}
              type="button"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'white', color: 'var(--gray-700)',
                border: '1px solid var(--gray-300)', padding: '0.75rem 1.25rem', borderRadius: 10,
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
            <button
              onClick={submit}
              disabled={!canSubmit}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--primary-600)', color: 'white',
                border: 'none', padding: '0.75rem 1.25rem', borderRadius: 10,
                cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.7,
              }}
            >
              <Send size={18} /> Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </PalliativeLayout>
  );
};

export default Feedback;