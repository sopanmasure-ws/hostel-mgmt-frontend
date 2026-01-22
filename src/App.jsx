import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { NotificationProvider } from './components/NotificationContext';
import { tokenService } from './shared/services/tokenService';
import { loginSuccess } from './redux/authSlice';
import { adminLoginSuccess } from './redux/adminAuthSlice';

// Pages - Student
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookHostel from './pages/BookHostel';
import HostelDetails from './pages/HostelDetails';
import ApplicationForm from './pages/ApplicationForm';
import Applications from './pages/Applications';
import About from './pages/About';
import Contact from './pages/Contact';

// Pages - Admin
import AdminLogin from './features/admin/pages/AdminLogin';
import AdminSignUp from './features/admin/pages/AdminSignUp';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import HostelApplications from './features/admin/pages/HostelApplications';
import HostelInventory from './features/admin/pages/HostelInventory';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isAuthenticated: adminIsAuthenticated } = useSelector((state) => state.adminAuth);
  const dispatch = useDispatch();

  // Check tokens on app mount
  useEffect(() => {
    // Check student token
    if (tokenService.isStudentTokenValid()) {
      const storedUser = tokenService.getStudentUser();
      if (storedUser) {
        dispatch(loginSuccess(storedUser));
      }
    } else if (tokenService.getStudentToken()) {
      // Token expired, clear it
      tokenService.removeStudentToken();
    }

    // Check admin token
    if (tokenService.isAdminTokenValid()) {
      const storedAdmin = tokenService.getAdminUser();
      if (storedAdmin) {
        dispatch(adminLoginSuccess(storedAdmin));
      }
    } else if (tokenService.getAdminToken()) {
      // Token expired, clear it
      tokenService.removeAdminToken();
    }
  }, [dispatch]);

  // Protected Route Component for Students
  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/signin" />;
  };

  // Protected Route Component for Admin
  const AdminProtectedRoute = ({ element }) => {
    return adminIsAuthenticated ? element : <Navigate to="/admin/login" />;
  };

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Student Protected Routes */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<Dashboard />} />}
          />
          <Route
            path="/book-hostel"
            element={<ProtectedRoute element={<BookHostel />} />}
          />
          <Route
            path="/hostel-details/:hostelId"
            element={<ProtectedRoute element={<HostelDetails />} />}
          />
          <Route
            path="/application-form/:hostelId"
            element={<ProtectedRoute element={<ApplicationForm />} />}
          />
          <Route
            path="/applications"
            element={<ProtectedRoute element={<Applications />} />}
          />

          {/* Admin Public Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignUp />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={<AdminProtectedRoute element={<AdminDashboard />} />}
          />
          <Route
            path="/admin/hostel/:hostelId"
            element={<AdminProtectedRoute element={<HostelApplications />} />}
          />
          <Route
            path="/admin/hostel/:hostelId/inventory"
            element={<AdminProtectedRoute element={<HostelInventory />} />}
          />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
