import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, BookOpen, X, RefreshCw } from 'lucide-react';
import { courseApi } from '../../api/courseApi';
import { CourseDto, CategoryDto, CourseLevel } from '../../types';
import { CourseCard } from '../../components/course/CourseCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/common/States';
import { Button } from '../../components/ui/Button';

export const CoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL params state
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('q') || '';
  
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedPrice, setSelectedPrice] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'price-asc' | 'price-desc'>('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch categories once
  useEffect(() => {
    courseApi.getCategories()
      .then(res => setCategories(res.content || []))
      .catch(() => {});
  }, []);

  // Fetch courses on filter/page change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const categoryObj = categories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
    const categoryId = categoryObj ? categoryObj.id : undefined;

    courseApi.getCourses({
      page,
      size: 12,
      search: searchTerm.trim() || undefined,
      categoryId: categoryId,
    })
      .then((res) => {
        if (!isMounted) return;
        setCourses(res.content || []);
        setTotalPages(res.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load courses.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, searchTerm, selectedCategory, categories]);

  // Sync to URL
  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    setPage(0);
    const newParams = new URLSearchParams(searchParams);
    if (catName) {
      newParams.set('category', catName);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set('q', searchTerm.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLevel('ALL');
    setSelectedPrice('ALL');
    setSortBy('popular');
    setPage(0);
    setSearchParams({});
  };

  // Client-side filtering and sorting for fine-grained options (level, price, sorting)
  const filteredCourses = courses.filter((c) => {
    if (selectedLevel !== 'ALL' && c.level !== selectedLevel) {
      return false;
    }
    if (selectedPrice === 'FREE' && Number(c.price) > 0) {
      return false;
    }
    if (selectedPrice === 'PAID' && Number(c.price) === 0) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.averageRating || 0) - (a.averageRating || 0);
    }
    if (sortBy === 'price-asc') {
      return Number(a.price || 0) - Number(b.price || 0);
    }
    if (sortBy === 'price-desc') {
      return Number(b.price || 0) - Number(a.price || 0);
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    // 'popular'
    return (b.totalEnrollments || 0) - (a.totalEnrollments || 0);
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Course Marketplace</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore All Courses
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl text-sm sm:text-base">
          Discover cutting-edge courses taught by industry leaders in software development, AI, cloud computing, and design.
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, topics, or keywords..."
              className="w-full pl-10 pr-24 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setPage(0);
                }}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          {/* Quick Controls */}
          <div className="flex items-center gap-3">
            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort courses by"
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 no-scrollbar">
          <button
            onClick={() => handleCategorySelect('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === ''
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters (Desktop & Mobile Drawer) */}
        <aside
          className={`md:col-span-1 space-y-6 ${
            mobileFilterOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-6 sticky top-24 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filter By</h3>
              </div>
              {(selectedCategory || selectedLevel !== 'ALL' || selectedPrice !== 'ALL' || searchTerm) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Level Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Experience Level
              </h4>
              <div className="space-y-2">
                {['ALL', CourseLevel.BEGINNER, CourseLevel.INTERMEDIATE, CourseLevel.ADVANCED].map((lvl) => (
                  <label key={lvl} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="level"
                      checked={selectedLevel === lvl}
                      onChange={() => setSelectedLevel(lvl)}
                      className="text-indigo-600 focus:ring-indigo-500 rounded"
                    />
                    <span className="capitalize">{lvl === 'ALL' ? 'All Levels' : lvl.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Pricing
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'All Courses', value: 'ALL' },
                  { label: 'Free Only', value: 'FREE' },
                  { label: 'Paid Only', value: 'PAID' },
                ].map((p) => (
                  <label key={p.value} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPrice === p.value}
                      onChange={() => setSelectedPrice(p.value as any)}
                      className="text-indigo-600 focus:ring-indigo-500 rounded"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Courses Listing Grid */}
        <section className="md:col-span-3">
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing {filteredCourses.length} results
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="Unable to load courses"
              message={error}
              onRetry={() => setPage(0)}
            />
          ) : filteredCourses.length === 0 ? (
            <EmptyState
              title="No courses found"
              message="Try adjusting your search keywords or removing active filters to see more results."
              action={
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-3">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
export default CoursesPage;
