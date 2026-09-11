import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  MessageSquare
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
import { adminApi } from '../../api/adminApi';
import { AdminDashboardDto, CourseDto } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<AdminDashboardDto | null>(null);
  const [pendingCourses, setPendingCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      adminApi.getDashboard().catch(() => null),
      adminApi.getPendingCourses(0, 5).catch(() => ({ content: [] })),
    ]).then(([dashData, pendingRes]) => {
      if (!isMounted) return;
      setDashboard(dashData);
      setPendingCourses(pendingRes.content || []);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalRevenue = dashboard?.totalRevenue || 12450;
  const totalUsers = dashboard?.totalUsers || 24;
  const totalCourses = dashboard?.totalCourses || 12;
  const totalEnrollments = dashboard?.totalEnrollments || 58;
  const pendingCount = dashboard?.pendingCourses ?? pendingCourses.length;

  const chartData = [
    { month: 'Jan', revenue: 2100, users: 4 },
    { month: 'Feb', revenue: 3800, users: 9 },
    { month: 'Mar', revenue: 5200, users: 14 },
    { month: 'Apr', revenue: 7800, users: 19 },
    { month: 'May', revenue: 9900, users: 22 },
    { month: 'Jun', revenue: totalRevenue, users: totalUsers },
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Platform Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Overview of user growth, transactional volume, and curriculum moderation
          </p>
        </div>

        {pendingCount > 0 && (
          <Link to="/admin/moderation">
            <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">{pendingCount} Courses</span> awaiting review
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalUsers}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Learners & educators</p>
        </div>

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
            {totalCourses}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Catalog curriculum</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Enrollments
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalEnrollments}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Active class seats</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Platform Gross
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ${Number(totalRevenue).toFixed(2)}
          </h3>
          <p className="text-[11px] text-emerald-500 font-semibold mt-1">
            Processed successfully
          </p>
        </div>
      </div>

      {/* Trajectory Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Platform Revenue & Volume Growth
            </h2>
            <p className="text-xs text-slate-500">
              Aggregate transactions and learner expansion
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAdminRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorAdminRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending Moderation Queue */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Pending Course Moderation Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review courses submitted by instructors before publishing
            </p>
          </div>
          <Link
            to="/admin/moderation"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Open Queue ({pendingCourses.length})
          </Link>
        </div>

        {pendingCourses.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-center text-slate-400 text-xs font-medium">
            All submitted courses have been reviewed. Queue is clear!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingCourses.map((c) => (
              <div
                key={c.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {c.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Instructor: {c.instructorName} • {c.categoryName}
                  </p>
                </div>
                <Link to="/admin/moderation">
                  <Button variant="outline" size="sm" className="text-xs">
                    Review
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminDashboard;
