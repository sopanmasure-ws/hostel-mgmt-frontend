import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { adminApplicationAPI, applicationAPI, adminRoomAPI } from '../../../services/api';
import { NotificationContext } from '../../../components/NotificationContext';
import Layout from '../../../components/Layout';
import '../styles/hostel-applications.css';

const HostelApplications = () => {
  const { hostelId } = useParams();
  const navigate = useNavigate();
  const { adminAuth } = useSelector((state) => state);
  const { currentHostel } = useSelector((state) => state.admin);
  const { showNotification } = useContext(NotificationContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'approve' or 'reject'
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

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

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getApplicationsByHostel(hostelId);
      
      let applicationsData = [];
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
      showNotification(error.message || 'Failed to load applications', 'error');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (applicationId) => {
    setDialogType('approve');
    setSelectedApplicationId(applicationId);
    setSelectedRoom('');
    setShowDialog(true);
    // Fetch available rooms
    fetchAvailableRooms();
  };

  const handleReject = (applicationId) => {
    setDialogType('reject');
    setSelectedApplicationId(applicationId);
    setRejectionReason('');
    setShowDialog(true);
  };

  const fetchAvailableRooms = async () => {
    try {
      setLoadingRooms(true);
      // Fetch available rooms from the hostel inventory endpoint
      const response = await adminRoomAPI.getAvailableRooms(hostelId);
      
      let roomsData = [];
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

  const confirmApprove = async () => {
    if (!selectedRoom) {
      showNotification('Please select a room', 'error');
      return;
    }
    try {
      // Find the selected room object to extract floor and roomNumber
      const selectedRoomObj = rooms.find(r => (r._id || r.id) === selectedRoom);
      
      const roomData = {
        roomNumber: selectedRoomObj?.roomNumber || selectedRoomObj?.name,
        floor: selectedRoomObj?.floor || selectedRoomObj?.floorNumber
      };
      
      await adminApplicationAPI.acceptApplication(selectedApplicationId, roomData);
      showNotification('Application approved successfully', 'success');
      setShowDialog(false);
      fetchApplications();
    } catch (error) {
      showNotification(error.message || 'Failed to approve application', 'error');
    }
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      showNotification('Please enter a reason for rejection', 'error');
      return;
    }
    try {
      await adminApplicationAPI.rejectApplication(selectedApplicationId, { reason: rejectionReason });
      showNotification('Application rejected', 'success');
      setShowDialog(false);
      fetchApplications();
    } catch (error) {
      showNotification(error.message || 'Failed to reject application', 'error');
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.status?.toLowerCase() === filter.toLowerCase();
  });

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
            {filteredApplications.map((app) => (
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
