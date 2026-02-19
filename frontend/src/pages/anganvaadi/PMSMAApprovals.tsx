import React, { useState, useEffect } from 'react';
import AnganvaadiLayout from './AnganvaadiLayout';
import { governmentBenefitsAPI } from '../../services/api';
import { User, CreditCard, CheckCircle, Clock, FileText, ChevronDown, ChevronUp, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface PendingApplication {
    userId: string;
    motherName: string;
    email: string;
    phone: string;
    installmentNumber: number;
    amount: number;
    submittedDate: string;
    paymentDetails: {
        accountHolderName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
    };
}

const PMSMAApprovals: React.FC = () => {
    const [applications, setApplications] = useState<PendingApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState<PendingApplication | null>(null);
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        fetchPendingApplications();
    }, []);

    const fetchPendingApplications = async () => {
        try {
            setLoading(true);
            const response = await governmentBenefitsAPI.getPendingApplications();
            setApplications(response.applications || []);
        } catch (error) {
            console.error('Failed to fetch pending applications:', error);
            toast.error('Failed to load pending applications');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string, installmentNumber: number) => {
        const key = `${userId}-${installmentNumber}`;
        try {
            setActionLoading(key);
            await governmentBenefitsAPI.approveApplication(userId, installmentNumber);
            toast.success('Application approved successfully!');
            fetchPendingApplications();
        } catch (error: any) {
            console.error('Failed to approve application:', error);
            toast.error(error.response?.data?.error || 'Failed to approve application');
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkAsPaid = (app: PendingApplication) => {
        setSelectedApp(app);
        setShowPaymentModal(true);
        setTransactionId('');
    };

    const submitPayment = async () => {
        if (!selectedApp || !transactionId.trim()) {
            toast.error('Please enter transaction ID');
            return;
        }
        try {
            setActionLoading('payment');
            await governmentBenefitsAPI.markInstallmentPaid(
                selectedApp.userId,
                selectedApp.installmentNumber,
                transactionId
            );
            toast.success('Marked as paid successfully!');
            setShowPaymentModal(false);
            setSelectedApp(null);
            setTransactionId('');
            fetchPendingApplications();
        } catch (error: any) {
            console.error('Failed to mark as paid:', error);
            toast.error(error.response?.data?.error || 'Failed to mark as paid');
        } finally {
            setActionLoading(null);
        }
    };

    const toggleExpand = (key: string) => {
        setExpandedCard(expandedCard === key ? null : key);
    };

    if (loading) {
        return (
            <AnganvaadiLayout title="PMSMA Approvals">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>Loading applications...</p>
                </div>
            </AnganvaadiLayout>
        );
    }

    return (
        <AnganvaadiLayout title="PMSMA Approvals">
            <div>
                {/* Summary Banner */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2rem',
                    padding: '1.25rem 1.5rem',
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    borderLeft: '4px solid var(--green-600)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText size={22} style={{ color: 'var(--green-600)' }} />
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-500)' }}>Pending Applications</p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--gray-900)' }}>{applications.length}</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchPendingApplications}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'none',
                            border: '1px solid var(--gray-300)',
                            borderRadius: '0.5rem',
                            color: 'var(--gray-600)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }}
                    >
                        Refresh
                    </button>
                </div>

                {applications.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <CheckCircle size={48} style={{ color: 'var(--green-400)', marginBottom: '1rem' }} />
                        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--gray-800)', fontSize: '1.25rem', fontWeight: '600' }}>
                            All Caught Up!
                        </h3>
                        <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                            There are no pending PMSMA applications to review.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {applications.map((app) => {
                            const key = `${app.userId}-${app.installmentNumber}`;
                            const isExpanded = expandedCard === key;
                            const isLoading = actionLoading === key;

                            return (
                                <div key={key} className="card" style={{
                                    overflow: 'hidden',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.75rem'
                                }}>
                                    {/* Row Header – always visible */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '1.25rem 1.5rem',
                                            cursor: 'pointer',
                                            gap: '1rem'
                                        }}
                                        onClick={() => toggleExpand(key)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                backgroundColor: 'var(--green-100)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <User size={20} style={{ color: 'var(--green-700)' }} />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ margin: 0, fontWeight: '600', color: 'var(--gray-900)', fontSize: '1rem' }}>
                                                    {app.motherName}
                                                </p>
                                                <p style={{ margin: '0.125rem 0 0', color: 'var(--gray-500)', fontSize: '0.8rem' }}>
                                                    {app.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                                            <span style={{
                                                fontSize: '0.75rem', fontWeight: '600',
                                                padding: '0.25rem 0.75rem', borderRadius: '1rem',
                                                backgroundColor: 'var(--blue-50)', color: 'var(--blue-700)'
                                            }}>
                                                Installment {app.installmentNumber}
                                            </span>
                                            <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--gray-900)' }}>
                                                ₹{app.amount.toLocaleString()}
                                            </span>
                                            {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--gray-400)' }} /> : <ChevronDown size={18} style={{ color: 'var(--gray-400)' }} />}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div style={{ borderTop: '1px solid #e5e7eb' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1.5rem' }}>
                                                {/* Contact Info */}
                                                <div>
                                                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        Contact Information
                                                    </p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-700)' }}><strong>Email:</strong> {app.email}</p>
                                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-700)' }}><strong>Phone:</strong> {app.phone}</p>
                                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                                            <strong>Submitted:</strong> {new Date(app.submittedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Bank Details */}
                                                <div>
                                                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        Bank Details
                                                    </p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-700)' }}><strong>Account Holder:</strong> {app.paymentDetails.accountHolderName}</p>
                                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-700)' }}><strong>Account No:</strong> {app.paymentDetails.accountNumber}</p>
                                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-700)' }}><strong>IFSC:</strong> {app.paymentDetails.ifscCode}</p>
                                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-700)' }}><strong>Bank:</strong> {app.paymentDetails.bankName}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div style={{
                                                padding: '1rem 1.5rem',
                                                backgroundColor: 'var(--gray-50)',
                                                borderTop: '1px solid #e5e7eb',
                                                display: 'flex',
                                                gap: '0.75rem',
                                                justifyContent: 'flex-end'
                                            }}>
                                                <button
                                                    onClick={() => handleApprove(app.userId, app.installmentNumber)}
                                                    disabled={isLoading}
                                                    style={{
                                                        padding: '0.6rem 1.5rem',
                                                        backgroundColor: 'var(--green-600)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '600',
                                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                                        opacity: isLoading ? 0.6 : 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <CheckCircle size={16} />
                                                    {isLoading ? 'Approving...' : 'Approve'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Payment Modal */}
                {showPaymentModal && selectedApp && (
                    <div style={{
                        position: 'fixed', inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2000, padding: '1rem'
                    }} onClick={() => setShowPaymentModal(false)}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            maxWidth: '460px',
                            width: '100%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                        }} onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div style={{
                                padding: '1.25rem 1.5rem',
                                borderBottom: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-900)' }}>
                                    Confirm Payment
                                </h3>
                                <button onClick={() => setShowPaymentModal(false)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--gray-400)', padding: '0.25rem'
                                }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{
                                    backgroundColor: 'var(--gray-50)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    marginBottom: '1.25rem'
                                }}>
                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                        <strong>Mother:</strong> {selectedApp.motherName}
                                    </p>
                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                        <strong>Installment:</strong> {selectedApp.installmentNumber}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                        <strong>Amount:</strong> ₹{selectedApp.amount.toLocaleString()}
                                    </p>
                                </div>

                                <label style={{
                                    display: 'block', marginBottom: '0.5rem',
                                    fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)'
                                }}>
                                    Transaction ID <span style={{ color: 'var(--red-500)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter transaction ID"
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.75rem',
                                        border: '1px solid var(--gray-300)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        boxSizing: 'border-box',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = 'var(--green-500)'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'var(--gray-300)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>

                            {/* Modal Footer */}
                            <div style={{
                                padding: '1rem 1.5rem',
                                borderTop: '1px solid #e5e7eb',
                                display: 'flex',
                                gap: '0.75rem',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    style={{
                                        padding: '0.6rem 1.25rem',
                                        backgroundColor: 'white',
                                        border: '1px solid var(--gray-300)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: 'var(--gray-600)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitPayment}
                                    disabled={actionLoading === 'payment' || !transactionId.trim()}
                                    style={{
                                        padding: '0.6rem 1.25rem',
                                        backgroundColor: 'var(--green-600)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: actionLoading === 'payment' || !transactionId.trim() ? 'not-allowed' : 'pointer',
                                        opacity: actionLoading === 'payment' || !transactionId.trim() ? 0.6 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <CreditCard size={16} />
                                    {actionLoading === 'payment' ? 'Processing...' : 'Confirm Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AnganvaadiLayout>
    );
};

export default PMSMAApprovals;
