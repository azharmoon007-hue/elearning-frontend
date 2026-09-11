import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// Public Pages
import HomePage from '../pages/public/HomePage';
import CoursesPage from '../pages/public/CoursesPage';
import CourseDetailPage from '../pages/public/CourseDetailPage';
import CategoriesPage from '../pages/public/CategoriesPage';
import CertificateVerifyPage from '../pages/public/CertificateVerifyPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';

// Common
import ProfilePage from '../pages/common/ProfilePage';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import MyCoursesPage from '../pages/student/MyCoursesPage';
import LearnPage from '../pages/student/LearnPage';
import StudentQuizPage from '../pages/student/StudentQuizPage';
import MyCertificatesPage from '../pages/student/MyCertificatesPage';
import MyReviewsPage from '../pages/student/MyReviewsPage';
import StudentPaymentsPage from '../pages/student/StudentPaymentsPage';
import StudentNotificationsPage from '../pages/student/StudentNotificationsPage';

// Instructor Pages
import InstructorDashboard from '../pages/instructor/InstructorDashboard';
import InstructorCoursesPage from '../pages/instructor/InstructorCoursesPage';
import CourseEditorPage from '../pages/instructor/CourseEditorPage';
import QuizEditorPage from '../pages/instructor/QuizEditorPage';
import InstructorStudentsPage from '../pages/instructor/InstructorStudentsPage';
import InstructorReviewsPage from '../pages/instructor/InstructorReviewsPage';
import InstructorRevenuePage from '../pages/instructor/InstructorRevenuePage';
import InstructorAnalyticsPage from '../pages/instructor/InstructorAnalyticsPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import CourseModerationPage from '../pages/admin/CourseModerationPage';
import AdminCoursesPage from '../pages/admin/AdminCoursesPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import AdminEnrollmentsPage from '../pages/admin/AdminEnrollmentsPage';
import AdminPaymentsPage from '../pages/admin/AdminPaymentsPage';
import AdminReviewsPage from '../pages/admin/AdminReviewsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/verify" element={<CertificateVerifyPage />} />
        <Route path="/verify-certificate" element={<CertificateVerifyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Standalone Student Immersive Learning & Quiz taker */}
      <Route
        path="/student/learn/:courseId"
        element={
          <ProtectedRoute requiredRole="ROLE_STUDENT">
            <LearnPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/quizzes/:quizId"
        element={
          <ProtectedRoute requiredRole="ROLE_STUDENT">
            <StudentQuizPage />
          </ProtectedRoute>
        }
      />

      {/* Student Portal */}
      <Route
        element={
          <ProtectedRoute requiredRole="ROLE_STUDENT">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/my-courses" element={<MyCoursesPage />} />
        <Route path="/student/certificates" element={<MyCertificatesPage />} />
        <Route path="/student/reviews" element={<MyReviewsPage />} />
        <Route path="/student/payments" element={<StudentPaymentsPage />} />
        <Route path="/student/notifications" element={<StudentNotificationsPage />} />
        <Route path="/student/profile" element={<ProfilePage />} />
      </Route>

      {/* Instructor Portal */}
      <Route
        element={
          <ProtectedRoute requiredRole="ROLE_INSTRUCTOR">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
        <Route path="/instructor/courses/new" element={<CourseEditorPage />} />
        <Route path="/instructor/courses/:id/edit" element={<CourseEditorPage />} />
        <Route path="/instructor/quizzes/:id/edit" element={<QuizEditorPage />} />
        <Route path="/instructor/students" element={<InstructorStudentsPage />} />
        <Route path="/instructor/reviews" element={<InstructorReviewsPage />} />
        <Route path="/instructor/revenue" element={<InstructorRevenuePage />} />
        <Route path="/instructor/analytics" element={<InstructorAnalyticsPage />} />
        <Route path="/instructor/profile" element={<ProfilePage />} />
      </Route>

      {/* Admin Portal */}
      <Route
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/moderation" element={<CourseModerationPage />} />
        <Route path="/admin/courses" element={<AdminCoursesPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/enrollments" element={<AdminEnrollmentsPage />} />
        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        <Route path="/admin/reviews" element={<AdminReviewsPage />} />
        <Route path="/admin/profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default AppRoutes;
