import React, { useState, useEffect } from 'react';
import MaternityLayout from './MaternityLayout';
import { Syringe, Calendar, CheckCircle, Clock, AlertCircle, Baby, Award, Lock } from 'lucide-react';
import { maternityAPI } from '../../services/api';

interface VaccinationMilestone {
    id: string;
    vaccineName: string;
    ageInDays: number;
    ageLabel: string;
    description: string;
    dueDate: string;
    status: 'completed' | 'pending' | 'overdue' | 'upcoming';
    completedAt?: string;
    category: string;
}

const VaccinationMilestones: React.FC = () => {
    // Pregnancy status check
    const [isPregnant, setIsPregnant] = useState<boolean | null>(null);
    const [pregnancyStatusLoading, setPregnancyStatusLoading] = useState(true);

    // Sample child data - in real implementation, this would come from API
    const childInfo = {
        name: 'Baby Kumar',
        dateOfBirth: '2025-12-15',
        gender: 'male',
        weight: 3200,
        height: 50
    };

    // Indian Immunization Program Schedule - Based on official guidelines
    const [milestones] = useState<VaccinationMilestone[]>([
        // At Birth (≤24 hours / ≤15 days)
        {
            id: '1',
            vaccineName: 'BCG',
            ageInDays: 0,
            ageLabel: 'At Birth',
            description: 'Tuberculosis vaccine - Intradermal | Up to 1 year if missed',
            dueDate: '2025-12-15',
            status: 'completed',
            completedAt: '2025-12-15',
            category: 'birth'
        },
        {
            id: '2',
            vaccineName: 'Hepatitis B (Birth Dose)',
            ageInDays: 0,
            ageLabel: 'At Birth (≤24 hrs)',
            description: 'Hepatitis B - Intramuscular | Preferably within 24 hours',
            dueDate: '2025-12-15',
            status: 'completed',
            completedAt: '2025-12-15',
            category: 'birth'
        },
        {
            id: '3',
            vaccineName: 'OPV-0 (Zero Dose)',
            ageInDays: 0,
            ageLabel: 'At Birth (≤15 days)',
            description: 'Polio - Oral | Within 15 days of birth',
            dueDate: '2025-12-15',
            status: 'completed',
            completedAt: '2025-12-16',
            category: 'birth'
        },

        // 6 Weeks
        {
            id: '4',
            vaccineName: 'OPV-1',
            ageInDays: 42,
            ageLabel: '6 Weeks',
            description: 'Polio - Oral (Dose 2)',
            dueDate: '2026-01-26',
            status: 'pending',
            category: '6-weeks'
        },
        {
            id: '5',
            vaccineName: 'Pentavalent-1',
            ageInDays: 42,
            ageLabel: '6 Weeks',
            description: 'DPT + Hepatitis B + Hib - Intramuscular (Dose 1)',
            dueDate: '2026-01-26',
            status: 'pending',
            category: '6-weeks'
        },
        {
            id: '6',
            vaccineName: 'Rotavirus-1',
            ageInDays: 42,
            ageLabel: '6 Weeks',
            description: 'Diarrhea prevention - Oral (Dose 1)',
            dueDate: '2026-01-26',
            status: 'pending',
            category: '6-weeks'
        },
        {
            id: '7',
            vaccineName: 'IPV-1 (Fractional)',
            ageInDays: 42,
            ageLabel: '6 Weeks',
            description: 'Inactivated Polio Vaccine - Intramuscular fractional dose (Dose 1)',
            dueDate: '2026-01-26',
            status: 'pending',
            category: '6-weeks'
        },

        // 10 Weeks
        {
            id: '8',
            vaccineName: 'OPV-2',
            ageInDays: 70,
            ageLabel: '10 Weeks',
            description: 'Polio - Oral (Dose 3)',
            dueDate: '2026-02-23',
            status: 'upcoming',
            category: '10-weeks'
        },
        {
            id: '9',
            vaccineName: 'Pentavalent-2',
            ageInDays: 70,
            ageLabel: '10 Weeks',
            description: 'DPT + Hepatitis B + Hib - Intramuscular (Dose 2)',
            dueDate: '2026-02-23',
            status: 'upcoming',
            category: '10-weeks'
        },
        {
            id: '10',
            vaccineName: 'Rotavirus-2',
            ageInDays: 70,
            ageLabel: '10 Weeks',
            description: 'Diarrhea prevention - Oral (Dose 2)',
            dueDate: '2026-02-23',
            status: 'upcoming',
            category: '10-weeks'
        },

        // 14 Weeks
        {
            id: '11',
            vaccineName: 'OPV-3',
            ageInDays: 98,
            ageLabel: '14 Weeks',
            description: 'Polio - Oral (Dose 4)',
            dueDate: '2026-03-23',
            status: 'upcoming',
            category: '14-weeks'
        },
        {
            id: '12',
            vaccineName: 'Pentavalent-3',
            ageInDays: 98,
            ageLabel: '14 Weeks',
            description: 'DPT + Hepatitis B + Hib - Intramuscular (Dose 3)',
            dueDate: '2026-03-23',
            status: 'upcoming',
            category: '14-weeks'
        },
        {
            id: '13',
            vaccineName: 'Rotavirus-3',
            ageInDays: 98,
            ageLabel: '14 Weeks',
            description: 'Diarrhea prevention - Oral (Dose 3)',
            dueDate: '2026-03-23',
            status: 'upcoming',
            category: '14-weeks'
        },
        {
            id: '14',
            vaccineName: 'IPV-2 (Fractional)',
            ageInDays: 98,
            ageLabel: '14 Weeks',
            description: 'Inactivated Polio Vaccine - Intramuscular fractional dose (Dose 2)',
            dueDate: '2026-03-23',
            status: 'upcoming',
            category: '14-weeks'
        },

        // 9-12 Months
        {
            id: '15',
            vaccineName: 'MR-1 (Measles-Rubella)',
            ageInDays: 270,
            ageLabel: '9-12 Months',
            description: 'Measles + Rubella - Subcutaneous (Dose 1)',
            dueDate: '2026-09-12',
            status: 'upcoming',
            category: '9-12-months'
        },
        {
            id: '16',
            vaccineName: 'JE-1 (Japanese Encephalitis)',
            ageInDays: 270,
            ageLabel: '9-12 Months',
            description: 'Japanese Encephalitis - Subcutaneous (Dose 1) | Endemic areas only',
            dueDate: '2026-09-12',
            status: 'upcoming',
            category: '9-12-months'
        },
        {
            id: '17',
            vaccineName: 'Vitamin A (1st Dose)',
            ageInDays: 270,
            ageLabel: '9 Months',
            description: 'Vitamin A Deficiency prevention - Oral | 1 lakh IU',
            dueDate: '2026-09-12',
            status: 'upcoming',
            category: '9-12-months'
        },

        // 16-24 Months
        {
            id: '18',
            vaccineName: 'MR-2 (Measles-Rubella)',
            ageInDays: 547,
            ageLabel: '16-24 Months',
            description: 'Measles + Rubella - Subcutaneous (Dose 2)',
            dueDate: '2027-06-15',
            status: 'upcoming',
            category: '16-24-months'
        },
        {
            id: '19',
            vaccineName: 'JE-2 (Japanese Encephalitis)',
            ageInDays: 547,
            ageLabel: '16-24 Months',
            description: 'Japanese Encephalitis - Subcutaneous (Dose 2) | Endemic areas only',
            dueDate: '2027-06-15',
            status: 'upcoming',
            category: '16-24-months'
        },
        {
            id: '20',
            vaccineName: 'OPV Booster',
            ageInDays: 547,
            ageLabel: '16-24 Months',
            description: 'Polio booster - Oral',
            dueDate: '2027-06-15',
            status: 'upcoming',
            category: '16-24-months'
        },
        {
            id: '21',
            vaccineName: 'DPT Booster-1',
            ageInDays: 547,
            ageLabel: '16-24 Months',
            description: 'Diphtheria + Pertussis + Tetanus booster - Intramuscular',
            dueDate: '2027-06-15',
            status: 'upcoming',
            category: '16-24-months'
        },

        // 5-6 Years
        {
            id: '22',
            vaccineName: 'DPT Booster-2',
            ageInDays: 1825,
            ageLabel: '5-6 Years',
            description: 'Diphtheria + Pertussis + Tetanus second booster - Intramuscular',
            dueDate: '2030-12-15',
            status: 'upcoming',
            category: '5-6-years'
        },

        // 10 Years
        {
            id: '23',
            vaccineName: 'TT (Tetanus Toxoid)',
            ageInDays: 3650,
            ageLabel: '10 Years',
            description: 'Tetanus protection - Intramuscular (Dose 1)',
            dueDate: '2035-12-15',
            status: 'upcoming',
            category: '10-years'
        },

        // 16 Years
        {
            id: '24',
            vaccineName: 'TT (Tetanus Toxoid)',
            ageInDays: 5840,
            ageLabel: '16 Years',
            description: 'Tetanus protection - Intramuscular (Dose 2)',
            dueDate: '2041-12-15',
            status: 'upcoming',
            category: '16-years'
        }
    ]);

    // Check pregnancy status on component mount
    useEffect(() => {
        checkPregnancyStatus();
    }, []);

    const checkPregnancyStatus = async () => {
        try {
            setPregnancyStatusLoading(true);
            const response = await maternityAPI.getPregnancyStatus();
            const pregnancyStatus = response.user?.maternalHealth?.pregnancyStatus;
            setIsPregnant(pregnancyStatus === 'pregnant');
        } catch (e) {
            console.error('Failed to check pregnancy status:', e);
            setIsPregnant(false); // Default to allowing access if check fails
        } finally {
            setPregnancyStatusLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle size={20} color="#16a34a" />;
            case 'pending':
                return <Clock size={20} color="#f59e0b" />;
            case 'overdue':
                return <AlertCircle size={20} color="#dc2626" />;
            case 'upcoming':
                return <Calendar size={20} color="#6b7280" />;
            default:
                return <Clock size={20} color="#6b7280" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return { bg: '#f0fdf4', border: '#86efac', text: '#166534' };
            case 'pending':
                return { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' };
            case 'overdue':
                return { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' };
            case 'upcoming':
                return { bg: '#f9fafb', border: '#d1d5db', text: '#374151' };
            default:
                return { bg: '#f9fafb', border: '#d1d5db', text: '#374151' };
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const calculateDaysUntil = (dateString: string) => {
        const dueDate = new Date(dateString);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const completedCount = milestones.filter(m => m.status === 'completed').length;
    const totalCount = milestones.length;
    const completionPercentage = Math.round((completedCount / totalCount) * 100);

    // Group milestones by category
    const groupedMilestones = milestones.reduce((acc, milestone) => {
        if (!acc[milestone.category]) {
            acc[milestone.category] = [];
        }
        acc[milestone.category].push(milestone);
        return acc;
    }, {} as Record<string, VaccinationMilestone[]>);

    return (
        <MaternityLayout title="Vaccination Milestones">
            <div>
                {/* Pregnancy Lock UI */}
                {pregnancyStatusLoading ? (
                    <div className="card">
                        <div className="card-content">
                            <p style={{ textAlign: 'center', padding: '2rem' }}>Checking eligibility...</p>
                        </div>
                    </div>
                ) : isPregnant ? (
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
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: '#fef3c7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                    border: '3px solid #fbbf24'
                                }}>
                                    <Lock size={40} color="#f59e0b" />
                                </div>

                                <h3 style={{ color: '#92400e', marginBottom: '1rem', fontSize: '1.5rem' }}>
                                    Vaccination Milestones Currently Locked
                                </h3>

                                <p style={{ color: '#78350f', marginBottom: '1.5rem', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
                                    Vaccination milestone tracking is available after your baby is born. This ensures we can properly monitor your child's immunization progress based on their actual birth date.
                                </p>

                                <div style={{
                                    background: 'white',
                                    padding: '1.5rem',
                                    borderRadius: '0.75rem',
                                    maxWidth: '500px',
                                    margin: '0 auto',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', justifyContent: 'center' }}>
                                        <Baby size={24} color="#16a34a" />
                                        <h4 style={{ margin: 0, color: '#166534', fontSize: '1.1rem' }}>After Birth is Recorded</h4>
                                    </div>
                                    <ul style={{
                                        textAlign: 'left',
                                        color: '#4b5563',
                                        lineHeight: '1.8',
                                        paddingLeft: '1.5rem',
                                        margin: 0
                                    }}>
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
                ) : (
                    <>
                        {/* Child Information Card */}
                        <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)', border: '2px solid #93c5fd' }}>
                            <div className="card-content" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '3px solid white',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        <Baby size={40} color="white" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: '700', color: '#1e3a8a' }}>
                                            {childInfo.name}
                                        </h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: '#1e40af' }}>
                                            <div><strong>Date of Birth:</strong> {formatDate(childInfo.dateOfBirth)}</div>
                                            <div><strong>Gender:</strong> {childInfo.gender}</div>
                                            <div><strong>Weight:</strong> {childInfo.weight}g</div>
                                            <div><strong>Height:</strong> {childInfo.height}cm</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div style={{ marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e3a8a' }}>
                                            Vaccination Progress
                                        </span>
                                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e3a8a' }}>
                                            {completedCount} / {totalCount} ({completionPercentage}%)
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '20px',
                                        backgroundColor: 'white',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        border: '2px solid #93c5fd'
                                    }}>
                                        <div style={{
                                            width: `${completionPercentage}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                                            transition: 'width 0.3s ease'
                                        }} />
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
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#166534' }}>
                                            {completedCount}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#166534' }}>Completed</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb' }}>
                                <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Clock size={32} color="#f59e0b" />
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#92400e' }}>
                                            {milestones.filter(m => m.status === 'pending').length}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>Pending</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ borderLeft: '4px solid #6b7280', backgroundColor: '#f9fafb' }}>
                                <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Calendar size={32} color="#6b7280" />
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#374151' }}>
                                            {milestones.filter(m => m.status === 'upcoming').length}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151' }}>Upcoming</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ borderLeft: '4px solid #8b5cf6', backgroundColor: '#faf5ff' }}>
                                <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Award size={32} color="#8b5cf6" />
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#6b21a8' }}>
                                            {completionPercentage}%
                                        </h3>
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
                                    Vaccination Timeline - Indian Immunization Program
                                </h2>
                            </div>
                            <div className="card-content">
                                {Object.entries(groupedMilestones).map(([category, categoryMilestones]) => (
                                    <div key={category} style={{ marginBottom: '2rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '1rem',
                                            paddingBottom: '0.5rem',
                                            borderBottom: '2px solid #e5e7eb'
                                        }}>
                                            <Calendar size={20} color="#db2777" />
                                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', textTransform: 'capitalize' }}>
                                                {categoryMilestones[0].ageLabel}
                                            </h3>
                                            <span style={{
                                                marginLeft: 'auto',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                backgroundColor: '#ede9fe',
                                                color: '#6b21a8'
                                            }}>
                                                {categoryMilestones.length} vaccine{categoryMilestones.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            {categoryMilestones.map((milestone) => {
                                                const colors = getStatusColor(milestone.status);
                                                const daysUntil = calculateDaysUntil(milestone.dueDate);

                                                return (
                                                    <div
                                                        key={milestone.id}
                                                        style={{
                                                            backgroundColor: colors.bg,
                                                            border: `2px solid ${colors.border}`,
                                                            borderRadius: '0.75rem',
                                                            padding: '1.25rem',
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: '1rem',
                                                            transition: 'all 0.2s ease',
                                                            cursor: 'pointer'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                            border: `2px solid ${colors.border}`
                                                        }}>
                                                            {getStatusIcon(milestone.status)}
                                                        </div>

                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                                <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: colors.text }}>
                                                                    {milestone.vaccineName}
                                                                </h4>
                                                                <span style={{
                                                                    padding: '0.25rem 0.75rem',
                                                                    borderRadius: '0.375rem',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: '600',
                                                                    backgroundColor: 'white',
                                                                    color: colors.text,
                                                                    textTransform: 'capitalize',
                                                                    border: `1px solid ${colors.border}`
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
                                                                {milestone.status === 'pending' && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: daysUntil < 0 ? '#dc2626' : '#f59e0b' }}>
                                                                        <Clock size={16} />
                                                                        {daysUntil < 0 ? (
                                                                            <span><strong>Overdue by {Math.abs(daysUntil)} days</strong></span>
                                                                        ) : daysUntil === 0 ? (
                                                                            <span><strong>Due today!</strong></span>
                                                                        ) : (
                                                                            <span><strong>In {daysUntil} days</strong></span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {milestone.completedAt && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a' }}>
                                                                        <CheckCircle size={16} />
                                                                        <strong>Completed:</strong> {formatDate(milestone.completedAt)}
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
