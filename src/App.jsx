import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { NotificationProvider } from './components/NotificationContext';

// Pages
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

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Protected Route Component
  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/signin" />;
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

          {/* Protected Routes */}
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

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
