import React from 'react';
import { X, Bell } from 'lucide-react';

interface ToastNotificationProps {
    title: string;
    message: string;
    color: string;
    onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ title, message, color, onClose }) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: '90px',
                right: '24px',
                width: '380px',
                maxWidth: 'calc(100vw - 48px)',
                backgroundColor: 'white',
                border: `2px solid ${color}`,
                borderRadius: '0.75rem',
                boxShadow: `0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px ${color}20`,
                padding: '1rem 1.25rem',
                zIndex: 9999,
                animation: 'slideIn 0.3s ease-out',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
            }}
        >
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `}</style>

            {/* Icon */}
            <div
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '0.5rem',
                    background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}
            >
                <Bell size={20} color={color} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        color: '#0f172a',
                        marginBottom: '0.25rem'
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        fontSize: '0.875rem',
                        color: '#64748b',
                        lineHeight: 1.5
                    }}
                >
                    {message}
                </div>
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '0.25rem',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.color = '#475569';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                }}
                aria-label="Close notification"
            >
                <X size={18} />
            </button>
        </div >
    );
};

export default ToastNotification;
