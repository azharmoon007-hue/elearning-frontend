import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, CheckCircle, Download } from 'lucide-react';
import { instructorApi } from '../../api/instructorApi';
import { adminApi } from '../../api/adminApi';
import { CourseDto, PaymentDto } from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

export const InstructorRevenuePage: React.FC = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      instructorApi.getMyCourses(0, 50).catch(() => ({ content: [] })),
      adminApi.getAllPayments('SUCCESS', 0, 100).catch(() => ({ content: [] })),
    ]).then(([coursesRes, paymentsRes]) => {
      setCourses(coursesRes.content || []);
      setPayments(paymentsRes.content || []);
      setLoading(false);
    });
  }, []);

  const totalGross = courses.reduce(
    (acc, c) => acc + (c.totalEnrollments || 0) * Number(c.price || 0),
    0
  );
  const instructorCut = totalGross * 0.8; // 80% creator revenue share
  const platformFee = totalGross * 0.2; // 20% platform share

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Revenue & Creator Payouts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track earnings, creator revenue share (80%), and monthly disbursement schedules
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="text-xs font-semibold"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          <span>Export Financial Statement</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Gross Course Sales
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            ${totalGross.toFixed(2)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Gross sales before revenue share</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Net Creator Earnings
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ${instructorCut.toFixed(2)}
          </h3>
          <p className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            80% creator take-home rate
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Platform & Hosting Fees
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            ${platformFee.toFixed(2)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">20% video delivery & gateway costs</p>
        </div>
      </div>

      {/* Course Revenue Distribution Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Earnings by Course
          </h3>
          <span className="text-xs text-slate-400">{courses.length} authored courses</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Course</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Enrolled</th>
                <th className="px-6 py-3.5">Total Sales</th>
                <th className="px-6 py-3.5 text-right">Your Earnings (80%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {courses.map((c) => {
                const sales = (c.totalEnrollments || 0) * Number(c.price || 0);
                const earn = sales * 0.8;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {c.title}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      ${Number(c.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {c.totalEnrollments || 0}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      ${sales.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                      ${earn.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default InstructorRevenuePage;
