import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, ArrowRight, Award, PlayCircle } from 'lucide-react';
import { studentApi } from '../../api/studentApi';
import { EnrollmentDto } from '../../types';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/States';

export const MyCoursesPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    studentApi
      .getMyEnrollments(0, 50)
      .then((res) => {
        if (!isMounted) return;
        setEnrollments(res.content || []);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = enrollments.filter((e) => {
    const matchesSearch = e.courseTitle.toLowerCase().includes(search.toLowerCase());
    const isDone = (e.progressPercentage || 0) >= 100 || e.status === 'COMPLETED';

    if (!matchesSearch) return false;
    if (filter === 'IN_PROGRESS') return !isDone;
    if (filter === 'COMPLETED') return isDone;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          My Enrolled Courses
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pick up right where you left off across all your registered classes
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {[
            { key: 'ALL', label: 'All Courses' },
            { key: 'IN_PROGRESS', label: 'In Progress' },
            { key: 'COMPLETED', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === tab.key
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search my courses..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Course List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching courses found"
          message={
            enrollments.length === 0
              ? "You haven't enrolled in any courses yet."
              : 'Try changing your search or filter options.'
          }
          action={
            <Link to="/courses">
              <Button variant="primary" size="sm">
                Browse Courses
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((enr) => {
            const isCompleted =
              (enr.progressPercentage || 0) >= 100 || enr.status === 'COMPLETED';

            return (
              <div
                key={enr.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                        }`}
                    >
                      {isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {enr.enrolledAt ? new Date(enr.enrolledAt).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {enr.courseTitle}
                  </h3>
                </div>

                <div className="space-y-4 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <span>Progress</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {Math.round(enr.progressPercentage || 0)}%
                      </span>
                    </div>
                    <ProgressBar value={enr.progressPercentage || 0} size="sm" />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Link to={`/student/learn/${enr.courseId}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full justify-center">
                        <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                        <span>{isCompleted ? 'Review' : 'Continue'}</span>
                      </Button>
                    </Link>

                    {isCompleted && (
                      <Link to={`/student/certificates`}>
                        <Button variant="outline" size="sm" className="shrink-0" title="View Certificate">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default MyCoursesPage;
