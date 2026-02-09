import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { COLLEGE_INFO } from '../util/data';
import Layout from '../layout/Layout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect to sign in if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Your Hostel Management Dashboard</p>
        </div>

        {/* College Details */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">College Details</h2>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">College Name:</span>
              <span className="text-sm text-gray-900 font-semibold">{COLLEGE_INFO.name}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Location:</span>
              <span className="text-sm text-gray-900 font-semibold">{COLLEGE_INFO.location}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Affiliation:</span>
              <span className="text-sm text-gray-900 font-semibold">{COLLEGE_INFO.affiliation}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Student ID:</span>
              <span className="text-sm text-gray-900 font-semibold">{user?.pnr}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between py-3">
              <span className="text-sm font-medium text-gray-600">Email:</span>
              <span className="text-sm text-gray-900 font-semibold">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">What would you like to do?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer border-2 border-transparent hover:border-primary group"
              onClick={() => navigate('/book-hostel')}
            >
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🏨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Book Hostel</h3>
              <p className="text-gray-600">Browse available hostels and submit applications</p>
            </div>

            <div 
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer border-2 border-transparent hover:border-primary group"
              onClick={() => navigate('/applications')}
            >
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">My Applications</h3>
              <p className="text-gray-600">View and track your hostel applications</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
