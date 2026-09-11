import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Award,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { studentApi } from '../../api/studentApi';
import { QuizStudentViewDto, QuizAttemptDto } from '../../types';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';

export const StudentQuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const id = Number(quizId);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<QuizStudentViewDto | null>(null);
  const [attempts, setAttempts] = useState<QuizAttemptDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Active quiz session state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttemptDto | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    Promise.all([
      studentApi.getQuizForStudent(id),
      studentApi.getMyQuizAttempts(id).catch(() => []),
    ])
      .then(([quizData, attemptsData]) => {
        if (!isMounted) return;
        setQuiz(quizData);
        setAttempts(attemptsData);
        if (attemptsData.length > 0) {
          setLatestAttempt(attemptsData[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoading(false);
        toast(err.message || 'Failed to load quiz assessment', 'error');
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSelectOption = (questionId: number, optionId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    const questions = quiz.questions || [];
    const answers = questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: selectedAnswers[q.id] || 0,
    }));

    setSubmitting(true);
    try {
      const result = await studentApi.submitQuiz(id, { answers });
      setLatestAttempt(result);
      setAttempts((prev) => [result, ...prev]);
      setQuizCompleted(true);

      const pass = result.passed;
      if (pass) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast('Congratulations! You passed the quiz.', 'success');
      } else {
        toast('Quiz completed. You did not meet the passing score.', 'info');
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to submit quiz', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setQuizCompleted(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <ErrorState
          title="Quiz Not Found"
          message="The requested quiz could not be loaded or is not assigned to you."
          action={
            <Button variant="primary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestionIdx];
  const answeredCount = Object.keys(selectedAnswers).length;
  const passingScore = quiz.passingScore || 70;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Lesson</span>
          </button>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {quiz.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Passing Score: <span className="font-bold text-indigo-600 dark:text-indigo-400">{passingScore}%</span> • {questions.length} Questions
          </p>
        </div>
      </div>

      {/* If Completed -> Score & Result Screen */}
      {quizCompleted && latestAttempt ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="inline-flex p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            {latestAttempt.passed ? (
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <XCircle className="w-10 h-10" />
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {latestAttempt.passed ? 'Assessment Passed!' : 'Assessment Not Passed'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {latestAttempt.passed
                ? 'Great job! You have demonstrated strong mastery of the concepts covered in this module.'
                : 'Keep practicing! Review the lesson material and try again to improve your score.'}
            </p>
          </div>

          {/* Score Circle / Box */}
          <div className="max-w-xs mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-around">
            <div>
              <span className="text-xs text-slate-500 font-medium">Your Score</span>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {Math.round(latestAttempt.scorePercentage || 0)}%
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-xs text-slate-500 font-medium">Passing Threshold</span>
              <p className="text-3xl font-black text-slate-700 dark:text-slate-300">
                {passingScore}%
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button variant="outline" size="sm" onClick={handleRetake}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              <span>Retake Quiz</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate(-1)}>
              <span>Continue Course</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-500">
          <HelpCircle className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold">No questions configured in this quiz yet.</p>
        </div>
      ) : (
        /* Active Quiz Stepper */
        <div className="space-y-6">
          {/* Progress Tracker */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>
                Question {currentQuestionIdx + 1} of {questions.length}
              </span>
              <span>{answeredCount} Answered</span>
            </div>
            <ProgressBar
              value={((currentQuestionIdx + 1) / questions.length) * 100}
              size="sm"
            />
          </div>

          {/* Question Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.questionText}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options?.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === opt.id;
                const optionLetter = String.fromCharCode(65 + oIdx);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm font-medium flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {optionLetter}
                    </span>
                    <span className="flex-1">{opt.optionText}</span>
                  </button>
                );
              })}
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((i) => Math.max(0, i - 1))}
              >
                Previous
              </Button>

              {currentQuestionIdx < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    setCurrentQuestionIdx((i) => Math.min(questions.length - 1, i + 1))
                  }
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  loading={submitting}
                  onClick={handleSubmitQuiz}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <span>Submit Quiz</span>
                  <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Previous Attempts History */}
      {attempts.length > 0 && (
        <div className="mt-12 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Past Attempts History
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {attempts.map((att, idx) => (
              <div key={att.id || idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Attempt #{attempts.length - idx}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {att.submittedAt ? new Date(att.submittedAt).toLocaleString() : 'Recent'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {Math.round(att.scorePercentage || 0)}%
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      att.passed
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {att.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentQuizPage;
