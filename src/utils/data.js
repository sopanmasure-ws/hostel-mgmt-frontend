// Hardcoded data - all static information for the application

// College Information
export const COLLEGE_INFO = {
  name: 'Tech College of Engineering',
  location: 'New Delhi, India',
  affiliation: 'University of Delhi',
  established: 2000,
  copyright: 2026,
  phone: '+91 1234567890',
  email: 'support@hostel.college',
  address: 'Tech College of Engineering, New Delhi, India',
  workingHours: {
    weekday: '9:00 AM - 5:00 PM',
    saturday: '10:00 AM - 2:00 PM',
  },
};

// All available hostels
export const HOSTELS_DATA = [
  {
    id: 1,
    name: 'Paradise Hostel',
    gender: 'male',
    admin: 'Mr. Raj Kumar',
    seatsRemained: 5,
    requiredDocs: ['Aadhaar Card', 'College ID', 'Parent Consent Letter'],
    description: 'Modern hostel with all amenities',
    pricePerMonth: 3000,
    image: 'https://via.placeholder.com/300x200?text=Paradise+Hostel',
  },
  {
    id: 2,
    name: 'Sunshine Girls Hostel',
    gender: 'female',
    admin: 'Mrs. Priya Singh',
    seatsRemained: 3,
    requiredDocs: ['Aadhaar Card', 'College ID', 'Parent Consent Letter'],
    description: 'Safe and comfortable hostel for girls',
    pricePerMonth: 2500,
    image: 'https://via.placeholder.com/300x200?text=Sunshine+Girls',
  },
  {
    id: 3,
    name: 'Tech Hostel',
    gender: 'male',
    admin: 'Mr. Vikram Patel',
    seatsRemained: 8,
    requiredDocs: ['Aadhaar Card', 'College ID', 'Parent Consent Letter'],
    description: 'Hostel with high-speed internet and study rooms',
    pricePerMonth: 3500,
    image: 'https://via.placeholder.com/300x200?text=Tech+Hostel',
  },
  {
    id: 4,
    name: 'Lotus Girls Hostel',
    gender: 'female',
    admin: 'Mrs. Anjali Sharma',
    seatsRemained: 2,
    requiredDocs: ['Aadhaar Card', 'College ID', 'Parent Consent Letter'],
    description: 'Premium hostel with excellent facilities',
    pricePerMonth: 4000,
    image: 'https://via.placeholder.com/300x200?text=Lotus+Girls',
  },
];

// Sample applications data
export const SAMPLE_APPLICATIONS = [
];

// Branches available in college
export const BRANCHES = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
];

// Caste categories
export const CASTE_CATEGORIES = [
  'General',
  'OBC',
  'SC',
  'ST',
];

// College years
export const COLLEGE_YEARS = [
  '1st',
  '2nd',
  '3rd',
  '4th',
];

// Gender options
export const GENDERS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];
