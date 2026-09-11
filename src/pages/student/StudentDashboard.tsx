import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlayCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { studentApi } from '../../api/studentApi';
import { courseApi } from '../../api/courseApi';
import { EnrollmentDto, CourseDto } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/States';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [recommended, setRecommended] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      studentApi.getMyEnrollments(0, 10).catch(() => ({ content: [] })),
      courseApi.getCourses({ size: 3 }).catch(() => ({ content: [] })),
    ]).then(([enrollmentsRes, coursesRes]) => {
      if (!isMounted) return;
      setEnrollments(enrollmentsRes.content || []);
      setRecommended(coursesRes.content || []);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const completedCount = enrollments.filter(
    (e) => (e.progressPercentage || 0) >= 100 || e.status === 'COMPLETED'
  ).length;

  const inProgressCount = enrollments.length - completedCount;
  const activeCourse = enrollments[0];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white p-6 sm:p-8 shadow-xl shadow-indigo-600/10">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Welcome back, {user?.firstName || 'Learner'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Ready to continue your learning journey?
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100">
            You're making great progress! Keep pushing towards completing your milestones and earning your verified credentials.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Enrolled Courses
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {enrollments.length}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              In Progress
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {inProgressCount}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {completedCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Continue Learning Spotlight */}
      {activeCourse && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Continue Learning</span>
            </h2>
            <Link
              to={`/student/learn/${activeCourse.courseId}`}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Current Course
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeCourse.courseTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Enrolled on {activeCourse.enrolledAt ? new Date(activeCourse.enrolledAt).toLocaleDateString() : 'recently'}
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Course Progress</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {Math.round(activeCourse.progressPercentage || 0)}%
                </span>
              </div>
              <ProgressBar value={activeCourse.progressPercentage || 0} size="md" />
            </div>

            <Link to={`/student/learn/${activeCourse.courseId}`}>
              <Button variant="primary" size="sm" className="font-bold shrink-0">
                Resume Course
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Enrolled Courses List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              My Courses ({enrollments.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Access your enrolled learning content
            </p>
          </div>
          <Link
            to="/student/my-courses"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View All
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <EmptyState
            title="No enrollments yet"
            message="You haven't enrolled in any courses yet. Browse our marketplace to find topics you love!"
            action={
              <Link to="/courses">
                <Button variant="primary" size="sm">
                  Browse Marketplace
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((enr) => (
              <div
                key={enr.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between gap-4 hover:border-indigo-500/50 transition-colors"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {enr.courseTitle}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>Status: {enr.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span>{Math.round(enr.progressPercentage || 0)}% Complete</span>
                  </div>
                  <ProgressBar value={enr.progressPercentage || 0} size="sm" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/40 dark:border-slate-700/40">
                  <Link
                    to={`/student/learn/${enr.courseId}`}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Launch Classroom</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {enr.progressPercentage && enr.progressPercentage >= 100 && (
                    <Link
                      to={`/student/certificates`}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Certificate</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Courses Carousel/Grid */}
      {recommended.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recommended for You
            </h2>
            <Link to="/courses" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Explore More
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recommended.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{c.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {Number(c.price) === 0 ? 'Free' : `$${Number(c.price).toFixed(2)}`}
                  </span>
                  <Link to={`/courses/${c.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentDashboard;
