import React, { useState, useEffect } from 'react';
import { Users, Search, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';
import { instructorApi } from '../../api/instructorApi';
import { adminApi } from '../../api/adminApi';
import { EnrollmentDto, CourseDto } from '../../types';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/States';

export const InstructorStudentsPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      instructorApi.getMyCourses(0, 50).catch(() => ({ content: [] })),
      adminApi.getAllEnrollments(undefined, 0, 100).catch(() => ({ content: [] })),
    ]).then(([coursesRes, enrollmentsRes]) => {
      setCourses(coursesRes.content || []);
      setEnrollments(enrollmentsRes.content || []);
      setLoading(false);
    });
  }, []);

  const courseIds = new Set(courses.map((c) => c.id));
  const instructorEnrollments = enrollments.filter((e) => courseIds.has(e.courseId));

  const filtered = instructorEnrollments.filter((e) => {
    const matchesCourse =
      selectedCourseId === 'ALL' || String(e.courseId) === selectedCourseId;
    const matchesSearch =
      (e.courseTitle || '').toLowerCase().includes(search.toLowerCase()) ||
      String(e.studentId).includes(search);
    return matchesCourse && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Enrolled Students Roster
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor learner progression, milestones, and engagement across your course catalog
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student ID or course..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Roster Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-indigo-500" />}
          title="No Students Found"
          message="Learners who enroll in your courses will appear in this roster."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Enrolled Course</th>
                  <th className="px-5 py-3">Progress</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Enrolled On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                          S
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Learner #{e.studentId}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                      {e.courseTitle || `Course #${e.courseId}`}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                          <span>{Math.round(e.progressPercentage || 0)}%</span>
                        </div>
                        <ProgressBar value={e.progressPercentage || 0} size="sm" />
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          e.status === 'COMPLETED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-400">
                      {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : 'Recent'}
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
export default InstructorStudentsPage;
