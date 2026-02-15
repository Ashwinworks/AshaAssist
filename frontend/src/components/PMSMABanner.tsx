import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { governmentBenefitsAPI } from '../services/api';
import PMSMAApplicationForm from './PMSMAApplicationForm';
import './PMSMABanner.css';
import toast from 'react-hot-toast';

interface Installment {
    installmentNumber: number;
    amount: number;
    eligibilityDate: string | null;
    status: 'locked' | 'eligible' | 'eligible_to_apply' | 'application_submitted' | 'paid';
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
    paymentDetails?: {
        accountHolderName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
    } | null;
}

const PMSMABanner: React.FC = () => {
    const { t } = useTranslation();
    const [benefits, setBenefits] = useState<PMSMABenefits | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBenefits();

        // Refresh when window/tab becomes visible again
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

    const handleApplyClick = (installmentNumber: number) => {
        setSelectedInstallment(installmentNumber);
        setShowDetails(false); // Close details modal first
        setShowApplicationForm(true);
    };

    const handleApplicationSuccess = () => {
        toast.success(t('pmsma.applicationSubmitted'));
        fetchBenefits(); // Refresh to show updated status
    };

    if (loading) {
        return (
            <div className="pmsma-banner loading">
                <div className="loading-spinner"></div>
                <p>{t('pmsma.loading')}</p>
            </div>
        );
    }

    if (!benefits) {
        // Show setup message if benefits not initialized
        return (
            <div className="pmsma-banner" style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', color: '#374151', cursor: 'default' }}>
                <div className="pmsma-banner-icon">🏛️</div>
                <div className="pmsma-banner-content">
                    <h3 style={{ color: '#1f2937' }}>{t('pmsma.title')}</h3>
                    <p className="pmsma-banner-subtitle" style={{ color: '#6b7280' }}>{t('pmsma.subtitle')}</p>
                    <p style={{ margin: '12px 0', color: '#6b7280', fontSize: '14px' }}>
                        {t('pmsma.setupMessage')}
                    </p>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '8px' }}
                        onClick={() => window.location.href = '/maternity/profile'}
                    >
                        {t('pmsma.setupButton')}
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
            case 'eligible_to_apply':
                return '⭐';
            case 'application_submitted':
                return '📝';
            case 'locked':
                return '🔒';
            default:
                return '○';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid':
                return t('pmsma.statusPaid');
            case 'eligible':
            case 'eligible_to_apply':
                return t('pmsma.statusEligibleToApply');
            case 'application_submitted':
                return t('pmsma.statusApplicationSubmitted');
            case 'locked':
                return t('pmsma.statusLocked');
            default:
                return 'UNKNOWN';
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'paid':
                return 'status-paid';
            case 'eligible':
            case 'eligible_to_apply':
                return 'status-eligible-apply';
            case 'application_submitted':
                return 'status-submitted';
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

    const completedCount = benefits.installments.filter(i => i.status !== 'locked').length;

    return (
        <>
            <div className="pmsma-banner" onClick={() => setShowDetails(true)}>
                <div className="pmsma-banner-icon">🏛️</div>
                <div className="pmsma-banner-content">
                    <h3>{t('pmsma.programName')}</h3>
                    <p className="pmsma-banner-subtitle">{t('pmsma.programShort')}</p>
                    <div className="pmsma-progress-bar">
                        <div className="pmsma-progress-indicators">
                            {benefits.installments.map((inst) => (
                                <div
                                    key={inst.installmentNumber}
                                    className={`pmsma-progress-dot ${inst.status !== 'locked' ? 'completed' : ''}`}
                                >
                                    {getStatusIcon(inst.status)}
                                </div>
                            ))}
                        </div>
                        <p className="pmsma-progress-text">
                            {completedCount}/3 {t('pmsma.progress')}
                        </p>
                    </div>
                    <div className="pmsma-amounts">
                        <div className="pmsma-amount">
                            <span className="amount-label">{t('pmsma.totalEligible')}</span>
                            <span className="amount-value">₹{benefits.totalEligible.toLocaleString()}</span>
                        </div>
                        <div className="pmsma-amount">
                            <span className="amount-label">{t('pmsma.totalPaid')}</span>
                            <span className="amount-value paid">₹{benefits.totalPaid.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className="pmsma-banner-arrow">
                    <span>{t('pmsma.viewDetails')} →</span>
                </div>
            </div>

            {/* Details Modal */}
            {showDetails && (
                <div className="pmsma-modal-overlay" onClick={() => setShowDetails(false)}>
                    <div className="pmsma-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="pmsma-modal-header">
                            <h2>{t('pmsma.programName')}</h2>
                            <button className="pmsma-close-btn" onClick={() => setShowDetails(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="pmsma-modal-body">
                            <div className="pmsma-summary">
                                <div className="pmsma-summary-card">
                                    <span className="summary-label">{t('pmsma.totalProgramAmount')}</span>
                                    <span className="summary-value">₹{benefits.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="pmsma-summary-card">
                                    <span className="summary-label">{t('pmsma.totalEligible')}</span>
                                    <span className="summary-value eligible">₹{benefits.totalEligible.toLocaleString()}</span>
                                </div>
                                <div className="pmsma-summary-card">
                                    <span className="summary-label">{t('pmsma.totalPaid')}</span>
                                    <span className="summary-value paid">₹{benefits.totalPaid.toLocaleString()}</span>
                                </div>
                            </div>

                            <h3 className="installments-title">{t('pmsma.installmentDetails')}</h3>
                            <div className="pmsma-installments">
                                {benefits.installments.map((inst) => (
                                    <div key={inst.installmentNumber} className={`pmsma-installment-card ${getStatusClass(inst.status)}`}>
                                        <div className="installment-header">
                                            <div className="installment-title">
                                                <span className="installment-icon">{getStatusIcon(inst.status)}</span>
                                                <h4>{t('pmsma.installment')} {inst.installmentNumber}</h4>
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
                                            <strong>{t('pmsma.eligibilityCriteria')}</strong>
                                            <p>{getCriteriaText(inst.eligibilityCriteria)}</p>
                                        </div>

                                        {/* Apply Button for eligible_to_apply status (or legacy eligible status) */}
                                        {(inst.status === 'eligible_to_apply' || inst.status === 'eligible') && (
                                            <div className="installment-action">
                                                <button
                                                    className="btn-apply"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleApplyClick(inst.installmentNumber);
                                                    }}
                                                >
                                                    {t('pmsma.applyNow')}
                                                </button>
                                            </div>
                                        )}

                                        {/* Under Review status */}
                                        {inst.status === 'application_submitted' && (
                                            <div className="installment-pending">
                                                <p className="pending-note">
                                                    📝 {t('pmsma.underReview')}
                                                </p>
                                            </div>
                                        )}

                                        {/* Paid status */}
                                        {inst.paidDate && (
                                            <div className="installment-details">
                                                <p>
                                                    <strong>{t('pmsma.paidOn')}</strong> {new Date(inst.paidDate).toLocaleDateString()}
                                                </p>
                                                {inst.transactionId && (
                                                    <p>
                                                        <strong>{t('pmsma.transactionId')}</strong> {inst.transactionId}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Locked status */}
                                        {inst.status === 'locked' && (
                                            <div className="installment-locked">
                                                <p className="locked-note">
                                                    🔒 {t('pmsma.lockedMessage')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="pmsma-info">
                                <h4>{t('pmsma.aboutTitle')}</h4>
                                <p>
                                    {t('pmsma.aboutDescription')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Application Form Modal */}
            {showApplicationForm && selectedInstallment && (
                <PMSMAApplicationForm
                    installmentNumber={selectedInstallment}
                    onClose={() => {
                        setShowApplicationForm(false);
                        setSelectedInstallment(null);
                    }}
                    onSuccess={handleApplicationSuccess}
                    paymentDetails={benefits.paymentDetails || null}
                />
            )}
        </>
    );
};

export default PMSMABanner;
