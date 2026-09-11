import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Eye, Filter, ArrowUpDown } from 'lucide-react';
import { courseApi } from '../../api/courseApi';
import { adminApi } from '../../api/adminApi';
import { CourseDto, CourseStatus } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    setLoading(true);
    courseApi
      .getCourses({ size: 100 })
      .then((res) => {
        setCourses(res.content || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleStatusChange = async (courseId: number, newStatus: CourseStatus) => {
    setUpdatingId(courseId);
    try {
      const updated = await adminApi.updateCourseStatus(courseId, newStatus);
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, status: updated.status } : c))
      );
      toast(`Course status updated to ${newStatus}`, 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to update course status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.instructorName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Platform Course Catalog
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Master registry of all instructional courses across all publication lifecycles
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
          {['ALL', 'PUBLISHED', 'PENDING_REVIEW', 'DRAFT', 'REJECTED', 'ARCHIVED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === s
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or instructor..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Courses Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Courses Found"
          message="No courses match your selected filter criteria."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Course</th>
                  <th className="px-5 py-3">Instructor</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Students</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {c.title}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {c.instructorName || 'Lead Instructor'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {c.categoryName || 'General'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold">
                      {Number(c.price) === 0 ? 'Free' : `$${Number(c.price).toFixed(2)}`}
                    </td>
                    <td className="px-5 py-3.5 font-semibold">
                      {c.totalEnrollments || 0}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={c.status}
                        disabled={updatingId === c.id}
                        onChange={(e) => handleStatusChange(c.id, e.target.value as CourseStatus)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link to={`/courses/${c.id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="text-[11px]">
                          <Eye className="w-3 h-3 mr-1" />
                          <span>View</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminCoursesPage;
