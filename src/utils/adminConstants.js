
export const ROOM_STATUSES = {
  AVAILABLE: 'available',
  FILLED: 'filled',
  DAMAGED: 'damaged',
};

export const APPLICATION_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

export const STATUS_LABELS = {
  [ROOM_STATUSES.AVAILABLE]: 'Available',
  [ROOM_STATUSES.FILLED]: 'Filled',
  [ROOM_STATUSES.DAMAGED]: 'Damaged',
  [APPLICATION_STATUSES.PENDING]: 'Pending',
  [APPLICATION_STATUSES.ACCEPTED]: 'Accepted',
  [APPLICATION_STATUSES.REJECTED]: 'Rejected',
};

export const STATUS_COLORS = {
  [ROOM_STATUSES.AVAILABLE]: '#4CAF50',
  [ROOM_STATUSES.FILLED]: '#FF9800',
  [ROOM_STATUSES.DAMAGED]: '#F44336',
  [APPLICATION_STATUSES.PENDING]: '#FF9800',
  [APPLICATION_STATUSES.ACCEPTED]: '#4CAF50',
  [APPLICATION_STATUSES.REJECTED]: '#F44336',
};

export const STATUS_ICONS = {
  [ROOM_STATUSES.AVAILABLE]: '✓',
  [ROOM_STATUSES.FILLED]: '👥',
  [ROOM_STATUSES.DAMAGED]: '⚠️',
  [APPLICATION_STATUSES.PENDING]: '⏳',
  [APPLICATION_STATUSES.ACCEPTED]: '✓',
  [APPLICATION_STATUSES.REJECTED]: '✗',
};

export const GENDERS = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

export const ACADEMIC_YEARS = ['1st', '2nd', '3rd', '4th'];

export const DEFAULT_ROOM_CAPACITY = 2;

export const DEFAULT_FLOOR_RANGE = [1, 2, 3, 4, 5];

export const ITEMS_PER_PAGE = 10;

export const FLOOR_NUMBERS = {
  GROUND: 'Ground',
  FIRST: '1',
  SECOND: '2',
  THIRD: '3',
  FOURTH: '4',
  FIFTH: '5',
};

export const ROOM_NUMBER_PATTERN = /^[1-9]\d{0,2}$/; // e.g., 1, 101, 201, 1001

export const APPLICATION_FILTERS = [
  { value: 'all', label: 'All Applications' },
  { value: APPLICATION_STATUSES.PENDING, label: 'Pending' },
  { value: APPLICATION_STATUSES.ACCEPTED, label: 'Accepted' },
  { value: APPLICATION_STATUSES.REJECTED, label: 'Rejected' },
];

export const ROOM_FILTERS = [
  { value: 'all', label: 'All Rooms' },
  { value: ROOM_STATUSES.AVAILABLE, label: 'Available' },
  { value: ROOM_STATUSES.FILLED, label: 'Filled' },
  { value: ROOM_STATUSES.DAMAGED, label: 'Damaged' },
];

export const VALIDATION_RULES = {
  ADMIN_ID_MIN_LENGTH: 3,
  ADMIN_ID_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ROOM_NUMBER_MIN: 100,
  ROOM_NUMBER_MAX: 999,
};

export const ERROR_MESSAGES = {
  ADMIN_ID_REQUIRED: 'Admin ID is required',
  ADMIN_ID_MIN_LENGTH: `Admin ID must be at least ${VALIDATION_RULES.ADMIN_ID_MIN_LENGTH} characters`,
  ADMIN_ID_MAX_LENGTH: `Admin ID cannot exceed ${VALIDATION_RULES.ADMIN_ID_MAX_LENGTH} characters`,
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
  PASSWORD_MAX_LENGTH: `Password cannot exceed ${VALIDATION_RULES.PASSWORD_MAX_LENGTH} characters`,
  PASSWORD_MISMATCH: 'Passwords do not match',
  EMAIL_INVALID: 'Please provide a valid email address',
  EMAIL_REQUIRED: 'Email is required',
  ROOM_NUMBER_REQUIRED: 'Room number is required',
  ROOM_NUMBER_INVALID: 'Invalid room number',
  FLOOR_REQUIRED: 'Floor number is required',
  REJECTION_REASON_REQUIRED: 'Please provide a reason for rejection',
  REJECTION_REASON_MIN_LENGTH: 'Rejection reason must be at least 10 characters',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  APPLICATION_ACCEPTED: 'Application accepted successfully',
  APPLICATION_REJECTED: 'Application rejected successfully',
  ROOM_UPDATED: 'Room status updated successfully',
  HOSTEL_UPDATED: 'Hostel information updated successfully',
};

export const API_ENDPOINTS = {
  ADMIN_LOGIN: '/admin/auth/login',
  ADMIN_SIGNUP: '/admin/auth/register',
  ADMIN_ME: '/admin/auth/me',
  ADMIN_HOSTELS: '/admin/hostels',
  ADMIN_HOSTEL_DETAIL: '/admin/hostels/:hostelId',
  ADMIN_HOSTEL_ROOMS: '/admin/hostels/:hostelId/rooms',
  ADMIN_APPLICATIONS: '/admin/applications/hostel/:hostelId',
  ADMIN_ACCEPT_APPLICATION: '/admin/applications/:applicationId/accept',
  ADMIN_REJECT_APPLICATION: '/admin/applications/:applicationId/reject',
  ADMIN_ROOM_UPDATE: '/admin/rooms/:roomId',
  ADMIN_ROOM_RELEASE: '/admin/rooms/:roomId/release',
};

export const ADMIN_ROUTES = {
  LOGIN: '/admin/login',
  SIGNUP: '/admin/signup',
  DASHBOARD: '/admin/dashboard',
  APPLICATIONS: '/admin/hostel/:hostelId',
  INVENTORY: '/admin/hostel/:hostelId/inventory',
};

export const MOCK_CONFIG = {
  DEFAULT_HOSTEL_COUNT: 3,
  DEFAULT_ROOMS_PER_FLOOR: 4,
  DEFAULT_FLOORS_PER_HOSTEL: 3,
  DEFAULT_APPLICATIONS_PER_HOSTEL: 4,
};

export const CHART_COLORS = {
  PRIMARY: '#667eea',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  DANGER: '#F44336',
  INFO: '#2196F3',
  LIGHT: '#E0E0E0',
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const NOTIFICATION_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
  PERSISTENT: 0,
};

export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  FULL: 'MMMM DD, YYYY HH:mm',
};

export const OCCUPANCY_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 70,
  HIGH: 100,
};

export const REPORTS = {
  OCCUPANCY_REPORT: 'occupancy',
  APPLICATION_REPORT: 'applications',
  ROOM_STATUS_REPORT: 'room_status',
};

export default {
  ROOM_STATUSES,
  APPLICATION_STATUSES,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_ICONS,
  GENDERS,
  ACADEMIC_YEARS,
  DEFAULT_ROOM_CAPACITY,
  DEFAULT_FLOOR_RANGE,
  ITEMS_PER_PAGE,
  FLOOR_NUMBERS,
  APPLICATION_FILTERS,
  ROOM_FILTERS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_ENDPOINTS,
  ADMIN_ROUTES,
  MOCK_CONFIG,
  CHART_COLORS,
  NOTIFICATION_TYPES,
  NOTIFICATION_DURATION,
  DATE_FORMATS,
  OCCUPANCY_THRESHOLDS,
  REPORTS,
};
