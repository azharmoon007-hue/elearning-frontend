import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Clock,
  Laptop,
  Users,
  Code2,
  BrainCircuit,
  Cloud,
  Smartphone,
  Lock,
  ChevronRight,
  Quote
} from 'lucide-react';
import { courseApi } from '../../api/courseApi';
import { CategoryDto, CourseDto } from '../../types';
import { CourseGrid } from '../../components/course/CourseGrid';
import { Button } from '../../components/ui/Button';

export const HomePage: React.FC = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      courseApi.getCourses({ size: 8, status: 'PUBLISHED' }).catch(() => courseApi.getCourses({ size: 8 })),
      courseApi.getCategories().catch(() => ({ content: [] })),
    ])
      .then(([coursesRes, categoriesRes]) => {
        setCourses(coursesRes.content || []);
        setCategories(categoriesRes.content || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    'Web Development': <Code2 className="w-6 h-6 text-indigo-500" />,
    'Data Science & AI': <BrainCircuit className="w-6 h-6 text-purple-500" />,
    'Cloud Computing & DevOps': <Cloud className="w-6 h-6 text-cyan-500" />,
    'Mobile App Development': <Smartphone className="w-6 h-6 text-emerald-500" />,
    'Cybersecurity': <Lock className="w-6 h-6 text-rose-500" />,
  };

  const defaultCategories: CategoryDto[] = [
    { id: 1, name: 'Web Development', description: 'React 19, Spring Boot, Node.js & Full-stack' },
    { id: 2, name: 'Data Science & AI', description: 'Python, Machine Learning, NumPy & Pandas' },
    { id: 3, name: 'Cloud Computing & DevOps', description: 'AWS, Kubernetes, Docker & CI/CD' },
    { id: 4, name: 'Mobile App Development', description: 'SwiftUI, Flutter, React Native & iOS' },
  ];

  const displayCategories = categories.length > 0 ? categories.slice(0, 4) : defaultCategories;

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/15 dark:bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Empower Your Future Today</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Learn Without Limits. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
              Build Real-World Skills.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Gain mastery through expert-led tech courses, hands-on production code, interactive quizzes, and industry-recognized certifications.
          </p>

          {/* Hero Search Box */}
          <form
            onSubmit={handleSearch}
            className="mt-10 max-w-xl mx-auto flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 p-2 gap-2"
          >
            <div className="flex items-center pl-3 flex-1">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="What do you want to learn? (e.g. React, Spring, AWS)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-2 py-2 text-sm bg-transparent focus:outline-none text-slate-900 dark:text-white"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </form>

          {/* Quick stats counter */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-10 border-t border-slate-200/80 dark:border-slate-800/80">
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">10K+</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Verified Lessons</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">50K+</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Active Learners</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">500+</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Industry Experts</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">98%</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Career Success</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explore Popular Categories
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Structured learning paths designed by world-class software engineers.
            </p>
          </div>
          <Link
            to="/courses"
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/courses?category=${cat.id}`}
              className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-elevated hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {categoryIcons[cat.name] || <Code2 className="w-6 h-6 text-indigo-500" />}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                  {cat.description || 'Comprehensive curriculum with practical projects and assessments.'}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>View Courses</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended by Tech Leads</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured Tech Courses
            </h2>
          </div>
          <Link
            to="/courses"
            className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <CourseGrid courses={courses} isLoading={isLoading} />
      </section>

      {/* Why Learn With Us Grid */}
      <section className="bg-slate-100/70 dark:bg-slate-900/50 py-16 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered for Real Career Impact
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Everything you need to master production architecture, ace technical interviews, and lead modern engineering teams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Expert Instructors</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Learn directly from senior architects and engineers from leading technology companies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Hands-on Labs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Build production-grade microservices, reactive UI applications, and cloud infrastructures.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Verified Certificates</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Receive verifiable digital certificates with unique serial numbers for LinkedIn and resume verification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Lifetime Access</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Learn at your own pace anytime, anywhere with continuous content updates and resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Trusted by 50,000+ Developers
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            See how developers leveraged EduFlow to advance their careers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
            <div>
              <Quote className="w-8 h-8 text-indigo-400/40 mb-3" />
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                "The Spring Security and JWT lessons gave me the clarity I couldn't find anywhere else. Landed a Senior Backend position two weeks after finishing!"
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm">
                AS
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Alice Smith</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Senior Full-Stack Engineer</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
            <div>
              <Quote className="w-8 h-8 text-indigo-400/40 mb-3" />
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                "The interactive quizzes and verifiable certificates made all the difference. My employer recognized my AWS certification immediately."
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                BJ
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Bob Jones</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Cloud Architect</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
            <div>
              <Quote className="w-8 h-8 text-indigo-400/40 mb-3" />
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                "As an instructor, the course builder and curriculum editor are second to none. Managing quizzes and student feedback is completely effortless."
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-sm">
                JD
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">John Doe</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Lead Tech Educator</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-8 sm:p-14 shadow-glow flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Start Learning Today. <br />
              Your Next Skill Is Waiting.
            </h2>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Join thousands of developers leveling up their architecture and development workflows with production-ready curriculum.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/courses">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold">
                Explore Marketplace
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-white border-white/40 hover:bg-white/10 hover:border-white"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
