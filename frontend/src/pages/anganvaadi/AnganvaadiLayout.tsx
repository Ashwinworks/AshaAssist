import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Heart, LogOut, Calendar, Package,
  Menu, X, BookOpen, MapPin
} from 'lucide-react';

// Navigation items for Anganvaadi workers
const navigationItems = [
  {
    id: 'community-classes',
    label: 'Community Classes',
    icon: BookOpen,
    path: '/anganvaadi/community-classes'
  },
  {
    id: 'local-camps',
    label: 'Local Camps',
    icon: MapPin,
    path: '/anganvaadi/local-camps'
  },
  {
    id: 'ration',
    label: 'Ration',
    icon: Package,
    path: '/anganvaadi/ration'
  },
  {
    id: 'vaccination-schedules',
    label: 'Vaccination Schedules',
    icon: Calendar,
    path: '/anganvaadi/vaccination-schedules'
  }
];

interface AnganvaadiLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AnganvaadiLayout: React.FC<AnganvaadiLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
  };

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : title;
  };

  const isActiveItem = (item: any) => {
    return item.path === location.pathname;
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
            backgroundColor: 'var(--green-50)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'var(--green-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--green-700)',
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
                  color: 'var(--green-700)',
                  fontWeight: '500',
                  backgroundColor: 'var(--green-100)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  display: 'inline-block',
                  marginTop: '0.375rem'
                }}>
                  Anganvaadi Worker
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ padding: '1.5rem 0', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveItem(item);

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
                  background: isActive ? 'var(--green-50)' : 'transparent',
                  color: isActive ? 'var(--green-700)' : 'var(--gray-600)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: isActive ? '600' : '500',
                  borderLeft: isActive ? '3px solid var(--green-600)' : '3px solid transparent',
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
                Welcome to your Anganvaadi Center dashboard
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '2rem 2.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AnganvaadiLayout;