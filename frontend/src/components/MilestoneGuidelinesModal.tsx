import React from 'react';
import { X, CheckSquare, Video, Lightbulb, AlertTriangle, Info, BookOpen } from 'lucide-react';

interface Milestone {
    id: string;
    milestoneName: string;
    description: string;
    minMonths: number;
    maxMonths: number;
    checklistItems?: string[];
    videoUrl?: string;
    tips?: string[];
    safetyWarnings?: string[];
    whatToExpect?: string;
    redFlags?: string[];
    icon?: string;
}

interface MilestoneGuidelinesModalProps {
    milestone: Milestone | null;
    isOpen: boolean;
    onClose: () => void;
}

const MilestoneGuidelinesModal: React.FC<MilestoneGuidelinesModalProps> = ({
    milestone,
    isOpen,
    onClose
}) => {
    if (!isOpen || !milestone) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease-in-out'
                }}
            />

            {/* Modal */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: '900px',
                    maxHeight: '90vh',
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    zIndex: 1001,
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    animation: 'slideUp 0.3s ease-out',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header with Gradient */}
                <div style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    padding: '2rem',
                    borderBottom: '2px solid #9333ea',
                    position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    >
                        <X size={24} color="white" />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                        <div style={{
                            fontSize: '3rem',
                            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                        }}>
                            {milestone.icon || '🎯'}
                        </div>
                        <div>
                            <h2 style={{
                                margin: 0,
                                fontSize: '1.75rem',
                                fontWeight: '700',
                                color: 'white',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
                            }}>
                                {milestone.milestoneName}
                            </h2>
                            <p style={{
                                margin: '0.5rem 0 0',
                                color: 'rgba(255, 255, 255, 0.95)',
                                fontSize: '1rem'
                            }}>
                                Typical age: {milestone.minMonths}-{milestone.maxMonths} months
                            </p>
                        </div>
                    </div>
                    <p style={{
                        margin: 0,
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '1rem',
                        lineHeight: '1.6'
                    }}>
                        {milestone.description}
                    </p>
                </div>

                {/* Scrollable Content */}
                <div style={{
                    overflowY: 'auto',
                    flex: 1,
                    padding: '2rem'
                }}>
                    {/* Achievement Checklist */}
                    {milestone.checklistItems && milestone.checklistItems.length > 0 && (
                        <div style={{
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                            borderRadius: '0.75rem',
                            border: '2px solid #10b981',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}>
                            <h3 style={{
                                margin: '0 0 1rem',
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#065f46',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <CheckSquare size={24} color="#10b981" />
                                Signs of Achievement
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {milestone.checklistItems.map((item, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.75rem',
                                        padding: '0.75rem',
                                        backgroundColor: 'white',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #a7f3d0'
                                    }}>
                                        <CheckSquare size={20} style={{ marginTop: '0.125rem', color: '#10b981', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.95rem', color: '#1f2937', lineHeight: '1.6' }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tips Section */}
                    {milestone.tips && milestone.tips.length > 0 && (
                        <div style={{
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                            borderRadius: '0.75rem',
                            border: '2px solid #3b82f6',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}>
                            <h3 style={{
                                margin: '0 0 1rem',
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#1e40af',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <Lightbulb size={24} color="#3b82f6" />
                                How to Encourage This Milestone
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {milestone.tips.map((tip, index) => (
                                    <div key={index} style={{
                                        padding: '1rem',
                                        backgroundColor: 'white',
                                        borderRadius: '0.5rem',
                                        borderLeft: '4px solid #3b82f6',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                            <Lightbulb size={18} style={{ marginTop: '0.125rem', color: '#3b82f6', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.95rem', color: '#1f2937', lineHeight: '1.6' }}>{tip}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Video Section */}
                    {milestone.videoUrl && (
                        <div style={{
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                            borderRadius: '0.75rem',
                            border: '2px solid #a855f7',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}>
                            <h3 style={{
                                margin: '0 0 1rem',
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#6b21a8',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <Video size={24} color="#a855f7" />
                                Video Demonstration
                            </h3>
                            <div style={{
                                position: 'relative',
                                paddingBottom: '56.25%',
                                height: 0,
                                borderRadius: '0.5rem',
                                overflow: 'hidden',
                                backgroundColor: '#f3f4f6'
                            }}>
                                <iframe
                                    src={milestone.videoUrl}
                                    title={`${milestone.milestoneName} demonstration`}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        border: 'none'
                                    }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', margin: '0.75rem 0 0' }}>
                                Watch how this milestone typically looks
                            </p>
                        </div>
                    )}

                    {/* Safety Warnings */}
                    {milestone.safetyWarnings && milestone.safetyWarnings.length > 0 && (
                        <div style={{
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                            borderRadius: '0.75rem',
                            border: '2px solid #ef4444',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{
                                padding: '1rem',
                                backgroundColor: '#fee2e2',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem',
                                border: '1px solid #fca5a5'
                            }}>
                                <h3 style={{
                                    margin: '0 0 0.5rem',
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    color: '#991b1b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <AlertTriangle size={24} color="#ef4444" />
                                    Important Safety Information
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0 }}>
                                    Always prioritize your baby's safety during this developmental stage
                                </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {milestone.safetyWarnings.map((warning, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.75rem',
                                        padding: '0.75rem',
                                        backgroundColor: 'white',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #fca5a5',
                                        borderLeft: '4px solid #ef4444'
                                    }}>
                                        <AlertTriangle size={18} style={{ marginTop: '0.125rem', color: '#ef4444', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.95rem', color: '#1f2937', lineHeight: '1.6' }}>{warning}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Red Flags */}
                            {milestone.redFlags && milestone.redFlags.length > 0 && (
                                <div style={{
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    backgroundColor: '#fff7ed',
                                    border: '2px solid #fb923c',
                                    borderRadius: '0.5rem'
                                }}>
                                    <h4 style={{
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: '#9a3412',
                                        marginBottom: '0.75rem'
                                    }}>
                                        ⚠️ When to Consult a Doctor
                                    </h4>
                                    <ul style={{
                                        margin: 0,
                                        paddingLeft: '1.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}>
                                        {milestone.redFlags.map((flag, index) => (
                                            <li key={index} style={{ fontSize: '0.9rem', color: '#c2410c', lineHeight: '1.6' }}>
                                                {flag}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* What to Expect */}
                    {milestone.whatToExpect && (
                        <div style={{
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                            borderRadius: '0.75rem',
                            border: '2px solid #22c55e',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}>
                            <h3 style={{
                                margin: '0 0 1rem',
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#15803d',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <Info size={24} color="#22c55e" />
                                What to Expect
                            </h3>
                            <p style={{
                                fontSize: '1rem',
                                color: '#1f2937',
                                lineHeight: '1.8',
                                margin: 0
                            }}>
                                {milestone.whatToExpect}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>
                {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, -45%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `}
            </style>
        </>
    );
};

export default MilestoneGuidelinesModal;
