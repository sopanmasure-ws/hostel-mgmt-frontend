import React, { useState } from 'react';

type ModalType = 'accept' | 'reject';

interface ApplicationData {
  studentName?: string;
  studentEmail?: string;
  year?: string | number;
  pnr?: string;
  appliedDate?: string;
}

interface ApplicationModalProps {
  type: ModalType;
  application: ApplicationData;
  onConfirm: (value: string, floor?: string) => void;
  onClose: () => void;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ type, application, onConfirm, onClose }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className={`${type === 'accept' ? 'bg-green-600' : 'bg-red-600'} text-white p-6 rounded-t-xl flex justify-between items-center`}>
          <h2 className="text-xl font-bold">
            {type === 'accept'
              ? `Accept Application - ${application.studentName}`
              : `Reject Application - ${application.studentName}`}
          </h2>
          <button 
            className="text-white hover:text-gray-200 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {type === 'accept' ? (
            <>
              <div>
                <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">Room Number *</label>
                <input
                  type="text"
                  id="roomNumber"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g., 101"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-2">Floor *</label>
                <input
                  type="text"
                  id="floor"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="e.g., 1, 2, 3"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <strong className="text-gray-700">Student:</strong> <span className="text-gray-900">{application.studentName}</span>
                </p>
                <p className="text-sm">
                  <strong className="text-gray-700">Email:</strong> <span className="text-gray-900">{application.studentEmail}</span>
                </p>
                <p className="text-sm">
                  <strong className="text-gray-700">Year:</strong> <span className="text-gray-900">{application.year}</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection *</label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a clear reason for rejection..."
                  rows="4"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <strong className="text-gray-700">Student:</strong> <span className="text-gray-900">{application.studentName}</span>
                </p>
                <p className="text-sm">
                  <strong className="text-gray-700">PNR:</strong> <span className="text-gray-900">{application.pnr}</span>
                </p>
                <p className="text-sm">
                  <strong className="text-gray-700">Applied Date:</strong> <span className="text-gray-900">{application.appliedDate}</span>
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 px-4 ${
                type === 'accept' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              } text-white font-semibold rounded-lg transition-colors`}
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
