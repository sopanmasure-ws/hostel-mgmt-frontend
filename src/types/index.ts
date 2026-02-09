// ==================== User & Authentication Types ====================

export interface Student {
  _id: string;
  pnr: string;
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  department?: string;
  year?: number;
  roomNumber?: string;
  hostelId?: string | Hostel;
  isBlacklisted?: boolean;
  blacklistReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Admin {
  _id: string;
  adminId: string;
  name: string;
  email: string;
  phone: string;
  hostels?: string[] | Hostel[];
  isDisabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: Student | null;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  token: string | null;
  admin: Admin | null;
  role: string | null;
}

// ==================== Hostel & Room Types ====================

export interface RoomStatistics {
  totalRooms: number;
  available: number;
  occupied: number;
  damaged: number;
  underMaintenance: number;
}

export interface FloorStatistics {
  totalRooms: number;
  available: number;
  occupied: number;
  damaged: number;
  underMaintenance: number;
}

export interface Hostel {
  _id: string;
  id?: string | number;
  name: string;
  description?: string;
  location?: string;
  address?: string;
  warden?: string;
  wardenPhone?: string;
  capacity: number;
  availableRooms: number;
  amenities?: string[];
  gender: 'male' | 'female' | 'co-ed' | 'Co-ed';
  rentPerMonth: number;
  pendingApplications?: number;
  rules?: string[];
  image?: string;
  adminId?: string | Admin;
  isActive?: boolean;
  roomStatistics?: RoomStatistics;
  floorStatistics?: Record<string, FloorStatistics>;
  requiredDocs?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type RoomStatus = 'available' | 'occupied' | 'damaged' | 'maintenance';

export interface Room {
  _id: string;
  id?: string | number;
  roomNumber: string;
  floor: string | number;
  floorNumber?: string | number;
  capacity: number;
  occupiedBeds: number;
  status: RoomStatus;
  isDamaged: boolean;
  hostelId: string | Hostel;
  assignedStudent?: { id?: string | number | null; name?: string | null } | null;
  studentDetails?: Student[];
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Application Types ====================

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface Application {
  _id: string;
  studentPNR: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  hostelId: string | Hostel;
  hostelName?: string;
  status: ApplicationStatus;
  applicationDate?: string;
  approvalDate?: string;
  rejectionDate?: string;
  rejectionReason?: string;
  roomNumber?: string;
  floor?: string | number;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  medicalInfo?: {
    bloodGroup?: string;
    allergies?: string;
    medications?: string;
  };
  documents?: {
    idProof?: string;
    addressProof?: string;
    collegeId?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// ==================== Dashboard Types ====================

export interface DashboardData {
  totalStudents?: Student[];
  totalAdmins?: Admin[];
  totalHostels?: Hostel[];
  allHostels?: Hostel[];
  totalRooms?: Room[];
  totalApplications?: Application[];
  pendingApplications?: Application[];
  approvedApplications?: Application[];
  rejectedApplications?: Application[];
  occupiedRooms?: number;
  availableRooms?: number;
  blacklistedStudents?: Student[];
}

// ==================== API Response Types ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface HostelsResponse {
  success: boolean;
  total: number;
  hostels: Hostel[];
}

// ==================== Form Data Types ====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  pnr: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  department?: string;
  year?: number;
}

export interface ApplicationFormData {
  studentPNR: string;
  hostelId: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  medicalInfo?: {
    bloodGroup?: string;
    allergies?: string;
    medications?: string;
  };
  documents?: {
    idProof?: string;
    addressProof?: string;
    collegeId?: string;
  };
}

export interface HostelFormData {
  name: string;
  address: string;
  location: string;
  capacity: number;
  warden: string;
  wardenPhone: string;
  gender: string;
  rentPerMonth: number;
  description: string;
  amenities?: string[];
  rules?: string[];
  adminId?: string;
}

// ==================== Component Props Types ====================

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

export interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// ==================== Utility Types ====================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface SelectOption {
  value: string;
  label: string;
}

export interface FilterState {
  searchTerm: string;
  gender?: string;
  hostel?: string;
  status?: string;
}

// ==================== Redux State Types ====================

export interface RootState {
  auth: AuthState;
  adminAuth: AdminAuthState;
  hostel: {
    hostels: Hostel[];
    selectedHostel: Hostel | null;
    loading: boolean;
    error: string | null;
  };
  application: {
    applications: Application[];
    loading: boolean;
    error: string | null;
  };
  admin: {
    adminHostels: Hostel[];
    currentHostel: Hostel | null;
    applications: Application[];
    rooms: Room[];
    filters: {
      floor: string | number | null;
      roomStatus: string | null;
    };
    loading: boolean;
    error: string | null;
  };
}
