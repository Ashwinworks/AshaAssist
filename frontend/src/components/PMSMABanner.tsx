import React, { useState, useEffect } from 'react';
import { governmentBenefitsAPI } from '../services/api';
import './PMSMABanner.css';

interface Installment {
    installmentNumber: number;
    amount: number;
    eligibilityDate: string | null;
    status: 'locked' | 'eligible' | 'paid';
    paidDate: string | null;
    transactionId: string | null;
    eligibilityCriteria: string;
    description: string;
}

interface PMSMABenefits {
    installments: Installment[];
    totalAmount: number;
    totalEligible: number;
    totalPaid: number;
    progress: string;
    programName: string;
    programShortName: string;
    createdAt: string;
}

const PMSMABanner: React.FC = () => {
    const [benefits, setBenefits] = useState<PMSMABenefits | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBenefits();

        // Refresh when window/tab becomes visible again (e.g., after saving profile in another component)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchBenefits();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const fetchBenefits = async () => {
        try {
            setLoading(true);
            const response = await governmentBenefitsAPI.getPMSMASummary();
            if (response.hasBenefits && response.benefits) {
                setBenefits(response.benefits);
            } else {
                setBenefits(null);
            }
        } catch (error) {
            console.error('Failed to fetch PMSMA benefits:', error);
            setBenefits(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="pmsma-banner loading">
                <div className="loading-spinner"></div>
                <p>Loading government benefits...</p>
            </div>
        );
    }

    if (!benefits) {
        // Show setup message if benefits not initialized
        return (
            <div className="pmsma-banner" style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', color: '#374151', cursor: 'default' }}>
                <div className="pmsma-banner-icon">🏛️</div>
                <div className="pmsma-banner-content">
                    <h3 style={{ color: '#1f2937' }}>PMSMA Government Benefits</h3>
                    <p className="pmsma-banner-subtitle" style={{ color: '#6b7280' }}>Financial assistance program</p>
                    <p style={{ margin: '12px 0', color: '#6b7280', fontSize: '14px' }}>
                        Complete your profile setup with LMP (Last Menstrual Period) to unlock government benefit tracking.
                    </p>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '8px' }}
                        onClick={() => window.location.href = '/maternity/profile'}
                    >
                        Set Up Profile
                    </button>
                </div>
            </div>
        );
    }


    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return '✅';
            case 'eligible':
                return '⭐';
            case 'locked':
                return '🔒';
            default:
                return '○';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid':
                return 'PAID';
            case 'eligible':
                return 'ELIGIBLE';
            case 'locked':
                return 'LOCKED';
            default:
                return 'UNKNOWN';
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'paid':
                return 'status-paid';
            case 'eligible':
                return 'status-eligible';
            case 'locked':
                return 'status-locked';
            default:
                return '';
        }
    };

    const getCriteriaText = (criteria: string) => {
        switch (criteria) {
            case 'pregnancy_registration_within_3_months':
                return 'Register pregnancy within first 3 months';
            case 'anc_visit_recorded':
                return 'Complete at least one ANC visit';
            case 'birth_recorded':
                return 'Record birth in the system';
            default:
                return criteria;
        }
    };

    const completedCount = benefits.installments.filter(i => i.status === 'eligible' || i.status === 'paid').length;

    return (
        <>
            <div className="pmsma-banner" onClick={() => setShowDetails(true)}>
                <div className="pmsma-banner-icon">🏛️</div>
                <div className="pmsma-banner-content">
                    <h3>{benefits.programName}</h3>
                    <p className="pmsma-banner-subtitle">{benefits.programShortName}</p>
                    <div className="pmsma-progress-bar">
                        <div className="pmsma-progress-indicators">
                            {benefits.installments.map((inst, idx) => (
                                <div
                                    key={inst.installmentNumber}
                                    className={`pmsma-progress-dot ${inst.status !== 'locked' ? 'completed' : ''}`}
                                >
                                    {getStatusIcon(inst.status)}
                                </div>
                            ))}
                        </div>
                        <p className="pmsma-progress-text">
                            {completedCount}/3 Installments Unlocked
                        </p>
                    </div>
                    <div className="pmsma-amounts">
                        <div className="pmsma-amount">
                            <span className="amount-label">Total Eligible</span>
                            <span className="amount-value">₹{benefits.totalEligible.toLocaleString()}</span>
                        </div>
                        <div className="pmsma-amount">
                            <span className="amount-label">Total Paid</span>
                            <span className="amount-value paid">₹{benefits.totalPaid.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className="pmsma-banner-arrow">
                    <span>View Details →</span>
                </div>
            </div>

            {/* Details Modal */}
            {showDetails && (
                <div className="pmsma-modal-overlay" onClick={() => setShowDetails(false)}>
                    <div className="pmsma-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="pmsma-modal-header">
                            <h2>{benefits.programName}</h2>
                            <button className="pmsma-close-btn" onClick={() => setShowDetails(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="pmsma-modal-body">
                            <div className="pmsma-summary">
                                <div className="pmsma-summary-card">
                                    <span className="summary-label">Total Program Amount</span>
                                    <span className="summary-value">₹{benefits.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="pmsma-summary-card">
                                    <span className="summary-label">Total Eligible</span>
                                    <span className="summary-value eligible">₹{benefits.totalEligible.toLocaleString()}</span>
                                </div>
                                <div className="pmsma-summary-card">
                                    <span className="summary-label">Total Paid</span>
                                    <span className="summary-value paid">₹{benefits.totalPaid.toLocaleString()}</span>
                                </div>
                            </div>

                            <h3 className="installments-title">Installment Details</h3>
                            <div className="pmsma-installments">
                                {benefits.installments.map((inst) => (
                                    <div key={inst.installmentNumber} className={`pmsma-installment-card ${getStatusClass(inst.status)}`}>
                                        <div className="installment-header">
                                            <div className="installment-title">
                                                <span className="installment-icon">{getStatusIcon(inst.status)}</span>
                                                <h4>Installment {inst.installmentNumber}</h4>
                                            </div>
                                            <div className="installment-amount">₹{inst.amount.toLocaleString()}</div>
                                        </div>
                                        <p className="installment-description">{inst.description}</p>
                                        <div className="installment-status-badge">
                                            <span className={`status-badge ${getStatusClass(inst.status)}`}>
                                                {getStatusText(inst.status)}
                                            </span>
                                        </div>
                                        <div className="installment-criteria">
                                            <strong>Eligibility Criteria:</strong>
                                            <p>{getCriteriaText(inst.eligibilityCriteria)}</p>
                                        </div>
                                        {inst.status === 'eligible' && !inst.paidDate && (
                                            <div className="installment-action">
                                                <p className="action-note">
                                                    ✓ You are eligible for this installment. Your ASHA worker will process the payment.
                                                </p>
                                            </div>
                                        )}
                                        {inst.paidDate && (
                                            <div className="installment-details">
                                                <p>
                                                    <strong>Paid on:</strong> {new Date(inst.paidDate).toLocaleDateString()}
                                                </p>
                                                {inst.transactionId && (
                                                    <p>
                                                        <strong>Transaction ID:</strong> {inst.transactionId}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {inst.status === 'locked' && (
                                            <div className="installment-locked">
                                                <p className="locked-note">
                                                    🔒 Complete the required action to unlock this installment.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="pmsma-info">
                                <h4>About PMSMA</h4>
                                <p>
                                    The Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA) is a government initiative that provides
                                    financial assistance to pregnant women in three installments based on health milestones. This
                                    program ensures mothers receive timely financial support linked to proper maternal healthcare practices.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PMSMABanner;
