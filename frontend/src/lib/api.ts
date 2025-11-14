import axios from "axios";
import {
  ApiResponse,
  AuthResponse,
  User,
  Course,
  Enrollment,
  Rating,
} from "@/types";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const response = await axios.post(
                `${API_BASE_URL}/auth/refresh-token`,
                {
                  refreshToken,
                }
            );

            const { token, refreshToken: newRefreshToken } = response.data.data;
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Token refresh failed, redirect to login
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/auth/login";
            return Promise.reject(refreshError);
          }
        }
      }

      return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string }) =>
      api.post<ApiResponse<AuthResponse>>("/auth/login", data),

  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => api.post<ApiResponse<AuthResponse>>("/auth/register", data),

  logout: () => api.post<ApiResponse>("/auth/logout"),

  getMe: () => api.get<ApiResponse<User>>("/auth/me"),

  updateProfile: (data: Partial<User>) =>
      api.put<ApiResponse<User>>("/auth/updatedetails", data),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
      api.put<ApiResponse>("/auth/updatepassword", data),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get<ApiResponse<User>>("/users/profile"),

  updateProfile: (data: Partial<User>) =>
      api.put<ApiResponse<User>>("/users/profile", data),

  uploadAvatar: (formData: FormData) =>
      api.post<ApiResponse<User>>("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),

  deleteAvatar: () => api.delete<ApiResponse<User>>("/users/avatar"),
};

// Courses API
export const coursesAPI = {
  getCourses: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    difficulty?: string;
    sort?: string;
  }) => api.get<ApiResponse<Course[]>>("/courses", { params }),

  getCourse: (id: string) => api.get<ApiResponse<Course>>(`/courses/${id}`),

  createCourse: (data: Partial<Course>) =>
      api.post<ApiResponse<Course>>("/courses", data),

  updateCourse: (id: string, data: Partial<Course>) =>
      api.put<ApiResponse<Course>>(`/courses/${id}`, data),

  deleteCourse: (id: string) => api.delete<ApiResponse>(`/courses/${id}`),

  uploadThumbnail: (id: string, formData: FormData) =>
      api.put<ApiResponse<Course>>(`/courses/${id}/thumbnail`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),

  uploadPromoVideo: (id: string, formData: FormData) =>
      api.put<ApiResponse<Course>>(`/courses/${id}/promo-video`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),

  togglePublish: (id: string) =>
      api.put<ApiResponse<Course>>(`/courses/${id}/publish`),

  getInstructorCourses: () =>
      api.get<ApiResponse<Course[]>>("/courses/instructor/my-courses"),

  addLesson: (courseId: string, data: Partial<Course>) =>
      api.post<ApiResponse<Course>>(`/courses/${courseId}/lessons`, data),

  updateLesson: (courseId: string, lessonId: string, data: Partial<Course>) =>
      api.put<ApiResponse<Course>>(
          `/courses/${courseId}/lessons/${lessonId}`,
          data
      ),

  deleteLesson: (courseId: string, lessonId: string) =>
      api.delete<ApiResponse>(`/courses/${courseId}/lessons/${lessonId}`),

  uploadLessonVideo: (courseId: string, lessonId: string, formData: FormData) =>
      api.put<ApiResponse<Course>>(
          `/courses/${courseId}/lessons/${lessonId}/video`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
      ),

  deleteLessonVideo: (courseId: string, lessonId: string) =>
      api.delete<ApiResponse<Course>>(
          `/courses/${courseId}/lessons/${lessonId}/video`
      ),

  uploadResource: (courseId: string, lessonId: string, formData: FormData) =>
      api.post<ApiResponse<Course>>(
          `/courses/${courseId}/lessons/${lessonId}/resources`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
      ),

  deleteResource: (courseId: string, lessonId: string, resourceId: string) =>
      api.delete<ApiResponse>(
          `/courses/${courseId}/lessons/${lessonId}/resources/${resourceId}`
      ),
};

// Enrollments API
export const enrollmentsAPI = {
  enroll: (courseId: string) =>
      api.post<ApiResponse<Enrollment>>(
          `/enrollments/courses/${courseId}/enroll`
      ),

  getMyEnrollments: () =>
      api.get<ApiResponse<Enrollment[]>>("/enrollments/my-courses"),

  getEnrollmentStatus: (courseId: string) =>
      api.get<
          ApiResponse<{ isEnrolled: boolean; enrollment: Enrollment | null }>
      >(`/enrollments/courses/${courseId}/enrollment-status`),
};

// Ratings API
export const ratingsAPI = {
  getRatings: (courseId: string) =>
      api.get<ApiResponse<Rating[]>>(`/ratings/courses/${courseId}/ratings`),

  addRating: (courseId: string, data: { rating: number; comment?: string }) =>
      api.post<ApiResponse<Rating>>(`/ratings/courses/${courseId}/ratings`, data),

  updateRating: (
      ratingId: string,
      data: { rating?: number; comment?: string }
  ) => api.put<ApiResponse<Rating>>(`/ratings/${ratingId}`, data),

  deleteRating: (ratingId: string) =>
      api.delete<ApiResponse>(`/ratings/${ratingId}`),

  getMyRating: (courseId: string) =>
      api.get<ApiResponse<Rating>>(`/ratings/courses/${courseId}/my-rating`),

  getRatingStats: (courseId: string) =>
      api.get<ApiResponse>(`/ratings/courses/${courseId}/rating-stats`),
};

// Favorites API
export const favoritesAPI = {
  toggleFavorite: (courseId: string) =>
      api.post<ApiResponse>(`/favorites/courses/${courseId}/toggle`),

  getFavorites: () => api.get<ApiResponse<Course[]>>("/favorites"),

  getFavoriteStatus: (courseId: string) =>
      api.get<ApiResponse<{ isFavorite: boolean }>>(
          `/favorites/courses/${courseId}/status`
      ),

  removeFavorite: (courseId: string) =>
      api.delete<ApiResponse>(`/favorites/courses/${courseId}`),

  clearFavorites: () => api.delete<ApiResponse>("/favorites"),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get<ApiResponse>("/admin/dashboard"),

  getUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => api.get<ApiResponse<User[]>>("/admin/users", { params }),

  getCourses: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }) => api.get<ApiResponse<Course[]>>("/admin/courses", { params }),

  updateUserRole: (userId: string, role: string) =>
      api.put<ApiResponse<User>>(`/admin/users/${userId}/role`, { role }),

  toggleUserActive: (userId: string) =>
      api.put<ApiResponse<User>>(`/admin/users/${userId}/toggle-active`),

  toggleCoursePublish: (courseId: string) =>
      api.put<ApiResponse<Course>>(`/admin/courses/${courseId}/toggle-publish`),

  deleteCourse: (courseId: string) =>
      api.delete<ApiResponse>(`/admin/courses/${courseId}`),

  deleteProfile: (id: string) => api.delete<ApiResponse<User>>(`/users/${id}`),

  getEnrollmentStats: (period?: string) =>
      api.get<ApiResponse>(
          `/admin/enrollments/stats?period=${period || "month"}`
      ),

  getSystemAnalytics: () => api.get<ApiResponse>("/admin/analytics"),
};

export default api;