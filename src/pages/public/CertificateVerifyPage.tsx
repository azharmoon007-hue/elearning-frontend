import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Award, CheckCircle, Search, ShieldAlert, ArrowLeft, Download, Printer } from 'lucide-react';
import { certificateApi } from '../../api/certificateApi';
import { CertificateDto } from '../../types';
import { Button } from '../../components/ui/Button';

export const CertificateVerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || searchParams.get('number') || '';

  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<CertificateDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
  }, [initialCode]);

  const handleVerify = async (certNum: string) => {
    if (!certNum.trim()) return;
    setLoading(true);
    setError(null);
    setCertificate(null);

    try {
      const data = await certificateApi.getByNumber(certNum.trim());
      setCertificate(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Certificate not found. Please double check the credential ID.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3">
          <Award className="w-4 h-4" />
          <span>Credential Registry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Verify Certificate
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Enter an EduFlow unique certificate identifier to verify recipient authenticity and completion status.
        </p>
      </div>

      {/* Verification Lookup Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(code);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CERT-2026-..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="sm:w-auto w-full justify-center text-sm font-bold"
          >
            Verify Credential
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Credential Verification Failed</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Verified Certificate Display Card */}
      {certificate && (
        <div className="bg-white dark:bg-slate-900 border-2 border-indigo-600/30 dark:border-indigo-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 relative overflow-hidden">
          {/* Top Decorative watermark */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Validated Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Official Verified Credential
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  EduFlow Certified Record
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print Certificate
              </Button>
            </div>
          </div>

          {/* Certificate Inner Canvas Simulation */}
          <div className="text-center py-6 space-y-4">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              This is proudly presented to
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {certificate.studentName || 'Learner'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              for successfully completing all curriculum requirements, hands-on milestones, and assessments for
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {certificate.courseTitle || 'Advanced Mastery Course'}
            </h3>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 text-center sm:text-left">
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Certificate Number
              </p>
              <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {certificate.certificateNumber}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Issue Date
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                {certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Authorized By
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                EduFlow Academic Board
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CertificateVerifyPage;
