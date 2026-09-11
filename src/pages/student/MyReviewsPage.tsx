import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Edit3 } from 'lucide-react';
import { studentApi } from '../../api/studentApi';
import { ReviewDto } from '../../types';
import { RatingStars } from '../../components/ui/RatingStars';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';

export const MyReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<ReviewDto | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    studentApi
      .getMyReviews(0)
      .then((res) => {
        if (!isMounted) return;
        setReviews(res.content || []);
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

  const handleOpenEdit = (rev: ReviewDto) => {
    setEditingReview(rev);
    setEditRating(rev.rating);
    setEditComment(rev.comment);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    setSaving(true);
    try {
      const updated = await studentApi.updateReview(editingReview.id, {
        rating: editRating,
        comment: editComment.trim(),
      });
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditingReview(null);
      toast('Review updated successfully!', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to update review', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          My Reviews & Ratings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your feedback left across enrolled courses
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No Reviews Submitted"
          message="You haven't reviewed any courses yet. Once you complete course milestones, share your feedback on the course details page!"
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <RatingStars rating={rev.rating} size="sm" />
                  <span className="text-xs text-slate-400">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {rev.comment}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(rev)}
                className="shrink-0 text-xs"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                <span>Edit Review</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Review Modal */}
      <Modal
        isOpen={!!editingReview}
        onClose={() => setEditingReview(null)}
        title="Update Review"
        size="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setEditRating(s)}
                  className="p-1 text-2xl focus:outline-none"
                >
                  <span className={s <= editRating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}>
                    ★
                  </span>
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                {editRating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Your Feedback
            </label>
            <textarea
              rows={4}
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setEditingReview(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default MyReviewsPage;
