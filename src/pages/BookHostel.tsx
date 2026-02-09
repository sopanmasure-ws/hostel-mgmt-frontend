import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectHostel, setHostels } from '../store/hostelSlice';
import { NotificationContext } from '../component/NotificationContext';
import Pagination from '../component/Pagination';
import { hostelAPI } from '../lib/api';
import { ROUTES } from '../config';
import Layout from '../layout/Layout';
import type { Hostel, NotificationContextType, RootState } from '../types';

const BookHostel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { hostels } = useSelector((state: RootState) => state.hostel);
  const notificationContext = useContext(NotificationContext) as NotificationContextType | undefined;
  const showNotification = notificationContext?.showNotification || (() => {});
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.SIGNIN);
    }
  }, [isAuthenticated, navigate]);

  // Fetch hostels on mount
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setLoading(true);
        const response = await hostelAPI.getAllHostels();
        const allHostels = Array.isArray(response) ? response : response.hostels || [];

        dispatch(setHostels(allHostels));
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to load hostels';
        showNotification(msg, 'error');
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchHostels();
    }
  }, [isAuthenticated, showNotification, dispatch]);

  // Memoized: Filter hostels by user's gender only when hostels or user changes
  const filteredHostels = useMemo(() => {
    if (!user?.gender || hostels.length === 0) {
      return [];
    }
    return hostels.filter(
      (h) => h.gender === user.gender || h.gender === 'Co-ed'
    );
  }, [hostels, user?.gender]);

  useEffect(() => {
    setPage(1);
  }, [user?.gender, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredHostels.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const pagedHostels = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredHostels.slice(start, start + pageSize);
  }, [filteredHostels, page, pageSize]);

  const handleSelectHostel = (hostelId: string) => {
    dispatch(selectHostel(hostelId));
    navigate(`${ROUTES.HOSTEL_DETAILS}/${hostelId}`);
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12 text-gray-600">Loading hostels...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Hostels for {user?.gender?.toUpperCase()}</h2>
          <p className="text-gray-600">Select a hostel to view details and apply</p>
        </div>

        {filteredHostels.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No hostels available for your gender at the moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {pagedHostels.map((hostel) => (
              <div key={hostel._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img src={hostel.image} alt={hostel.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{hostel.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Warden:</strong> {hostel.warden}
                  </p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{hostel.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Available Rooms:</span>
                      <span className="text-gray-900 font-semibold">{hostel.availableRooms}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Price/Month:</span>
                      <span className="text-gray-900 font-semibold">₹{hostel.rentPerMonth}</span>
                    </div>
                  </div>
                  <button
                    className="w-full py-2.5 bg-primary hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    onClick={() => handleSelectHostel(hostel._id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
            </div>

            {filteredHostels.length > pageSize && (
              <Pagination
                totalItems={filteredHostels.length}
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
    </Layout>
  );
};

export default BookHostel;
