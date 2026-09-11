import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Trash2, ShieldAlert } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { ReviewDto } from '../../types';
import { RatingStars } from '../../components/ui/RatingStars';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    setLoading(true);
    adminApi
      .getAllReviews(0, 50)
      .then((res) => {
        setReviews(res.content || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await adminApi.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast('Review removed from public listing.', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to delete review', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Review Moderation
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Inspect student course feedback and remove inappropriate or abusive comments
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No Reviews to Moderate"
          message="All published reviews are currently active."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <RatingStars rating={rev.rating} size="sm" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {rev.studentName || 'Student'}
                  </span>
                  <span className="text-xs text-slate-400">
                    on Course #{rev.courseId}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    • {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                loading={deletingId === rev.id}
                onClick={() => handleDelete(rev.id)}
                className="text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                <span>Delete Review</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AdminReviewsPage;
