import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Heart, LogOut, Calendar, Home, Package,
  MessageSquare, Menu, X, ChevronDown, ChevronRight, Clipboard
} from 'lucide-react';

// Navigation items for ASHA workers with dropdown support
const navigationItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Home, 
    path: '/asha-dashboard' 
  },
  {
    id: 'requests',
    label: 'Requests',
    icon: Package,
    isDropdown: true,
    children: [
      { id: 'visit-requests', label: 'Home Visit Requests', path: '/asha/visit-requests' },
      { id: 'supply-requests', label: 'Supply Requests', path: '/asha/supply-requests' }
    ]
  },
  {
    id: 'records',
    label: 'Records Management',
    icon: Clipboard,
    isDropdown: true,
    children: [
      { id: 'maternal-records', label: 'Maternal Records', path: '/asha/maternal-records' },
      { id: 'palliative-records', label: 'Palliative Records', path: '/asha/palliative-records' },
      { id: 'vaccination-records', label: 'Child Vaccination Records', path: '/asha/vaccination-records' }
    ]
  },
  { 
    id: 'calendar', 
    label: 'Calendar', 
    icon: Calendar, 
    path: '/asha/calendar' 
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: MessageSquare,
    isDropdown: true,
    children: [
      { id: 'health-blogs', label: 'Health Blogs', path: '/asha/health-blogs' },
      { id: 'vaccination-schedules', label: 'Vaccination Schedules', path: '/asha/vaccination-schedules' },
      { id: 'community-classes', label: 'Community Class Details', path: '/asha/community-classes' },
      { id: 'local-camps', label: 'Local Camp Announcements', path: '/asha/local-camps' }
    ]
  },
  { 
    id: 'supply-distribution', 
    label: 'Supply Distribution', 
    icon: Package, 
    path: '/asha/supply-distribution' 
  }
];

interface AshaLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AshaLayout: React.FC<AshaLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  const handleLogout = () => {
    logout();
  };

  const toggleDropdown = (itemId: string) => {
    setOpenDropdowns(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getCurrentPageTitle = () => {
    // Check main navigation items first
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    if (currentItem) return currentItem.label;

    // Check dropdown items
    for (const item of navigationItems) {
      if (item.children) {
        const childItem = item.children.find(child => child.path === location.pathname);
        if (childItem) return childItem.label;
      }
    }

    return title;
  };

  const isActiveItem = (item: any) => {
    if (item.path) return location.pathname === item.path;
    if (item.children) {
      return item.children.some((child: any) => location.pathname === child.path);
    }
    return false;
  };

  const isActiveChild = (childPath: string) => {
    return location.pathname === childPath;
  };

  // Auto-open dropdown if current page is a child of that dropdown
  React.useEffect(() => {
    navigationItems.forEach(item => {
      if (item.children && item.children.some(child => child.path === location.pathname)) {
        if (!openDropdowns.includes(item.id)) {
          setOpenDropdowns(prev => [...prev, item.id]);
        }
      }
    });
  }, [location.pathname]);

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
                  ASHA Worker
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
            const isDropdownOpen = openDropdowns.includes(item.id);
            
            return (
              <div key={item.id}>
                {/* Main Navigation Item */}
                <button
                  onClick={() => {
                    if (item.isDropdown) {
                      toggleDropdown(item.id);
                    } else if (item.path) {
                      navigate(item.path);
                    }
                  }}
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
                    justifyContent: sidebarOpen ? 'space-between' : 'center',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Icon size={22} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </div>
                  {sidebarOpen && item.isDropdown && (
                    isDropdownOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                  )}
                </button>

                {/* Dropdown Items */}
                {item.isDropdown && isDropdownOpen && sidebarOpen && (
                  <div style={{ backgroundColor: 'var(--gray-25)' }}>
                    {item.children?.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => navigate(child.path)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.75rem 3rem',
                          border: 'none',
                          background: isActiveChild(child.path) ? 'var(--blue-100)' : 'transparent',
                          color: isActiveChild(child.path) ? 'var(--blue-700)' : 'var(--gray-600)',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: isActiveChild(child.path) ? '600' : '500',
                          transition: 'all 0.2s ease',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActiveChild(child.path)) {
                            e.currentTarget.style.backgroundColor = 'var(--gray-50)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActiveChild(child.path)) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                ASHA Worker Dashboard
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

export default AshaLayout;