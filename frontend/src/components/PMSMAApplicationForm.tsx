import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { governmentBenefitsAPI } from '../services/api';
import './PMSMAApplicationForm.css';

interface PMSMAApplicationFormProps {
    installmentNumber: number;
    onClose: () => void;
    onSuccess: () => void;
    paymentDetails?: {
        accountHolderName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
    } | null;
}

const PMSMAApplicationForm: React.FC<PMSMAApplicationFormProps> = ({
    installmentNumber,
    onClose,
    onSuccess,
    paymentDetails
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        accountHolderName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        bankName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const validateForm = () => {
        if (installmentNumber === 1) {
            // Full validation for installment 1
            if (!formData.accountHolderName || !formData.accountNumber ||
                !formData.confirmAccountNumber || !formData.ifscCode || !formData.bankName) {
                setError(t('pmsma.fillAllFields'));
                return false;
            }

            if (formData.accountNumber !== formData.confirmAccountNumber) {
                setError(t('pmsma.accountNumbersMismatch'));
                return false;
            }

            // Basic IFSC validation (11 characters, alphanumeric)
            const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
            if (!ifscRegex.test(formData.ifscCode.toUpperCase())) {
                setError('Invalid IFSC code format');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Prepare data for installment 1 only
            const applicationData = installmentNumber === 1 ? {
                accountHolderName: formData.accountHolderName,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode.toUpperCase(),
                bankName: formData.bankName
            } : undefined;

            await governmentBenefitsAPI.applyForInstallment(installmentNumber, applicationData);

            // Success!
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pmsma-form-overlay" onClick={onClose}>
            <div className="pmsma-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="pmsma-form-header">
                    <h2>{t('pmsma.applicationForm')}</h2>
                    <button className="pmsma-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="pmsma-form-body">
                    <h3>
                        {installmentNumber === 1 && t('pmsma.installment1Form')}
                        {installmentNumber === 2 && t('pmsma.installment2Form')}
                        {installmentNumber === 3 && t('pmsma.installment3Form')}
                    </h3>

                    {installmentNumber === 1 ? (
                        // Full form for installment 1
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="accountHolderName">
                                    {t('pmsma.accountHolderName')} <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="accountHolderName"
                                    name="accountHolderName"
                                    value={formData.accountHolderName}
                                    onChange={handleChange}
                                    placeholder="Enter account holder name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="accountNumber">
                                    {t('pmsma.accountNumber')} <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="accountNumber"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    placeholder="Enter account number"
                                    maxLength={18}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmAccountNumber">
                                    {t('pmsma.confirmAccountNumber')} <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="confirmAccountNumber"
                                    name="confirmAccountNumber"
                                    value={formData.confirmAccountNumber}
                                    onChange={handleChange}
                                    placeholder="Re-enter account number"
                                    maxLength={18}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="ifscCode">
                                    {t('pmsma.ifscCode')} <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="ifscCode"
                                    name="ifscCode"
                                    value={formData.ifscCode}
                                    onChange={handleChange}
                                    placeholder="e.g., SBIN0001234"
                                    maxLength={11}
                                    style={{ textTransform: 'uppercase' }}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="bankName">
                                    {t('pmsma.bankName')} <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="bankName"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    placeholder="Enter bank name"
                                    required
                                />
                            </div>

                            {error && <div className="form-error">{error}</div>}

                            <div className="form-actions">
                                <button type="button" onClick={onClose} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Submitting...' : t('pmsma.submitApplication')}
                                </button>
                            </div>
                        </form>
                    ) : (
                        // Simple confirmation for installments 2 & 3
                        <div className="confirmation-view">
                            {paymentDetails && (
                                <div className="payment-details-display">
                                    <h4>{t('pmsma.paymentDetailsStored')}</h4>
                                    <div className="detail-row">
                                        <span className="label">{t('pmsma.accountHolderName')}:</span>
                                        <span className="value">{paymentDetails.accountHolderName}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">{t('pmsma.accountNumber')}:</span>
                                        <span className="value">XXXX-XXXX-{paymentDetails.accountNumber.slice(-4)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">{t('pmsma.ifscCode')}:</span>
                                        <span className="value">{paymentDetails.ifscCode}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">{t('pmsma.bankName')}:</span>
                                        <span className="value">{paymentDetails.bankName}</span>
                                    </div>
                                </div>
                            )}

                            <p className="confirmation-message">
                                {t('pmsma.confirmationMessage')}
                            </p>

                            {error && <div className="form-error">{error}</div>}

                            <div className="form-actions">
                                <button type="button" onClick={onClose} className="btn-secondary">
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Submitting...' : t('pmsma.confirmApplication')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PMSMAApplicationForm;
