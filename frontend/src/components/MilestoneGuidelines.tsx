import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckSquare, Video, Lightbulb, AlertTriangle, Info } from 'lucide-react';

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
}

interface MilestoneGuidelinesProps {
    milestone: Milestone;
    compact?: boolean;
    showVideo?: boolean;
}

const MilestoneGuidelines: React.FC<MilestoneGuidelinesProps> = ({
    milestone,
    compact = false,
    showVideo = true
}) => {
    const [isExpanded, setIsExpanded] = useState(!compact);
    const [activeTab, setActiveTab] = useState<'checklist' | 'video' | 'tips' | 'safety'>('checklist');

    if (compact && !isExpanded) {
        return (
            <button
                style={{
                    width: '100%',
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: 'var(--purple-50)',
                    color: 'var(--purple-700)',
                    border: '1px solid var(--purple-200)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                }}
                onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--purple-100)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--purple-50)'}
            >
                <Info size={16} />
                Show Guidelines & Tips
                <ChevronDown size={16} />
            </button>
        );
    }

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                marginTop: '1rem',
                border: '1px solid var(--purple-200)',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                backgroundColor: 'white'
            }}
        >
            {/* Header */}
            {compact && (
                <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--purple-50)',
                    borderBottom: '1px solid var(--purple-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--purple-700)' }}>
                        Guidelines & Tips
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--purple-600)',
                            padding: '0.25rem'
                        }}
                    >
                        <ChevronUp size={18} />
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '2px solid var(--gray-200)',
                backgroundColor: 'var(--gray-50)',
                overflowX: 'auto'
            }}>
                {milestone.checklistItems && milestone.checklistItems.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setActiveTab('checklist'); }}
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            border: 'none',
                            backgroundColor: activeTab === 'checklist' ? 'white' : 'transparent',
                            borderBottom: activeTab === 'checklist' ? '2px solid var(--purple-600)' : '2px solid transparent',
                            color: activeTab === 'checklist' ? 'var(--purple-700)' : 'var(--gray-600)',
                            fontWeight: activeTab === 'checklist' ? '600' : '500',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                            marginBottom: '-2px'
                        }}
                    >
                        <CheckSquare size={16} />
                        Checklist
                    </button>
                )}
                {showVideo && milestone.videoUrl && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setActiveTab('video'); }}
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            border: 'none',
                            backgroundColor: activeTab === 'video' ? 'white' : 'transparent',
                            borderBottom: activeTab === 'video' ? '2px solid var(--purple-600)' : '2px solid transparent',
                            color: activeTab === 'video' ? 'var(--purple-700)' : 'var(--gray-600)',
                            fontWeight: activeTab === 'video' ? '600' : '500',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                            marginBottom: '-2px'
                        }}
                    >
                        <Video size={16} />
                        Video
                    </button>
                )}
                {milestone.tips && milestone.tips.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setActiveTab('tips'); }}
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            border: 'none',
                            backgroundColor: activeTab === 'tips' ? 'white' : 'transparent',
                            borderBottom: activeTab === 'tips' ? '2px solid var(--purple-600)' : '2px solid transparent',
                            color: activeTab === 'tips' ? 'var(--purple-700)' : 'var(--gray-600)',
                            fontWeight: activeTab === 'tips' ? '600' : '500',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                            marginBottom: '-2px'
                        }}
                    >
                        <Lightbulb size={16} />
                        Tips
                    </button>
                )}
                {milestone.safetyWarnings && milestone.safetyWarnings.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setActiveTab('safety'); }}
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            border: 'none',
                            backgroundColor: activeTab === 'safety' ? 'white' : 'transparent',
                            borderBottom: activeTab === 'safety' ? '2px solid var(--purple-600)' : '2px solid transparent',
                            color: activeTab === 'safety' ? 'var(--purple-700)' : 'var(--gray-600)',
                            fontWeight: activeTab === 'safety' ? '600' : '500',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                            marginBottom: '-2px'
                        }}
                    >
                        <AlertTriangle size={16} />
                        Safety
                    </button>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '1rem' }}>
                {/* Checklist Tab */}
                {activeTab === 'checklist' && milestone.checklistItems && (
                    <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.75rem' }}>
                            Signs of Achievement
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {milestone.checklistItems.map((item, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <CheckSquare size={16} style={{ marginTop: '0.125rem', color: 'var(--green-600)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: '1.5' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Video Tab */}
                {activeTab === 'video' && milestone.videoUrl && (
                    <div>
                        <div style={{
                            position: 'relative',
                            paddingBottom: '56.25%',
                            height: 0,
                            borderRadius: '0.5rem',
                            overflow: 'hidden',
                            backgroundColor: 'var(--gray-100)'
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
                        <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--gray-600)', textAlign: 'center' }}>
                            Watch how this milestone typically looks
                        </p>
                    </div>
                )}

                {/* Tips Tab */}
                {activeTab === 'tips' && milestone.tips && (
                    <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '0.75rem' }}>
                            How to Encourage This Milestone
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {milestone.tips.map((tip, index) => (
                                <div key={index} style={{
                                    padding: '0.75rem',
                                    backgroundColor: 'var(--blue-50)',
                                    border: '1px solid var(--blue-200)',
                                    borderRadius: '0.5rem',
                                    borderLeft: '3px solid var(--blue-500)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <Lightbulb size={14} style={{ marginTop: '0.125rem', color: 'var(--blue-600)', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: '1.5' }}>{tip}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Safety Tab */}
                {activeTab === 'safety' && milestone.safetyWarnings && (
                    <div>
                        <div style={{
                            padding: '0.75rem',
                            backgroundColor: 'var(--red-50)',
                            border: '1px solid var(--red-200)',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem'
                        }}>
                            <h4 style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: 'var(--red-900)',
                                marginBottom: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <AlertTriangle size={16} />
                                Important Safety Information
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--red-700)' }}>
                                Always prioritize your baby's safety during this developmental stage
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {milestone.safetyWarnings.map((warning, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0',
                                    borderBottom: index < milestone.safetyWarnings!.length - 1 ? '1px solid var(--gray-200)' : 'none'
                                }}>
                                    <AlertTriangle size={14} style={{ marginTop: '0.125rem', color: 'var(--red-600)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: '1.5' }}>{warning}</span>
                                </div>
                            ))}
                        </div>

                        {/* Red Flags section if available */}
                        {milestone.redFlags && milestone.redFlags.length > 0 && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                backgroundColor: 'var(--orange-50)',
                                border: '1px solid var(--orange-300)',
                                borderRadius: '0.5rem'
                            }}>
                                <h5 style={{
                                    fontSize: '0.8125rem',
                                    fontWeight: '600',
                                    color: 'var(--orange-900)',
                                    marginBottom: '0.5rem'
                                }}>
                                    ⚠️ When to Consult a Doctor
                                </h5>
                                <ul style={{
                                    margin: '0',
                                    paddingLeft: '1.25rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.375rem'
                                }}>
                                    {milestone.redFlags.map((flag, index) => (
                                        <li key={index} style={{ fontSize: '0.8125rem', color: 'var(--orange-800)', lineHeight: '1.5' }}>
                                            {flag}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* What to Expect section at bottom of all tabs */}
                {milestone.whatToExpect && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        backgroundColor: 'var(--purple-50)',
                        border: '1px solid var(--purple-200)',
                        borderRadius: '0.5rem'
                    }}>
                        <h5 style={{
                            fontSize: '0.8125rem',
                            fontWeight: '600',
                            color: 'var(--purple-900)',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem'
                        }}>
                            <Info size={14} />
                            What to Expect
                        </h5>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--gray-700)', lineHeight: '1.6', margin: 0 }}>
                            {milestone.whatToExpect}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MilestoneGuidelines;
