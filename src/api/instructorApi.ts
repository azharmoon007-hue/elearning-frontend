import api from './axios';
import {
  CourseDto,
  CourseSectionDto,
  InstructorAnalyticsDto,
  LessonDto,
  Page,
  QuestionDto,
  QuestionOptionDto,
  QuizDto
} from '../types';

export const instructorApi = {
  getMyCourses: async (page: number = 0, size: number = 10): Promise<Page<CourseDto>> => {
    const res = await api.get<Page<CourseDto>>('/instructor/courses', { params: { page, size } });
    return res.data;
  },

  createCourse: async (course: Partial<CourseDto>): Promise<CourseDto> => {
    const res = await api.post<CourseDto>('/instructor/courses', course);
    return res.data;
  },

  getCourseById: async (id: number): Promise<CourseDto> => {
    const res = await api.get<CourseDto>(`/instructor/courses/${id}`);
    return res.data;
  },

  updateCourse: async (id: number, course: Partial<CourseDto>): Promise<CourseDto> => {
    const res = await api.put<CourseDto>(`/instructor/courses/${id}`, course);
    return res.data;
  },

  deleteCourse: async (id: number): Promise<void> => {
    await api.delete(`/instructor/courses/${id}`);
  },

  submitCourseForReview: async (id: number): Promise<CourseDto> => {
    const res = await api.post<CourseDto>(`/instructor/courses/${id}/submit`);
    return res.data;
  },

  publishCourse: async (id: number): Promise<CourseDto> => {
    const res = await api.post<CourseDto>(`/instructor/courses/${id}/publish`);
    return res.data;
  },

  addSection: async (courseId: number, section: Partial<CourseSectionDto>): Promise<CourseSectionDto> => {
    const res = await api.post<CourseSectionDto>(`/instructor/courses/${courseId}/sections`, section);
    return res.data;
  },

  updateSection: async (sectionId: number, section: Partial<CourseSectionDto>): Promise<CourseSectionDto> => {
    const res = await api.put<CourseSectionDto>(`/instructor/sections/${sectionId}`, section);
    return res.data;
  },

  deleteSection: async (sectionId: number): Promise<void> => {
    await api.delete(`/instructor/sections/${sectionId}`);
  },

  addLesson: async (sectionId: number, lesson: Partial<LessonDto>): Promise<LessonDto> => {
    const res = await api.post<LessonDto>(`/instructor/sections/${sectionId}/lessons`, lesson);
    return res.data;
  },

  updateLesson: async (lessonId: number, lesson: Partial<LessonDto>): Promise<LessonDto> => {
    const res = await api.put<LessonDto>(`/instructor/lessons/${lessonId}`, lesson);
    return res.data;
  },

  deleteLesson: async (lessonId: number): Promise<void> => {
    await api.delete(`/instructor/lessons/${lessonId}`);
  },

  createQuiz: async (courseId: number, lessonId: number | undefined, quiz: Partial<QuizDto>): Promise<QuizDto> => {
    const res = await api.post<QuizDto>(`/instructor/courses/${courseId}/quizzes`, quiz, {
      params: lessonId ? { lessonId } : {}
    });
    return res.data;
  },

  addQuestion: async (quizId: number, question: Partial<QuestionDto>): Promise<QuestionDto> => {
    const res = await api.post<QuestionDto>(`/instructor/quizzes/${quizId}/questions`, question);
    return res.data;
  },

  addOption: async (questionId: number, option: Partial<QuestionOptionDto>): Promise<QuestionOptionDto> => {
    const res = await api.post<QuestionOptionDto>(`/instructor/questions/${questionId}/options`, option);
    return res.data;
  },

  setCorrectOption: async (questionId: number, optionId: number): Promise<void> => {
    await api.put(`/instructor/questions/${questionId}/options/${optionId}/correct`);
  },

  deleteQuiz: async (quizId: number): Promise<void> => {
    await api.delete(`/instructor/quizzes/${quizId}`);
  },

  getAnalytics: async (): Promise<InstructorAnalyticsDto> => {
    const res = await api.get<InstructorAnalyticsDto>('/instructor/analytics');
    return res.data;
  },
};
