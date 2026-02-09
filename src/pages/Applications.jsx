import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { applicationAPI } from '../lib/api';
import { NotificationContext } from '../component/NotificationContext';
import Layout from '../layout/Layout';
import { formatDate } from '../util/adminHelpers';

const Applications = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { hostels } = useSelector((state) => state.hostel);
  const { showNotification } = useContext(NotificationContext);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoading(true);

        if (!user?.pnr) {
          setApplications([]);
          return;
        }

        const response = await applicationAPI.getMyApplications(user.pnr);

        let applicationsData = [];
        if (Array.isArray(response)) {
          applicationsData = response;
        } else if (response?.application ) {
          applicationsData = response.application;
        } else if (response?.data ) {
          applicationsData = response.data;
        }

        setApplications([applicationsData]);
      } catch (error) {
        console.error(error);
        showNotification(error.message || 'Failed to load applications', 'error');
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [isAuthenticated, user?.pnr, navigate, showNotification]);

  const hostelMap = useMemo(() => {
    const map = {};
    hostels?.forEach((hostel) => {
      map[hostel._id] = hostel;
    });
    return map;
  }, [hostels]);
  const statusConfig = useMemo(
    () => ({
      getStatusClass: (status) => `status-badge status-${status}`,
      getStatusIcon: (status) => {
        const icons = {
          pending: '⏳',
          approved: '✓',
          rejected: '✗',
        };
        return icons[status] || '';
      },
    }),
    []
  );

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12 text-gray-600">Loading your applications...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Hostel Applications</h2>
          <p className="text-gray-600">Track the status of your hostel applications</p>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">You haven't submitted any applications yet.</p>
            <button
              className="px-6 py-3 bg-primary hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              onClick={() => navigate('/book-hostel')}
            >
              Book a Hostel
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => {
              const hostel = hostelMap[application?.hostelId];

              return (
                <div key={application.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-secondary p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="text-white">
                      <h3 className="text-xl font-bold">{application?.hostelId?.name || 'Hostel'}</h3>
                      <p className="text-sm mt-1 opacity-90">
                        Applied on: {formatDate(application.appliedOn)}
                      </p>
                    </div>

                    <div className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 ${
                      application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      <span className="text-lg">
                        {statusConfig.getStatusIcon(application.status)}
                      </span>
                      <span>
                        {application.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Student & Application Details</h4>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 font-medium">Hostel Name:</span>
                          <span className="text-sm text-gray-900">{application?.hostelId?.name|| 'N/A'}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 font-medium">Year:</span>
                          <span className="text-sm text-gray-900">{application.studentYear}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 font-medium">Branch:</span>
                          <span className="text-sm text-gray-900">{application.branch}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 font-medium">Caste:</span>
                          <span className="text-sm text-gray-900">{application.caste}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 font-medium">DOB:</span>
                          <span className="text-sm text-gray-900">{application.dateOfBirth}</span>
                        </div>
                      </div>
                    </div>

                    {application.status === 'approved' && (
                      <div>
                        <h4 className="text-lg font-semibold text-green-800 mb-4">Allocation Details</h4>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 font-medium">Room Number:</span>
                            <span className="text-sm text-green-700 font-semibold">{application.roomNumber}</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 font-medium">Floor:</span>
                            <span className="text-sm text-green-700 font-semibold">{application.floor}</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 font-medium">Approved Date:</span>
                            <span className="text-sm text-green-700 font-semibold">
                              {formatDate(application.approvedOn)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {application.status === 'rejected' && (
                      <div>
                        <h4 className="text-lg font-semibold text-red-800 mb-4">Rejection Details</h4>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 font-medium">Reason:</span>
                          <span className="text-sm text-red-700">
                            {application.reason || 'No reason provided'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Applications;
