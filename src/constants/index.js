/**
 * Centralized Constants for Hostel Management System
 * This file contains all app-wide constants to avoid hardcoded values
 */

// ========================
// API Configuration
// ========================
export const API_CONFIG = {
  BASE_URL: 'https://hostel-mgmt-backend-0icp.onrender.com/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// ========================
// Routes
// ========================
export const ROUTES = {
  // Public routes
  HOME: '/',
  SIGNIN: '/signin',
  REGISTER: '/register',
  BOOK_HOSTEL: '/book-hostel',
  HOSTEL_DETAILS: '/hostel-details',
  APPLICATION_FORM: '/application-form',
  CONTACT: '/contact',
  ABOUT: '/about',

  // Student routes
  DASHBOARD: '/dashboard',
  APPLICATIONS: '/applications',

  // Admin routes
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_INVENTORY: '/admin/inventory',
  ADMIN_APPLICATIONS: '/admin/applications',
};

// ========================
// Authentication
// ========================
export const AUTH = {
  TOKEN_KEYS: {
    STUDENT: 'studentToken',
    ADMIN: 'adminToken',
    STUDENT_USER: 'studentUser',
    ADMIN_USER: 'adminUser',
  },
  TOKEN_TTL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  REFRESH_THRESHOLD: 60 * 1000, // 1 minute before expiry
};

// ========================
// Password Validation
// ========================
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  HAS_UPPERCASE: /[A-Z]/,
  HAS_LOWERCASE: /[a-z]/,
  HAS_SPECIAL_CHAR: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

export const PASSWORD_ERRORS = {
  MIN_LENGTH: 'Password must be at least 8 characters long',
  UPPERCASE: 'Password must contain at least one uppercase letter',
  LOWERCASE: 'Password must contain at least one lowercase letter',
  SPECIAL_CHAR: 'Password must contain at least one special character (!@#$%^&* etc.)',
};

// ========================
// Form Validation
// ========================
export const VALIDATION = {
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PNR_PATTERN: /^[A-Z]{2}\d{4}$/,
  PHONE_PATTERN: /^[0-9]{10}$/,
  REQUIRED_FIELDS: 'All fields are required',
};

// ========================
// Application Status
// ========================
export const APPLICATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const STATUS_COLORS = {
  PENDING: '#ffc107',
  APPROVED: '#28a745',
  REJECTED: '#dc3545',
};

// ========================
// UI Labels and Messages
// ========================
export const LABELS = {
  // Home page
  HOME_TITLE: 'Hostel Management System',
  HOME_SUBTITLE: 'Find and Book Your Perfect Hostel',
  BROWSE_HOSTELS: 'Browse Hostels',
  EASY_APPLICATION: 'Easy Application',
  TRACK_STATUS: 'Track Status',
  SECURE: 'Secure',

  // Auth pages
  STUDENT_SIGNIN: 'Student Sign In',
  STUDENT_REGISTER: 'Student Register',
  ADMIN_LOGIN: 'Admin Login',
  EMAIL_OR_PNR: 'Email or PNR Number',
  PASSWORD: 'Password',
  CONFIRM_PASSWORD: 'Confirm Password',

  // Hostel details
  HOSTEL_ADMIN: 'Hostel Admin:',
  SEATS_REMAINED: 'Seats Remained:',
  PRICE_PER_MONTH: 'Price per Month:',
  GENDER: 'Gender:',
  REQUIRED_DOCS: 'Required Documents',
  HOSTEL_INFO: 'Hostel Information',

  // Buttons
  APPLY_NOW: 'Apply Now',
  SIGN_IN: 'Sign In',
  REGISTER: 'Register',
  GO_TO_DASHBOARD: 'Go to Dashboard',
  BACK: 'Back',
  SUBMIT: 'Submit',
  CANCEL: 'Cancel',
  APPROVE: 'Approve',
  REJECT: 'Reject',

  // Notifications
  WELCOME: 'Welcome back',
  SUCCESS: 'Success',
  ERROR: 'Error',
  INVALID_CREDENTIALS: 'Invalid credentials. Please check your email/PNR and password.',
};

// ========================
// Feature Information
// ========================
export const FEATURES = [
  {
    icon: '🏨',
    title: 'Browse Hostels',
    description: 'Explore available hostels filtered by your preferences',
  },
  {
    icon: '📋',
    title: 'Easy Application',
    description: 'Submit hostel applications with just a few clicks',
  },
  {
    icon: '✓',
    title: 'Track Status',
    description: 'Monitor your applications in real-time',
  },
  {
    icon: '🔒',
    title: 'Secure',
    description: 'Your data is safe and secure with us',
  },
];

// ========================
// Notification Types
// ========================
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// ========================
// Gender Options
// ========================
export const GENDER_OPTIONS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
};

// ========================
// Academic Years
// ========================
export const ACADEMIC_YEARS = {
  FIRST: '1',
  SECOND: '2',
  THIRD: '3',
  FOURTH: '4',
};

// ========================
// Caste Categories
// ========================
export const CASTE_CATEGORIES = [
  'General',
  'SC',
  'ST',
  'OBC',
  'Other',
];

// ========================
// Delay Constants (in milliseconds)
// ========================
export const DELAYS = {
  SHORT: 500,
  MEDIUM: 1000,
  LONG: 1500,
  REDIRECT: 1500,
};

// ========================
// API Endpoints
// ========================
export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',
  ADMIN_REGISTER: '/admin/register',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_ME: '/admin/me',

  // Hostels
  HOSTELS: '/hostels',
  HOSTEL_BY_ID: '/hostels/:id',
  ADMIN_HOSTELS: '/admin/:adminId/hostels',

  // Applications
  APPLICATIONS: '/applications',
  APPLICATIONS_BY_HOSTEL: '/applications/hostel/:hostelId',
  APPLICATIONS_BY_PNR: '/applications/:pnr',
  ADMIN_APPLICATIONS: '/admin/hostels/:hostelId/applications',
  ACCEPT_APPLICATION: '/admin/applications/:id/accept',
  REJECT_APPLICATION: '/admin/applications/:id/reject',

  // Inventory/Rooms
  INVENTORY: '/admin/hostels/:hostelId/inventory',
  AVAILABLE_ROOMS: '/admin/hostels/:hostelId/inventory?status=empty',
  ROOMS_BY_HOSTEL: '/admin/hostels/:hostelId/rooms',
};

// ========================
// Error Messages
// ========================
export const ERROR_MESSAGES = {
  FILL_ALL_FIELDS: 'Please fill in all fields',
  SELECT_ROOM: 'Please select a room',
  ENTER_REJECTION_REASON: 'Please enter a reason for rejection',
  HOSTEL_NOT_FOUND: 'Hostel not found',
  LOADING_APPLICATIONS: 'Loading applications...',
  LOADING_ROOMS: 'Loading available rooms...',
  NO_ROOMS_AVAILABLE: 'No available rooms found',
  NO_APPLICATIONS: 'No applications found',
  FAILED_TO_LOAD: 'Failed to load',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'You are not authorized to access this page',
};

// ========================
// Success Messages
// ========================
export const SUCCESS_MESSAGES = {
  APPLICATION_APPROVED: 'Application approved successfully',
  APPLICATION_REJECTED: 'Application rejected',
  REGISTERED_SUCCESSFULLY: 'Registered successfully',
  SIGNIN_SUCCESSFUL: 'Sign in successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  APPLICATION_SUBMITTED: 'Application submitted successfully',
};

// ========================
// Default Values
// ========================
export const DEFAULT_VALUES = {
  PAGINATION_LIMIT: 10,
  AVATAR_PLACEHOLDER: '👤',
  IMAGE_PLACEHOLDER: '🖼️',
};
