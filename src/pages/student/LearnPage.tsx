import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  PlayCircle,
  FileText,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Award,
  Download,
  CheckCircle2,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { studentApi } from '../../api/studentApi';
import { CourseLearnDto, LessonDto, CourseSectionDto, CourseProgressDto } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/common/States';

export const LearnPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const id = Number(courseId);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedLessonId = searchParams.get('lesson') ? Number(searchParams.get('lesson')) : null;

  const navigate = useNavigate();
  const { toast } = useToast();

  const [learnData, setLearnData] = useState<CourseLearnDto | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonDto | null>(null);
  const [progress, setProgress] = useState<CourseProgressDto | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(new Set());

  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes'>('overview');

  // Load Course Learn Data and Progress
  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    Promise.all([
      studentApi.getCourseLearnContent(id),
      studentApi.getCourseProgress(id).catch(() => null),
    ])
      .then(([content, prog]) => {
        if (!isMounted) return;
        setLearnData(content);
        setProgress(prog);

        // Populate completed lessons set from completedLessonIds if available
        if (prog?.completedLessonIds) {
          setCompletedLessonIds(new Set(prog.completedLessonIds));
        }

        // Find initial lesson
        const allLessons = content.sections?.flatMap((s) => s.lessons || []) || [];
        if (allLessons.length > 0) {
          const selected = requestedLessonId
            ? allLessons.find((l) => l.id === requestedLessonId) || allLessons[0]
            : allLessons[0];
          setCurrentLesson(selected);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoading(false);
        toast(err.message || 'Failed to load classroom content.', 'error');
      });

    return () => {
      isMounted = false;
    };
  }, [id, requestedLessonId]);

  // Handle Mark Lesson Complete
  const handleCompleteLesson = async () => {
    if (!currentLesson) return;
    setCompleting(true);
    try {
      const updatedProgress = await studentApi.completeLesson(currentLesson.id);
      setProgress(updatedProgress);
      setCompletedLessonIds((prev) => new Set([...prev, currentLesson.id]));
      toast('Lesson marked as completed!', 'success');

      // Auto advance to next lesson if available
      handleNextLesson();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to mark lesson complete', 'error');
    } finally {
      setCompleting(false);
    }
  };

  // Flatten lessons to navigate prev/next
  const allLessons = learnData?.sections?.flatMap((s) => s.lessons || []) || [];
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleSelectLesson = (lesson: LessonDto) => {
    setCurrentLesson(lesson);
    setSearchParams({ lesson: String(lesson.id) });
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      handleSelectLesson(nextLesson);
    }
  };

  const handlePrevLesson = () => {
    if (prevLesson) {
      handleSelectLesson(prevLesson);
    }
  };

  const isCurrentCompleted = currentLesson ? completedLessonIds.has(currentLesson.id) : false;
  const progressPercent = Math.round(progress?.progressPercentage || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col p-6 space-y-6">
        <Skeleton className="h-12 w-1/3 bg-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          <Skeleton className="lg:col-span-3 h-[500px] bg-slate-800 rounded-2xl" />
          <Skeleton className="h-[500px] bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!learnData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <ErrorState
          title="Classroom Content Unavailable"
          message="Could not load the content for this course. Please verify your enrollment."
          action={
            <Link to="/student/my-courses">
              <Button variant="primary">Return to My Courses</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Learning Bar */}
      <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/student/my-courses"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Back to My Courses"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate max-w-md">
              {learnData.courseTitle}
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              {currentLesson ? currentLesson.title : 'Select a lesson'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Overall Progress */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-32">
              <ProgressBar value={progressPercent} size="sm" />
            </div>
            <span className="text-xs font-bold text-indigo-400 whitespace-nowrap">
              {progressPercent}% Done
            </span>
          </div>

          {/* Certificate Badge if 100% */}
          {progressPercent >= 100 && (
            <Link to="/student/certificates">
              <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                <Award className="w-3.5 h-3.5 mr-1" />
                <span>Certificate</span>
              </Button>
            </Link>
          )}

          {/* Toggle Sidebar (Mobile & Desktop) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Curriculum Sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Classroom Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Lesson Stage */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {/* Player Canvas */}
          <div className="w-full bg-black flex items-center justify-center relative aspect-video max-h-[65vh]">
            {currentLesson?.type === 'PDF' || currentLesson?.documentUrl ? (
              /* PDF Document Viewer */
              <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-lg">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2.5 py-0.5 rounded-full">
                    PDF Document Guide
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">
                    {currentLesson.title}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mt-1">
                    Download or review the accompanying handbook, architectural schematics, and study slides.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={currentLesson.documentUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-md shadow-rose-600/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>Open & Download PDF</span>
                  </a>
                </div>
              </div>
            ) : currentLesson?.type === 'ARTICLE' ? (
              /* Rich Article Reader Mode */
              <div className="w-full h-full bg-slate-900/90 flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-0.5 rounded-full">
                    Interactive Reading Article
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2">
                    {currentLesson.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Estimated reading time: {currentLesson.durationMinutes || 10} minutes
                  </p>
                </div>
                <p className="text-xs text-slate-300 max-w-md leading-relaxed bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                  {currentLesson.description ||
                    'Comprehensive article walkthrough with technical explanations, syntax examples, and real-world system design notes.'}
                </p>
              </div>
            ) : currentLesson?.videoUrl ? (
              currentLesson.videoUrl.includes('youtube.com') || currentLesson.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={
                    currentLesson.videoUrl.includes('watch?v=')
                      ? currentLesson.videoUrl.replace('watch?v=', 'embed/')
                      : currentLesson.videoUrl
                  }
                  title={currentLesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={currentLesson.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  poster={learnData.thumbnailUrl}
                />
              )
            ) : (
              /* Fallback rich visual player placeholder */
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-lg">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <PlayCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {currentLesson?.title || 'Interactive Lesson Module'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    This lesson is delivered in interactive text and code walkthrough format. Read through the guided notes and practical steps below.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Player Control Bar (Prev, Complete, Next) */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!prevLesson}
                onClick={handlePrevLesson}
                className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Previous</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!nextLesson}
                onClick={handleNextLesson}
                className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/* If Quiz attached */}
              {currentLesson?.quizId && (
                <Link to={`/student/quizzes/${currentLesson.quizId}`}>
                  <Button variant="outline" size="sm" className="bg-indigo-950/60 border-indigo-700 text-indigo-300 text-xs">
                    <HelpCircle className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                    <span>Take Lesson Quiz</span>
                  </Button>
                </Link>
              )}

              {/* Complete Lesson Button */}
              <Button
                variant={isCurrentCompleted ? 'outline' : 'primary'}
                size="sm"
                loading={completing}
                onClick={handleCompleteLesson}
                className={`text-xs font-bold ${isCurrentCompleted
                    ? 'border-emerald-600/40 text-emerald-400 bg-emerald-950/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>{isCurrentCompleted ? 'Completed' : 'Mark as Complete'}</span>
              </Button>
            </div>
          </div>

          {/* Lesson Details & Notes Tabs */}
          <div className="p-6 sm:p-8 max-w-4xl space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`text-sm font-bold pb-1 transition-colors ${activeTab === 'overview'
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                Lesson Overview
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`text-sm font-bold pb-1 transition-colors ${activeTab === 'notes'
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                Resources & Code Snippets
              </button>
            </div>

            {activeTab === 'overview' ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">
                  {currentLesson?.title}
                </h2>
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentLesson?.content ||
                    'In this lesson, follow along with the concepts presented in the video. Take notes, experiment with the sample code, and test your comprehension by completing any associated quiz modules.'}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">Lesson Resources</h3>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-400">
                  <p className="font-semibold text-slate-200">Recommended Next Step:</p>
                  <p>Implement the architectural pattern demonstrated in this module inside your development environment.</p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Collapsible Curriculum Sidebar */}
        <aside
          className={`w-80 lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col transition-all duration-200 ease-in-out shrink-0 ${sidebarOpen ? 'block' : 'hidden'
            }`}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Course Content</span>
            </h3>
            <span className="text-xs text-slate-400">
              {allLessons.length} lessons
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
            {learnData.sections?.map((section, sIdx) => (
              <div key={section.id} className="py-2">
                <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Section {sIdx + 1}: {section.title}
                </div>
                <div className="space-y-0.5">
                  {section.lessons?.map((lesson) => {
                    const isSelected = currentLesson?.id === lesson.id;
                    const isCompleted = completedLessonIds.has(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson)}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${isSelected
                            ? 'bg-indigo-600/20 text-white border-l-4 border-indigo-500'
                            : 'text-slate-300 hover:bg-slate-800/60'
                          }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <PlayCircle className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isSelected ? 'font-bold text-white' : ''}`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span>{lesson.durationMinutes || 10} mins</span>
                            {lesson.quizId && (
                              <span className="text-indigo-400 font-semibold">• Quiz</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
export default LearnPage;
