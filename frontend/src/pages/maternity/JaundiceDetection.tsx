import React, { useState, useRef } from 'react';
import MaternityLayout from './MaternityLayout';
import {
    Camera,
    Upload,
    Eye,
    AlertTriangle,
    CheckCircle,
    Info,
    X,
    Image as ImageIcon,
    TrendingUp,
    Calendar,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AnalysisResult {
    id: string;
    date: string;
    imageUrl: string;
    riskLevel: 'low' | 'medium' | 'high';
    confidence: number;
    recommendations: string[];
    bilirubinEstimate?: string;
}

const JaundiceDetection: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
    const [history, setHistory] = useState<AnalysisResult[]>([]);
    const [showGuidance, setShowGuidance] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size should be less than 10MB');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
            setShowGuidance(false);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage) {
            toast.error('Please select an image first');
            return;
        }

        setAnalyzing(true);

        // Simulate analysis (replace with actual API call later)
        setTimeout(() => {
            const mockResult: AnalysisResult = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                imageUrl: previewUrl!,
                riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
                confidence: Math.floor(Math.random() * 20) + 80,
                bilirubinEstimate: '8-12 mg/dL',
                recommendations: []
            };

            // Add recommendations based on risk level
            if (mockResult.riskLevel === 'high') {
                mockResult.recommendations = [
                    '⚠️ Seek immediate medical attention',
                    'Visit a healthcare facility within 24 hours',
                    'Keep baby well-hydrated and feeding frequently',
                    'Monitor for increased yellowing or behavioral changes'
                ];
            } else if (mockResult.riskLevel === 'medium') {
                mockResult.recommendations = [
                    'Schedule a checkup with your healthcare provider',
                    'Monitor baby\'s color daily',
                    'Ensure adequate feeding (8-12 times per day)',
                    'Increase exposure to indirect natural light'
                ];
            } else {
                mockResult.recommendations = [
                    'Continue regular feeding schedule',
                    'Monitor baby\'s condition daily',
                    'Maintain good hydration',
                    'Follow up during next scheduled visit'
                ];
            }

            setCurrentResult(mockResult);
            setHistory(prev => [mockResult, ...prev]);
            setAnalyzing(false);
            toast.success('Analysis complete!');
        }, 3000);
    };

    const resetAnalysis = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setCurrentResult(null);
        setShowGuidance(true);
    };

    const getRiskColor = (level: 'low' | 'medium' | 'high') => {
        switch (level) {
            case 'low': return { bg: '#dcfce7', color: '#166534', border: '#22c55e' };
            case 'medium': return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' };
            case 'high': return { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' };
        }
    };

    const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
        switch (level) {
            case 'low': return <CheckCircle size={24} />;
            case 'medium': return <AlertTriangle size={24} />;
            case 'high': return <AlertTriangle size={24} />;
        }
    };

    return (
        <MaternityLayout title="Jaundice Detection">
            <div>
                {/* Header Card */}
                <div
                    className="card"
                    style={{
                        marginBottom: '2rem',
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        border: '1px solid #fbbf24'
                    }}
                >
                    <div className="card-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Eye size={32} color="white" />
                            </div>
                            <div>
                                <h2 style={{ margin: '0 0 0.25rem', color: '#92400e', fontSize: '1.5rem', fontWeight: 700 }}>
                                    Newborn Jaundice Screening
                                </h2>
                                <p style={{ margin: 0, color: '#78350f', fontSize: '0.875rem' }}>
                                    Quick and easy screening for your baby
                                </p>
                            </div>
                        </div>

                        {/* Important Notice */}
                        <div style={{
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fbbf24',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            display: 'flex',
                            gap: '0.75rem'
                        }}>
                            <Info size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#92400e', fontSize: '0.875rem' }}>
                                    Important Medical Disclaimer
                                </p>
                                <p style={{ margin: 0, color: '#92400e', fontSize: '0.8rem', lineHeight: '1.5' }}>
                                    This tool provides preliminary screening only and is not a substitute for professional medical diagnosis.
                                    Always consult a healthcare provider for accurate diagnosis and treatment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {/* Upload & Analysis Section */}
                    <div className="card" style={{ gridColumn: currentResult ? '1' : '1 / -1' }}>
                        <div className="card-header">
                            <h3 className="card-title">Upload Image</h3>
                            <p className="card-description">Take or upload a clear photo of baby's eyes or skin</p>
                        </div>
                        <div className="card-content">
                            {/* Image Guidance */}
                            {showGuidance && (
                                <div style={{
                                    backgroundColor: '#f0fdf4',
                                    border: '1px dashed #22c55e',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <h4 style={{ margin: '0 0 1rem', color: '#166534', fontSize: '1rem', fontWeight: 600 }}>
                                        📸 Photography Tips
                                    </h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#166534', fontSize: '0.875rem', lineHeight: '1.8' }}>
                                        <li>Use natural daylight (avoid direct sunlight)</li>
                                        <li>Ensure baby's eyes or skin are clearly visible</li>
                                        <li>Take photo from 15-20 cm distance</li>
                                        <li>Avoid flash and artificial yellow lighting</li>
                                        <li>Make sure the image is in focus and well-lit</li>
                                    </ul>
                                </div>
                            )}

                            {/* Image Preview */}
                            {previewUrl ? (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{
                                        position: 'relative',
                                        borderRadius: '0.75rem',
                                        overflow: 'hidden',
                                        border: '2px solid #e5e7eb'
                                    }}>
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            style={{
                                                width: '100%',
                                                maxHeight: '400px',
                                                objectFit: 'contain',
                                                backgroundColor: '#f9fafb'
                                            }}
                                        />
                                        <button
                                            onClick={resetAnalysis}
                                            style={{
                                                position: 'absolute',
                                                top: '0.75rem',
                                                right: '0.75rem',
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
                                        >
                                            <X size={20} color="white" />
                                        </button>
                                    </div>
                                    <p style={{
                                        textAlign: 'center',
                                        marginTop: '0.75rem',
                                        fontSize: '0.875rem',
                                        color: '#6b7280'
                                    }}>
                                        {selectedImage?.name}
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    border: '2px dashed #cbd5e1',
                                    borderRadius: '0.75rem',
                                    padding: '3rem 1.5rem',
                                    textAlign: 'center',
                                    backgroundColor: '#f8fafc',
                                    marginBottom: '1.5rem'
                                }}>
                                    <ImageIcon size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                                        No image selected. Choose an option below.
                                    </p>
                                </div>
                            )}

                            {/* Upload Buttons */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <button
                                    className="btn"
                                    onClick={() => cameraInputRef.current?.click()}
                                    disabled={analyzing}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '1.25rem',
                                        backgroundColor: '#eff6ff',
                                        border: '1px solid #3b82f6',
                                        color: '#1e40af'
                                    }}
                                >
                                    <Camera size={24} />
                                    <span style={{ fontWeight: 600 }}>Take Photo</span>
                                </button>

                                <button
                                    className="btn"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={analyzing}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '1.25rem',
                                        backgroundColor: '#f0fdf4',
                                        border: '1px solid #22c55e',
                                        color: '#166534'
                                    }}
                                >
                                    <Upload size={24} />
                                    <span style={{ fontWeight: 600 }}>Upload Image</span>
                                </button>
                            </div>

                            {/* Analyze Button */}
                            {previewUrl && !currentResult && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        backgroundColor: '#f59e0b',
                                        borderColor: '#f59e0b'
                                    }}
                                >
                                    {analyzing ? (
                                        <>
                                            <div className="loading-spinner" style={{ marginRight: '0.5rem' }} />
                                            Analyzing Image...
                                        </>
                                    ) : (
                                        <>
                                            <Eye size={20} style={{ marginRight: '0.5rem' }} />
                                            Analyze for Jaundice
                                        </>
                                    )}
                                </button>
                            )}

                            {currentResult && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={resetAnalysis}
                                    style={{ width: '100%', marginTop: '0.5rem' }}
                                >
                                    Analyze Another Image
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results Section */}
                    {currentResult && (
                        <div className="card" style={{ height: 'fit-content' }}>
                            <div className="card-header">
                                <h3 className="card-title">Analysis Results</h3>
                                <p className="card-description">
                                    {new Date(currentResult.date).toLocaleString()}
                                </p>
                            </div>
                            <div className="card-content">
                                {/* Risk Level Badge */}
                                <div
                                    style={{
                                        backgroundColor: getRiskColor(currentResult.riskLevel).bg,
                                        border: `2px solid ${getRiskColor(currentResult.riskLevel).border}`,
                                        borderRadius: '0.75rem',
                                        padding: '1.5rem',
                                        marginBottom: '1.5rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '0.75rem',
                                        color: getRiskColor(currentResult.riskLevel).color
                                    }}>
                                        {getRiskIcon(currentResult.riskLevel)}
                                    </div>
                                    <h4 style={{
                                        margin: '0 0 0.5rem',
                                        color: getRiskColor(currentResult.riskLevel).color,
                                        fontSize: '1.25rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {currentResult.riskLevel} Risk
                                    </h4>
                                    <p style={{
                                        margin: 0,
                                        color: getRiskColor(currentResult.riskLevel).color,
                                        fontSize: '0.875rem'
                                    }}>
                                        Confidence: {currentResult.confidence}%
                                    </p>
                                    {currentResult.bilirubinEstimate && (
                                        <p style={{
                                            margin: '0.5rem 0 0',
                                            color: getRiskColor(currentResult.riskLevel).color,
                                            fontSize: '0.875rem',
                                            fontWeight: 600
                                        }}>
                                            Estimated Bilirubin: {currentResult.bilirubinEstimate}
                                        </p>
                                    )}
                                </div>

                                {/* Recommendations */}
                                <div>
                                    <h4 style={{
                                        margin: '0 0 1rem',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: '#374151',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <TrendingUp size={18} />
                                        Recommendations
                                    </h4>
                                    <ul style={{
                                        margin: 0,
                                        padding: '0 0 0 1.25rem',
                                        color: '#4b5563',
                                        fontSize: '0.875rem',
                                        lineHeight: '1.8'
                                    }}>
                                        {currentResult.recommendations.map((rec, idx) => (
                                            <li key={idx} style={{ marginBottom: '0.5rem' }}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* History Section */}
                {history.length > 0 && (
                    <div className="card" style={{ marginTop: '2rem' }}>
                        <div className="card-header">
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={20} />
                                Screening History
                            </h3>
                            <p className="card-description">Track your baby's jaundice screening over time</p>
                        </div>
                        <div className="card-content">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {history.map((result) => (
                                    <div
                                        key={result.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            backgroundColor: '#f9fafb',
                                            border: '1px solid #e5e7eb',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f9fafb';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <img
                                            src={result.imageUrl}
                                            alt="History"
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '0.5rem',
                                                objectFit: 'cover',
                                                border: '2px solid #e5e7eb'
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.25rem'
                                            }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    backgroundColor: getRiskColor(result.riskLevel).bg,
                                                    color: getRiskColor(result.riskLevel).color
                                                }}>
                                                    {result.riskLevel.toUpperCase()}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                    {result.confidence}% confidence
                                                </span>
                                            </div>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '0.875rem',
                                                color: '#6b7280'
                                            }}>
                                                {new Date(result.date).toLocaleString()}
                                            </p>
                                        </div>
                                        <ChevronRight size={20} color="#9ca3af" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MaternityLayout>
    );
};

export default JaundiceDetection;
