import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  DollarSign,
  Star,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { instructorApi } from '../../api/instructorApi';
import { CourseDto, InstructorAnalyticsDto } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const InstructorDashboard: React.FC = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [analytics, setAnalytics] = useState<InstructorAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      instructorApi.getMyCourses(0, 10).catch(() => ({ content: [] })),
      instructorApi.getAnalytics().catch(() => null),
    ]).then(([coursesRes, analyticsData]) => {
      if (!isMounted) return;
      setCourses(coursesRes.content || []);
      setAnalytics(analyticsData);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalEnrollments = analytics?.totalStudents || courses.reduce((acc, c) => acc + (c.totalEnrollments || 0), 0);
  const totalRevenue = analytics?.totalRevenue || courses.reduce((acc, c) => acc + (Number(c.price || 0) * (c.totalEnrollments || 0)), 0);
  const averageRating = analytics?.averageRating || 4.9;

  // Chart dummy data trends
  const chartData = [
    { month: 'Jan', revenue: Math.round(totalRevenue * 0.1), students: 12 },
    { month: 'Feb', revenue: Math.round(totalRevenue * 0.15), students: 25 },
    { month: 'Mar', revenue: Math.round(totalRevenue * 0.22), students: 48 },
    { month: 'Apr', revenue: Math.round(totalRevenue * 0.35), students: 76 },
    { month: 'May', revenue: Math.round(totalRevenue * 0.58), students: 110 },
    { month: 'Jun', revenue: Math.round(totalRevenue), students: totalEnrollments || 150 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Instructor Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Creator Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor student engagement, track earnings, and publish high-impact courses
          </p>
        </div>

        <Link to="/instructor/courses/new">
          <Button variant="primary" size="md" className="font-bold shadow-lg shadow-indigo-600/20">
            <PlusCircle className="w-4 h-4 mr-2" />
            <span>Create New Course</span>
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Courses
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {courses.length}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Active curriculum packages</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Students
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalEnrollments}
          </h3>
          <p className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +18% from last month
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gross Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ${Number(totalRevenue).toFixed(2)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Lifetime course sales</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Instructor Rating
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {averageRating.toFixed(1)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Across student evaluations</p>
        </div>
      </div>

      {/* Revenue Growth Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Revenue & Enrollment Trajectory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly breakdown of student acquisitions and earnings
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Courses List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Courses
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your existing content and curriculum
            </p>
          </div>
          <Link
            to="/instructor/courses"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View All Courses
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {courses.slice(0, 5).map((course) => (
            <div
              key={course.id}
              className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {course.title}
                  </h4>
                  <Badge
                    variant={
                      course.status === 'PUBLISHED'
                        ? 'success'
                        : course.status === 'PENDING_REVIEW'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {course.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {course.categoryName} • {course.totalEnrollments || 0} students • ${Number(course.price || 0).toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link to={`/instructor/courses/${course.id}/edit`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    Edit Course
                  </Button>
                </Link>
                <Link to={`/courses/${course.id}`}>
                  <Button variant="ghost" size="sm" className="text-xs">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default InstructorDashboard;
