import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, Printer, ExternalLink, ShieldCheck, Search, Share2 } from 'lucide-react';
import { studentApi } from '../../api/studentApi';
import { CertificateDto, EnrollmentDto } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';

export const MyCertificatesPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<CertificateDto | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    studentApi
      .getMyEnrollments(0, 50)
      .then(async (res) => {
        if (!isMounted) return;
        const allEnr = res.content || [];
        setEnrollments(allEnr);

        // For courses with completed status or >= 100 progress, fetch certificates
        const completed = allEnr.filter(
          (e) => (e.progressPercentage || 0) >= 100 || e.status === 'COMPLETED'
        );

        const certPromises = completed.map((e) =>
          studentApi.getCertificate(e.courseId).catch(() => null)
        );

        const certs = await Promise.all(certPromises);
        if (isMounted) {
          setCertificates(certs.filter((c): c is CertificateDto => c !== null));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopyLink = (certNumber: string) => {
    const url = `${window.location.origin}/verify-certificate?code=${encodeURIComponent(certNumber)}`;
    navigator.clipboard.writeText(url);
    toast('Public verification URL copied to clipboard!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          My Earned Certificates
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Industry-recognized digital credentials verifying your completed course milestones
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-56 rounded-3xl" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <EmptyState
          title="No Certificates Earned Yet"
          message="Complete 100% of any course's curriculum and quiz milestones to unlock your verifiable digital credential."
          action={
            <Link to="/student/my-courses">
              <Button variant="primary" size="sm">
                Continue Learning
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {cert.certificateNumber}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cert.courseTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Issued to: <span className="font-semibold text-slate-700 dark:text-slate-300">{cert.studentName}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Date: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'Recent'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedCert(cert)}
                  className="flex-1 justify-center text-xs"
                >
                  View Credential
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(cert.certificateNumber)}
                  title="Copy Public Verification Link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      <Modal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        title="Verified Credential Certificate"
        size="lg"
      >
        {selectedCert && (
          <div className="space-y-6">
            <div className="p-8 rounded-3xl border-2 border-indigo-500/30 bg-slate-900 text-white text-center space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>

              <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
                EduFlow Certificate of Mastery
              </p>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {selectedCert.studentName}
              </h2>

              <p className="text-xs text-slate-300 max-w-md mx-auto">
                has successfully fulfilled all curriculum requirements, code laboratories, and passing assessments for
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-indigo-400">
                {selectedCert.courseTitle}
              </h3>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
                <div>
                  <span className="font-semibold text-slate-200">Credential ID:</span>{' '}
                  <span className="font-mono">{selectedCert.certificateNumber}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-200">Issue Date:</span>{' '}
                  {selectedCert.issueDate ? new Date(selectedCert.issueDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyLink(selectedCert.certificateNumber)}
              >
                <Share2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Copy Verification URL</span>
              </Button>

              <Button variant="primary" size="sm" onClick={handlePrint}>
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                <span>Print Certificate</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default MyCertificatesPage;
