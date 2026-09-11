import api from './axios';
import {
  CertificateDto,
  CourseDto,
  CourseLearnDto,
  CourseProgressDto,
  EnrollmentDto,
  LessonDto,
  Page,
  QuizAttemptDto,
  QuizStudentViewDto,
  QuizSubmissionDto,
  ReviewDto
} from '../types';

export const studentApi = {
  browseCourses: async (params?: { search?: string; categoryId?: number; page?: number; size?: number }): Promise<Page<CourseDto>> => {
    const res = await api.get<Page<CourseDto>>('/student/browse', { params });
    return res.data;
  },

  getCourseDetails: async (courseId: number): Promise<CourseDto> => {
    const res = await api.get<CourseDto>(`/student/courses/${courseId}/overview`);
    return res.data;
  },

  enrollInCourse: async (courseId: number): Promise<EnrollmentDto> => {
    const res = await api.post<EnrollmentDto>(`/student/courses/${courseId}/enroll`);
    return res.data;
  },

  getMyEnrollments: async (page: number = 0, size: number = 10): Promise<Page<EnrollmentDto>> => {
    const res = await api.get<Page<EnrollmentDto>>('/student/enrollments', { params: { page, size } });
    return res.data;
  },

  getCourseLearnContent: async (courseId: number): Promise<CourseLearnDto> => {
    const res = await api.get<CourseLearnDto>(`/student/courses/${courseId}/learn`);
    return res.data;
  },

  getLessonContent: async (lessonId: number): Promise<LessonDto> => {
    const res = await api.get<LessonDto>(`/student/lessons/${lessonId}`);
    return res.data;
  },

  getCourseProgress: async (courseId: number): Promise<CourseProgressDto> => {
    const res = await api.get<CourseProgressDto>(`/student/courses/${courseId}/progress`);
    return res.data;
  },

  completeLesson: async (lessonId: number): Promise<CourseProgressDto> => {
    const res = await api.post<CourseProgressDto>(`/student/lessons/${lessonId}/complete`);
    return res.data;
  },

  saveLessonProgress: async (lessonId: number, watchedSeconds: number, completed: boolean = false): Promise<void> => {
    // Sync to /api/lesson-progress if available
    try {
      const userStr = localStorage.getItem('elearning_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        await api.post('/lesson-progress', {
          studentId: user.id || user.userId,
          lessonId,
          watchedSeconds,
          completed
        });
      }
    } catch {
      // Background non-blocking sync
    }
  },

  getCertificate: async (courseId: number): Promise<CertificateDto> => {
    const res = await api.get<CertificateDto>(`/student/courses/${courseId}/certificate`);
    return res.data;
  },

  getQuizForStudent: async (quizId: number): Promise<QuizStudentViewDto> => {
    const res = await api.get<QuizStudentViewDto>(`/student/quizzes/${quizId}`);
    return res.data;
  },

  startQuiz: async (quizId: number): Promise<QuizAttemptDto> => {
    const res = await api.post<QuizAttemptDto>(`/student/quizzes/${quizId}/start`);
    return res.data;
  },

  submitQuiz: async (quizId: number, submission: QuizSubmissionDto): Promise<QuizAttemptDto> => {
    const res = await api.post<QuizAttemptDto>(`/student/quizzes/${quizId}/submit`, submission);
    return res.data;
  },

  getMyQuizAttempts: async (quizId: number): Promise<QuizAttemptDto[]> => {
    const res = await api.get<QuizAttemptDto[]>(`/student/quizzes/${quizId}/attempts`);
    return res.data;
  },

  addReview: async (courseId: number, review: { rating: number; comment: string }): Promise<ReviewDto> => {
    const res = await api.post<ReviewDto>(`/student/courses/${courseId}/reviews`, review);
    return res.data;
  },

  updateReview: async (reviewId: number, review: { rating: number; comment: string }): Promise<ReviewDto> => {
    const res = await api.put<ReviewDto>(`/student/reviews/${reviewId}`, review);
    return res.data;
  },

  getMyReviews: async (page: number = 0): Promise<Page<ReviewDto>> => {
    const res = await api.get<Page<ReviewDto>>('/student/reviews/my', { params: { page, size: 10 } });
    return res.data;
  },
};
