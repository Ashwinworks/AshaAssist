import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Users, 
  FileText, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  Heart,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contentManagementOpen, setContentManagementOpen] = useState(false);

  const menuItems = [
    { 
      path: '/admin/dashboard', 
      icon: Home, 
      label: 'Dashboard',
      color: 'var(--blue-600)'
    },
    { 
      path: '/admin/asha-management', 
      icon: Users, 
      label: 'ASHA Worker Management',
      color: 'var(--green-600)'
    },
    { 
      path: '/admin/users', 
      icon: Users, 
      label: 'User Management',
      color: 'var(--blue-600)'
    },
    { 
      path: '', 
      icon: FileText, 
      label: 'Content Management',
      color: 'var(--purple-600)',
      isDropdown: true,
      subItems: [
        { path: '/admin/content/health-blogs', label: 'Health Blogs' },
        { path: '/admin/content/vaccination-schedules', label: 'Vaccination Schedules' },
        { path: '/admin/content/community-classes', label: 'Community Classes' },
        { path: '/admin/content/local-camps', label: 'Local Camps' }
      ]
    },
    { 
      path: '/admin/feedbacks', 
      icon: MessageSquare, 
      label: 'Feedbacks',
      color: 'var(--yellow-600)'
    },
  ];

  const handleNavigation = (path: string) => {
    if (path) {
      navigate(path);
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Admin logout initiated...');
      await logout();
      console.log('Logout successful, navigating to home...');
      // Use window.location to force a complete page reload
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force navigation even if logout fails
      window.location.href = '/';
    }
  };

  const isActivePath = (path: string) => {
    if (path === '') return false;
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const isContentManagementActive = () => {
    return location.pathname.startsWith('/admin/content');
  };

  React.useEffect(() => {
    if (isContentManagementActive()) {
      setContentManagementOpen(true);
    }
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--gray-50)' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '90px',
        backgroundColor: 'white',
        borderRight: '1px solid var(--gray-200)',
        position: 'fixed',
        height: '100vh',
        transition: 'width 0.3s ease',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid var(--gray-200)',
          backgroundColor: 'var(--primary-600)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Heart size={28} />
            {sidebarOpen && (
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>AshaAssist</h2>
                <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>Admin Panel</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.isDropdown ? (
                <div>
                  <button
                    onClick={() => setContentManagementOpen(!contentManagementOpen)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: sidebarOpen ? '1rem 1.5rem' : '1rem',
                      border: 'none',
                      background: isContentManagementActive() ? 'var(--blue-50)' : 'transparent',
                      color: isContentManagementActive() ? 'var(--blue-700)' : 'var(--gray-700)',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderLeft: isContentManagementActive() ? '4px solid var(--blue-600)' : '4px solid transparent',
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isContentManagementActive()) {
                        e.currentTarget.style.backgroundColor = 'var(--gray-50)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isContentManagementActive()) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <item.icon size={22} />
                    {sidebarOpen && (
                      <>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {contentManagementOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </>
                    )}
                  </button>
                  {contentManagementOpen && sidebarOpen && (
                    <div style={{ backgroundColor: 'var(--gray-25)' }}>
                      {item.subItems?.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => handleNavigation(subItem.path)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 3rem',
                            border: 'none',
                            background: isActivePath(subItem.path) ? 'var(--blue-50)' : 'transparent',
                            color: isActivePath(subItem.path) ? 'var(--blue-700)' : 'var(--gray-600)',
                            fontSize: '0.8125rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderLeft: isActivePath(subItem.path) ? '4px solid var(--blue-600)' : '4px solid transparent',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActivePath(subItem.path)) {
                              e.currentTarget.style.backgroundColor = 'var(--gray-50)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActivePath(subItem.path)) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleNavigation(item.path)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: sidebarOpen ? '1rem 1.5rem' : '1rem',
                    border: 'none',
                    background: isActivePath(item.path) ? 'var(--blue-50)' : 'transparent',
                    color: isActivePath(item.path) ? 'var(--blue-700)' : 'var(--gray-700)',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderLeft: isActivePath(item.path) ? '4px solid var(--blue-600)' : '4px solid transparent',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActivePath(item.path)) {
                      e.currentTarget.style.backgroundColor = 'var(--gray-50)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActivePath(item.path)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <item.icon size={22} />
                  {sidebarOpen && item.label}
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--gray-200)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: sidebarOpen ? '0.75rem 1.5rem' : '0.75rem',
              border: '1px solid var(--red-200)',
              background: 'white',
              color: 'var(--red-600)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              textAlign: 'left',
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
            <LogOut size={22} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        marginLeft: sidebarOpen ? '280px' : '90px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Top Bar */}
        <header style={{ 
          backgroundColor: 'white', 
          borderBottom: '1px solid var(--gray-200)',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: 'var(--gray-900)' 
            }}>
              {title}
            </h1>
            <p style={{ 
              margin: 0, 
              fontSize: '0.875rem', 
              color: 'var(--gray-600)',
              fontWeight: '500'
            }}>
              Admin Panel
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--blue-50)',
              borderRadius: '0.5rem',
              border: '1px solid var(--blue-200)'
            }}>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: 'var(--blue-700)' 
              }}>
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ 
          flex: 1, 
          padding: '2rem 1.5rem',
          overflow: 'auto'
        }}>
          {children}
        </main>
      </div>


    </div>
  );
};

export default AdminLayout;