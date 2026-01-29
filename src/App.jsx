import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { NotificationProvider } from './components/NotificationContext';
import LoadingSpinner from './components/LoadingSpinner';
import { tokenService } from './shared/services/tokenService';
import { loginSuccess } from './redux/authSlice';
import { adminLoginSuccess } from './redux/adminAuthSlice';

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

const AdminLogin = lazy(() => import('./features/admin/pages/AdminLogin'));
const AdminSignUp = lazy(() => import('./features/admin/pages/AdminSignUp'));
const AdminDashboard = lazy(() => import('./features/admin/pages/AdminDashboard'));
const HostelApplications = lazy(() => import('./features/admin/pages/HostelApplications'));
const HostelInventory = lazy(() => import('./features/admin/pages/HostelInventory'));

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isAuthenticated: adminIsAuthenticated } = useSelector((state) => state.adminAuth);
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
        dispatch(adminLoginSuccess(storedAdmin));
      }
    } else if (tokenService.getAdminToken()) {
      tokenService.removeAdminToken();
    }
  }, [dispatch]);

  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/signin" />;
  };

  const AdminProtectedRoute = ({ element }) => {
    return adminIsAuthenticated ? element : <Navigate to="/admin/login" />;
  };

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
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignUp />} />
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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
    </NotificationProvider>
  );
}

export default App;
