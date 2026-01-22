import React, { useState } from 'react';
import '../styles/application-modal.css';

const ApplicationModal = ({ type, application, onConfirm, onClose }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (type === 'accept') {
      if (!roomNumber || !floor) {
        setError('Please fill in all fields');
        return;
      }
      onConfirm(roomNumber, floor);
    } else if (type === 'reject') {
      if (!reason) {
        setError('Please provide a reason for rejection');
        return;
      }
      onConfirm(reason);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {type === 'accept'
              ? `Accept Application - ${application.studentName}`
              : `Reject Application - ${application.studentName}`}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

          {type === 'accept' ? (
            <>
              <div className="form-group">
                <label htmlFor="roomNumber">Room Number *</label>
                <input
                  type="text"
                  id="roomNumber"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g., 101"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="floor">Floor *</label>
                <input
                  type="text"
                  id="floor"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="e.g., 1, 2, 3"
                  required
                />
              </div>

              <div className="modal-info">
                <p>
                  <strong>Student:</strong> {application.studentName}
                </p>
                <p>
                  <strong>Email:</strong> {application.studentEmail}
                </p>
                <p>
                  <strong>Year:</strong> {application.year}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="reason">Reason for Rejection *</label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a clear reason for rejection..."
                  rows="4"
                  required
                />
              </div>

              <div className="modal-info">
                <p>
                  <strong>Student:</strong> {application.studentName}
                </p>
                <p>
                  <strong>PNR:</strong> {application.pnr}
                </p>
                <p>
                  <strong>Applied Date:</strong> {application.appliedDate}
                </p>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${type === 'accept' ? 'btn-success' : 'btn-danger'}`}
            >
              {type === 'accept' ? 'Accept Application' : 'Reject Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;
