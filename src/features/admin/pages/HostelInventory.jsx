import React, { useState, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../../components/NotificationContext';
import { setRooms, setFilter } from '../../../redux/adminSlice';
import { adminRoomAPI } from '../../../services/api';
import { cacheService } from '../../../shared/services/cacheService';
import Layout from '../../../components/Layout';
import SeatMap from '../components/SeatMap';
import '../styles/admin-inventory.css';

const HostelInventory = () => {
  const { hostelId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminAuth } = useSelector((state) => state);
  const { rooms, currentHostel, filters } = useSelector((state) => state.admin);
  const { showNotification } = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [floorFilter, setFloorFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'seatmap'

  useEffect(() => {
    if (!adminAuth.isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    const cacheKey = `rooms_hostel_${hostelId}`;
    
    // Try cache first
    const cachedRooms = cacheService.get(cacheKey, 'local');
    if (cachedRooms && cachedRooms.length > 0) {
      dispatch(setRooms(cachedRooms));
      setLoading(false);
      return;
    }

    // Fetch from API
    adminRoomAPI
      .getRoomsByHostel(hostelId)
      .then((response) => {
        // Handle different response formats
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
        dispatch(setRooms(roomsData));
        // Cache for 5 minutes
        cacheService.set(cacheKey, roomsData, 5 * 60 * 1000, 'local');
      })
      .catch((err) => {
        showNotification(err.message || 'Failed to load rooms', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [adminAuth.isAuthenticated, hostelId, dispatch, navigate, showNotification]);

  const getFilteredRooms = () => {
    return rooms.filter((room) => {
      if (floorFilter && room.floor !== floorFilter) return false;
      if (statusFilter && room.status !== statusFilter) return false;
      return true;
    });
  };

  const filteredRooms = getFilteredRooms();

  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === 'empty').length,
    filled: rooms.filter((r) => r.status === 'filled').length,
    damaged: rooms.filter((r) => r.status === 'damaged').length,
  };

  const uniqueFloors = [...new Set(rooms.map((r) => r.floor))].sort();

  if (loading) {
    return (
      <Layout>
        <div className="admin-inventory">
          <div className="loading">Loading inventory...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-inventory">
        <div className="inventory-header">
          <div>
            <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
              ← Back to Dashboard
            </button>
            <h1>Hostel Inventory</h1>
            <p>{currentHostel?.name || 'Hostel'} - Hostel ID: {hostelId}</p>
          </div>
        </div>

        <div className="inventory-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Rooms</div>
          </div>
          <div className="stat-card available">
            <div className="stat-value">{stats.available}</div>
            <div className="stat-label">Available</div>
          </div>
          <div className="stat-card filled">
            <div className="stat-value">{stats.filled}</div>
            <div className="stat-label">Filled</div>
          </div>
          <div className="stat-card damaged">
            <div className="stat-value">{stats.damaged}</div>
            <div className="stat-label">Damaged</div>
          </div>
        </div>

        <div className="inventory-controls">
          <div className="filters">
            <div className="filter-group">
              <label>Filter by Floor:</label>
              <select
                value={floorFilter || ''}
                onChange={(e) => setFloorFilter(e.target.value || null)}
              >
                <option value="">All Floors</option>
                {uniqueFloors.map((floor) => (
                  <option key={floor} value={floor}>
                    Floor {floor}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Filter by Status:</label>
              <select
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value || null)}
              >
                <option value="">All Statuses</option>
                <option value="empty">Empty</option>
                <option value="filled">Filled</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => {
                setFloorFilter(null);
                setStatusFilter(null);
              }}
            >
              Clear Filters
            </button>
          </div>

          <div className="view-options">
            <button
              className={`view-btn ${viewType === 'grid' ? 'active' : ''}`}
              onClick={() => setViewType('grid')}
            >
              Grid View
            </button>
            <button
              className={`view-btn ${viewType === 'seatmap' ? 'active' : ''}`}
              onClick={() => setViewType('seatmap')}
            >
              Seat Map View
            </button>
          </div>
        </div>

        {viewType === 'grid' ? (
          <div className="inventory-grid">
            {filteredRooms.length === 0 ? (
              <div className="no-data">No rooms match the selected filters.</div>
            ) : (
              filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className={`room-card status-${room.status}`}
                >
                  <div className="room-header">
                    <h3>Room {room.roomNumber}</h3>
                    <span className={`status-badge status-${room.status}`}>
                      {room.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="room-info">
                    <p>
                      <strong>Floor:</strong> {room.floor}
                    </p>
                    <p>
                      <strong>Capacity:</strong> {room.capacity}
                    </p>
                    <p>
                      <strong>Occupancy:</strong> {room.assignedStudents.length}/{room.capacity}
                    </p>
                  </div>

                  {room.assignedStudents.length > 0 && (
                    <div className="students-list">
                      <strong>Assigned Students:</strong>
                      <ul>
                        {room.assignedStudents.map((student) => (
                          <li key={student.id}>{student.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {room.status === 'damaged' && (
                    <div className="damage-note">
                      ⚠️ Room requires maintenance
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <SeatMap rooms={filteredRooms} floors={uniqueFloors} />
        )}
      </div>
    </Layout>
  );
};

export default HostelInventory;
