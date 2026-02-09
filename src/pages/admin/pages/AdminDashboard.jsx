import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../../component/NotificationContext';
import { setCurrentHostel, setAdminHostels } from '../../../store/adminSlice';
import { adminHostelAPI } from '../../../lib/api';
import { cacheService } from '../../../lib/services/cacheService';
import Pagination from '../../../component/Pagination';
import Layout from '../../../layout/Layout';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminAuth } = useSelector((state) => state);
  const { adminHostels } = useSelector((state) => state.admin);
  const { showNotification } = useContext(NotificationContext);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    if (!adminAuth.isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    const adminId = adminAuth.admin?.adminId;
    
    if (!adminId) {
      showNotification('Admin ID not found', 'error');
      setLoading(false);
      return;
    }

    const cacheKey = `admin_hostels_${adminId}`;
    const cachedHostels = cacheService.get(cacheKey, 'local');
    
    if (cachedHostels && cachedHostels.length > 0) {
      dispatch(setAdminHostels(cachedHostels));
      setLoading(false);
      return;
    }

    adminHostelAPI
      .getAdminHostels(adminId)
      .then((response) => {
        const hostels = Array.isArray(response.data.hostels) ? response.data.hostels : [];
        dispatch(setAdminHostels(hostels));
        cacheService.set(cacheKey, hostels, 10 * 60 * 1000, 'local');
      })
      .catch((err) => {
        showNotification(err.message || 'Failed to load hostels', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [adminAuth.isAuthenticated, adminAuth.admin?.adminId, dispatch, navigate, showNotification]);

  const totalPages = Math.max(1, Math.ceil(adminHostels.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const pagedHostels = useMemo(() => {
    const start = (page - 1) * pageSize;
    return adminHostels.slice(start, start + pageSize);
  }, [adminHostels, page, pageSize]);

  const handleViewHostel = (hostel) => {
    dispatch(setCurrentHostel(hostel));
    navigate(`/admin/hostel/${hostel._id}`);
  };

  const handleLogout = () => {
    dispatch({ type: 'adminAuth/adminLogout' });
    navigate('/admin/login');
    showNotification('Logged out successfully', 'success');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading your hostels...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-purple-100 mt-1">Welcome, {adminAuth.admin?.name || 'Admin'}</p>
            </div>
            <div>
              <button 
                className="px-6 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-150 shadow-md" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🏨</div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{adminHostels.length}</h3>
                <p className="text-sm text-gray-600">Hostels Managed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🛏️</div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{adminHostels.reduce((sum, h) => sum + h.capacity, 0)}</h3>
                <p className="text-sm text-gray-600">Total Rooms</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">✅</div>
              <div>
                <h3 className="text-3xl font-bold text-green-600">{adminHostels.reduce((sum, h) => sum + h.availableRooms, 0)}</h3>
                <p className="text-sm text-gray-600">Available Rooms</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📋</div>
              <div>
                <h3 className="text-3xl font-bold text-orange-600">{adminHostels.reduce((sum, h) => sum + h.pendingApplications, 0)}</h3>
                <p className="text-sm text-gray-600">Pending Applications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hostels Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Hostels</h2>
          {adminHostels.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600">You are not managing any hostels yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {pagedHostels.map((hostel) => (
                <div key={hostel.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="h-48 overflow-hidden bg-gray-200">
                    <img src={hostel.image} alt={hostel.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{hostel.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">📍 {hostel.location}</p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="text-xs text-gray-600 block">Total Rooms</span>
                        <span className="text-lg font-bold text-gray-900">{hostel.capacity}</span>
                      </div>
                      <div className="bg-red-50 p-3 rounded">
                        <span className="text-xs text-gray-600 block">Filled</span>
                        <span className="text-lg font-bold text-red-600">{hostel.capacity - hostel.availableRooms}</span>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <span className="text-xs text-gray-600 block">Available</span>
                        <span className="text-lg font-bold text-green-600">{hostel.availableRooms}</span>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <span className="text-xs text-gray-600 block">Pending</span>
                        <span className="text-lg font-bold text-orange-600">{hostel.pendingApplications}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <button
                        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-150"
                        onClick={() => handleViewHostel(hostel)}
                      >
                        Manage Applications
                      </button>
                      <button
                        className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors duration-150"
                        onClick={() => navigate(`/admin/hostel/${hostel._id}/inventory`)}
                      >
                        View Inventory
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>

              {adminHostels.length > pageSize && (
                <Pagination
                  totalItems={adminHostels.length}
                  currentPage={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[6, 12, 24]}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
