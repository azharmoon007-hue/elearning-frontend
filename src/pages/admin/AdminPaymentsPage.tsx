import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, RotateCcw, Search, ShieldCheck } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { PaymentDto } from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundingId, setRefundingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = () => {
    setLoading(true);
    adminApi
      .getAllPayments(undefined, 0, 50)
      .then((res) => {
        setPayments(res.content || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleRefund = async (paymentId: number) => {
    setRefundingId(paymentId);
    try {
      const refunded = await adminApi.refundPayment(paymentId);
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? refunded : p))
      );
      toast('Payment marked as refunded successfully.', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Refund failed', 'error');
    } finally {
      setRefundingId(null);
    }
  };

  const filtered = payments.filter((p) =>
    (p.orderId || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.paymentId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Financial Transactions & Orders
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor incoming payments, billing gateway receipts, and refund requests
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order or Payment ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Transactions Found"
          message="No payment transactions logged in the platform registry yet."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Gateway Payment ID</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3.5 font-mono text-slate-900 dark:text-white font-bold">
                      {p.orderId}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">
                      {p.paymentId || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      ${Number(p.amount).toFixed(2)} {p.currency || 'USD'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'Recent'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {p.status === 'SUCCESS' && (
                        <Button
                          variant="outline"
                          size="sm"
                          loading={refundingId === p.id}
                          onClick={() => handleRefund(p.id)}
                          className="text-[11px]"
                        >
                          <RotateCcw className="w-3 h-3 mr-1 text-amber-500" />
                          <span>Refund</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminPaymentsPage;
