// types/index.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  avatar?: {
    url: string;
    public_id: string;
  };
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  instructor: User;
  category: string;
  subcategory?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  price: number;
  thumbnail?: {
    url: string;
    public_id: string;
  };
  promoVideo?: {
    url: string;
    public_id: string;
    duration: number;
  };
  lessons: Lesson[];
  isPublished: boolean;
  isFeatured: boolean;
  totalEnrollments: number;
  averageRating: number;
  totalRatings: number;
  totalStudents: number;
  totalLessons: number;
  totalDuration: number;
  favoriteCount: number;
  requirements: string[];
  learningOutcomes: string[];
  tags: string[];
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  _id: string;
  title: string;
  content: string;
  video?: {
    url: string;
    public_id: string;
    duration: number;
  };
  resources: Resource[];
  duration: number;
  order: number;
  isFree: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  _id: string;
  name: string;
  type: "pdf" | "video" | "image" | "document" | "link";
  url: string;
  public_id?: string;
  size?: number;
  duration?: number;
  order: number;
}

export interface Enrollment {
  _id: string;
  student: string;
  course: Course;
  progress: number;
  completedLessons: string[];
  enrolledAt: string;
  completedAt?: string;
  lastAccessedAt: string;
}

export interface Rating {
  _id: string;
  user: User;
  course: string;
  rating: number;
  comment?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: "student" | "instructor" | "admin";
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: {
    url: string;
    public_id: string;
  };
  token: string;
  refreshToken: string;
}

export const COURSE_CATEGORIES = [
  "Development",
  "Business",
  "Design",
  "Marketing",
  "IT & Software",
  "Personal Development",
  "Photography",
  "Music",
  "Health & Fitness",
  "Academics",
  "Language",
  "Test Preparation",
] as const;

export const COURSE_DIFFICULTIES = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export const COURSE_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Arabic",
  "Portuguese",
  "Russian",
  "Hindi",
] as const;

// Add these additional types that are used in your components
export interface CourseFilters {
  category?: string;
  difficulty?: string;
  price?: "free" | "paid" | "all";
  rating?: number;
  search?: string;
  sort?: "newest" | "popular" | "rating" | "price-low" | "price-high";
}

export interface CreateCourseData {
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  price: number;
  requirements: string[];
  learningOutcomes: string[];
  tags: string[];
  language: string;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface LessonFormData {
  title: string;
  content: string;
  duration: number;
  order: number;
  isFree: boolean;
  isPublished: boolean;
}

export type LessonFormValues = {
  title: string;
  content: string;
  duration: number;
  order: number;
  isFree: boolean;
  isPublished: boolean;
};

export interface Resource {
  _id: string;
  name: string;
  type: "pdf" | "video" | "image" | "document" | "link";
  url: string;
  public_id?: string;
  size?: number;
  duration?: number;
  order: number;
}

// Add this new interface for file uploads
export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    public_id: string;
    size?: number;
    duration?: number;
  };
}
