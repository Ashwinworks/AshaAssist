import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AshaLayout from './AshaLayout';
import {
    ArrowLeft, Printer, User, Heart, Calendar, Baby, DollarSign,
    Syringe, MapPin, Phone, Mail, Clock, FileText, CheckCircle,
    XCircle, Lock, AlertCircle, Shield
} from 'lucide-react';
import { maternalReportAPI } from '../../services/api';

const MaternalReport: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userId) loadReport();
    }, [userId]);

    const loadReport = async () => {
        try {
            setLoading(true);
            setError('');
            const { report: data } = await maternalReportAPI.getReport(userId!);
            setReport(data);
        } catch (err: any) {
            console.error('Failed to load report:', err);
            setError(err?.response?.data?.error || 'Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        } catch { return dateStr; }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
            paid: { bg: 'var(--green-100)', color: 'var(--green-700)', icon: <CheckCircle size={12} /> },
            approved: { bg: 'var(--blue-100)', color: 'var(--blue-700)', icon: <CheckCircle size={12} /> },
            applied: { bg: 'var(--yellow-100)', color: 'var(--yellow-700)', icon: <Clock size={12} /> },
            eligible: { bg: 'var(--purple-100)', color: 'var(--purple-700)', icon: <AlertCircle size={12} /> },
            locked: { bg: 'var(--gray-100)', color: 'var(--gray-500)', icon: <Lock size={12} /> },
            completed: { bg: 'var(--green-100)', color: 'var(--green-700)', icon: <CheckCircle size={12} /> },
            booked: { bg: 'var(--blue-100)', color: 'var(--blue-700)', icon: <Calendar size={12} /> },
            pregnant: { bg: 'var(--pink-100)', color: 'var(--pink-700)', icon: <Heart size={12} /> },
            delivered: { bg: 'var(--green-100)', color: 'var(--green-700)', icon: <Baby size={12} /> },
        };
        const s = styles[status?.toLowerCase()] || { bg: 'var(--gray-100)', color: 'var(--gray-600)', icon: null };
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.25rem 0.625rem', borderRadius: '999px',
                fontSize: '0.75rem', fontWeight: '600',
                backgroundColor: s.bg, color: s.color,
                textTransform: 'capitalize'
            }}>
                {s.icon} {status}
            </span>
        );
    };

    // --- Section wrapper ---
    const Section: React.FC<{ title: string; icon: React.ReactNode; accentColor: string; children: React.ReactNode }> =
        ({ title, icon, accentColor, children }) => (
            <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{
                    padding: '1rem 1.5rem',
                    backgroundColor: accentColor,
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    borderBottom: '1px solid var(--gray-200)'
                }}>
                    {icon}
                    <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--gray-900)' }}>
                        {title}
                    </h2>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {children}
                </div>
            </div>
        );

    // --- Info row ---
    const InfoRow: React.FC<{ label: string; value: string | React.ReactNode; icon?: React.ReactNode }> =
        ({ label, value, icon }) => (
            <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)'
            }}>
                {icon && <span style={{ color: 'var(--gray-400)', marginTop: '2px' }}>{icon}</span>}
                <span style={{ fontWeight: '600', color: 'var(--gray-700)', minWidth: '140px', fontSize: '0.875rem' }}>{label}:</span>
                <span style={{ color: 'var(--gray-900)', fontSize: '0.875rem', flex: 1 }}>{value || '—'}</span>
            </div>
        );

    if (loading) {
        return (
            <AshaLayout title="Maternal Report">
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-500)' }}>
                    <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Generating report...</div>
                    <div style={{ fontSize: '0.875rem' }}>Gathering all maternal user data</div>
                </div>
            </AshaLayout>
        );
    }

    if (error) {
        return (
            <AshaLayout title="Maternal Report">
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <XCircle size={48} color="var(--red-500)" style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '1.25rem', color: 'var(--red-600)', marginBottom: '1rem' }}>{error}</div>
                    <button className="btn" onClick={() => navigate('/asha/maternal-records')} style={{
                        backgroundColor: 'var(--gray-600)', color: 'white', border: 'none'
                    }}>Back to Records</button>
                </div>
            </AshaLayout>
        );
    }

    if (!report) return null;

    const { profile, pregnancy, children, ancVisits, pmsma, vaccinationRecords, homeVisits } = report;

    return (
        <AshaLayout title="Maternal Report">
            {/* Print styles */}
            <style>{`
        @media print {
          /* Hide sidebar, header, buttons during print */
          div[style*="position: fixed"], header, .no-print { display: none !important; }
          div[style*="marginLeft"] { margin-left: 0 !important; }
          main { padding: 0 !important; }
          .card { break-inside: avoid; box-shadow: none !important; border: 1px solid #ddd !important; }
        }
      `}</style>

            {/* Action Bar (hide on print) */}
            <div className="no-print" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'
            }}>
                <button className="btn" onClick={() => navigate('/asha/maternal-records')} style={{
                    backgroundColor: 'white', color: 'var(--gray-700)', border: '1px solid var(--gray-300)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600'
                }}>
                    <ArrowLeft size={16} /> Back to Records
                </button>
                <button className="btn" onClick={handlePrint} style={{
                    backgroundColor: 'var(--pink-600)', color: 'white', border: 'none',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(219, 39, 119, 0.3)'
                }}>
                    <Printer size={16} /> Print Report
                </button>
            </div>

            {/* Report Title Banner */}
            <div style={{
                background: 'linear-gradient(135deg, var(--pink-600) 0%, var(--pink-700) 100%)',
                borderRadius: '1rem', padding: '2rem', marginBottom: '2rem', color: 'white',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
                    <Heart size={120} />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Shield size={24} />
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>
                            Maternal Health Report
                        </h1>
                    </div>
                    <p style={{ margin: '0.5rem 0 0', opacity: 0.9, fontSize: '1.1rem' }}>
                        Complete health report for <strong>{profile?.name}</strong>
                    </p>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.875rem', opacity: 0.85 }}>
                        <span>Generated: {formatDate(report.generatedAt)}</span>
                        <span>By: {report.generatedBy}</span>
                    </div>
                </div>
            </div>

            {/* =========== PROFILE =========== */}
            <Section title="Profile Information" icon={<User size={20} color="var(--blue-600)" />} accentColor="var(--blue-50)">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.25rem' }}>
                    <InfoRow label="Full Name" value={profile?.name} icon={<User size={14} />} />
                    <InfoRow label="Email" value={profile?.email} icon={<Mail size={14} />} />
                    <InfoRow label="Phone" value={profile?.phone} icon={<Phone size={14} />} />
                    <InfoRow label="Age" value={profile?.age ? `${profile.age} years` : null} />
                    <InfoRow label="Ward" value={profile?.ward} icon={<MapPin size={14} />} />
                    <InfoRow label="Address" value={profile?.address} />
                    <InfoRow label="Registered" value={formatDate(profile?.registeredAt)} icon={<Calendar size={14} />} />
                </div>
            </Section>

            {/* =========== PREGNANCY =========== */}
            <Section title="Pregnancy Details" icon={<Heart size={20} color="var(--pink-600)" />} accentColor="var(--pink-50)">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.25rem' }}>
                    <InfoRow label="Status" value={getStatusBadge(pregnancy?.status)} />
                    <InfoRow label="LMP (Last Menstrual Period)" value={formatDate(pregnancy?.lmp)} />
                    <InfoRow label="EDD (Expected Delivery)" value={formatDate(pregnancy?.edd)} />
                    <InfoRow label="Weeks Pregnant" value={pregnancy?.weeksPregnant != null ? `${pregnancy.weeksPregnant} weeks` : null} />
                    <InfoRow label="Trimester" value={pregnancy?.trimester ? `Trimester ${pregnancy.trimester}` : null} />
                    {pregnancy?.deliveryDate && (
                        <InfoRow label="Delivery Date" value={formatDate(pregnancy.deliveryDate)} />
                    )}
                    {pregnancy?.deliveryDetails && (
                        <>
                            <InfoRow label="Delivery Type" value={pregnancy.deliveryDetails.type} />
                            <InfoRow label="Delivery Location" value={pregnancy.deliveryDetails.location} />
                            <InfoRow label="Complications" value={pregnancy.deliveryDetails.complications} />
                        </>
                    )}
                </div>
            </Section>

            {/* =========== CHILDREN =========== */}
            {children && children.length > 0 && (
                <Section title={`Children (${children.length})`} icon={<Baby size={20} color="var(--purple-600)" />} accentColor="var(--purple-50)">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                        {children.map((child: any, idx: number) => (
                            <div key={idx} style={{
                                padding: '1.25rem', borderRadius: '0.75rem',
                                border: '1px solid var(--purple-200)', backgroundColor: 'var(--purple-50)'
                            }}>
                                <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--purple-800)', marginBottom: '0.75rem' }}>
                                    <Baby size={16} style={{ marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                                    {child.name}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                    <div><strong>Gender:</strong> {child.gender}</div>
                                    <div><strong>DOB:</strong> {formatDate(child.dateOfBirth)}</div>
                                    {child.weight && <div><strong>Weight:</strong> {child.weight}g</div>}
                                    {child.height && <div><strong>Height:</strong> {child.height}cm</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* =========== ANC VISITS =========== */}
            <Section title={`ANC Visit History (${ancVisits?.length || 0})`} icon={<Calendar size={20} color="var(--teal-600)" />} accentColor="var(--green-50)">
                {ancVisits && ancVisits.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--gray-50)' }}>
                                    <th style={thStyle}>#</th>
                                    <th style={thStyle}>Visit Date</th>
                                    <th style={thStyle}>Pregnancy Week</th>
                                    <th style={thStyle}>Center</th>
                                    <th style={thStyle}>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ancVisits.map((visit: any, idx: number) => (
                                    <tr key={visit.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                        <td style={tdStyle}>{idx + 1}</td>
                                        <td style={tdStyle}>{formatDate(visit.visitDate)}</td>
                                        <td style={tdStyle}>{visit.week || '—'}</td>
                                        <td style={tdStyle}>{visit.center || '—'}</td>
                                        <td style={tdStyle}>{visit.notes || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>No ANC visits recorded</div>
                )}
            </Section>

            {/* =========== PMSMA BENEFITS =========== */}
            <Section title="PMSMA Government Benefits" icon={<DollarSign size={20} color="var(--green-600)" />} accentColor="var(--green-50)">
                {pmsma ? (
                    <>
                        {/* Summary row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={summaryCardStyle('var(--green-50)', 'var(--green-700)')}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>₹{pmsma.totalPaid?.toLocaleString()}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Total Paid</div>
                            </div>
                            <div style={summaryCardStyle('var(--blue-50)', 'var(--blue-700)')}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>₹{pmsma.totalEligible?.toLocaleString()}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Total Eligible</div>
                            </div>
                            <div style={summaryCardStyle('var(--purple-50)', 'var(--purple-700)')}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{pmsma.progress}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Progress</div>
                            </div>
                        </div>
                        {/* Installment cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            {pmsma.installments?.map((inst: any) => (
                                <div key={inst.number} style={{
                                    padding: '1.25rem', borderRadius: '0.75rem',
                                    border: `1px solid ${inst.status === 'paid' ? 'var(--green-300)' : 'var(--gray-200)'}`,
                                    backgroundColor: inst.status === 'paid' ? 'var(--green-50)' : 'white'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--gray-800)' }}>Installment {inst.number}</span>
                                        {getStatusBadge(inst.status)}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                        <div>{inst.name || inst.milestone}</div>
                                        <div style={{ fontWeight: '600', marginTop: '0.25rem' }}>₹{inst.amount?.toLocaleString()}</div>
                                        {inst.paidDate && <div style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>Paid: {formatDate(inst.paidDate)}</div>}
                                        {inst.transactionId && <div style={{ fontSize: '0.75rem' }}>Txn: {inst.transactionId}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>PMSMA benefits not initialized</div>
                )}
            </Section>

            {/* =========== VACCINATION RECORDS =========== */}
            <Section title={`Vaccination Records (${vaccinationRecords?.length || 0})`} icon={<Syringe size={20} color="var(--indigo-600)" />} accentColor="var(--blue-50)">
                {vaccinationRecords && vaccinationRecords.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--gray-50)' }}>
                                    <th style={thStyle}>#</th>
                                    <th style={thStyle}>Child</th>
                                    <th style={thStyle}>Vaccines</th>
                                    <th style={thStyle}>Date</th>
                                    <th style={thStyle}>Location</th>
                                    <th style={thStyle}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vaccinationRecords.map((rec: any, idx: number) => (
                                    <tr key={rec.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                        <td style={tdStyle}>{idx + 1}</td>
                                        <td style={tdStyle}>{rec.childName || '—'}</td>
                                        <td style={tdStyle}>{(rec.vaccines || []).join(', ') || '—'}</td>
                                        <td style={tdStyle}>{formatDate(rec.date)}</td>
                                        <td style={tdStyle}>{rec.location || '—'}</td>
                                        <td style={tdStyle}>{getStatusBadge(rec.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>No vaccination records</div>
                )}
            </Section>

            {/* =========== HOME VISITS =========== */}
            <Section title={`Home Visits (${homeVisits?.length || 0})`} icon={<MapPin size={20} color="var(--orange-600)" />} accentColor="var(--orange-50)">
                {homeVisits && homeVisits.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--gray-50)' }}>
                                    <th style={thStyle}>#</th>
                                    <th style={thStyle}>Visit Date</th>
                                    <th style={thStyle}>Notes</th>
                                    <th style={thStyle}>Verified</th>
                                </tr>
                            </thead>
                            <tbody>
                                {homeVisits.map((hv: any, idx: number) => (
                                    <tr key={hv.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                        <td style={tdStyle}>{idx + 1}</td>
                                        <td style={tdStyle}>{formatDate(hv.visitDate)}</td>
                                        <td style={tdStyle}>{hv.visitNotes || '—'}</td>
                                        <td style={tdStyle}>
                                            {hv.verified
                                                ? <span style={{ color: 'var(--green-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14} /> Yes</span>
                                                : <span style={{ color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><XCircle size={14} /> No</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>No home visits recorded</div>
                )}
            </Section>

            {/* Footer */}
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--gray-400)', fontSize: '0.75rem' }}>
                Report generated by AshaAssist &bull; {formatDate(report.generatedAt)}
            </div>
        </AshaLayout>
    );
};

// ---- table style helpers ----
const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: '0.75rem 1rem',
    fontWeight: '600', color: 'var(--gray-600)',
    borderBottom: '2px solid var(--gray-200)', whiteSpace: 'nowrap'
};
const tdStyle: React.CSSProperties = {
    padding: '0.75rem 1rem', color: 'var(--gray-800)', verticalAlign: 'top'
};
const summaryCardStyle = (bg: string, color: string): React.CSSProperties => ({
    padding: '1.25rem', borderRadius: '0.75rem',
    backgroundColor: bg, color, textAlign: 'center'
});

export default MaternalReport;
