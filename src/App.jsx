import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { NotificationProvider } from './component/NotificationContext';
import LoadingSpinner from './component/LoadingSpinner';
import { tokenService } from './lib/services/tokenService';
import { loginSuccess } from './store/authSlice';
import { adminLoginSuccess } from './store/adminAuthSlice';

const Home = lazy(() => import('./pages/Home'));
const SignIn = lazy(() => import('./pages/SignIn'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BookHostel = lazy(() => import('./pages/BookHostel'));
const HostelDetails = lazy(() => import('./pages/HostelDetails'));
const ApplicationForm = lazy(() => import('./pages/ApplicationForm'));
const Applications = lazy(() => import('./pages/Applications'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

const AdminLogin = lazy(() => import('./pages/admin/pages/AdminLogin'));
const AdminSignUp = lazy(() => import('./pages/admin/pages/AdminSignUp'));
const AdminDashboard = lazy(() => import('./pages/admin/pages/AdminDashboard'));
const HostelApplications = lazy(() => import('./pages/admin/pages/HostelApplications'));
const HostelInventory = lazy(() => import('./pages/admin/pages/HostelInventory'));

// Super Admin Components
const SuperAdminDashboard = lazy(() => import('./pages/admin/pages/SuperAdminDashboard'));
const SuperAdminStudents = lazy(() => import('./pages/admin/pages/SuperAdminStudents'));
const SuperAdminAdmins = lazy(() => import('./pages/admin/pages/SuperAdminAdmins'));
const SuperAdminHostels = lazy(() => import('./pages/admin/pages/SuperAdminHostels'));

const ProtectedRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/signin" />;
};

const AdminProtectedRoute = ({ element, adminIsAuthenticated, adminRole }) => {
  // Allow regular admins but not super admins on regular admin routes
  if (!adminIsAuthenticated) {
    return <Navigate to="/admin/login" />;
  }
  // If it's a super admin trying to access admin routes, redirect to super admin dashboard
  if (adminRole === 'superadmin' || adminRole === 'SUPERADMIN') {
    return <Navigate to="/superadmin/dashboard" />;
  }
  return element;
};

const SuperAdminProtectedRoute = ({ element, adminIsAuthenticated, adminRole }) => {
  return adminIsAuthenticated && (adminRole === 'superadmin' || adminRole === 'SUPERADMIN') ? element : <Navigate to="/admin/login" />;
};

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isAuthenticated: adminIsAuthenticated, role: adminRole } = useSelector((state) => state.adminAuth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (tokenService.isStudentTokenValid()) {
      const storedUser = tokenService.getStudentUser();
      if (storedUser) {
        dispatch(loginSuccess(storedUser));
      }
    } else if (tokenService.getStudentToken()) {
      tokenService.removeStudentToken();
    }

    if (tokenService.isAdminTokenValid()) {
      const storedAdmin = tokenService.getAdminUser();
      if (storedAdmin) {
        // Restore admin with role intact
        dispatch(adminLoginSuccess({ 
          admin: storedAdmin,
          role: storedAdmin.role // Ensure role is passed
        }));
      }
    } else if (tokenService.getAdminToken()) {
      tokenService.removeAdminToken();
    }
  }, [dispatch]);

  return (
    <NotificationProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
           
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<Dashboard />} isAuthenticated={isAuthenticated} />}
            />
            <Route
              path="/book-hostel"
              element={<ProtectedRoute element={<BookHostel />} isAuthenticated={isAuthenticated} />}
            />
            <Route
              path="/hostel-details/:hostelId"
              element={<ProtectedRoute element={<HostelDetails />} isAuthenticated={isAuthenticated} />}
            />
            <Route
              path="/application-form/:hostelId"
              element={<ProtectedRoute element={<ApplicationForm />} isAuthenticated={isAuthenticated} />}
            />
            <Route
              path="/applications"
              element={<ProtectedRoute element={<Applications />} isAuthenticated={isAuthenticated} />}
            />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignUp />} />
            <Route
              path="/admin/dashboard"
              element={<AdminProtectedRoute element={<AdminDashboard />} adminIsAuthenticated={adminIsAuthenticated} adminRole={adminRole} />}
            />
            <Route
              path="/admin/hostel/:hostelId"
              element={<AdminProtectedRoute element={<HostelApplications />} adminIsAuthenticated={adminIsAuthenticated} adminRole={adminRole} />}
            />
            <Route
              path="/admin/hostel/:hostelId/inventory"
              element={<AdminProtectedRoute element={<HostelInventory />} adminIsAuthenticated={adminIsAuthenticated} adminRole={adminRole} />}
            />
            
            {/* Super Admin Routes */}
            <Route
              path="/superadmin/dashboard"
              element={<SuperAdminProtectedRoute element={<SuperAdminDashboard />} adminIsAuthenticated={adminIsAuthenticated} adminRole={adminRole} />}
            />
            <Route
              path="/superadmin/students"
              element={<SuperAdminProtectedRoute element={<SuperAdminStudents />} adminIsAuthenticated={adminIsAuthenticated} adminRole={adminRole} />}
            />
            <Route
              path="/superadmin/admins"
              element={<SuperAdminProtectedRoute element={<SuperAdminAdmins />} adminIsAuthenticated={adminIsAuthenticated} adminRole={adminRole} />}
            />
            <Route
              path="/superadmin/hostels"
              element={<SuperAdminProtectedRoute element={<SuperAdminHostels />} adminIsAuthenticated={adminIsAuthenticated} adminRole={adminRole} />}
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
    </NotificationProvider>
  );
}

export default App;
