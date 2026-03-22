import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AshaLayout from './AshaLayout';
import {
  Search, Calendar, Baby, FileText, User, Phone, Mail,
  Clock, Activity, ChevronDown, ChevronUp, AlertTriangle,
  AlertCircle, CheckCircle, Printer, ArrowLeft, Heart
} from 'lucide-react';
import { maternityAPI } from '../../services/api';

interface Visit {
  id: string;
  visitDate: string;
  week?: number;
  center?: string;
  notes?: string;
  doctorNotes?: string;
  vitals?: Record<string, any>;
  riskLevel?: string;
  riskConfidence?: number;
  riskFactors?: string[];
  riskRecommendations?: string[];
  createdAt: string;
}

interface Mother {
  id: string;
  name: string;
  email: string;
  phone?: string;
  visits: Visit[];
  latestRisk?: string;
  latestRiskConfidence?: number;
}

/* ── Helpers ── */
const RISK_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  'low risk':  { bg: '#f0fdf4', border: '#86efac', text: '#15803d', badge: '#22c55e' },
  'mid risk':  { bg: '#fffbeb', border: '#fcd34d', text: '#b45309', badge: '#f59e0b' },
  'high risk': { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c', badge: '#ef4444' },
};
const RISK_ICON: Record<string, React.ReactNode> = {
  'low risk':  <CheckCircle size={14} color="#22c55e" />,
  'mid risk':  <AlertCircle size={14} color="#f59e0b" />,
  'high risk': <AlertTriangle size={14} color="#ef4444" />,
};

const RiskBadge: React.FC<{ riskLevel: string; confidence?: number; small?: boolean }> = ({ riskLevel, confidence, small }) => {
  const c = RISK_COLORS[riskLevel] || RISK_COLORS['low risk'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      backgroundColor: c.badge, color: 'white',
      padding: small ? '2px 8px' : '4px 12px',
      borderRadius: '20px', fontSize: small ? '0.7rem' : '0.8rem', fontWeight: 700,
    }}>
      {riskLevel.replace(' risk', '').toUpperCase()}
      {confidence !== undefined ? ` · ${confidence}%` : ''}
    </span>
  );
};

const formatDate = (s?: string) => {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

/* ================================================================
   DETAIL PANEL — Shown when a mother is selected
================================================================ */
const MotherDetailPanel: React.FC<{ mother: Mother; onBack: () => void }> = ({ mother, onBack }) => {
  const navigate = useNavigate();
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null);

  const handlePrint = () => window.print();

  const sortedVisits = [...mother.visits].sort((a, b) =>
    new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
  );

  const riskCounts = {
    high: mother.visits.filter(v => v.riskLevel === 'high risk').length,
    mid:  mother.visits.filter(v => v.riskLevel === 'mid risk').length,
    low:  mother.visits.filter(v => v.riskLevel === 'low risk').length,
  };

  return (
    <div>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .card { break-inside: avoid; box-shadow: none !important; border: 1px solid #ddd !important; }
          body { background: white !important; }
        }
      `}</style>

      {/* Action bar */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'white', border: '1px solid #d1d5db', borderRadius: '0.5rem',
          padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600, color: '#374151',
        }}>
          <ArrowLeft size={16} /> Back to Mothers
        </button>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate(`/asha/maternal-report/${mother.id}`)} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: '#0284c7', color: 'white', border: 'none', borderRadius: '0.5rem',
            padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600,
          }}>
            <FileText size={16} /> Full Report
          </button>
          <button onClick={handlePrint} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: '#db2777', color: 'white', border: 'none', borderRadius: '0.5rem',
            padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600,
            boxShadow: '0 2px 8px rgba(219,39,119,0.3)',
          }}>
            <Printer size={16} /> Print Record
          </button>
        </div>
      </div>

      {/* Mother header */}
      <div style={{
        background: 'linear-gradient(135deg, #db2777, #be185d)',
        borderRadius: '1rem', padding: '1.75rem', marginBottom: '1.5rem', color: 'white',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.1 }}>
          <Heart size={100} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700,
            }}>
              {mother.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{mother.name}</h2>
              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.875rem', opacity: 0.9, marginTop: '0.3rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={13} />{mother.email}</span>
                {mother.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={13} />{mother.phone}</span>}
              </div>
            </div>
            {mother.latestRisk && (
              <div style={{ marginLeft: 'auto' }}>
                <RiskBadge riskLevel={mother.latestRisk} confidence={mother.latestRiskConfidence} />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', opacity: 0.9 }}>
            <span><strong>{mother.visits.length}</strong> ANC Visit{mother.visits.length !== 1 ? 's' : ''}</span>
            {riskCounts.high > 0 && <span>🔴 {riskCounts.high} High Risk</span>}
            {riskCounts.mid > 0 && <span>🟡 {riskCounts.mid} Mid Risk</span>}
            {riskCounts.low > 0 && <span>🟢 {riskCounts.low} Low Risk</span>}
          </div>
        </div>
      </div>

      {/* Visit list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sortedVisits.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            No visits recorded yet.
          </div>
        ) : (
          sortedVisits.map((visit, idx) => {
            const riskC = visit.riskLevel ? RISK_COLORS[visit.riskLevel] : null;
            const isExpanded = expandedVisit === visit.id;
            return (
              <div key={visit.id} className="card" style={{
                borderLeft: `4px solid ${riskC ? riskC.badge : '#0284c7'}`,
                border: `1px solid ${riskC ? riskC.border : '#e5e7eb'}`,
              }}>
                {/* Visit header — always visible */}
                <div
                  onClick={() => setExpandedVisit(isExpanded ? null : visit.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.25rem', cursor: 'pointer', flexWrap: 'wrap', gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{
                      background: riskC ? riskC.bg : '#f0f9ff',
                      border: `1px solid ${riskC ? riskC.border : '#bae6fd'}`,
                      borderRadius: '50%', width: 32, height: 32,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.8rem', color: riskC ? riskC.text : '#0369a1',
                      flexShrink: 0,
                    }}>
                      {sortedVisits.length - idx}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
                        {formatDate(visit.visitDate)}
                        {visit.week ? <span style={{ color: '#6b7280', fontWeight: 400, fontSize: '0.85rem', marginLeft: '0.5rem' }}>· Week {visit.week}</span> : ''}
                      </div>
                      {visit.center && <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{visit.center}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {visit.riskLevel
                      ? <RiskBadge riskLevel={visit.riskLevel} confidence={visit.riskConfidence} small />
                      : <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>No vitals</span>}
                    {isExpanded ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #f3f4f6', padding: '1rem 1.25rem', background: '#fafafa' }}>

                    {/* Vitals */}
                    {visit.vitals && Object.keys(visit.vitals).length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Activity size={13} color="#0d9488" /> Health Vitals
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {Object.entries(visit.vitals).map(([k, v]) => (
                            <span key={k} style={{
                              background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px',
                              padding: '3px 10px', fontSize: '0.8rem', color: '#155e46',
                            }}>
                              <strong>{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:</strong> {v as string}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk factors */}
                    {visit.riskLevel && riskC && visit.riskFactors && visit.riskFactors.length > 0 && (
                      <div style={{ background: riskC.bg, border: `1px solid ${riskC.border}`, borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem' }}>
                        <p style={{ margin: '0 0 0.4rem', fontWeight: 700, fontSize: '0.8rem', color: riskC.text }}>Risk Factors:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                          {visit.riskFactors.map((f, i) => <li key={i} style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '2px' }}>{f}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {visit.riskRecommendations && visit.riskRecommendations.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151', marginBottom: '0.4rem' }}>Recommendations:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                          {visit.riskRecommendations.map((r, i) => <li key={i} style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '3px', lineHeight: 1.5 }}>{r}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* Notes & Doctor notes */}
                    {(visit.notes || visit.doctorNotes) && (
                      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem' }}>
                        {visit.notes && (
                          <div style={{ marginBottom: visit.doctorNotes ? '0.6rem' : 0 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#374151', margin: '0 0 0.25rem' }}>Notes</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{visit.notes}</p>
                          </div>
                        )}
                        {visit.doctorNotes && (
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0d9488', margin: '0 0 0.25rem' }}>Doctor's Report</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{visit.doctorNotes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
                      <Clock size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                      Recorded on {formatDate(visit.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/* ================================================================
   MOTHER LIST — Default view
================================================================ */
const MaternalRecords: React.FC = () => {
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [selectedMother, setSelectedMother] = useState<Mother | null>(null);

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const { records } = await maternityAPI.getAllRecords();
      setAllRecords(records);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  };

  /* Group visits by mother */
  const mothers: Mother[] = useMemo(() => {
    const map = new Map<string, Mother>();
    allRecords.forEach(r => {
      const uid = r.user.id;
      if (!map.has(uid)) {
        map.set(uid, { id: uid, name: r.user.name, email: r.user.email, phone: r.user.phone, visits: [] });
      }
      map.get(uid)!.visits.push({
        id: r.id, visitDate: r.visitDate, week: r.week, center: r.center,
        notes: r.notes, doctorNotes: r.doctorNotes, vitals: r.vitals,
        riskLevel: r.riskLevel, riskConfidence: r.riskConfidence,
        riskFactors: r.riskFactors, riskRecommendations: r.riskRecommendations,
        createdAt: r.createdAt,
      });
    });
    // Attach latestRisk from most recent visit
    map.forEach(m => {
      const sorted = [...m.visits].sort((a, b) =>
        new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
      );
      const withRisk = sorted.find(v => v.riskLevel);
      m.latestRisk = withRisk?.riskLevel;
      m.latestRiskConfidence = withRisk?.riskConfidence;
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allRecords]);

  const riskCounts = useMemo(() => ({
    high: mothers.filter(m => m.latestRisk === 'high risk').length,
    mid:  mothers.filter(m => m.latestRisk === 'mid risk').length,
    low:  mothers.filter(m => m.latestRisk === 'low risk').length,
    none: mothers.filter(m => !m.latestRisk).length,
  }), [mothers]);

  const filtered = useMemo(() => mothers.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRisk = filterRisk === '' || m.latestRisk === filterRisk ||
      (filterRisk === 'none' && !m.latestRisk);
    return matchSearch && matchRisk;
  }), [mothers, searchTerm, filterRisk]);

  /* If a mother is selected, show the detail panel */
  if (selectedMother) {
    return (
      <AshaLayout title={`${selectedMother.name}'s Records`}>
        <MotherDetailPanel
          mother={selectedMother}
          onBack={() => setSelectedMother(null)}
        />
      </AshaLayout>
    );
  }

  return (
    <AshaLayout title="Maternal Records">
      <div>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem' }}>Maternal Records</h1>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
            {mothers.length} mother{mothers.length !== 1 ? 's' : ''} registered — click a name to view their ANC visits.
          </p>
        </div>

        {/* Risk summary cards (clickable filters) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'High Risk', count: riskCounts.high, color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', risk: 'high risk', icon: <AlertTriangle size={18} color="#ef4444" /> },
            { label: 'Mid Risk',  count: riskCounts.mid,  color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', risk: 'mid risk',  icon: <AlertCircle  size={18} color="#f59e0b" /> },
            { label: 'Low Risk',  count: riskCounts.low,  color: '#22c55e', bg: '#f0fdf4', border: '#86efac', risk: 'low risk',  icon: <CheckCircle  size={18} color="#22c55e" /> },
            { label: 'No Vitals', count: riskCounts.none, color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', risk: 'none',      icon: <Activity     size={18} color="#94a3b8" /> },
          ].map(s => (
            <button key={s.label} onClick={() => setFilterRisk(filterRisk === s.risk ? '' : s.risk)} style={{
              border: `2px solid ${filterRisk === s.risk ? s.color : s.border}`,
              borderRadius: '0.75rem', padding: '1rem', background: s.bg, cursor: 'pointer',
              textAlign: 'center', transition: 'all 0.2s',
              boxShadow: filterRisk === s.risk ? `0 0 0 3px ${s.color}30` : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>{s.label}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 12, color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.4rem',
                border: '1.5px solid #d1d5db', borderRadius: '0.5rem',
                fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Mother cards grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <Baby size={40} color="#d1d5db" style={{ marginBottom: '1rem' }} />
            <div>No mothers found.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filtered.map(mother => {
              const riskC = mother.latestRisk ? RISK_COLORS[mother.latestRisk] : null;
              return (
                <div
                  key={mother.id}
                  onClick={() => setSelectedMother(mother)}
                  className="card"
                  style={{
                    padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s',
                    borderLeft: `4px solid ${riskC ? riskC.badge : '#0284c7'}`,
                    border: `1px solid ${riskC ? riskC.border : '#e5e7eb'}`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: riskC ? riskC.bg : '#f0f9ff',
                        border: `2px solid ${riskC ? riskC.border : '#bae6fd'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '1.1rem',
                        color: riskC ? riskC.text : '#0369a1',
                      }}>
                        {mother.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>{mother.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{mother.email}</div>
                      </div>
                    </div>
                    {mother.latestRisk
                      ? <RiskBadge riskLevel={mother.latestRisk} small />
                      : <span style={{ fontSize: '0.7rem', color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: '10px' }}>No vitals</span>}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6b7280', borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} /> {mother.visits.length} visit{mother.visits.length !== 1 ? 's' : ''}
                    </span>
                    {mother.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={12} />{mother.phone}</span>}
                    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#0284c7', fontWeight: 600, fontSize: '0.75rem' }}>
                      View <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AshaLayout>
  );
};

export default MaternalRecords;