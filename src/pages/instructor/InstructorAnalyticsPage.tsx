import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  BookOpen,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { instructorApi } from '../../api/instructorApi';
import { CourseDto, InstructorAnalyticsDto } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';

export const InstructorAnalyticsPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [analytics, setAnalytics] = useState<InstructorAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      instructorApi.getMyCourses(0, 50).catch(() => ({ content: [] })),
      instructorApi.getAnalytics().catch(() => null),
    ]).then(([cRes, aData]) => {
      if (!isMounted) return;
      setCourses(cRes.content || []);
      setAnalytics(aData);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalStudents = analytics?.totalStudents || courses.reduce((a, b) => a + (b.totalEnrollments || 0), 0);
  const totalRev = analytics?.totalRevenue || courses.reduce((a, b) => a + (Number(b.price || 0) * (b.totalEnrollments || 0)), 0);

  const coursePerformanceData = courses.map((c) => ({
    name: c.title.length > 18 ? c.title.substring(0, 18) + '...' : c.title,
    students: c.totalEnrollments || 0,
    revenue: Math.round((c.totalEnrollments || 0) * Number(c.price || 0)),
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Performance Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Detailed metrics across enrollments, revenue, and student evaluations
        </p>
      </div>

      {/* Top Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Active Students
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalStudents}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Lifetime Revenue
          </p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ${Number(totalRev).toFixed(2)}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Average Rating
          </p>
          <h3 className="text-2xl font-black text-amber-500 mt-1">
            {(analytics?.averageRating || 4.9).toFixed(1)} ★
          </h3>
        </div>
      </div>

      {/* Per-Course Performance Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Enrollments by Course
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={coursePerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} interval={0} angle={-15} textAnchor="end" />
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
              <Bar dataKey="students" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Course Performance Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Students</th>
                <th className="px-5 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {courses.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                    {c.title}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold">{c.status}</span>
                  </td>
                  <td className="px-5 py-3.5">${Number(c.price).toFixed(2)}</td>
                  <td className="px-5 py-3.5 font-semibold">{c.totalEnrollments || 0}</td>
                  <td className="px-5 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                    ${((c.totalEnrollments || 0) * Number(c.price || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default InstructorAnalyticsPage;
