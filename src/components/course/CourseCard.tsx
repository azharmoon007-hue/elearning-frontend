import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Sparkles } from 'lucide-react';
import { CourseDto } from '../../types';
import { Badge } from '../ui/Badge';
import { RatingStars } from '../ui/RatingStars';

interface CourseCardProps {
  course: CourseDto;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  // Format duration in hours/minutes
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '3h 30m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };

  const levelColor = {
    BEGINNER: 'success',
    INTERMEDIATE: 'primary',
    ADVANCED: 'warning',
  } as const;

  const placeholderImages: Record<string, string> = {
    web: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
    data: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    cloud: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    mobile: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
    default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
  };

  const safeSlug = (course.slug || course.title || '').toLowerCase();
  const thumbnail =
    course.thumbnailUrl ||
    (safeSlug.includes('react') || safeSlug.includes('bootcamp')
      ? placeholderImages.web
      : safeSlug.includes('python') || safeSlug.includes('data')
      ? placeholderImages.data
      : safeSlug.includes('aws') || safeSlug.includes('cloud')
      ? placeholderImages.cloud
      : safeSlug.includes('ios') || safeSlug.includes('swift')
      ? placeholderImages.mobile
      : placeholderImages.default);

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-elevated hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Thumbnail container with zoom effect */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={thumbnail}
          alt={course.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge variant={levelColor[course.level] || 'default'} size="sm">
            {course.level}
          </Badge>
        </div>
        {course.price === 0 && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500 text-white rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              FREE
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {course.categoryName && (
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1.5 uppercase tracking-wider">
              {course.categoryName}
            </p>
          )}
          <Link to={`/courses/${course.id}`}>
            <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
              {course.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Course Meta (Duration & Lessons) */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{course.totalLessons || 12} Lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDuration(course.totalDurationSeconds)}</span>
          </div>
        </div>

        {/* Rating and Price footer */}
        <div className="mt-3 flex items-center justify-between">
          <RatingStars rating={4.8} showScore totalReviews={42} size="sm" />
          <div className="text-right">
            {course.price === 0 ? (
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">Free</span>
            ) : (
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                ${course.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
