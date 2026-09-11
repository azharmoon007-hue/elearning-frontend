import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Globe, Share2, Code2, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Edu<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Empowering learners globally with industry-standard curriculum, interactive labs, verified certificates, and career advancement.
            </p>
            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Code2 className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/courses" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/courses?category=1" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/courses?category=2" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Data Science & AI
                </Link>
              </li>
              <li>
                <Link to="/courses?category=3" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Cloud Computing
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/verify" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Become an Instructor
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-600 cursor-not-allowed">API Documentation</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Verification */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Accreditation
            </h4>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Verified Credentials
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                All certificates issued are backed by tamper-evident unique serials verifiable 24/7 on our public registry.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Azhar Hussain Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for modern learners</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
