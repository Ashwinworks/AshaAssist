import React, { useEffect, useState } from 'react';
import MaternityLayout from './MaternityLayout';
import { maternityAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface VisitItem {
  _id: string;
  visitDate: string; // ISO date string for display
  week?: number | null;
  center?: string;
  notes?: string;
}

const AntenatalVisits: React.FC = () => {
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [visitDate, setVisitDate] = useState('');
  const [center, setCenter] = useState('');
  const [notes, setNotes] = useState('');
  const [week, setWeek] = useState<number | ''>('');

  const loadVisits = async () => {
    try {
      setLoading(true);
      const data = await maternityAPI.getVisits();
      const list = (data?.visits || []).map((v: any) => ({
        _id: v._id,
        visitDate: (v.visitDate ? new Date(v.visitDate).toISOString().slice(0, 10) : ''),
        week: v.week ?? null,
        center: v.center || '',
        notes: v.notes || '',
      }));
      setVisits(list);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to load visits');
    } finally {
      setLoading(false);
    }
  };

  const addVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate) {
      toast.error('Please select a visit date');
      return;
    }
    try {
      setLoading(true);
      const payload = { visitDate, week: week === '' ? undefined : Number(week), center: center.trim() || undefined, notes: notes.trim() || undefined };
      await maternityAPI.addVisit(payload);
      toast.success('Visit recorded');
      setVisitDate('');
      setCenter('');
      setNotes('');
      setWeek('');
      await loadVisits();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to add visit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true); // trigger entrance animation
    loadVisits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MaternityLayout title="Antenatal Visits">
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Add Visit Form */}
        <div
          className="card"
          style={{
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            opacity: mounted ? 1 : 0,
            transition: 'all 300ms ease',
          }}
        >
          <div className="card-header">
            <h2 className="card-title">Add Antenatal Visit</h2>
            <p className="card-subtitle">Record your checkup at a hospital/clinic</p>
          </div>
          <div className="card-content">
            <form onSubmit={addVisit} style={{ display: 'grid', gap: '1.25rem', maxWidth: 520 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Visit Date</label>
                  <input
                    type="date"
                    className="input"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gestational Week (optional)</label>
                  <select
                    className="input"
                    value={week}
                    onChange={(e) => setWeek(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Auto-compute</option>
                    {/* Weeks 4-28 every 4 weeks */}
                    {[4,8,12,16,20,24,28].map(w => (
                      <option key={w} value={w}>{`Week ${w}`}</option>
                    ))}
                    {/* Weeks 30,32,34,36 */}
                    {[30,32,34,36].map(w => (
                      <option key={w} value={w}>{`Week ${w}`}</option>
                    ))}
                    {/* Weeks 37-40 */}
                    {[37,38,39,40].map(w => (
                      <option key={w} value={w}>{`Week ${w}`}</option>
                    ))}
                    {/* Optional follow-ups 41,42 */}
                    {[41,42].map(w => (
                      <option key={w} value={w}>{`Week ${w}`}</option>
                    ))}
                  </select>
                  <div className="form-help">Select if known; otherwise it will be computed.</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Health Center (optional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., PHC, CHC, Pvt Clinic"
                  value={center}
                  onChange={(e) => setCenter(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="input"
                  placeholder="Any observations, tests, doctor instructions, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
                <div className="form-help">Add key observations or instructions from your visit.</div>
              </div>
              <div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? 'Saving...' : 'Add Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Visits List */}
        <div
          className="card"
          style={{
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            opacity: mounted ? 1 : 0,
            transition: 'all 350ms ease 80ms',
          }}
        >
          <div className="card-header">
            <h2 className="card-title">Recorded Visits</h2>
          </div>
          <div className="card-content">
            {loading && visits.length === 0 ? (
              <p>Loading...</p>
            ) : visits.length === 0 ? (
              <p style={{ color: 'var(--gray-600)' }}>No visits recorded yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Date</th>
                      <th style={{ textAlign: 'left' }}>Gestational Week</th>
                      <th style={{ textAlign: 'left' }}>Center</th>
                      <th style={{ textAlign: 'left' }}>Notes</th>
                      <th style={{ textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits
                      .slice()
                      .sort((a, b) => a.visitDate.localeCompare(b.visitDate))
                      .map((v) => (
                        <tr key={v._id}>
                          <td>{v.visitDate}</td>
                          <td>{v.week ?? '-'}</td>
                          <td>{v.center || '-'}</td>
                          <td>{v.notes || '-'}</td>
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
                                } finally {
                                  setLoading(false);
                                }
                              }}
                            >
                              Clear
                            </button>
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
    </MaternityLayout>
  );
};

export default AntenatalVisits;