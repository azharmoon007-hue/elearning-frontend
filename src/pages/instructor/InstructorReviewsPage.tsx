import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, BookOpen } from 'lucide-react';
import { instructorApi } from '../../api/instructorApi';
import { adminApi } from '../../api/adminApi';
import { ReviewDto, CourseDto } from '../../types';
import { RatingStars } from '../../components/ui/RatingStars';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/States';

export const InstructorReviewsPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');

  useEffect(() => {
    Promise.all([
      instructorApi.getMyCourses(0, 50).catch(() => ({ content: [] })),
      adminApi.getAllReviews(0, 100).catch(() => ({ content: [] })),
    ]).then(([coursesRes, reviewsRes]) => {
      setCourses(coursesRes.content || []);
      setReviews(reviewsRes.content || []);
      setLoading(false);
    });
  }, []);

  const courseIds = new Set(courses.map((c) => c.id));
  const instructorReviews = reviews.filter((r) => courseIds.has(r.courseId));

  const filtered = instructorReviews.filter((r) =>
    selectedCourseId === 'ALL' ? true : String(r.courseId) === selectedCourseId
  );

  const avgRating =
    filtered.length > 0
      ? (filtered.reduce((acc, r) => acc + r.rating, 0) / filtered.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Student Feedback & Reviews
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ratings and comments left by students enrolled across your instructional courses
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {avgRating} Avg Rating
          </span>
          <span className="text-[11px] text-slate-400">({filtered.length} reviews)</span>
        </div>
      </div>

      {/* Course Filter Dropdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-3 max-w-md">
        <span className="text-xs font-semibold text-slate-500 shrink-0">Filter by Course:</span>
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

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-8 h-8 text-indigo-500" />}
          title="No Reviews Yet"
          message="Student reviews for your courses will be aggregated and displayed here."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((rev) => (
            <div key={rev.id} className="p-6 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {rev.studentName ? rev.studentName[0].toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {rev.studentName || 'Student'}
                    </h4>
                    <RatingStars rating={rev.rating} size="sm" />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                    Course #{rev.courseId}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 pl-11 leading-relaxed">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default InstructorReviewsPage;
