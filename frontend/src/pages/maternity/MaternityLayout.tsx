import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  LogOut,
  Calendar,
  Baby,
  Home,
  BookOpen,
  Package,
  UserCheck,
  Syringe,
  CreditCard,
  MessageSquare,
  ShoppingBag,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import ChatBot from '../../components/ChatBot';
import LanguageToggle from '../../components/LanguageToggle';
import NotificationPanel from '../../components/NotificationPanel';

interface MaternityLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MaternityLayout: React.FC<MaternityLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Navigation items with translation keys
  const navigationItems = [
    { id: 'dashboard', labelKey: 'nav.dashboard', icon: Home, path: '/maternity-dashboard' },
    { id: 'milestones', labelKey: 'nav.milestones', icon: Baby, path: '/maternity/milestones' },
    { id: 'blogs', labelKey: 'nav.healthBlogs', icon: BookOpen, path: '/maternity/blogs' },
    { id: 'calendar', labelKey: 'nav.calendar', icon: Calendar, path: '/maternity/calendar' },
    { id: 'supplies', labelKey: 'nav.supplies', icon: Package, path: '/maternity/supplies' },
    { id: 'ration', labelKey: 'nav.ration', icon: ShoppingBag, path: '/maternity/ration' },
    { id: 'visits', labelKey: 'nav.visits', icon: UserCheck, path: '/maternity/visits' },
    { id: 'visit-requests', labelKey: 'nav.visitRequests', icon: UserCheck, path: '/maternity/visit-requests' },
    { id: 'vaccinations', labelKey: 'nav.vaccinations', icon: Syringe, path: '/maternity/vaccinations' },
    { id: 'mcp-card', labelKey: 'nav.mcpCard', icon: CreditCard, path: '/maternity/mcp-card' },
    { id: 'feedback', labelKey: 'nav.feedback', icon: MessageSquare, path: '/maternity/feedback' },
  ];

  const handleLogout = () => {
    logout();
  };

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    if (currentItem?.labelKey) return t(currentItem.labelKey);
    return title;
  };

  const getNavLabel = (item: typeof navigationItems[0]) => {
    return t(item.labelKey);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '320px' : '90px',
        backgroundColor: 'white',
        boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)',
        transition: 'width 0.3s ease',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Heart style={{ width: '2.5rem', height: '2.5rem', color: 'var(--primary-600)' }} />
            {sidebarOpen && (
              <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-600)' }}>
                AshaAssist
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '0.25rem',
              color: 'var(--gray-600)'
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: 'var(--blue-50)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--blue-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--blue-700)',
                  fontWeight: '600',
                  fontSize: '1.25rem'
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontWeight: '600', color: 'var(--gray-900)', fontSize: '1rem' }}>
                  {user?.name}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--blue-700)',
                  fontWeight: '500',
                  backgroundColor: 'var(--blue-100)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  display: 'inline-block',
                  marginTop: '0.375rem'
                }}>
                  {t('maternity.title')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ padding: '1rem 0', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: sidebarOpen ? '1rem 1.5rem' : '1rem',
                  border: 'none',
                  background: isActive ? 'var(--blue-50)' : 'transparent',
                  color: isActive ? 'var(--blue-700)' : 'var(--gray-600)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: isActive ? '600' : '500',
                  borderLeft: isActive ? '3px solid var(--blue-600)' : '3px solid transparent',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--gray-50)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={22} />
                {sidebarOpen && <span>{getNavLabel(item)}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Footer (pinned, non-overlapping) */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #e5e7eb',
          background: 'white'
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: sidebarOpen ? '0.75rem 1rem' : '0.75rem',
              border: '1px solid var(--red-200)',
              background: 'white',
              color: 'var(--red-600)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              borderRadius: '0.5rem',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--red-50)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>{t('common.logout')}</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: sidebarOpen ? '320px' : '90px',
        flex: 1,
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh'
      }}>
        {/* Top Header */}
        <header style={{
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem 2.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'var(--gray-900)',
                margin: 0
              }}>
                {getCurrentPageTitle()}
              </h1>
              <p style={{
                color: 'var(--gray-600)',
                margin: '0.5rem 0 0',
                fontSize: '1rem'
              }}>
                Maternity Care Dashboard
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Notification Button */}
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                style={{
                  position: 'relative',
                  background: 'white',
                  border: '2px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  color: '#64748b'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#ec4899';
                  e.currentTarget.style.color = '#ec4899';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#64748b';
                }}
                title="Notifications"
              >
                <Bell size={20} />
                {/* Notification Badge */}
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ec4899',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  0
                </span>
              </button>
              <div style={{
                backgroundColor: 'var(--blue-100)',
                color: 'var(--blue-700)',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                {t('dashboard.welcomeBack')}, {user?.name}
              </div>
              <LanguageToggle />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main style={{ padding: '2.5rem' }}>
          {children}
        </main>

        {/* Chat Bot */}
        <ChatBot />

        {/* Notification Panel */}
        <NotificationPanel
          isOpen={notificationOpen}
          onClose={() => setNotificationOpen(false)}
          categoryColor="#ec4899"
        />
      </div>
    </div>
  );
};

export default MaternityLayout;