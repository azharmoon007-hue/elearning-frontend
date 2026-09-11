import api from './axios';
import {
  AdminDashboardDto,
  CourseDto,
  CourseStatus,
  EnrollmentDto,
  Page,
  PaymentDto,
  ReviewDto,
  UserDto
} from '../types';

export const adminApi = {
  getDashboard: async (): Promise<AdminDashboardDto> => {
    const res = await api.get<AdminDashboardDto>('/admin/dashboard');
    return res.data;
  },

  getPendingCourses: async (page: number = 0, size: number = 10): Promise<Page<CourseDto>> => {
    const res = await api.get<Page<CourseDto>>('/admin/courses/pending', { params: { page, size } });
    return res.data;
  },

  approveCourse: async (id: number): Promise<CourseDto> => {
    const res = await api.put<CourseDto>(`/admin/courses/${id}/approve`);
    return res.data;
  },

  rejectCourse: async (id: number, reason: string): Promise<CourseDto> => {
    const res = await api.put<CourseDto>(`/admin/courses/${id}/reject`, { reason });
    return res.data;
  },

  updateCourseStatus: async (id: number, status: CourseStatus): Promise<CourseDto> => {
    const res = await api.put<CourseDto>(`/admin/courses/${id}/status`, null, { params: { status } });
    return res.data;
  },

  getAllUsers: async (params?: { search?: string; role?: string; page?: number; size?: number }): Promise<Page<UserDto>> => {
    const res = await api.get<Page<UserDto>>('/admin/users', { params });
    return res.data;
  },

  getUserById: async (id: number): Promise<UserDto> => {
    const res = await api.get<UserDto>(`/admin/users/${id}`);
    return res.data;
  },

  updateUserStatus: async (id: number, enabled: boolean): Promise<UserDto> => {
    const res = await api.put<UserDto>(`/admin/users/${id}/status`, { enabled });
    return res.data;
  },

  updateUserRoles: async (id: number, roles: string[]): Promise<UserDto> => {
    const res = await api.put<UserDto>(`/admin/users/${id}/roles`, { roles });
    return res.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  getAllEnrollments: async (status?: string, page: number = 0, size: number = 10): Promise<Page<EnrollmentDto>> => {
    const res = await api.get<Page<EnrollmentDto>>('/admin/enrollments', {
      params: status ? { status, page, size } : { page, size }
    });
    return res.data;
  },

  updateEnrollmentStatus: async (id: number, status: string): Promise<EnrollmentDto> => {
    const res = await api.put<EnrollmentDto>(`/admin/enrollments/${id}/status`, null, { params: { status } });
    return res.data;
  },

  getAllPayments: async (status?: string, page: number = 0, size: number = 10): Promise<Page<PaymentDto>> => {
    const res = await api.get<Page<PaymentDto>>('/admin/payments', {
      params: status ? { status, page, size } : { page, size }
    });
    return res.data;
  },

  refundPayment: async (id: number): Promise<PaymentDto> => {
    const res = await api.post<PaymentDto>(`/admin/payments/${id}/refund`);
    return res.data;
  },

  getAllReviews: async (page: number = 0, size: number = 10): Promise<Page<ReviewDto>> => {
    const res = await api.get<Page<ReviewDto>>('/admin/reviews', { params: { page, size } });
    return res.data;
  },

  deleteReview: async (id: number): Promise<void> => {
    await api.delete(`/admin/reviews/${id}`);
  },
};
