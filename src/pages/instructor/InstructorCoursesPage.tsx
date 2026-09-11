import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  Edit,
  Send,
  Trash2,
  Eye,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { instructorApi } from '../../api/instructorApi';
import { CourseDto } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';

export const InstructorCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Course to delete modal
  const [courseToDelete, setCourseToDelete] = useState<CourseDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Submit for review action state
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    setLoading(true);
    instructorApi
      .getMyCourses(0, 50)
      .then((res) => {
        setCourses(res.content || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSubmitForReview = async (courseId: number) => {
    setSubmittingId(courseId);
    try {
      const updated = await instructorApi.submitCourseForReview(courseId);
      setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)));
      toast('Course submitted for administrative review!', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Submission failed. Ensure course has sections and lessons.', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const handlePublishNow = async (courseId: number) => {
    setSubmittingId(courseId);
    try {
      const updated = await instructorApi.publishCourse(courseId);
      setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)));
      toast('Course published to marketplace successfully!', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Publishing failed. Ensure course has sections and lessons.', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setDeleting(true);
    try {
      await instructorApi.deleteCourse(courseToDelete.id);
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setCourseToDelete(null);
      toast('Course deleted successfully.', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to delete course', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Course Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build, edit, and publish your instructional content
          </p>
        </div>

        <Link to="/instructor/courses/new">
          <Button variant="primary" size="sm" className="font-bold">
            <PlusCircle className="w-4 h-4 mr-2" />
            <span>Create New Course</span>
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
          {['ALL', 'DRAFT', 'PENDING_REVIEW', 'PUBLISHED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === s
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {s === 'ALL' ? 'All Courses' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

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

      {/* Courses Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No courses found"
          message={
            courses.length === 0
              ? "You haven't authored any courses yet. Get started by creating your first course!"
              : 'Try changing your search term or filter status.'
          }
          action={
            <Link to="/instructor/courses/new">
              <Button variant="primary" size="sm">
                Create First Course
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((course) => (
              <div
                key={course.id}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {course.title}
                    </h3>
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
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>Category: {course.categoryName || 'General'}</span>
                    <span>•</span>
                    <span>Price: {Number(course.price) === 0 ? 'Free' : `$${Number(course.price).toFixed(2)}`}</span>
                    <span>•</span>
                    <span>Students: {course.totalEnrollments || 0}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  <Link to={`/courses/${course.id}`} target="_blank">
                    <Button variant="ghost" size="sm" className="text-xs" title="Public Preview">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      <span>Preview</span>
                    </Button>
                  </Link>

                  <Link to={`/instructor/courses/${course.id}/edit`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      <span>Edit & Curriculum</span>
                    </Button>
                  </Link>

                  {course.status !== 'PUBLISHED' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                        loading={submittingId === course.id}
                        onClick={() => handlePublishNow(course.id)}
                        title="Directly publish course live to marketplace"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        <span>Publish</span>
                      </Button>

                      {course.status === 'DRAFT' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-medium"
                          loading={submittingId === course.id}
                          onClick={() => handleSubmitForReview(course.id)}
                          title="Submit course for administrative review"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          <span>Submit</span>
                        </Button>
                      )}
                    </>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    onClick={() => setCourseToDelete(course)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        title="Delete Course"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{courseToDelete?.title}"</span>? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setCourseToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              onClick={handleDeleteCourse}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default InstructorCoursesPage;
