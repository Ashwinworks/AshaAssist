import React, { useState } from 'react';
import { X, Baby, Calendar, MapPin, Weight, Ruler, User } from 'lucide-react';
import { maternityAPI } from '../services/api';
import toast from 'react-hot-toast';

interface BirthRecordingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const BirthRecordingModal: React.FC<BirthRecordingModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        deliveryDate: '',
        deliveryType: 'normal' as 'normal' | 'c-section' | 'home',
        location: '',
        complications: '',
        childName: '',
        childGender: 'male' as 'male' | 'female',
        childWeight: '',
        childHeight: ''
    });

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.deliveryDate || !formData.location || !formData.childName || !formData.childWeight || !formData.childHeight) {
            toast.error('Please fill all required fields');
            return;
        }

        const weight = parseInt(formData.childWeight);
        const height = parseInt(formData.childHeight);

        if (isNaN(weight) || weight < 500 || weight > 6000) {
            toast.error('Child weight must be between 500g and 6000g');
            return;
        }

        if (isNaN(height) || height < 30 || height > 70) {
            toast.error('Child height must be between 30cm and 70cm');
            return;
        }

        // Check if date is in future
        const deliveryDate = new Date(formData.deliveryDate);
        if (deliveryDate > new Date()) {
            toast.error('Delivery date cannot be in the future');
            return;
        }

        try {
            setSubmitting(true);
            const result = await maternityAPI.recordBirth({
                deliveryDate: new Date(formData.deliveryDate).toISOString(),
                deliveryType: formData.deliveryType,
                location: formData.location,
                complications: formData.complications || undefined,
                childName: formData.childName,
                childGender: formData.childGender,
                childWeight: weight,
                childHeight: height
            });

            if (result.success) {
                toast.success(result.message || 'Birth recorded successfully!');
                // Update local storage with new user data
                if (result.user) {
                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...result.user }));
                }
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            console.error('Birth recording error:', error);
            toast.error(error.response?.data?.error || 'Failed to record birth');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f0fdf4'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#dcfce7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Baby size={24} color="#16a34a" />
                        </div>
                        <h2 style={{ margin: 0, color: '#166534', fontSize: '1.5rem', fontWeight: 600 }}>
                            Record Birth Details
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '0.375rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={24} color="#6b7280" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {/* Delivery Details Section */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ color: '#374151', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>
                            Delivery Information
                        </h3>

                        {/* Delivery Date */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                                <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Delivery Date & Time *
                            </label>
                            <input
                                type="datetime-local"
                                className="input"
                                value={formData.deliveryDate}
                                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                                required
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Delivery Type */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                                Delivery Type *
                            </label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {(['normal', 'c-section', 'home'] as const).map((type) => (
                                    <label key={type} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1rem',
                                        border: '2px solid',
                                        borderColor: formData.deliveryType === type ? '#16a34a' : '#e5e7eb',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        backgroundColor: formData.deliveryType === type ? '#f0fdf4' : 'white',
                                        transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="radio"
                                            name="deliveryType"
                                            value={type}
                                            checked={formData.deliveryType === type}
                                            onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value as any })}
                                            style={{ margin: 0 }}
                                        />
                                        <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                            {type === 'c-section' ? 'C-Section' : type}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Location */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                                <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Hospital/Location *
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., District Hospital, Home"
                                required
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Complications */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                                Complications (if any)
                            </label>
                            <textarea
                                className="input"
                                value={formData.complications}
                                onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
                                placeholder="None, or describe any complications..."
                                rows={2}
                                style={{ width: '100%', resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    {/* Child Details Section */}
                    <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                        <h3 style={{ color: '#374151', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>
                            Child Information
                        </h3>

                        {/* Child Name */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                                <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Child Name *
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={formData.childName}
                                onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                                placeholder="Baby's name"
                                required
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Gender */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                                Gender *
                            </label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {(['male', 'female'] as const).map((gender) => (
                                    <label key={gender} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.5rem',
                                        border: '2px solid',
                                        borderColor: formData.childGender === gender ? '#16a34a' : '#e5e7eb',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        backgroundColor: formData.childGender === gender ? '#f0fdf4' : 'white',
                                        flex: 1,
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={gender}
                                            checked={formData.childGender === gender}
                                            onChange={(e) => setFormData({ ...formData, childGender: e.target.value as any })}
                                            style={{ margin: 0 }}
                                        />
                                        <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{gender}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Weight & Height */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                                    <Weight size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    Weight (grams) *
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.childWeight}
                                    onChange={(e) => setFormData({ ...formData, childWeight: e.target.value })}
                                    placeholder="e.g., 3200"
                                    min="500"
                                    max="6000"
                                    required
                                    style={{ width: '100%' }}
                                />
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>500g - 6000g</p>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
                                    <Ruler size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    Height (cm) *
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.childHeight}
                                    onChange={(e) => setFormData({ ...formData, childHeight: e.target.value })}
                                    placeholder="e.g., 50"
                                    min="30"
                                    max="70"
                                    required
                                    style={{ width: '100%' }}
                                />
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>30cm - 70cm</p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <button
                            type="button"
                            className="btn"
                            onClick={onClose}
                            disabled={submitting}
                            style={{
                                flex: 1,
                                backgroundColor: 'white',
                                border: '1px solid #d1d5db',
                                color: '#374151'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn"
                            disabled={submitting}
                            style={{
                                flex: 1,
                                backgroundColor: '#16a34a',
                                color: 'white',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {submitting ? (
                                'Recording...'
                            ) : (
                                <>
                                    <Baby size={18} />
                                    Record Birth
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BirthRecordingModal;
