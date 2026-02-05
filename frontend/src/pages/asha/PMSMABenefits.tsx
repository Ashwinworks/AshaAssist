import React, { useState, useEffect } from 'react';
import AshaLayout from './AshaLayout';
import { governmentBenefitsAPI, maternityAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { DollarSign, User, CheckCircle, Clock, Lock, Search } from 'lucide-react';

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
}

interface Mother {
    id: string;
    name: string;
    phone: string;
    lmp?: string;
    edd?: string;
    benefits?: PMSMABenefits;
}

const PMSMABenefits: React.FC = () => {
    const [mothers, setMothers] = useState<Mother[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMother, setSelectedMother] = useState<Mother | null>(null);
    const [paymentModal, setPaymentModal] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        fetchMothersWithBenefits();
    }, []);

    const fetchMothersWithBenefits = async () => {
        try {
            setLoading(true);
            // Fetch users directly from the users collection via our new API
            const response = await governmentBenefitsAPI.getAllMaternityUsers();
            const allMothers = response.mothers || [];

            // Filter to find mothers who have PMSMA benefits initialized
            const mothersWithBenefitsData = await Promise.all(
                allMothers.map(async (mother: any) => {
                    if (!mother.hasPMSMA) return null;

                    try {
                        const benefitsResponse = await governmentBenefitsAPI.getUserPMSMASummary(mother.id);
                        return {
                            id: mother.id,
                            name: mother.name,
                            phone: mother.phone,
                            lmp: mother.lmp,
                            edd: '',
                            benefits: benefitsResponse.hasBenefits ? benefitsResponse.benefits : null
                        };
                    } catch (err) {
                        console.error(`Failed to fetch details for ${mother.name}`, err);
                        return null;
                    }
                })
            );

            // Filter out nulls
            const validMothers = mothersWithBenefitsData.filter((m: any) => m !== null) as Mother[];
            setMothers(validMothers);

            if (validMothers.length === 0) {
                toast('No mothers found with initialized PMSMA benefits', {
                    icon: 'ℹ️',
                });
            }

        } catch (error) {
            console.error('Failed to fetch mothers:', error);
            toast.error('Failed to load PMSMA benefits data');
        } finally {
            setLoading(false);
        }
    };



    const handleMarkAsPaid = async () => {
        if (!selectedMother || selectedInstallment === null) return;

        try {
            await governmentBenefitsAPI.markInstallmentPaid(
                selectedMother.id,
                selectedInstallment,
                transactionId || undefined
            );
            toast.success(`Installment ${selectedInstallment} marked as paid`);
            setPaymentModal(false);
            setTransactionId('');
            setSelectedInstallment(null);
            // Refresh data
            fetchMothersWithBenefits();
            if (selectedMother) {
                const updatedBenefits = await governmentBenefitsAPI.getUserPMSMASummary(selectedMother.id);
                setSelectedMother({
                    ...selectedMother,
                    benefits: updatedBenefits.hasBenefits ? updatedBenefits.benefits : null
                });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to mark installment as paid');
        }
    };

    const filteredMothers = mothers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return { bg: '#dcfce7', text: '#047857', icon: CheckCircle };
            case 'eligible': return { bg: '#fef3c7', text: '#92400e', icon: Clock };
            case 'locked': return { bg: '#f3f4f6', text: '#6b7280', icon: Lock };
            default: return { bg: '#f3f4f6', text: '#6b7280', icon: Lock };
        }
    };

    return (
        <AshaLayout title="PMSMA Benefits Management">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={24} color="#8b5cf6" />
                        PMSMA Government Benefits
                    </h2>
                    <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                        Manage Pradhan Mantri Surakshit Matritva Abhiyan financial assistance
                    </p>
                </div>

                <div className="card-content">
                    {/* Search */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search
                                size={20}
                                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                            />
                            <input
                                type="text"
                                placeholder="Search by mother's name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>

                    {/* Mothers List */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            Loading mothers' benefit data...
                        </div>
                    ) : filteredMothers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            No mothers with PMSMA benefits found
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {filteredMothers.map((mother) => (
                                <div
                                    key={mother.id}
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        background: selectedMother?.id === mother.id ? '#f0fdf4' : 'white'
                                    }}
                                    onClick={() => setSelectedMother(selectedMother?.id === mother.id ? null : mother)}
                                    onMouseEnter={(e) => {
                                        if (selectedMother?.id !== mother.id) {
                                            e.currentTarget.style.backgroundColor = '#f9fafb';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedMother?.id !== mother.id) {
                                            e.currentTarget.style.backgroundColor = 'white';
                                        }
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <User size={20} color="#6366f1" />
                                                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                                                    {mother.name}
                                                </h3>
                                            </div>
                                            <p style={{ margin: '0.25rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                                                📞 {mother.phone}
                                            </p>
                                            {mother.benefits && (
                                                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                    <div>
                                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>
                                                            Progress
                                                        </span>
                                                        <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: '700', color: '#8b5cf6' }}>
                                                            {mother.benefits.progress}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>
                                                            Total Eligible
                                                        </span>
                                                        <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
                                                            ₹{mother.benefits.totalEligible.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>
                                                            Total Paid
                                                        </span>
                                                        <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                                                            ₹{mother.benefits.totalPaid.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expandable Details */}
                                    {selectedMother?.id === mother.id && mother.benefits && (
                                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                                            <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
                                                Installment Details
                                            </h4>
                                            <div style={{ display: 'grid', gap: '1rem' }}>
                                                {mother.benefits.installments.map((inst) => {
                                                    const statusStyle = getStatusColor(inst.status);
                                                    const StatusIcon = statusStyle.icon;

                                                    return (
                                                        <div
                                                            key={inst.installmentNumber}
                                                            style={{
                                                                padding: '1rem',
                                                                background: statusStyle.bg,
                                                                borderRadius: '8px',
                                                                border: `1px solid ${statusStyle.text}20`
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                                        <StatusIcon size={18} color={statusStyle.text} />
                                                                        <strong style={{ color: statusStyle.text }}>
                                                                            Installment {inst.installmentNumber}
                                                                        </strong>
                                                                    </div>
                                                                    <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#4b5563' }}>
                                                                        {inst.description}
                                                                    </p>
                                                                    <p style={{ margin: '0.5rem 0 0', fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>
                                                                        ₹{inst.amount.toLocaleString()}
                                                                    </p>
                                                                    {inst.paidDate && (
                                                                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#047857' }}>
                                                                            ✓ Paid on {new Date(inst.paidDate).toLocaleDateString()}
                                                                            {inst.transactionId && ` • TXN: ${inst.transactionId}`}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {inst.status === 'eligible' && !inst.paidDate && (
                                                                    <button
                                                                        className="btn btn-primary"
                                                                        style={{ margin: 0 }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedInstallment(inst.installmentNumber);
                                                                            setPaymentModal(true);
                                                                        }}
                                                                    >
                                                                        Mark as Paid
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {paymentModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000
                    }}
                    onClick={() => setPaymentModal(false)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '2rem',
                            maxWidth: '500px',
                            width: '90%'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginTop: 0 }}>Mark Installment as Paid</h3>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                            Recording payment for {selectedMother?.name} - Installment {selectedInstallment}
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Transaction ID (Optional)
                            </label>
                            <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Enter transaction ID"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" onClick={handleMarkAsPaid} style={{ flex: 1, margin: 0 }}>
                                Confirm Payment
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setPaymentModal(false);
                                    setTransactionId('');
                                }}
                                style={{ flex: 1, margin: 0 }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AshaLayout>
    );
};

export default PMSMABenefits;
