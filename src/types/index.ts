// Application Types

export type UserRole = 
  | 'CIVIL_ENGINEER'
  | 'CONTRACTOR'
  | 'ENGINEERING_OFFICE'
  | 'CRAFTSMAN'
  | 'CONSTRUCTION_COMPANY'
  | 'STORE_FACTORY'
  | 'NORMAL_USER'
  | 'ADMIN';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  isActive: boolean;
  bio?: string;
  address?: string;
  city?: string;
  wilaya?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  specialization?: string;
  experience?: number;
  licenseNumber?: string;
  rating: number;
  reviewCount: number;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  images?: string[];
  videos?: string[];
  category?: string;
  tags?: string[];
  isPublished: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  nameFr?: string;
  description?: string;
  images?: string[];
  unit?: string;
  price: number;
  oldPrice?: number;
  minQuantity?: number;
  stock?: number;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  soldCount: number;
  rating: number;
  reviewCount: number;
  categoryId?: string;
  factoryId?: string;
  sellerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobListing {
  id: string;
  title: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  jobType: 'full_time' | 'part_time' | 'contract' | 'freelance';
  category?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  city?: string;
  wilaya?: string;
  isRemote: boolean;
  vacancies: number;
  applications: number;
  deadline?: string;
  status: string;
  isFeatured: boolean;
  isUrgent: boolean;
  postedById: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  lessons?: number;
  price: number;
  oldPrice?: number;
  isFree: boolean;
  certificate: boolean;
  instructorId: string;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: string;
  title: string;
  description: string;
  category?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  budget?: number;
  deadline?: string;
  files?: string[];
  requesterId: string;
  officeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RealEstateListing {
  id: string;
  title: string;
  description?: string;
  type: 'sale' | 'rent';
  propertyType: 'apartment' | 'house' | 'land' | 'commercial' | 'office';
  price?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  address?: string;
  city?: string;
  wilaya?: string;
  images?: string[];
  status: string;
  isFeatured: boolean;
  isVerified: boolean;
  viewCount: number;
  postedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CraftsmanProfile {
  id: string;
  userId: string;
  categoryId: string;
  specializations?: string[];
  experience?: number;
  portfolio?: string[];
  availableAreas?: string[];
  hourlyRate?: number;
  dailyRate?: number;
  isAvailable: boolean;
  completedJobs: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments?: string[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalProducts: number;
  totalJobs: number;
  totalCourses: number;
  totalConsultations: number;
  activeUsers: number;
  pendingApprovals: number;
  revenue: number;
  growth: number;
}
