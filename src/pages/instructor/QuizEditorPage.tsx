import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Check,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { instructorApi } from '../../api/instructorApi';
import { QuestionDto, QuestionOptionDto, QuizDto } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';

export const QuizEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Course or Section ID
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lessonId') ? Number(searchParams.get('lessonId')) : undefined;

  const navigate = useNavigate();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<QuizDto | null>(null);
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Add Option Modal
  const [addOptionOpen, setAddOptionOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [newOptionText, setNewOptionText] = useState('');
  const [newOptionIsCorrect, setNewOptionIsCorrect] = useState(false);
  const [savingOption, setSavingOption] = useState(false);

  // Initialize or fetch quiz
  useEffect(() => {
    let isMounted = true;
    const courseId = Number(id) || 1;

    // Create or retrieve quiz
    instructorApi
      .createQuiz(courseId, lessonId, {
        title: 'Module Mastery Assessment',
        passingScore: 70,
      })
      .then((q) => {
        if (!isMounted) return;
        setQuiz(q);
        setQuestions(q.questions || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoading(false);
        toast(err.message || 'Quiz loaded', 'info');
      });

    return () => {
      isMounted = false;
    };
  }, [id, lessonId]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz || !newQuestionText.trim()) return;
    setSavingQuestion(true);
    try {
      const added = await instructorApi.addQuestion(quiz.id, {
        questionText: newQuestionText.trim(),
        orderIndex: questions.length + 1,
      });
      setQuestions((prev) => [...prev, { ...added, options: [] }]);
      setNewQuestionText('');
      setAddQuestionOpen(false);
      toast('Question added!', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to add question', 'error');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleOpenAddOption = (qId: number) => {
    setSelectedQuestionId(qId);
    setNewOptionText('');
    setNewOptionIsCorrect(false);
    setAddOptionOpen(true);
  };

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestionId || !newOptionText.trim()) return;
    setSavingOption(true);
    try {
      const added = await instructorApi.addOption(selectedQuestionId, {
        optionText: newOptionText.trim(),
        correct: newOptionIsCorrect,
      });

      // Update local state
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === selectedQuestionId
            ? { ...q, options: [...(q.options || []), added] }
            : q
        )
      );

      // If marked correct, call backend endpoint
      if (newOptionIsCorrect && added.id) {
        await instructorApi.setCorrectOption(selectedQuestionId, added.id);
      }

      setAddOptionOpen(false);
      toast('Option added!', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to add option', 'error');
    } finally {
      setSavingOption(false);
    }
  };

  const handleMarkCorrect = async (questionId: number, optionId: number) => {
    try {
      await instructorApi.setCorrectOption(questionId, optionId);
      // Update local state
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                options: (q.options || []).map((o) => ({
                  ...o,
                  correct: o.id === optionId,
                })),
              }
            : q
        )
      );
      toast('Correct answer designated!', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to set correct option', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Quiz & Assessment Builder
            </h1>
            <p className="text-xs text-slate-500">
              Configure multiple choice questions and specify correct answers
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setAddQuestionOpen(true)}
          className="text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Add Question</span>
        </Button>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-400 space-y-3">
          <HelpCircle className="w-10 h-10 mx-auto opacity-40" />
          <p className="text-sm font-medium">No questions created yet for this quiz.</p>
          <Button variant="outline" size="sm" onClick={() => setAddQuestionOpen(true)}>
            Add First Question
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {q.questionText}
                  </h3>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenAddOption(q.id)}
                  className="text-xs shrink-0"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <span>Add Option</span>
                </Button>
              </div>

              {/* Options */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {(q.options || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No options added yet.</p>
                ) : (
                  (q.options || []).map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                        opt.correct
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {opt.correct && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        <span>{opt.optionText}</span>
                      </div>

                      {!opt.correct && (
                        <button
                          type="button"
                          onClick={() => handleMarkCorrect(q.id, opt.id)}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Mark as Correct
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Question Modal */}
      <Modal
        isOpen={addQuestionOpen}
        onClose={() => setAddQuestionOpen(false)}
        title="Add Question"
        size="sm"
      >
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <Input
            label="Question Text"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="e.g. Which annotation designates a Spring bean?"
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddQuestionOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={savingQuestion}>
              Add Question
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Option Modal */}
      <Modal
        isOpen={addOptionOpen}
        onClose={() => setAddOptionOpen(false)}
        title="Add Option Choice"
        size="sm"
      >
        <form onSubmit={handleAddOption} className="space-y-4">
          <Input
            label="Option Text"
            value={newOptionText}
            onChange={(e) => setNewOptionText(e.target.value)}
            placeholder="e.g. @Component"
            required
          />

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={newOptionIsCorrect}
              onChange={(e) => setNewOptionIsCorrect(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Set as Correct Answer</span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddOptionOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={savingOption}>
              Add Option
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default QuizEditorPage;
