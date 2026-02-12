import applicationReducer, {
  setApplications,
  submitApplication,
  updateApplicationStatus,
} from '../../src/store/applicationSlice';

describe('Application Slice - Student Application Flow', () => {
  const initialState = {
    applications: [],
  };

  describe('Student Application Submission', () => {
    it('should submit application', () => {
      const application = {
        id: 'app1',
        userId: 'user1',
        studentName: 'John Doe',
        hostelId: 'H1',
        status: 'PENDING',
        pnr: 'PNR123',
      };

      const state = applicationReducer(initialState, submitApplication(application));

      expect(state.applications).toHaveLength(1);
      expect(state.applications[0]).toEqual(application);
    });

    it('should prevent duplicate approved applications for same user', () => {
      const approvedApp = {
        id: 'app1',
        userId: 'user1',
        studentName: 'John Doe',
        hostelId: 'H1',
        status: 'APPROVED',
        pnr: 'PNR123',
      };

      const newApp = {
        id: 'app2',
        userId: 'user1',
        studentName: 'John Doe',
        hostelId: 'H2',
        status: 'PENDING',
        pnr: 'PNR456',
      };

      let state = applicationReducer(initialState, submitApplication(approvedApp));
      state = applicationReducer(state, submitApplication(newApp));

      expect(state.applications).toHaveLength(1);
      expect(state.applications[0].id).toBe('app1');
    });

    it('should allow new application if no approved application exists', () => {
      const pendingApp = {
        id: 'app1',
        userId: 'user1',
        studentName: 'John Doe',
        hostelId: 'H1',
        status: 'PENDING',
        pnr: 'PNR123',
      };

      const newApp = {
        id: 'app2',
        userId: 'user1',
        studentName: 'John Doe',
        hostelId: 'H2',
        status: 'PENDING',
        pnr: 'PNR456',
      };

      let state = applicationReducer(initialState, submitApplication(pendingApp));
      state = applicationReducer(state, submitApplication(newApp));

      expect(state.applications).toHaveLength(2);
    });

    it('should allow applications from different users', () => {
      const app1 = {
        id: 'app1',
        userId: 'user1',
        studentName: 'John Doe',
        hostelId: 'H1',
        status: 'APPROVED',
        pnr: 'PNR123',
      };

      const app2 = {
        id: 'app2',
        userId: 'user2',
        studentName: 'Jane Smith',
        hostelId: 'H1',
        status: 'APPROVED',
        pnr: 'PNR456',
      };

      let state = applicationReducer(initialState, submitApplication(app1));
      state = applicationReducer(state, submitApplication(app2));

      expect(state.applications).toHaveLength(2);
    });
  });

  describe('Admin Application Management', () => {
    it('should set applications list', () => {
      const applications = [
        { id: 'app1', userId: 'user1', studentName: 'John', status: 'PENDING', pnr: 'PNR123', hostelId: 'H1' },
        { id: 'app2', userId: 'user2', studentName: 'Jane', status: 'PENDING', pnr: 'PNR456', hostelId: 'H1' },
      ];

      const state = applicationReducer(initialState, setApplications(applications));

      expect(state.applications).toHaveLength(2);
      expect(state.applications).toEqual(applications);
    });

    it('should replace existing applications when setting new list', () => {
      const oldApps = [
        { id: 'app1', userId: 'user1', studentName: 'John', status: 'PENDING', pnr: 'PNR123', hostelId: 'H1' },
      ];

      const newApps = [
        { id: 'app2', userId: 'user2', studentName: 'Jane', status: 'PENDING', pnr: 'PNR456', hostelId: 'H1' },
        { id: 'app3', userId: 'user3', studentName: 'Bob', status: 'PENDING', pnr: 'PNR789', hostelId: 'H1' },
      ];

      let state = applicationReducer(initialState, setApplications(oldApps));
      state = applicationReducer(state, setApplications(newApps));

      expect(state.applications).toHaveLength(2);
      expect(state.applications).toEqual(newApps);
    });

    it('should update application status to accepted with room details', () => {
      const stateWithApps = {
        applications: [
          { id: 'app1', userId: 'user1', studentName: 'John', status: 'PENDING', pnr: 'PNR123', hostelId: 'H1' },
        ],
      };

      const state = applicationReducer(
        stateWithApps,
        updateApplicationStatus({
          applicationId: 'app1',
          status: 'ACCEPTED',
          roomNumber: '201',
          floor: '2',
        })
      );

      expect(state.applications[0].status).toBe('ACCEPTED');
      expect(state.applications[0].roomNumber).toBe('201');
      expect(state.applications[0].floor).toBe('2');
    });

    it('should update application status to rejected with reason', () => {
      const stateWithApps = {
        applications: [
          { id: 'app1', userId: 'user1', studentName: 'John', status: 'PENDING', pnr: 'PNR123', hostelId: 'H1' },
        ],
      };

      const state = applicationReducer(
        stateWithApps,
        updateApplicationStatus({
          applicationId: 'app1',
          status: 'REJECTED',
          reason: 'No rooms available',
        })
      );

      expect(state.applications[0].status).toBe('REJECTED');
      expect(state.applications[0].reason).toBe('No rooms available');
    });

    it('should not update non-existent application', () => {
      const stateWithApps = {
        applications: [
          { id: 'app1', userId: 'user1', studentName: 'John', status: 'PENDING', pnr: 'PNR123', hostelId: 'H1' },
        ],
      };

      const state = applicationReducer(
        stateWithApps,
        updateApplicationStatus({
          applicationId: 'app999',
          status: 'ACCEPTED',
        })
      );

      expect(state.applications[0].status).toBe('PENDING');
    });

    it('should handle multiple status updates', () => {
      const stateWithApps = {
        applications: [
          { id: 'app1', userId: 'user1', studentName: 'John', status: 'PENDING', pnr: 'PNR123', hostelId: 'H1' },
          { id: 'app2', userId: 'user2', studentName: 'Jane', status: 'PENDING', pnr: 'PNR456', hostelId: 'H1' },
        ],
      };

      let state = applicationReducer(
        stateWithApps,
        updateApplicationStatus({
          applicationId: 'app1',
          status: 'ACCEPTED',
          roomNumber: '201',
          floor: '2',
        })
      );

      state = applicationReducer(
        state,
        updateApplicationStatus({
          applicationId: 'app2',
          status: 'REJECTED',
          reason: 'Incomplete documents',
        })
      );

      expect(state.applications[0].status).toBe('ACCEPTED');
      expect(state.applications[1].status).toBe('REJECTED');
    });
  });

  describe('Application Workflow', () => {
    it('should handle complete application workflow', () => {
      const application = {
        id: 'app1',
        userId: 'user1',
        studentName: 'John Doe',
        hostelId: 'H1',
        status: 'PENDING',
        pnr: 'PNR123',
      };

      // Student submits application
      let state = applicationReducer(initialState, submitApplication(application));
      expect(state.applications[0].status).toBe('PENDING');

      // Admin accepts application
      state = applicationReducer(
        state,
        updateApplicationStatus({
          applicationId: 'app1',
          status: 'ACCEPTED',
          roomNumber: '201',
          floor: '2',
        })
      );

      expect(state.applications[0].status).toBe('ACCEPTED');
      expect(state.applications[0].roomNumber).toBe('201');
    });

    it('should handle application rejection workflow', () => {
      const application = {
        id: 'app1',
        userId: 'user1',
        studentName: 'John Doe',
        hostelId: 'H1',
        status: 'PENDING',
        pnr: 'PNR123',
      };

      // Student submits application
      let state = applicationReducer(initialState, submitApplication(application));

      // Admin rejects application
      state = applicationReducer(
        state,
        updateApplicationStatus({
          applicationId: 'app1',
          status: 'REJECTED',
          reason: 'Invalid PNR',
        })
      );

      expect(state.applications[0].status).toBe('REJECTED');
      expect(state.applications[0].reason).toBe('Invalid PNR');
    });

    it('should handle empty applications list', () => {
      const state = applicationReducer(initialState, setApplications([]));

      expect(state.applications).toHaveLength(0);
    });
  });
});
