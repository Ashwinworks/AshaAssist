import React, { useEffect, useState } from 'react';
import MaternityLayout from './MaternityLayout';
import { maternityAPI, locationsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, Activity, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface VisitItem {
  _id: string;
  visitDate: string;
  week?: number | null;
  center?: string;
  notes?: string;
  doctorNotes?: string;
  vitals?: Record<string, any>;
  riskLevel?: string;
  riskConfidence?: number;
  riskFactors?: string[];
  riskRecommendations?: string[];
}

interface RiskResult {
  riskLevel: string;
  riskConfidence: number;
  riskFactors: string[];
  riskRecommendations: string[];
}

const RISK_COLORS: Record<string, { bg: string; border: string; text: string; badge: string; icon: React.ReactNode }> = {
  'low risk':  { bg: '#f0fdf4', border: '#86efac', text: '#15803d', badge: '#22c55e', icon: <CheckCircle size={18} /> },
  'mid risk':  { bg: '#fffbeb', border: '#fcd34d', text: '#b45309', badge: '#f59e0b', icon: <AlertCircle size={18} /> },
  'high risk': { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c', badge: '#ef4444', icon: <AlertTriangle size={18} /> },
};

const RiskBadge: React.FC<{ riskLevel: string; confidence?: number; small?: boolean }> = ({ riskLevel, confidence, small }) => {
  const c = RISK_COLORS[riskLevel] || RISK_COLORS['low risk'];
  const label = riskLevel.replace(' risk', '').toUpperCase();
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      backgroundColor: c.badge, color: 'white',
      padding: small ? '2px 8px' : '4px 12px',
      borderRadius: '20px',
      fontSize: small ? '0.7rem' : '0.8rem',
      fontWeight: 700,
    }}>
      {label}{confidence !== undefined ? ` · ${confidence}%` : ''}
    </span>
  );
};

const AntenatalVisits: React.FC = () => {
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [healthCenters, setHealthCenters] = useState<any[]>([]);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [showVitals, setShowVitals] = useState(false);

  // Form state — basic
  const [visitDate, setVisitDate] = useState('');
  const [center, setCenter] = useState('');
  const [notes, setNotes] = useState('');
  const [week, setWeek] = useState<number | ''>('');
  const [doctorNotes, setDoctorNotes] = useState('');

  // Form state — vitals
  const [systolicBP, setSystolicBP] = useState('');
  const [diastolicBP, setDiastolicBP] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [bodyTemp, setBodyTemp] = useState('');
  const [heartRate, setHeartRate] = useState('');

  const loadVisits = async () => {
    try {
      setLoading(true);
      const data = await maternityAPI.getVisits();
      const list = (data?.visits || []).map((v: any) => ({
        _id: v.id || v._id,
        visitDate: (v.visitDate ? new Date(v.visitDate).toISOString().slice(0, 10) : ''),
        week: v.week ?? null,
        center: v.center || '',
        notes: v.notes || '',
        doctorNotes: v.doctorNotes || '',
        vitals: v.vitals,
        riskLevel: v.riskLevel,
        riskConfidence: v.riskConfidence,
        riskFactors: v.riskFactors || [],
        riskRecommendations: v.riskRecommendations || [],
      }));
      setVisits(list);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to load visits');
    } finally {
      setLoading(false);
    }
  };

  const loadHealthCenters = async () => {
    try {
      const response = await locationsAPI.getLocations();
      const filtered = (response.locations || []).filter((loc: any) =>
        loc.type === 'health_center' || loc.type === 'clinic' ||
        loc.type === 'Health Center' || loc.type === 'Clinic'
      );
      setHealthCenters(filtered);
    } catch (err: any) {
      console.error('Failed to load health centers:', err);
    }
  };

  const addVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate) { toast.error('Please select a visit date'); return; }
    try {
      setLoading(true);
      setRiskResult(null);

      // Get age from localStorage user profile
      let age: number | undefined;
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (u.age) age = Number(u.age);
        else if (u.dateOfBirth) {
          const dob = new Date(u.dateOfBirth);
          age = new Date().getFullYear() - dob.getFullYear();
        }
      } catch (_) {}

      const payload: any = {
        visitDate,
        week: week === '' ? undefined : Number(week),
        center: center.trim() || undefined,
        notes: notes.trim() || undefined,
        doctorNotes: doctorNotes.trim() || undefined,
      };

      // Attach vitals if any filled
      if (systolicBP) payload.systolicBP = Number(systolicBP);
      if (diastolicBP) payload.diastolicBP = Number(diastolicBP);
      if (bloodSugar) payload.bloodSugar = Number(bloodSugar);
      if (bodyTemp) payload.bodyTemp = Number(bodyTemp);
      if (heartRate) payload.heartRate = Number(heartRate);
      if (age) payload.age = age;

      const result = await maternityAPI.addVisit(payload);

      if (result?.riskResult) {
        setRiskResult(result.riskResult);
      }

      toast.success('Visit recorded');
      setVisitDate(''); setCenter(''); setNotes(''); setWeek('');
      setDoctorNotes('');
      setSystolicBP(''); setDiastolicBP(''); setBloodSugar('');
      setBodyTemp(''); setHeartRate('');
      setShowVitals(false);
      await loadVisits();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to add visit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadVisits();
    loadHealthCenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.75rem',
    border: '1.5px solid #d1d5db', borderRadius: '0.5rem',
    fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontWeight: 600, fontSize: '0.85rem',
    color: '#374151', marginBottom: '0.3rem',
  };

  return (
    <MaternityLayout title="Antenatal Visits">
      <div style={{ display: 'grid', gap: '1.5rem' }}>

        {/* ── Add Visit Form ── */}
        <div className="card" style={{
          transform: mounted ? 'translateY(0)' : 'translateY(8px)',
          opacity: mounted ? 1 : 0,
          transition: 'all 300ms ease',
        }}>
          <div className="card-header">
            <h2 className="card-title">Add Antenatal Visit</h2>
            <p className="card-subtitle">Record your checkup at a hospital/clinic</p>
          </div>
          <div className="card-content">
            <form onSubmit={addVisit} style={{ display: 'grid', gap: '1.25rem' }}>

              {/* Basic fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Visit Date *</label>
                  <input type="date" className="input" value={visitDate}
                    onChange={e => setVisitDate(e.target.value)} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Gestational Week</label>
                  <select className="input" value={week}
                    onChange={e => setWeek(e.target.value ? Number(e.target.value) : '')} style={inputStyle}>
                    <option value="">Auto-compute</option>
                    {[4,8,12,16,20,24,28,30,32,34,36,37,38,39,40,41,42].map(w => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Health Center</label>
                  <select className="input" value={center}
                    onChange={e => setCenter(e.target.value)} style={inputStyle}>
                    <option value="">-- Select Health Center --</option>
                    {healthCenters.map(loc => (
                      <option key={loc._id} value={loc.name}>
                        {loc.name}{loc.ward ? ` - ${loc.ward}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Notes</label>
                  <textarea className="input" placeholder="Observations, instructions…"
                    value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Doctor's Report / Advice</label>
                <textarea className="input" placeholder="Paste or type the doctor's report or advice here…"
                  value={doctorNotes} onChange={e => setDoctorNotes(e.target.value)} rows={2} style={inputStyle} />
              </div>

              {/* ── Health Vitals (collapsible) ── */}
              <div style={{ border: '1.5px solid #e5e7eb', borderRadius: '0.75rem', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setShowVitals(v => !v)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.875rem 1rem', background: showVitals ? '#f0fdf4' : '#f8fafc',
                    border: 'none', cursor: 'pointer', transition: 'background 0.2s',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: '#1a6b4a' }}>
                    <Activity size={18} />
                    Health Vitals (optional) — used to calculate your risk level
                  </span>
                  {showVitals ? <ChevronUp size={18} color="#1a6b4a" /> : <ChevronDown size={18} color="#1a6b4a" />}
                </button>

                {showVitals && (
                  <div style={{ padding: '1rem', background: '#fafafa', display: 'grid', gap: '0.875rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={labelStyle}>Systolic BP (mmHg)</label>
                        <input type="number" placeholder="e.g. 120" min={60} max={220}
                          value={systolicBP} onChange={e => setSystolicBP(e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Diastolic BP (mmHg)</label>
                        <input type="number" placeholder="e.g. 80" min={40} max={150}
                          value={diastolicBP} onChange={e => setDiastolicBP(e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Blood Sugar (mg/dL)</label>
                        <input type="number" placeholder="e.g. 95" step="1" min={50} max={600}
                          value={bloodSugar} onChange={e => setBloodSugar(e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={labelStyle}>Body Temperature (°C)</label>
                        <input type="number" placeholder="e.g. 37.0" step="0.1" min={35} max={42}
                          value={bodyTemp} onChange={e => setBodyTemp(e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Heart Rate (bpm)</label>
                        <input type="number" placeholder="e.g. 75" min={40} max={200}
                          value={heartRate} onChange={e => setHeartRate(e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>
                      These values are optional. When provided, a risk assessment will be shown right after you save.
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? 'Saving…' : 'Add Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Risk Result Card ── */}
        {riskResult && (() => {
          const c = RISK_COLORS[riskResult.riskLevel] || RISK_COLORS['low risk'];
          return (
            <div style={{
              background: c.bg, border: `2px solid ${c.border}`,
              borderRadius: '1rem', padding: '1.5rem',
              animation: 'fadeIn 0.4s ease',
              transition: 'all 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ color: c.text }}>{c.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: c.text }}>
                    Risk Assessment Result
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Based on the vitals you entered</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <RiskBadge riskLevel={riskResult.riskLevel} confidence={riskResult.riskConfidence} />
                </div>
              </div>

              {riskResult.riskFactors.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '0.85rem', color: c.text }}>
                    Detected Risk Factors:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                    {riskResult.riskFactors.map((f, i) => (
                      <li key={i} style={{ fontSize: '0.85rem', color: '#374151', marginBottom: '0.25rem' }}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '0.85rem', color: c.text }}>
                  Recommendations:
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {riskResult.riskRecommendations.map((r, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: '#374151', marginBottom: '0.35rem', lineHeight: 1.5 }}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })()}

        {/* ── Recorded Visits ── */}
        <div className="card" style={{
          transform: mounted ? 'translateY(0)' : 'translateY(8px)',
          opacity: mounted ? 1 : 0,
          transition: 'all 350ms ease 80ms',
        }}>
          <div className="card-header">
            <h2 className="card-title">Recorded Visits</h2>
          </div>
          <div className="card-content">
            {loading && visits.length === 0 ? (
              <p>Loading…</p>
            ) : visits.length === 0 ? (
              <p style={{ color: 'var(--gray-600)' }}>No visits recorded yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Date</th>
                      <th style={{ textAlign: 'left' }}>Week</th>
                      <th style={{ textAlign: 'left' }}>Center</th>
                      <th style={{ textAlign: 'left' }}>Risk Level</th>
                      <th style={{ textAlign: 'left' }}>Notes</th>
                      <th style={{ textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.slice().sort((a, b) => a.visitDate.localeCompare(b.visitDate)).map(v => (
                      <tr key={v._id}>
                        <td>{v.visitDate}</td>
                        <td>{v.week ?? '-'}</td>
                        <td>{v.center || '-'}</td>
                        <td>
                          {v.riskLevel
                            ? <RiskBadge riskLevel={v.riskLevel} confidence={v.riskConfidence} small />
                            : <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>No vitals</span>}
                        </td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {v.notes || '-'}
                        </td>
                        <td>
                          <button
                            className="btn btn-outline"
                            onClick={async () => {
                              try {
                                setLoading(true);
                                await maternityAPI.deleteVisit(v._id);
                                toast.success('Visit deleted');
                                await loadVisits();
                              } catch (err: any) {
                                toast.error(err?.response?.data?.error || 'Failed to delete visit');
                              } finally { setLoading(false); }
                            }}
                          >Clear</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </MaternityLayout>
  );
};

export default AntenatalVisits;