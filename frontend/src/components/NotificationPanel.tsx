import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    categoryColor: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, categoryColor }) => {
    // Check if device is mobile
    const isMobile = () => {
        return window.innerWidth <= 768;
    };

    // Empty notifications for now
    const notifications: any[] = [];

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                right: isMobile() ? '10px' : '24px',
                left: isMobile() ? '10px' : 'auto',
                top: '80px',
                width: isMobile() ? 'calc(100vw - 20px)' : '380px',
                maxHeight: isMobile() ? '70vh' : '500px',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                boxShadow: '0 12px 28px rgba(2, 8, 23, 0.18)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1100,
                overflow: 'hidden',
                margin: isMobile() ? '0 auto' : '0'
            }}
        >
            {/* Header */}
            <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                background: `linear-gradient(135deg, ${categoryColor}10 0%, ${categoryColor}05 100%)`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: categoryColor,
                    fontWeight: 700,
                    fontSize: '1rem'
                }}>
                    <Bell size={18} />
                    Notifications
                </div>
                <button
                    onClick={onClose}
                    aria-label="Close notifications"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        borderRadius: '0.25rem',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Notifications List */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem'
            }}>
                {notifications.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3rem 1rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${categoryColor}15 0%, ${categoryColor}05 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem'
                        }}>
                            <Bell size={32} color={categoryColor} style={{ opacity: 0.6 }} />
                        </div>
                        <h3 style={{
                            margin: '0 0 0.5rem',
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            color: '#334155'
                        }}>
                            No notifications yet
                        </h3>
                        <p style={{
                            margin: 0,
                            fontSize: '0.875rem',
                            color: '#64748b',
                            lineHeight: 1.5
                        }}>
                            You're all caught up! We'll notify you when there's something new.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}>
                        {notifications.map((notification, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '0.875rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: notification.read ? 'white' : `${categoryColor}05`,
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                    e.currentTarget.style.borderColor = categoryColor;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = notification.read ? 'white' : `${categoryColor}05`;
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                            >
                                <div style={{
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: '#0f172a',
                                    marginBottom: '0.25rem'
                                }}>
                                    {notification.title}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: '#64748b',
                                    lineHeight: 1.4,
                                    marginBottom: '0.5rem'
                                }}>
                                    {notification.message}
                                </div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: '#94a3b8'
                                }}>
                                    {notification.time}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer - only show when there are notifications */}
            {notifications.length > 0 && (
                <div style={{
                    padding: '0.875rem 1rem',
                    borderTop: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            color: categoryColor,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${categoryColor}10`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        Mark all as read
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
