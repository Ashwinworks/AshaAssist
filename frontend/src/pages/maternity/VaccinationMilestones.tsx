import React, { useState, useEffect } from 'react';
import MaternityLayout from './MaternityLayout';
import { Syringe, Calendar, CheckCircle, Clock, AlertCircle, Baby, Award, Lock, RefreshCw } from 'lucide-react';
import { vaccinationAPI } from '../../services/api';

interface VaccinationMilestone {
    vaccineName: string;
    ageInDays: number;
    ageLabel: string;
    description: string;
    dueDate: string;
    status: 'completed' | 'due' | 'overdue' | 'upcoming' | 'pending';
    completedAt?: string;
    category: string;
}

interface ChildInfo {
    name: string;
    dateOfBirth: string;
    gender: string;
    weight?: number;
    height?: number;
}

const VaccinationMilestones: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [locked, setLocked] = useState(false);
    const [lockedReason, setLockedReason] = useState('');
    const [child, setChild] = useState<ChildInfo | null>(null);
    const [milestones, setMilestones] = useState<VaccinationMilestone[]>([]);
    const [completedCount, setCompletedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchMilestones();
    }, []);

    const fetchMilestones = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await vaccinationAPI.getMyMilestones();
            if (data.locked) {
                setLocked(true);
                setLockedReason(data.reason || '');
            } else {
                setLocked(false);
                setChild(data.child || null);
                setMilestones((data.milestones || []) as VaccinationMilestone[]);
                setCompletedCount(data.completedCount || 0);
                setTotalCount(data.totalCount || 0);
            }
        } catch (e: any) {
            setError(e?.response?.data?.error || 'Failed to load vaccination milestones');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle size={20} color="#16a34a" />;
            case 'due':
                return <Clock size={20} color="#f59e0b" />;
            case 'overdue':
                return <AlertCircle size={20} color="#dc2626" />;
            case 'upcoming':
            default:
                return <Calendar size={20} color="#6b7280" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return { bg: '#f0fdf4', border: '#86efac', text: '#166534' };
            case 'due':
                return { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' };
            case 'overdue':
                return { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' };
            case 'upcoming':
            default:
                return { bg: '#f9fafb', border: '#d1d5db', text: '#374151' };
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        } catch { return 'Invalid Date'; }
    };

    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Group milestones by category
    const groupedMilestones = milestones.reduce((acc, milestone) => {
        if (!acc[milestone.category]) acc[milestone.category] = [];
        acc[milestone.category].push(milestone);
        return acc;
    }, {} as Record<string, VaccinationMilestone[]>);

    const pendingCount = milestones.filter(m => m.status === 'due' || m.status === 'overdue' || m.status === 'pending').length;
    const upcomingCount = milestones.filter(m => m.status === 'upcoming').length;

    return (
        <MaternityLayout title="Vaccination Milestones">
            <div>
                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>Loading vaccination milestones...</div>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #fca5a5', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                        <button onClick={fetchMilestones} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                            <RefreshCw size={14} /> Retry
                        </button>
                    </div>
                )}

                {/* Locked — still pregnant or no child recorded */}
                {!loading && !error && locked && (
                    <div className="card">
                        <div className="card-content">
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem 2rem',
                                background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)',
                                borderRadius: '1rem',
                                border: '2px solid #fbbf24'
                            }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%',
                                    background: '#fef3c7', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 1.5rem', border: '3px solid #fbbf24'
                                }}>
                                    <Lock size={40} color="#f59e0b" />
                                </div>
                                <h3 style={{ color: '#92400e', marginBottom: '1rem', fontSize: '1.5rem' }}>
                                    Vaccination Milestones Currently Locked
                                </h3>
                                <p style={{ color: '#78350f', marginBottom: '1.5rem', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
                                    {lockedReason === 'pregnant'
                                        ? 'Vaccination milestone tracking is available after your baby is born. This ensures we can properly monitor your child\'s immunization progress based on their actual birth date.'
                                        : 'No child record found. Once your ASHA worker records the birth, vaccination milestones will be automatically calculated.'}
                                </p>
                                <div style={{
                                    background: 'white', padding: '1.5rem', borderRadius: '0.75rem',
                                    maxWidth: '500px', margin: '0 auto', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', justifyContent: 'center' }}>
                                        <Baby size={24} color="#16a34a" />
                                        <h4 style={{ margin: 0, color: '#166534', fontSize: '1.1rem' }}>After Birth is Recorded</h4>
                                    </div>
                                    <ul style={{ textAlign: 'left', color: '#4b5563', lineHeight: '1.8', paddingLeft: '1.5rem', margin: 0 }}>
                                        <li>Your ASHA worker will record the birth details</li>
                                        <li>A child profile will be created with birth date</li>
                                        <li>Vaccination milestones will be automatically calculated</li>
                                        <li>Track all Indian immunization program vaccines</li>
                                        <li>Receive timely reminders for upcoming vaccinations</li>
                                    </ul>
                                </div>
                                <p style={{ color: '#78350f', marginTop: '1.5rem', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                    Continue with your prenatal care visits. Vaccination milestone tracking will unlock automatically after delivery.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                {!loading && !error && !locked && child && (
                    <>
                        {/* Child Information Card */}
                        <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)', border: '2px solid #93c5fd' }}>
                            <div className="card-content" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}>
                                        <Baby size={40} color="white" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: '700', color: '#1e3a8a' }}>
                                            {child.name}
                                        </h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: '#1e40af' }}>
                                            <div><strong>Date of Birth:</strong> {formatDate(child.dateOfBirth)}</div>
                                            <div><strong>Gender:</strong> {child.gender}</div>
                                            {child.weight && <div><strong>Weight:</strong> {child.weight}g</div>}
                                            {child.height && <div><strong>Height:</strong> {child.height}cm</div>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={fetchMilestones}
                                        style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.6)', border: '1px solid #93c5fd', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#1e40af' }}
                                        title="Refresh"
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div style={{ marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e3a8a' }}>Vaccination Progress</span>
                                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e3a8a' }}>
                                            {completedCount} / {totalCount} ({completionPercentage}%)
                                        </span>
                                    </div>
                                    <div style={{ width: '100%', height: '20px', backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', border: '2px solid #93c5fd' }}>
                                        <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #16a34a, #22c55e)', transition: 'width 0.3s ease' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="card" style={{ borderLeft: '4px solid #16a34a', backgroundColor: '#f0fdf4' }}>
                                <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <CheckCircle size={32} color="#16a34a" />
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#166534' }}>{completedCount}</h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#166534' }}>Completed</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card" style={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb' }}>
                                <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Clock size={32} color="#f59e0b" />
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#92400e' }}>{pendingCount}</h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>Due / Overdue</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card" style={{ borderLeft: '4px solid #6b7280', backgroundColor: '#f9fafb' }}>
                                <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Calendar size={32} color="#6b7280" />
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#374151' }}>{upcomingCount}</h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151' }}>Upcoming</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card" style={{ borderLeft: '4px solid #8b5cf6', backgroundColor: '#faf5ff' }}>
                                <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Award size={32} color="#8b5cf6" />
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#6b21a8' }}>{completionPercentage}%</h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b21a8' }}>Complete</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vaccination Timeline */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Syringe size={24} color="#db2777" />
                                    Vaccination Timeline — Indian Immunization Program
                                </h2>
                            </div>
                            <div className="card-content">
                                {Object.entries(groupedMilestones).map(([category, categoryMilestones]) => (
                                    <div key={category} style={{ marginBottom: '2rem' }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            marginBottom: '1rem', paddingBottom: '0.5rem',
                                            borderBottom: '2px solid #e5e7eb'
                                        }}>
                                            <Calendar size={20} color="#db2777" />
                                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                                                {categoryMilestones[0].ageLabel}
                                            </h3>
                                            <span style={{
                                                marginLeft: 'auto', padding: '0.25rem 0.75rem', borderRadius: '9999px',
                                                fontSize: '0.75rem', fontWeight: '600',
                                                backgroundColor: '#ede9fe', color: '#6b21a8'
                                            }}>
                                                {categoryMilestones.length} vaccine{categoryMilestones.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            {categoryMilestones.map((milestone, i) => {
                                                const colors = getStatusColor(milestone.status);
                                                return (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            backgroundColor: colors.bg,
                                                            border: `2px solid ${colors.border}`,
                                                            borderRadius: '0.75rem',
                                                            padding: '1.25rem',
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: '1rem',
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '48px', height: '48px', borderRadius: '50%',
                                                            backgroundColor: 'white', display: 'flex',
                                                            alignItems: 'center', justifyContent: 'center',
                                                            flexShrink: 0, border: `2px solid ${colors.border}`
                                                        }}>
                                                            {getStatusIcon(milestone.status)}
                                                        </div>

                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                                <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: colors.text }}>
                                                                    {milestone.vaccineName}
                                                                </h4>
                                                                <span style={{
                                                                    padding: '0.25rem 0.75rem', borderRadius: '0.375rem',
                                                                    fontSize: '0.75rem', fontWeight: '600',
                                                                    backgroundColor: 'white', color: colors.text,
                                                                    textTransform: 'capitalize', border: `1px solid ${colors.border}`
                                                                }}>
                                                                    {milestone.status}
                                                                </span>
                                                            </div>

                                                            <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
                                                                {milestone.description}
                                                            </p>

                                                            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#4b5563', flexWrap: 'wrap' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                                    <Calendar size={16} />
                                                                    <strong>Due:</strong> {formatDate(milestone.dueDate)}
                                                                </div>
                                                                {milestone.status === 'completed' && milestone.completedAt && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a' }}>
                                                                        <CheckCircle size={16} />
                                                                        <strong>Completed:</strong> {formatDate(milestone.completedAt)}
                                                                    </div>
                                                                )}
                                                                {milestone.status === 'overdue' && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#dc2626' }}>
                                                                        <AlertCircle size={16} />
                                                                        <strong>Overdue — contact your ASHA worker</strong>
                                                                    </div>
                                                                )}
                                                                {milestone.status === 'due' && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b' }}>
                                                                        <Clock size={16} />
                                                                        <strong>Due now — schedule vaccination</strong>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info Banner */}
                        <div className="card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)', border: '2px solid #fbbf24' }}>
                            <div className="card-content" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <AlertCircle size={32} color="#f59e0b" />
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: '600', color: '#92400e' }}>
                                            Important Information
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#78350f', lineHeight: '1.6' }}>
                                            This vaccination schedule follows the Indian Universal Immunization Program (UIP) guidelines.
                                            Completed vaccinations are updated when your ASHA worker marks them as done.
                                            Please consult with your ASHA worker or healthcare provider before any vaccination.
                                            Keep your MCP card updated with all vaccination records. JE vaccines are given only in endemic areas.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </MaternityLayout>
    );
};

export default VaccinationMilestones;
