// Hardcoded data - all static information for the application

interface CollegeInfo {
  name: string;
  location: string;
  affiliation: string;
  established: number;
  copyright: number;
  phone: string;
  email: string;
  address: string;
  workingHours: {
    weekday: string;
    saturday: string;
  };
}

interface GenderOption {
  value: string;
  label: string;
}

// College Information
export const COLLEGE_INFO: CollegeInfo = {
  name: 'Dr. Babasaheb Ambedkar Technological University',
  location: 'Lonere,Maharashtra, India',
  affiliation: 'DBATU',
  established: 1960,
  copyright: 2026,
  phone: '+91 1234567890',
  email: 'support@hostel.college',
  address: 'DBATU Lonere,Mangaon, Maharashtra',
  workingHours: {
    weekday: '9:00 AM - 5:00 PM',
    saturday: '10:00 AM - 2:00 PM',
  },
};

// Branches available in college
export const BRANCHES: string[] = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
];

// Caste categories
export const CASTE_CATEGORIES: string[] = [
  'General',
  'OBC',
  'SC',
  'ST',
];

// College years
export const COLLEGE_YEARS: string[] = [
  '1st',
  '2nd',
  '3rd',
  '4th',
];

// Gender options
export const GENDERS: GenderOption[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];
