import React from 'react';
import { CourseDto } from '../../types';
import { CourseCard } from './CourseCard';
import { CourseCardSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../common/States';

interface CourseGridProps {
  courses: CourseDto[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
}

export const CourseGrid: React.FC<CourseGridProps> = ({
  courses,
  isLoading = false,
  emptyTitle = 'No courses found',
  emptyMessage = 'Try adjusting your search terms or filters to find what you are looking for.',
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};
