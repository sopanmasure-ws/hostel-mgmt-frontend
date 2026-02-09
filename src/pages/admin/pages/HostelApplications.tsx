import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { adminApplicationAPI, applicationAPI, adminRoomAPI } from '../../../lib/api';
import { NotificationContext } from '../../../component/NotificationContext';
import Pagination from '../../../component/Pagination';
import Layout from '../../../layout/Layout';
import '../../../styles/hostel-applications.css';
import type { Application, NotificationContextType, RootState, Room } from '../../../types';

const HostelApplications: React.FC = () => {
  const { hostelId } = useParams<{ hostelId?: string }>();
  const navigate = useNavigate();
  const { adminAuth } = useSelector((state: RootState) => state);
  const { currentHostel } = useSelector((state: RootState) => state.admin);
  const notificationContext = useContext(NotificationContext) as NotificationContextType | undefined;
  const showNotification = notificationContext?.showNotification || (() => {});
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all'); // all, pending, approved, rejected
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [dialogType, setDialogType] = useState<string>(''); // 'approve' or 'reject'
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    if (!adminAuth.isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    if (!hostelId) {
      navigate('/admin/dashboard');
      return;
    }

    fetchApplications();
  }, [hostelId, adminAuth.isAuthenticated, navigate]);

  const fetchApplications = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await applicationAPI.getApplicationsByHostel(hostelId);
      
      let applicationsData: Application[] = [];
      if (Array.isArray(response)) {
        applicationsData = response;
      } else if (response?.applications && Array.isArray(response.applications)) {
        applicationsData = response.applications;
      } else if (response?.data && Array.isArray(response.data)) {
        applicationsData = response.data;
      }
      
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      const msg = error instanceof Error ? error.message : 'Failed to load applications';
      showNotification(msg, 'error');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (applicationId: string) => {
    setDialogType('approve');
    setSelectedApplicationId(applicationId);
    setSelectedRoom('');
    setShowDialog(true);
    // Fetch available rooms
    fetchAvailableRooms();
  };

  const handleReject = (applicationId: string) => {
    setDialogType('reject');
    setSelectedApplicationId(applicationId);
    setRejectionReason('');
    setShowDialog(true);
  };

  const fetchAvailableRooms = async (): Promise<void> => {
    try {
      setLoadingRooms(true);
      // Fetch available rooms from the hostel inventory endpoint
      const response = await adminRoomAPI.getAvailableRooms(hostelId);
      
      let roomsData: Room[] = [];
      if (Array.isArray(response)) {
        roomsData = response;
      } else if (response?.data?.rooms && Array.isArray(response.data.rooms)) {
        roomsData = response.data.rooms;
      } else if (response?.rooms && Array.isArray(response.rooms)) {
        roomsData = response.rooms;
      } else if (response?.data && Array.isArray(response.data)) {
        roomsData = response.data;
      }
      
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      showNotification('Failed to load available rooms', 'error');
    } finally {
      setLoadingRooms(false);
    }
  };

  const confirmApprove = async (): Promise<void> => {
    if (!selectedRoom) {
      showNotification('Please select a room', 'error');
      return;
    }
    try {
      // Find the selected room object to extract floor and roomNumber
      const selectedRoomObj = rooms.find(r => (r._id || (r as any).id) === selectedRoom);
      
      const roomData = {
        roomNumber: selectedRoomObj?.roomNumber || selectedRoomObj?.name,
        floor: selectedRoomObj?.floor || selectedRoomObj?.floorNumber
      };
      
      await adminApplicationAPI.changeApplicationStatus(selectedApplicationId, roomData, 'APPROVED');
      showNotification('Application approved successfully', 'success');
      setShowDialog(false);
      fetchApplications();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to approve application';
      showNotification(msg, 'error');
    }
  };

  const confirmReject = async (): Promise<void> => {
    if (!rejectionReason.trim()) {
      showNotification('Please enter a reason for rejection', 'error');
      return;
    }
    try {
      await adminApplicationAPI.rejectStudentApplication(selectedApplicationId, { reason: rejectionReason }, 'REJECTED');
      showNotification('Application rejected', 'success');
      setShowDialog(false);
      fetchApplications();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to reject application';
      showNotification(msg, 'error');
    }
  };

  // Memoized: Only recalculate filtered applications when applications or filter changes
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (filter === 'all') return true;
      return app.status?.toLowerCase() === filter.toLowerCase();
    });
  }, [applications, filter]);

  useEffect(() => {
    setPage(1);
  }, [filter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const pagedApplications = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, page, pageSize]);

  if (loading) {
    return (
      <Layout>
        <div className="hostel-applications">
          <div className="loading">Loading applications...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="hostel-applications">
        <div className="applications-header">
          <div>
            <h1>Applications</h1>
            <p className="hostel-name">
              {currentHostel?.name || 'Hostel'} - Hostel ID: {hostelId}
            </p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </button>
        </div>

        <div className="filter-section">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({applications.length})
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({applications.filter((a) => a.status?.toLowerCase() === 'pending').length})
          </button>
          <button
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({applications.filter((a) => a.status?.toLowerCase() === 'approved').length})
          </button>
          <button
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({applications.filter((a) => a.status?.toLowerCase() === 'rejected').length})
          </button>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="no-data">
            <p>No applications found for the selected filter.</p>
          </div>
        ) : (
          <div className="applications-list">
            {pagedApplications.map((app) => (
              <div key={app._id} className={`application-card status-${app.status?.toLowerCase()}`}>
                <div className="app-header">
                  <div>
                    <h3>{app.studentName || 'N/A'}</h3>
                    <p className="pnr">PNR: {app.studentPNR || 'N/A'}</p>
                  </div>
                  <div className={`status-badge ${app.status?.toLowerCase()}`}>
                    {app.status || 'Unknown'}
                  </div>
                </div>

                <div className="app-details">
                 
                  <div className="detail-row">
                    <span className="label">Year:</span>
                    <span className="value">{app.studentYear || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Caste:</span>
                    <span className="value">{app.caste || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Applied on:</span>
                    <span className="value">
                      {app.appliedOn ? new Date(app.appliedOn).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                   <div className="detail-row">
                    <span className="label">Room No.:</span>
                    <span className="value">
                      {app.roomNumber || 'N/A'}
                    </span>
                  </div>
                   <div className="detail-row">
                    <span className="label">Floor:</span>
                    <span className="value">
                      {app.floor || 'N/A'}
                    </span>
                  </div>
                </div>

                {app.status?.toLowerCase() === 'pending' && (
                  <div className="app-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprove(app._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleReject(app._id)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {filteredApplications.length > pageSize && (
          <Pagination
            totalItems={filteredApplications.length}
            currentPage={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50]}
          />
        )}
      </div>

      {/* Dialog Box */}
      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            {dialogType === 'approve' ? (
              <>
                <h3>Approve Application</h3>
                <p>Select a room to assign to this student:</p>
                <div className="dialog-content">
                  {loadingRooms ? (
                    <div className="loading-rooms">Loading available rooms...</div>
                  ) : rooms.length === 0 ? (
                    <div className="no-rooms">No available rooms found</div>
                  ) : (
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      className="room-select"
                    >
                      <option value="">-- Select Room --</option>
                      {rooms.map((room) => (
                        <option key={room._id || room.id} value={room._id || room.id}>
                        {room.floor || room.floorNumber} - Room {room.roomNumber || room.name} ({room.type || 'Standard'}) - {(room.capacity - room.occupiedSpaces) || 'N/A'} seats available
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="dialog-actions">
                  <button
                    className="btn btn-success"
                    onClick={confirmApprove}
                    disabled={loadingRooms || !selectedRoom}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Reject Application</h3>
                <p>Enter reason for rejection:</p>
                <div className="dialog-content">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="reason-textarea"
                    rows="4"
                  />
                </div>
                <div className="dialog-actions">
                  <button
                    className="btn btn-danger"
                    onClick={confirmReject}
                  >
                    Reject
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HostelApplications;
