import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import axios from 'axios';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'event';
    isRead: boolean;
    createdAt: string;
    relatedEntity?: {
        type: string;
        id: string;
    };
}

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    categoryColor: string;
    onUnreadCountChange?: (count: number) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, categoryColor, onUnreadCountChange }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch notifications when panel opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiUrl}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unreadCount || 0);

            // Notify parent component of unread count
            if (onUnreadCountChange) {
                onUnreadCountChange(response.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            await axios.put(
                `${apiUrl}/notifications/${notificationId}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );

            // Update unread count
            const newUnreadCount = Math.max(0, unreadCount - 1);
            setUnreadCount(newUnreadCount);
            if (onUnreadCountChange) {
                onUnreadCountChange(newUnreadCount);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            await axios.put(
                `${apiUrl}/notifications/mark-all-read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            if (onUnreadCountChange) {
                onUnreadCountChange(0);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    };

    // Check if device is mobile
    const isMobile = () => {
        return window.innerWidth <= 768;
    };

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
                    {unreadCount > 0 && (
                        <span style={{
                            backgroundColor: categoryColor,
                            color: 'white',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                        }}>
                            {unreadCount}
                        </span>
                    )}
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
                {loading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '3rem 1rem',
                        color: '#64748b'
                    }}>
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
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
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => !notification.isRead && markAsRead(notification.id)}
                                style={{
                                    padding: '0.875rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: notification.isRead ? 'white' : `${categoryColor}05`,
                                    transition: 'all 0.2s ease',
                                    cursor: notification.isRead ? 'default' : 'pointer',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                    e.currentTarget.style.borderColor = categoryColor;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = notification.isRead ? 'white' : `${categoryColor}05`;
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                            >
                                {!notification.isRead && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: categoryColor
                                    }} />
                                )}
                                <div style={{
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: '#0f172a',
                                    marginBottom: '0.25rem',
                                    paddingRight: '16px'
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
                                    {formatTime(notification.createdAt)}
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
                        onClick={markAllAsRead}
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
