import React, { useState, useMemo } from 'react';
import '../styles/seat-map.css';

interface StudentInfo {
  name: string;
}

interface RoomInfo {
  id: string | number;
  roomNumber: string | number;
  floor: string | number;
  status: 'available' | 'filled' | 'damaged';
  assignedStudents: StudentInfo[];
  capacity: number;
}

interface SeatMapProps {
  rooms: RoomInfo[];
  floors: Array<string | number>;
}

const SeatMap: React.FC<SeatMapProps> = ({ rooms, floors }) => {
  const [selectedFloor, setSelectedFloor] = useState<string | number>(floors[0] || '1');

  // Memoized: Only recalculates when rooms or selectedFloor changes
  const floorRooms = useMemo(() => {
    return rooms.filter((room) => room.floor === selectedFloor);
  }, [rooms, selectedFloor]);

  // Memoized: Status color mapping - only created once
  const statusColors = useMemo(() => ({
    available: '#4CAF50',
    filled: '#FF9800',
    damaged: '#F44336',
  }), []);

  // Memoized: Status icons mapping - only created once
  const statusIcons = useMemo(() => ({
    available: '✓',
    filled: '👥',
    damaged: '⚠️',
  }), []);

  const getRoomStatusColor = (status: RoomInfo['status']) => {
    return statusColors[status] || '#9E9E9E';
  };

  const getRoomStatusIcon = (status: RoomInfo['status']) => {
    return statusIcons[status] || '?';
  };

  return (
    <div className="seat-map-container">
      <div className="floor-selector">
        <h3>Select Floor:</h3>
        <div className="floor-buttons">
          {floors.map((floor) => (
            <button
              key={floor}
              className={`floor-btn ${selectedFloor === floor ? 'active' : ''}`}
              onClick={() => setSelectedFloor(floor)}
            >
              {floor}
            </button>
          ))}
        </div>
      </div>

      <div className="seat-map">
        <h3>Floor {selectedFloor} - Room Layout</h3>

        {floorRooms.length === 0 ? (
          <div className="no-rooms">No rooms on this floor.</div>
        ) : (
          <>
            <div className="legend">
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: '#4CAF50' }}
                />
                Available
              </div>
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: '#FF9800' }}
                />
                Filled
              </div>
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: '#F44336' }}
                />
                Damaged
              </div>
            </div>

            <div className="rooms-grid">
              {floorRooms.map((room) => (
                <div
                  key={room.id}
                  className="room-seat"
                  style={{ backgroundColor: getRoomStatusColor(room.status) }}
                  title={`Room ${room.roomNumber} - ${room.status.toUpperCase()}`}
                >
                  <div className="room-number">{room.roomNumber}</div>
                  <div className="room-icon">{getRoomStatusIcon(room.status)}</div>
                  {room.status === 'filled' && (
                    <div className="room-occupancy">
                      {room.assignedStudents.length}/{room.capacity}
                    </div>
                  )}
                  {room.assignedStudents.length > 0 && room.status === 'filled' && (
                    <div className="room-tooltip">
                      {room.assignedStudents.map((s) => s.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="floor-statistics">
              <h4>Floor {selectedFloor} Statistics</h4>
              <div className="stats-grid">
                <div className="stat">
                  <span className="stat-label">Total Rooms:</span>
                  <span className="stat-value">{floorRooms.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Available:</span>
                  <span className="stat-value">
                    {floorRooms.filter((r) => r.status === 'available').length}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Filled:</span>
                  <span className="stat-value">
                    {floorRooms.filter((r) => r.status === 'filled').length}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Damaged:</span>
                  <span className="stat-value">
                    {floorRooms.filter((r) => r.status === 'damaged').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="room-details">
              <h4>Room Details</h4>
              <table>
                <thead>
                  <tr>
                    <th>Room No.</th>
                    <th>Status</th>
                    <th>Occupancy</th>
                    <th>Assigned Students</th>
                  </tr>
                </thead>
                <tbody>
                  {floorRooms.map((room) => (
                    <tr key={room.id}>
                      <td>{room.roomNumber}</td>
                      <td>
                        <span
                          className={`status-badge status-${room.status}`}
                        >
                          {room.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {room.assignedStudents.length}/{room.capacity}
                      </td>
                      <td>
                        {room.assignedStudents.length > 0
                          ? room.assignedStudents
                              .map((s) => s.name)
                              .join(', ')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SeatMap;
