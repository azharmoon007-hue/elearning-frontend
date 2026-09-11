import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Eye,
  BookOpen,
  User,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { courseApi } from '../../api/courseApi';
import { CourseDto, CourseSectionDto } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';

export const CourseModerationPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Preview Modal
  const [previewCourse, setPreviewCourse] = useState<CourseDto | null>(null);
  const [previewSections, setPreviewSections] = useState<CourseSectionDto[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // Reject Modal
  const [rejectingCourse, setRejectingCourse] = useState<CourseDto | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  // Approving state
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = () => {
    setLoading(true);
    adminApi
      .getPendingCourses(0, 50)
      .then((res) => {
        setCourses(res.content || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleApprove = async (courseId: number) => {
    setApprovingId(courseId);
    try {
      await adminApi.approveCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      if (previewCourse?.id === courseId) setPreviewCourse(null);
      toast('Course approved and published to marketplace!', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to approve course', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingCourse || !rejectReason.trim()) return;
    setSubmittingReject(true);
    try {
      await adminApi.rejectCourse(rejectingCourse.id, rejectReason.trim());
      setCourses((prev) => prev.filter((c) => c.id !== rejectingCourse.id));
      if (previewCourse?.id === rejectingCourse.id) setPreviewCourse(null);
      setRejectingCourse(null);
      setRejectReason('');
      toast('Course marked as rejected with instructor feedback.', 'info');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to reject course', 'error');
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleOpenPreview = async (course: CourseDto) => {
    setPreviewCourse(course);
    setLoadingSections(true);
    try {
      const s = await courseApi.getSectionsByCourseId(course.id);
      setPreviewSections(s);
    } catch {
      setPreviewSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Course Moderation Queue
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review curriculum completeness, compliance, and pedagogical quality before public listing
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="Moderation Queue Clear"
          message="There are currently no courses awaiting administrative approval."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    PENDING REVIEW
                  </span>
                  <span className="text-xs text-slate-400">
                    Category: {course.categoryName}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <User className="w-3.5 h-3.5" />
                    {course.instructorName}
                  </span>
                  <span>•</span>
                  <span>Price: {Number(course.price) === 0 ? 'Free' : `$${Number(course.price).toFixed(2)}`}</span>
                  <span>•</span>
                  <span>Level: {course.level}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenPreview(course)}
                  className="text-xs"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  <span>Inspect Curriculum</span>
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setRejectingCourse(course);
                    setRejectReason('');
                  }}
                  className="text-xs"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  <span>Reject</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  loading={approvingId === course.id}
                  onClick={() => handleApprove(course.id)}
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  <span>Approve & Publish</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Curriculum Modal */}
      <Modal
        isOpen={!!previewCourse}
        onClose={() => setPreviewCourse(null)}
        title={previewCourse ? `Curriculum Review: ${previewCourse.title}` : 'Curriculum Review'}
        size="lg"
      >
        {previewCourse && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <p className="text-xs text-slate-500">
                Instructor: <span className="font-bold text-slate-800 dark:text-slate-200">{previewCourse.instructorName}</span>
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {previewCourse.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Sections & Lessons ({previewSections.length} Sections)
              </h4>

              {loadingSections ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 rounded-xl" />
                  <Skeleton className="h-10 rounded-xl" />
                </div>
              ) : previewSections.length === 0 ? (
                <p className="text-xs text-amber-500 font-semibold italic">
                  Warning: No sections or lessons have been attached by the instructor.
                </p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {previewSections.map((sec, i) => (
                    <div
                      key={sec.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                        <span>
                          {i + 1}. {sec.title}
                        </span>
                        <span className="text-slate-400">
                          {sec.lessons?.length || 0} lessons
                        </span>
                      </div>

                      <div className="space-y-1 pl-3 border-l-2 border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                        {sec.lessons?.map((les, j) => (
                          <div key={les.id} className="flex justify-between py-0.5">
                            <span>
                              {i + 1}.{j + 1} {les.title}
                            </span>
                            <span className="text-slate-400">{les.durationMinutes}m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setRejectingCourse(previewCourse);
                  setRejectReason('');
                }}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleApprove(previewCourse.id)}
              >
                Approve Course
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={!!rejectingCourse}
        onClose={() => setRejectingCourse(null)}
        title="Reject Course Submission"
        size="md"
      >
        <form onSubmit={handleReject} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Please provide specific constructive feedback explaining what needs to be improved or added before this course can be accepted:
          </p>

          <textarea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Please add video content for Section 2, and ensure audio quality meets marketplace guidelines..."
            required
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setRejectingCourse(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="submit"
              loading={submittingReject}
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default CourseModerationPage;
