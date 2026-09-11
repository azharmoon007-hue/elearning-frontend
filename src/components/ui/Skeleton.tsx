import React from 'react';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
      {...props}
    />
  );
};

export const CourseCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-4 shadow-subtle">
      <Skeleton className="w-full h-44 rounded-xl" />
      <div className="flex items-center justify-between">
        <Skeleton className="w-20 h-5 rounded-full" />
        <Skeleton className="w-16 h-4" />
      </div>
      <Skeleton className="w-full h-6" />
      <Skeleton className="w-3/4 h-4" />
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <Skeleton className="w-16 h-6" />
        <Skeleton className="w-24 h-9 rounded-xl" />
      </div>
    </div>
  );
};

export const SkeletonCard = CourseCardSkeleton;

