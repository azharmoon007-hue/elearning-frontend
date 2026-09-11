import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Download, Receipt, CheckCircle, ShieldCheck } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { PaymentDto } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/States';
import { useAuth } from '../../context/AuthContext';

export const StudentPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentDto | null>(null);

  useEffect(() => {
    // Retrieve payments
    adminApi
      .getAllPayments(undefined, 0, 50)
      .then((res) => {
        // Filter payments for this student
        const userPayments = (res.content || []).filter(
          (p) => !p.studentId || p.studentId === user?.userId
        );
        setPayments(userPayments);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.userId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Billing & Purchase History
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review your course order invoices, transaction status, and receipts
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-8 h-8 text-indigo-500" />}
          title="No Transactions Yet"
          message="When you purchase paid courses on EduFlow, your receipts and order summaries will appear here."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Order Ref</th>
                  <th className="px-5 py-3">Course / Item</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {p.orderId}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {p.courseTitle || `Course #${p.courseId}`}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      ${Number(p.amount).toFixed(2)} {p.currency || 'USD'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'SUCCESS'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : p.status === 'REFUNDED'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReceipt(p)}
                        className="text-[11px]"
                      >
                        <Receipt className="w-3.5 h-3.5 mr-1" />
                        <span>View Invoice</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Official Payment Invoice"
        size="md"
      >
        {selectedReceipt && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order ID</p>
                  <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {selectedReceipt.orderId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Item:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedReceipt.courseTitle || `Course #${selectedReceipt.courseId}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {selectedReceipt.paymentId || 'pay_confirmed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedReceipt.status}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                <span className="text-xs font-semibold text-slate-500">Total Paid:</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  ${Number(selectedReceipt.amount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                className="text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                <span>Print Invoice</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default StudentPaymentsPage;
