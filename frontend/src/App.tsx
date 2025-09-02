import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MaternityDashboard from './pages/MaternityDashboard';
import PalliativeDashboard from './pages/PalliativeDashboard';
import AshaWorkerDashboard from './pages/AshaWorkerDashboard';
import AshaCalendarManagement from './pages/asha/CalendarManagement';
import AdminDashboard from './pages/admin/AdminDashboard';
import AshaManagement from './pages/admin/AshaManagement';
import HealthBlogsManagement from './pages/admin/content/HealthBlogsManagement';
import VaccinationSchedulesManagement from './pages/admin/content/VaccinationSchedulesManagement';
import CommunityClassesManagement from './pages/admin/content/CommunityClassesManagement';
import LocalCampsManagement from './pages/admin/content/LocalCampsManagement';
import Feedbacks from './pages/admin/Feedbacks';

import CategorySelection from './components/CategorySelection';

// Import maternity pages
import MaternityProfileSetup from './pages/maternity/ProfileSetup';
import MaternitySupplyRequests from './pages/maternity/SupplyRequests';
import VaccinationBooking from './pages/maternity/VaccinationBooking';
import MCPCard from './pages/maternity/MCPCard';
import MaternityFeedback from './pages/maternity/Feedback';
import AntenatalVisits from './pages/maternity/AntenatalVisits';

// Import palliative pages
import PalliativeProfileSetup from './pages/palliative/ProfileSetup';
import PalliativeSupplyRequests from './pages/palliative/SupplyRequests';
import HealthRecords from './pages/palliative/HealthRecords';
import PalliativeFeedback from './pages/palliative/Feedback';

// Import shared pages
import HealthBlogs from './pages/shared/HealthBlogs';
import BlogDetail from './pages/shared/BlogDetail';
import AshaHealthBlogs from './pages/asha/HealthBlogs';
import Calendar from './pages/shared/Calendar';
import VisitRequests from './pages/shared/VisitRequests';
import './App.css';

// Dashboard Redirect Component - redirects to appropriate dashboard based on user type
const DashboardRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  console.log('DashboardRedirect - loading:', loading, 'user:', user);

  if (loading) {
    console.log('DashboardRedirect - showing loading screen');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    console.log('DashboardRedirect - no user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user type and beneficiary category
  console.log('DashboardRedirect - user authenticated, redirecting based on role:', user.userType, 'and category:', user.beneficiaryCategory);
  
  switch (user.userType) {
    case 'user':
      // Further redirect based on beneficiary category
      if (user.beneficiaryCategory === 'maternity') {
        return <Navigate to="/maternity-dashboard" replace />;
      } else if (user.beneficiaryCategory === 'palliative') {
        return <Navigate to="/palliative-dashboard" replace />;
      } else {
        // Default to maternity if no category specified
        return <Navigate to="/maternity-dashboard" replace />;
      }
    case 'asha_worker':
      return <Navigate to="/asha-dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      console.error('Unknown user type:', user.userType);
      return <Navigate to="/maternity-dashboard" replace />;
  }
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - loading:', loading, 'user:', user);

  if (loading) {
    console.log('ProtectedRoute - showing loading screen');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - no user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute - user authenticated, showing protected content');
  return <>{children}</>;
};

// Public Route Component (redirect to appropriate dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('PublicRoute - loading:', loading, 'user:', user);

  if (loading) {
    console.log('PublicRoute - showing loading screen');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    console.log('PublicRoute - user authenticated, redirecting to appropriate dashboard based on role:', user.userType, 'and category:', user.beneficiaryCategory);
    // Redirect to appropriate dashboard based on user type and beneficiary category
    switch (user.userType) {
      case 'user':
        // Further redirect based on beneficiary category
        if (user.beneficiaryCategory === 'maternity') {
          return <Navigate to="/maternity-dashboard" replace />;
        } else if (user.beneficiaryCategory === 'palliative') {
          return <Navigate to="/palliative-dashboard" replace />;
        } else {
          return <Navigate to="/maternity-dashboard" replace />;
        }
      case 'asha_worker':
        return <Navigate to="/asha-dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/maternity-dashboard" replace />;
    }
  }

  console.log('PublicRoute - no user, showing public content');
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maternity-dashboard"
        element={
          <ProtectedRoute>
            <MaternityDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/palliative-dashboard"
        element={
          <ProtectedRoute>
            <PalliativeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/asha-dashboard"
        element={
          <ProtectedRoute>
            <AshaWorkerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/asha/calendar"
        element={
          <ProtectedRoute>
            <AshaCalendarManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/asha/health-blogs"
        element={
          <ProtectedRoute>
            <AshaHealthBlogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/asha/health-blogs/:id"
        element={
          <ProtectedRoute>
            <BlogDetail />
          </ProtectedRoute>
        }
      />
      {/* Maternity Routes */}
      <Route
        path="/maternity/profile"
        element={
          <ProtectedRoute>
            <MaternityProfileSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maternity/blogs"
        element={
          <ProtectedRoute>
            <HealthBlogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maternity/blogs/:id"
        element={
          <ProtectedRoute>
            <BlogDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maternity/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maternity/supplies"
        element={
          <ProtectedRoute>
            <MaternitySupplyRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maternity/visits"
        element={
          <ProtectedRoute>
            {/* Antenatal Visits page */}
            <AntenatalVisits />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maternity/vaccinations"
        element={
          <ProtectedRoute>
            <VaccinationBooking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maternity/mcp-card"
        element={
          <ProtectedRoute>
            <MCPCard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maternity/feedback"
        element={
          <ProtectedRoute>
            <MaternityFeedback />
          </ProtectedRoute>
        }
      />

      {/* Palliative Routes */}
      <Route
        path="/palliative/profile"
        element={
          <ProtectedRoute>
            <PalliativeProfileSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/palliative/blogs"
        element={
          <ProtectedRoute>
            <HealthBlogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/palliative/blogs/:id"
        element={
          <ProtectedRoute>
            <BlogDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/palliative/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/palliative/supplies"
        element={
          <ProtectedRoute>
            <PalliativeSupplyRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/palliative/visits"
        element={
          <ProtectedRoute>
            <VisitRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/palliative/records"
        element={
          <ProtectedRoute>
            <HealthRecords />
          </ProtectedRoute>
        }
      />
      <Route
        path="/palliative/feedback"
        element={
          <ProtectedRoute>
            <PalliativeFeedback />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/asha-management"
        element={
          <ProtectedRoute>
            <AshaManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/content/health-blogs"
        element={
          <ProtectedRoute>
            <HealthBlogsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/content/vaccination-schedules"
        element={
          <ProtectedRoute>
            <VaccinationSchedulesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/content/community-classes"
        element={
          <ProtectedRoute>
            <CommunityClassesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/content/local-camps"
        element={
          <ProtectedRoute>
            <LocalCampsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/feedbacks"
        element={
          <ProtectedRoute>
            <Feedbacks />
          </ProtectedRoute>
        }
      />


      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const AppContent: React.FC = () => {
  const { showCategorySelection, hideCategorySelection } = useAuth();

  return (
    <div className="App">
      <AppRoutes />
      {showCategorySelection && (
        <CategorySelection onComplete={hideCategorySelection} />
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
