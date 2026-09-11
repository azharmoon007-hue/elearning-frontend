import api from './axios';
import {
  CategoryDto,
  CourseDto,
  CourseRatingSummaryDto,
  CourseSectionDto,
  LessonDto,
  Page,
  ReviewDto
} from '../types';

export const courseApi = {
  getCourses: async (params?: { page?: number; size?: number; search?: string; categoryId?: number; status?: string }): Promise<Page<CourseDto>> => {
    if (params?.search) {
      const res = await api.get<Page<CourseDto>>('/courses/search', {
        params: { title: params.search, page: params.page ?? 0, size: params.size ?? 12 }
      });
      return res.data;
    }
    if (params?.categoryId) {
      const res = await api.get<Page<CourseDto>>(`/courses/category/${params.categoryId}`, {
        params: { page: params.page ?? 0, size: params.size ?? 12 }
      });
      return res.data;
    }
    if (params?.status) {
      const res = await api.get<Page<CourseDto>>(`/courses/status/${params.status}`, {
        params: { page: params.page ?? 0, size: params.size ?? 12 }
      });
      return res.data;
    }
    const res = await api.get<Page<CourseDto>>('/courses', {
      params: { page: params?.page ?? 0, size: params?.size ?? 12 }
    });
    return res.data;
  },

  getCourseById: async (id: number): Promise<CourseDto> => {
    const res = await api.get<CourseDto>(`/courses/${id}`);
    return res.data;
  },

  getCategories: async (): Promise<Page<CategoryDto>> => {
    const res = await api.get<Page<CategoryDto>>('/categories', { params: { size: 50 } });
    return res.data;
  },

  getSectionsByCourseId: async (courseId: number): Promise<CourseSectionDto[]> => {
    const res = await api.get<CourseSectionDto[]>(`/sections/course/${courseId}`);
    return res.data;
  },

  getLessonsBySectionId: async (sectionId: number): Promise<LessonDto[]> => {
    const res = await api.get<LessonDto[]>(`/lessons/section/${sectionId}`);
    return res.data;
  },

  getReviewsByCourseId: async (courseId: number, page: number = 0): Promise<Page<ReviewDto>> => {
    const res = await api.get<Page<ReviewDto>>(`/reviews/course/${courseId}`, { params: { page, size: 10 } });
    return res.data;
  },

  getCourseRatingSummary: async (courseId: number): Promise<CourseRatingSummaryDto> => {
    const res = await api.get<CourseRatingSummaryDto>(`/reviews/course/${courseId}/summary`);
    return res.data;
  },

  createCategory: async (category: Partial<CategoryDto>): Promise<CategoryDto> => {
    const res = await api.post<CategoryDto>('/categories', category);
    return res.data;
  },

  updateCategory: async (id: number, category: Partial<CategoryDto>): Promise<CategoryDto> => {
    const res = await api.put<CategoryDto>(`/categories/${id}`, category);
    return res.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
