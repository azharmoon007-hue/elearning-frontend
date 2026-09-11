// ==========================================
// Authentication & User Types
// ==========================================
export type RoleName = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string | null;
  enabled: boolean;
  emailVerified: boolean;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string | null;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: RoleName;
  roles?: string[];
}

// ==========================================
// Course & Category Types
// ==========================================
export const CourseLevel = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const;
export type CourseLevel = (typeof CourseLevel)[keyof typeof CourseLevel];

export const CourseStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus];

export const LessonType = {
  VIDEO: 'VIDEO',
  PDF: 'PDF',
  ARTICLE: 'ARTICLE',
  QUIZ: 'QUIZ',
} as const;
export type LessonType = (typeof LessonType)[keyof typeof LessonType];

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface CourseDto {
  id: number;
  title: string;
  subtitle?: string;
  slug?: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  level: CourseLevel;
  status: CourseStatus;
  instructorId?: number;
  categoryId?: number;
  instructorName?: string;
  categoryName?: string;
  totalLessons?: number;
  totalDurationSeconds?: number;
  totalEnrollments?: number;
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
}

export interface CourseSectionDto {
  id: number;
  courseId?: number;
  title: string;
  description?: string;
  displayOrder?: number;
  orderIndex?: number;
  lessons?: LessonDto[];
}

export interface LessonDto {
  id: number;
  sectionId?: number;
  title: string;
  description?: string;
  content?: string;
  type?: LessonType;
  videoUrl?: string;
  documentUrl?: string;
  durationSeconds?: number;
  durationMinutes?: number;
  displayOrder?: number;
  preview?: boolean;
  completed?: boolean;
  quizId?: number;
}

// ==========================================
// Quiz Types
// ==========================================
export interface QuestionOptionDto {
  id: number;
  questionId?: number;
  optionText: string;
  displayOrder?: number;
  orderIndex?: number;
  correct?: boolean; // Only present for instructor quiz builder
}

export interface QuestionDto {
  id: number;
  quizId?: number;
  questionText: string;
  marks?: number;
  displayOrder?: number;
  orderIndex?: number;
  options?: QuestionOptionDto[];
}

export interface QuizDto {
  id: number;
  courseId: number;
  lessonId?: number;
  title: string;
  description?: string;
  passingScore: number;
  maxAttempts: number;
  questions?: QuestionDto[];
}

export interface QuizStudentViewDto {
  id: number;
  courseId?: number;
  title: string;
  description?: string;
  passingScore: number;
  maxAttempts: number;
  remainingAttempts?: number;
  questions: QuestionDto[];
}

export interface QuizSubmissionDto {
  attemptId?: number;
  answers: {
    questionId: number;
    selectedOptionId: number;
  }[];
}

export interface QuizAttemptDto {
  id: number;
  studentId: number;
  quizId: number;
  score: number;
  totalMarks: number;
  percentage: number;
  scorePercentage?: number;
  passed: boolean;
  startedAt?: string;
  submittedAt?: string;
}

// ==========================================
// Enrollment & Learning Progress Types
// ==========================================
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface EnrollmentDto {
  id: number;
  studentId: number;
  courseId: number;
  courseTitle: string;
  course?: CourseDto;
  status: EnrollmentStatus;
  progressPercentage: number;
  enrolledAt: string;
  completedAt?: string | null;
}

export interface CourseProgressDto {
  studentId: number;
  courseId: number;
  progressPercentage: number;
  totalLessons: number;
  completedLessons: number;
  completed: boolean;
  completedLessonIds?: number[];
}

export interface LessonProgressDto {
  id?: number;
  studentId: number;
  lessonId: number;
  completed: boolean;
  watchedSeconds: number;
}

export interface CourseLearnDto {
  course: CourseDto;
  courseTitle?: string;
  thumbnailUrl?: string;
  sections: CourseSectionDto[];
  progress: CourseProgressDto;
}

// ==========================================
// Payments Types
// ==========================================
export type PaymentStatus = 'CREATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface PaymentDto {
  id: number;
  studentId: number;
  courseId: number;
  orderId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt?: string;
  studentEmail?: string;
  courseTitle?: string;
}

export interface CreatePaymentRequest {
  courseId: number;
  amount?: number;
}

export interface PaymentOrderResponseDto {
  orderId: string;
  amount: number;
  currency: string;
}

// ==========================================
// Review Types
// ==========================================
export interface ReviewDto {
  id: number;
  studentId: number;
  studentName?: string;
  courseId: number;
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseRatingSummaryDto {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: Record<number, number>;
}

// ==========================================
// Certificate Types
// ==========================================
export interface CertificateDto {
  id: number;
  studentId: number;
  studentName?: string;
  courseId: number;
  courseTitle?: string;
  certificateNumber: string;
  certificateUrl?: string;
  issuedAt: string;
  issueDate?: string;
}

// ==========================================
// Notification Types
// ==========================================
export type NotificationType = 'SYSTEM' | 'COURSE_UPDATE' | 'CERTIFICATE' | 'ENROLLMENT' | 'PAYMENT';

export interface NotificationDto {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// ==========================================
// Dashboards & Analytics Types
// ==========================================
export interface AdminDashboardDto {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  publishedCourses: number;
  pendingCourses: number;
  totalEnrollments: number;
  successfulPaymentsCount: number;
  totalRevenue: number;
  recentActivities?: {
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }[];
}

export interface InstructorAnalyticsDto {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  courseStats: {
    courseId: number;
    courseTitle: string;
    studentCount: number;
    revenue: number;
    rating: number;
  }[];
}

// ==========================================
// Pagination Type (Spring Data Page)
// ==========================================
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
