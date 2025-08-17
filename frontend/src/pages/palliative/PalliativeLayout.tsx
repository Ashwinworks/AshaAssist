import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, LogOut, User, Settings, Calendar, Baby, Stethoscope, Phone,
  Home, FileText, BookOpen, Package, UserCheck, Syringe, CreditCard, MessageSquare,
  Menu, X, Activity, Clipboard
} from 'lucide-react';

// Navigation items for palliative users
const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/palliative-dashboard' },
  { id: 'profile', label: 'Profile Setup', icon: User, path: '/palliative/profile' },
  { id: 'blogs', label: 'Health Blogs', icon: BookOpen, path: '/palliative/blogs' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/palliative/calendar' },
  { id: 'supplies', label: 'Supply Requests', icon: Package, path: '/palliative/supplies' },
  { id: 'visits', label: 'Visit Requests', icon: UserCheck, path: '/palliative/visits' },
  { id: 'records', label: 'Health Records', icon: Clipboard, path: '/palliative/records' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, path: '/palliative/feedback' },
];

interface PalliativeLayoutProps {
  children: React.ReactNode;
  title: string;
}

const PalliativeLayout: React.FC<PalliativeLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
  };

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    return currentItem?.label || title;
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
        overflowY: 'auto'
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
                  Palliative Care
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ padding: '1.5rem 0' }}>
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
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div style={{ 
          position: 'absolute', 
          bottom: '1rem', 
          left: sidebarOpen ? '1rem' : '50%', 
          right: sidebarOpen ? '1rem' : 'auto',
          transform: sidebarOpen ? 'none' : 'translateX(-50%)'
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
            {sidebarOpen && <span>Logout</span>}
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
                Palliative Care Dashboard
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                backgroundColor: 'var(--blue-100)',
                color: 'var(--blue-700)',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                Welcome, {user?.name}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main style={{ padding: '2.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PalliativeLayout;