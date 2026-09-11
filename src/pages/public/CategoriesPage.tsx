import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Code2,
  Cloud,
  Database,
  Brain,
  Palette,
  Smartphone,
  Shield,
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { courseApi } from '../../api/courseApi';
import { CategoryDto } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/States';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseApi
      .getCategories()
      .then((res) => {
        setCategories(res.content || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('web') || n.includes('frontend') || n.includes('fullstack')) {
      return <Code2 className="w-7 h-7 text-indigo-500" />;
    }
    if (n.includes('cloud') || n.includes('devops') || n.includes('aws')) {
      return <Cloud className="w-7 h-7 text-sky-500" />;
    }
    if (n.includes('data') || n.includes('sql') || n.includes('database')) {
      return <Database className="w-7 h-7 text-emerald-500" />;
    }
    if (n.includes('ai') || n.includes('intelligence') || n.includes('machine')) {
      return <Brain className="w-7 h-7 text-purple-500" />;
    }
    if (n.includes('design') || n.includes('ui') || n.includes('ux')) {
      return <Palette className="w-7 h-7 text-pink-500" />;
    }
    if (n.includes('mobile') || n.includes('android') || n.includes('ios')) {
      return <Smartphone className="w-7 h-7 text-amber-500" />;
    }
    return <Layers className="w-7 h-7 text-indigo-500" />;
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Learning Domains</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Explore Course Categories
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Choose a domain that aligns with your professional aspirations and accelerate your career with comprehensive courses.
        </p>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-3xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title="No Categories Available"
          message="Course categories will appear here once published."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/courses?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-7 shadow-sm hover:shadow-xl hover:border-indigo-500/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.name)}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.description ||
                      'Master essential frameworks, industry best practices, and real-world implementation techniques.'}
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                <span>Browse Courses</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default CategoriesPage;
