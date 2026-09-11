import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Award,
  Star,
  PlusCircle,
  BarChart3,
  ShieldCheck,
  Users,
  CreditCard,
  MessageSquare,
  Compass,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  CheckCircle,
  User,
  Layers,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationApi } from '../api/notificationApi';
import { NotificationDto } from '../types';

export const DashboardLayout: React.FC = () => {
  const { user, logout, isAdmin, isInstructor } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Determine user role and navigation items
  const roleTitle = isAdmin ? 'Administrator' : isInstructor ? 'Instructor' : 'Student';

  const navItems = isAdmin
    ? [
        { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
        { label: 'Course Moderation', to: '/admin/moderation', icon: ShieldCheck },
        { label: 'Courses Catalog', to: '/admin/courses', icon: BookOpen },
        { label: 'Categories', to: '/admin/categories', icon: Layers },
        { label: 'User Directory', to: '/admin/users', icon: Users },
        { label: 'Enrollments', to: '/admin/enrollments', icon: BookOpen },
        { label: 'Payments', to: '/admin/payments', icon: CreditCard },
        { label: 'Review Moderation', to: '/admin/reviews', icon: MessageSquare },
        { label: 'My Profile', to: '/admin/profile', icon: User },
      ]
    : isInstructor
    ? [
        { label: 'Dashboard', to: '/instructor', icon: LayoutDashboard, end: true },
        { label: 'My Courses', to: '/instructor/courses', icon: BookOpen },
        { label: 'Create Course', to: '/instructor/courses/new', icon: PlusCircle },
        { label: 'Enrolled Students', to: '/instructor/students', icon: Users },
        { label: 'Student Reviews', to: '/instructor/reviews', icon: MessageSquare },
        { label: 'Revenue & Payouts', to: '/instructor/revenue', icon: DollarSign },
        { label: 'Analytics', to: '/instructor/analytics', icon: BarChart3 },
        { label: 'My Profile', to: '/instructor/profile', icon: User },
      ]
    : [
        { label: 'Learning Center', to: '/student', icon: LayoutDashboard, end: true },
        { label: 'My Courses', to: '/student/my-courses', icon: BookOpen },
        { label: 'Certificates', to: '/student/certificates', icon: Award },
        { label: 'My Reviews', to: '/student/reviews', icon: Star },
        { label: 'Billing & Payments', to: '/student/payments', icon: CreditCard },
        { label: 'Notifications', to: '/student/notifications', icon: Bell },
        { label: 'My Profile', to: '/student/profile', icon: User },
      ];

  // Fetch notifications
  useEffect(() => {
    if (user?.userId) {
      notificationApi
        .getUserNotifications(user.userId)
        .then((res) => {
          setNotifications(res.content || []);
          setUnreadCount(res.content ? res.content.filter((n) => !n.read).length : 0);
        })
        .catch(() => {
          // Fallback gracefully
        });
    }
  }, [user?.userId]);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Ignored
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              Edu<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {roleTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Quick link to public marketplace */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/courses"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Compass className="w-4 h-4 text-emerald-500" />
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {roleTitle} Portal
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark mode switch */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* Notification dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-elevated p-3 z-50 animate-slide-up">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Notifications ({unreadCount})
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1.5 py-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`p-2.5 rounded-xl cursor-pointer text-xs transition-colors flex items-start gap-2.5 ${
                            n.read
                              ? 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              : 'bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-900 dark:text-white font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/60'
                          }`}
                        >
                          <CheckCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${n.read ? 'text-slate-300 dark:text-slate-600' : 'text-indigo-600 dark:text-indigo-400'}`} />
                          <div className="flex-1">
                            <p className="font-bold">{n.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
