import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  CheckCircle2,
  Award,
  Globe,
  Share2,
  Heart,
  ArrowRight,
  ShieldCheck,
  User,
  MessageSquare,
  Sparkles,
  Lock,
  PlayCircle
} from 'lucide-react';
import { courseApi } from '../../api/courseApi';
import { studentApi } from '../../api/studentApi';
import { paymentApi } from '../../api/paymentApi';
import { CourseDto, CourseSectionDto, ReviewDto, CourseRatingSummaryDto } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RatingStars } from '../../components/ui/RatingStars';
import { CurriculumAccordion } from '../../components/course/CurriculumAccordion';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { ErrorState } from '../../components/common/States';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();
  const { isAuthenticated, user, isStudent } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseDto | null>(null);
  const [sections, setSections] = useState<CourseSectionDto[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [summary, setSummary] = useState<CourseRatingSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enrollment state
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Payment checkout modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    let isMounted = true;
    setLoading(true);

    Promise.all([
      courseApi.getCourseById(courseId),
      courseApi.getSectionsByCourseId(courseId).catch(() => []),
      courseApi.getReviewsByCourseId(courseId, 0).catch(() => ({ content: [] })),
      courseApi.getCourseRatingSummary(courseId).catch(() => null),
    ])
      .then(([courseData, sectionsData, reviewsData, summaryData]) => {
        if (!isMounted) return;
        setCourse(courseData);
        setSections(sectionsData);
        setReviews(reviewsData.content || []);
        setSummary(summaryData);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load course details');
        setLoading(false);
      });

    // Check enrollment if authenticated
    if (isAuthenticated && isStudent) {
      studentApi.getMyEnrollments(0, 100).then((res) => {
        const found = res.content?.some((e) => e.courseId === courseId);
        if (isMounted) setIsEnrolled(!!found);
      }).catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [courseId, isAuthenticated, isStudent]);

  // Handle Enrollment or Purchase
  const handleEnrollOrBuy = async () => {
    if (!isAuthenticated) {
      toast('Please log in or sign up to enroll in this course.', 'info');
      navigate(`/login?redirect=/courses/${courseId}`);
      return;
    }

    if (isEnrolled) {
      navigate(`/student/learn/${courseId}`);
      return;
    }

    // If free course -> instant enroll
    if (!course?.price || Number(course.price) === 0) {
      setEnrolling(true);
      try {
        await studentApi.enrollInCourse(courseId);
        setIsEnrolled(true);
        toast('Enrolled successfully! Enjoy learning.', 'success');
        navigate(`/student/learn/${courseId}`);
      } catch (err: any) {
        toast(err.response?.data?.message || 'Enrollment failed. Please try again.', 'error');
      } finally {
        setEnrolling(false);
      }
    } else {
      // Paid course -> Open Checkout modal
      setCheckoutModalOpen(true);
    }
  };

  // Complete Payment Flow
  const handleConfirmPayment = async () => {
    setProcessingPayment(true);
    try {
      // Step 1: Create Order
      const order = await paymentApi.createOrder(courseId);
      // Step 2: Mark Success (Simulating payment gateway response)
      const fakePaymentId = 'pay_' + Math.random().toString(36).substring(2, 9);
      await paymentApi.markSuccess(order.orderId, fakePaymentId);

      // Step 3: Complete enrollment
      await studentApi.enrollInCourse(courseId);
      setIsEnrolled(true);
      setCheckoutModalOpen(false);
      toast('Payment successful! You are now enrolled.', 'success');
      navigate(`/student/learn/${courseId}`);
    } catch (err: any) {
      toast(err.response?.data?.message || 'Payment simulation failed. Please try again.', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Handle Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const added = await studentApi.addReview(courseId, {
        rating: newRating,
        comment: newComment.trim(),
      });
      setReviews((prev) => [added, ...prev]);
      setReviewModalOpen(false);
      setNewComment('');
      toast('Review submitted successfully!', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to submit review. Make sure you are enrolled.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-pulse">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState
          title="Course Not Found"
          message={error || 'The requested course does not exist or may have been removed.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
  const isFree = !course.price || Number(course.price) === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19]">
      {/* Dark Hero Header Banner */}
      <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {course.categoryName && (
                <Badge variant="primary" size="md">
                  {course.categoryName}
                </Badge>
              )}
              <Badge variant="neutral" size="md">
                {course.level || 'All Levels'}
              </Badge>
              {course.averageRating && course.averageRating >= 4.5 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Bestseller
                </span>
              )}
            </div>

            {/* Course Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {course.title}
            </h1>

            {/* Subtitle / Short Description */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              {course.subtitle || course.description?.slice(0, 160) + '...'}
            </p>

            {/* Meta Row: Rating, Enrollments, Instructor */}
            <div className="flex flex-wrap items-center gap-4 text-sm pt-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400 text-base">
                  {course.averageRating ? course.averageRating.toFixed(1) : 'New'}
                </span>
                <RatingStars rating={course.averageRating || 5} size="sm" />
                <span className="text-slate-400">
                  ({course.totalReviews || reviews.length} reviews)
                </span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <User className="w-4 h-4 text-slate-400" />
                <span>{course.totalEnrollments || 0} students enrolled</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="text-slate-300">
                Created by{' '}
                <span className="font-semibold text-indigo-400 underline decoration-indigo-400/30">
                  {course.instructorName || 'Lead Instructor'}
                </span>
              </div>
            </div>

            {/* Language & Certificate perks */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>English</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Certificate of Completion Included</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Details + Sticky Right Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Details, Objectives, Curriculum, Instructor, Reviews */}
          <div className="lg:col-span-2 space-y-10">
            {/* What you'll learn card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>What You'll Master in This Course</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  'Build production-grade applications from scratch with modern architectures',
                  'Gain real-world problem solving and system design skills',
                  'Master best practices, performance optimization, and testing workflows',
                  'Implement robust security patterns, token authorization, and data validation',
                  'Interactive quizzes to reinforce retention at every chapter',
                  'Verified industry-recognized digital certificate to showcase on LinkedIn'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Curriculum */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Course Curriculum
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {sections.length} sections • {totalLessons} lessons
                  </p>
                </div>
              </div>

              <CurriculumAccordion
                sections={sections}
                isEnrolled={isEnrolled}
                onSelectLesson={(lesson) => {
                  if (isEnrolled) {
                    navigate(`/student/learn/${courseId}?lesson=${lesson.id}`);
                  } else if (lesson.preview) {
                    toast('Free preview selected', 'info');
                  } else {
                    toast('Enroll in this course to unlock all lessons.', 'info');
                  }
                }}
              />
            </div>

            {/* Description Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Course Description
              </h2>
              <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {course.description || 'No detailed description provided.'}
              </div>
            </div>

            {/* Instructor Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                About the Instructor
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl shrink-0">
                  {course.instructorName ? course.instructorName[0].toUpperCase() : 'I'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {course.instructorName || 'Senior Software Engineer'}
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
                    Verified Lead Instructor
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Passionate software engineer and tech educator dedicated to mentoring next-generation developers through high-quality project-based courses and hands-on code walkthroughs.
                  </p>
                </div>
              </div>
            </div>

            {/* Student Reviews & Ratings Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Student Reviews & Feedback
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Verified ratings from enrolled students
                  </p>
                </div>
                {isEnrolled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReviewModalOpen(true)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                    Write a Review
                  </Button>
                )}
              </div>

              {/* Summary Stats Box */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-center sm:text-left shrink-0">
                  <div className="text-4xl font-black text-slate-900 dark:text-white">
                    {summary?.averageRating ? summary.averageRating.toFixed(1) : (course.averageRating?.toFixed(1) || '5.0')}
                  </div>
                  <RatingStars rating={summary?.averageRating || course.averageRating || 5} size="md" />
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Course Rating • {summary?.totalReviews || reviews.length} Reviews
                  </div>
                </div>

                {/* Rating Distribution Bars */}
                <div className="flex-1 w-full space-y-1.5">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = (summary?.ratingDistribution as any)?.[stars] || 0;
                    const total = summary?.totalReviews || 1;
                    const pct = Math.round((count / Math.max(1, total)) * 100);
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs">
                        <span className="w-10 text-slate-500 dark:text-slate-400 font-medium">{stars} stars</span>
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-slate-400">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4 pt-2">
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">
                    No reviews yet. Be the first to share your learning experience!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {rev.studentName ? rev.studentName[0].toUpperCase() : 'S'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {rev.studentName || 'Student'}
                            </p>
                            <RatingStars rating={rev.rating} size="sm" />
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 pl-10">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Pricing & Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              {/* Media preview */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center group cursor-pointer">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-800 flex items-center justify-center text-white">
                    <PlayCircle className="w-14 h-14 opacity-90 group-hover:scale-110 transition-transform" />
                  </div>
                )}
              </div>

              {/* Price & CTA */}
              <div>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {isFree ? 'Free' : `$${Number(course.price).toFixed(2)}`}
                  </span>
                  {!isFree && (
                    <span className="text-base text-slate-400 line-through">
                      ${(Number(course.price) * 1.5).toFixed(2)}
                    </span>
                  )}
                  {!isFree && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      33% OFF
                    </span>
                  )}
                </div>

                {isEnrolled ? (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full justify-center text-sm font-bold shadow-lg shadow-indigo-600/30"
                    onClick={() => navigate(`/student/learn/${courseId}`)}
                  >
                    <span>Go to Course</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full justify-center text-sm font-bold shadow-lg shadow-indigo-600/30"
                    loading={enrolling}
                    onClick={handleEnrollOrBuy}
                  >
                    {isFree ? 'Enroll for Free' : 'Buy Now'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              <div className="text-center">
                <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  30-day money-back guarantee • Instant access
                </span>
              </div>

              {/* Included Perks Checklist */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  This Course Includes:
                </h4>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{totalLessons} lessons & video lectures</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Self-paced lifetime access</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Access on mobile, tablet & desktop</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title="Complete Your Enrollment"
        size="md"
      >
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{course.title}</h4>
            <p className="text-xs text-slate-500 mt-1">Instructor: {course.instructorName}</p>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Total Amount:</span>
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                ${Number(course.price).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Encrypted payment gateway integration simulation enabled.</span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setCheckoutModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={processingPayment}
              onClick={handleConfirmPayment}
            >
              Pay ${Number(course.price).toFixed(2)} & Enroll
            </Button>
          </div>
        </div>
      </Modal>

      {/* Write Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Rate & Review Course"
        size="md"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Your Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setNewRating(s)}
                  className="p-1 text-2xl focus:outline-none"
                >
                  <span className={s <= newRating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}>
                    ★
                  </span>
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                {newRating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Your Review
            </label>
            <textarea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What did you enjoy about this course? How was the teaching quality?"
              required
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submittingReview}>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default CourseDetailPage;
