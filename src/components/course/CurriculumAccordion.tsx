import React, { useState } from 'react';
import { ChevronDown, PlayCircle, FileText, HelpCircle, CheckCircle2, Lock } from 'lucide-react';
import { CourseSectionDto, LessonDto, LessonType } from '../../types';
import { Badge } from '../ui/Badge';

interface CurriculumAccordionProps {
  sections: CourseSectionDto[];
  activeLessonId?: number;
  onSelectLesson?: (lesson: LessonDto) => void;
  isEnrolled?: boolean;
}

export const CurriculumAccordion: React.FC<CurriculumAccordionProps> = ({
  sections,
  activeLessonId,
  onSelectLesson,
  isEnrolled = false,
}) => {
  // Expand first section by default
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case 'VIDEO':
        return <PlayCircle className="w-4 h-4 text-indigo-500 shrink-0" />;
      case 'ARTICLE':
      case 'PDF':
        return <FileText className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'QUIZ':
        return <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
      default:
        return <PlayCircle className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '10m';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!sections || sections.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 italic py-4">
        Curriculum details are being finalized by the instructor.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section, sIndex) => {
        const isExpanded = !!expandedSections[sIndex];
        const lessons = section.lessons || [];

        return (
          <div
            key={section.id}
            className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/60 transition-all"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(sIndex)}
              className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  Part {sIndex + 1}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {section.title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Lessons List */}
            {isExpanded && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {lessons.length === 0 ? (
                  <div className="px-5 py-3 text-xs text-slate-400 italic">No lessons listed yet</div>
                ) : (
                  lessons.map((lesson) => {
                    const isActive = activeLessonId === lesson.id;
                    const canAccess = isEnrolled || lesson.preview;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => canAccess && onSelectLesson?.(lesson)}
                        className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                          isActive
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40'
                            : canAccess
                            ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer'
                            : 'opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-4">
                          {lesson.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            getLessonIcon(lesson.type || 'VIDEO')
                          )}
                          <span
                            className={`text-sm truncate ${
                              isActive
                                ? 'font-bold text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-700 dark:text-slate-300 font-medium'
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          {lesson.preview && !isEnrolled && (
                            <Badge variant="primary" size="sm">
                              Preview
                            </Badge>
                          )}
                          {!canAccess && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                            {formatDuration(lesson.durationSeconds)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
