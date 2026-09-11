import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  Edit,
  Video,
  FileText,
  HelpCircle,
  CheckCircle2,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { instructorApi } from '../../api/instructorApi';
import { courseApi } from '../../api/courseApi';
import {
  CourseDto,
  CourseSectionDto,
  LessonDto,
  LessonType,
  CategoryDto,
  CourseLevel,
  CourseStatus,
} from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';

export const CourseEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const courseId = isEditing ? Number(id) : null;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [activeTab, setActiveTab] = useState<'basics' | 'curriculum' | 'publish'>('basics');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // Basics Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [level, setLevel] = useState<CourseLevel>(CourseLevel.BEGINNER);
  const [price, setPrice] = useState<number>(0);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [courseStatus, setCourseStatus] = useState<CourseStatus>(CourseStatus.DRAFT);

  // Curriculum State
  const [sections, setSections] = useState<CourseSectionDto[]>([]);

  // Section Modal State
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);

  // Lesson Modal State
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonDuration, setLessonDuration] = useState(15);
  const [lessonIsPreview, setLessonIsPreview] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);

  // Load Categories & Course Data
  useEffect(() => {
    courseApi.getCategories().then((res) => {
      const cats = res.content || [];
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    }).catch(() => {});

    if (isEditing && courseId) {
      Promise.all([
        instructorApi.getCourseById(courseId),
        courseApi.getSectionsByCourseId(courseId).catch(() => []),
      ])
        .then(([c, s]) => {
          setTitle(c.title || '');
          setSubtitle(c.subtitle || '');
          setDescription(c.description || '');
          setCategoryId(c.categoryId);
          setLevel(c.level || CourseLevel.BEGINNER);
          setPrice(Number(c.price || 0));
          setThumbnailUrl(c.thumbnailUrl || '');
          setCourseStatus(c.status || CourseStatus.DRAFT);
          setSections(s);
          setLoading(false);
        })
        .catch((err) => {
          toast(err.message || 'Failed to load course details', 'error');
          setLoading(false);
        });
    }
  }, [courseId, isEditing]);

  // Handle Save Course Basics
  const handleSaveBasics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast('Course title is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const generatedSlug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const payload: Partial<CourseDto> = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        slug: generatedSlug,
        description: description.trim(),
        categoryId: categoryId ? Number(categoryId) : undefined,
        level,
        price: Number(price) || 0,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
      };

      if (isEditing && courseId) {
        await instructorApi.updateCourse(courseId, payload);
        toast('Course details updated successfully!', 'success');
      } else {
        const created = await instructorApi.createCourse(payload);
        toast('Course draft created! Now build your curriculum.', 'success');
        navigate(`/instructor/courses/${created.id}/edit`);
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to save course', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Add Section
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !newSectionTitle.trim()) return;
    setAddingSection(true);
    try {
      const added = await instructorApi.addSection(courseId, {
        title: newSectionTitle.trim(),
        displayOrder: sections.length + 1,
        orderIndex: sections.length + 1,
      });
      setSections((prev) => [...prev, { ...added, lessons: [] }]);
      setNewSectionTitle('');
      setSectionModalOpen(false);
      toast('Section added successfully!', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to add section', 'error');
    } finally {
      setAddingSection(false);
    }
  };

  // Delete Section
  const handleDeleteSection = async (secId: number) => {
    try {
      await instructorApi.deleteSection(secId);
      setSections((prev) => prev.filter((s) => s.id !== secId));
      toast('Section deleted', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to delete section', 'error');
    }
  };

  // Open Lesson Modal
  const handleOpenAddLesson = (secId: number) => {
    setSelectedSectionId(secId);
    setLessonTitle('');
    setLessonVideoUrl('');
    setLessonContent('');
    setLessonDuration(15);
    setLessonIsPreview(false);
    setLessonModalOpen(true);
  };

  // Save Lesson
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectionId || !lessonTitle.trim()) return;
    setSavingLesson(true);
    try {
      const isVideo = Boolean(lessonVideoUrl.trim());
      const added = await instructorApi.addLesson(selectedSectionId, {
        title: lessonTitle.trim(),
        type: isVideo ? LessonType.VIDEO : LessonType.ARTICLE,
        videoUrl: lessonVideoUrl.trim() || undefined,
        description: lessonContent.trim() || undefined,
        content: lessonContent.trim() || undefined,
        durationSeconds: (Number(lessonDuration) || 15) * 60,
        durationMinutes: Number(lessonDuration) || 15,
        displayOrder: ((sections.find((s) => s.id === selectedSectionId)?.lessons?.length) || 0) + 1,
        preview: lessonIsPreview,
      });

      setSections((prev) =>
        prev.map((s) =>
          s.id === selectedSectionId
            ? { ...s, lessons: [...(s.lessons || []), added] }
            : s
        )
      );

      setLessonModalOpen(false);
      toast('Lesson added to section!', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to add lesson', 'error');
    } finally {
      setSavingLesson(false);
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (secId: number, lessonId: number) => {
    try {
      await instructorApi.deleteLesson(lessonId);
      setSections((prev) =>
        prev.map((s) =>
          s.id === secId
            ? { ...s, lessons: (s.lessons || []).filter((l) => l.id !== lessonId) }
            : s
        )
      );
      toast('Lesson deleted', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to delete lesson', 'error');
    }
  };

  // Direct Publish to Marketplace
  const handleDirectPublish = async () => {
    if (!courseId) return;
    const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
    if (totalLessons === 0) {
      toast('Please add at least one lesson in the Curriculum tab before publishing', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await instructorApi.publishCourse(courseId);
      setCourseStatus(updated.status);
      toast('Course published successfully! It is now live on the marketplace.', 'success');
      navigate('/instructor/courses');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to publish course', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Submit For Review
  const handleSubmitReview = async () => {
    if (!courseId) return;
    const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
    if (totalLessons === 0) {
      toast('Please add at least one lesson in the Curriculum tab before submitting', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await instructorApi.submitCourseForReview(courseId);
      setCourseStatus(updated.status);
      toast('Course submitted for administrative review!', 'success');
      navigate('/instructor/courses');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to submit course for review', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/instructor/courses"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {isEditing ? `Edit: ${title || 'Course'}` : 'Create New Course'}
            </h1>
            <p className="text-xs text-slate-500">Status: <span className="font-bold">{courseStatus}</span></p>
          </div>
        </div>

        {isEditing && (
          <Link to={`/courses/${courseId}`} target="_blank">
            <Button variant="outline" size="sm" className="text-xs">
              Live Preview
            </Button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('basics')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'basics'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          1. Course Basics
        </button>
        <button
          disabled={!isEditing}
          onClick={() => setActiveTab('curriculum')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-50 ${
            activeTab === 'curriculum'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          2. Curriculum & Lessons
        </button>
        <button
          disabled={!isEditing}
          onClick={() => setActiveTab('publish')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-50 ${
            activeTab === 'publish'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          3. Publish & Review
        </button>
      </div>

      {/* Tab 1: Course Basics */}
      {activeTab === 'basics' && (
        <form onSubmit={handleSaveBasics} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <Input
            label="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master Spring Boot & Cloud Architecture"
            required
          />

          <Input
            label="Short Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="A comprehensive hands-on guide for senior developers"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              value={categoryId || ''}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />

            <Select
              label="Difficulty Level"
              value={level}
              onChange={(e) => setLevel(e.target.value as CourseLevel)}
              options={[
                { value: CourseLevel.BEGINNER, label: 'Beginner' },
                { value: CourseLevel.INTERMEDIATE, label: 'Intermediate' },
                { value: CourseLevel.ADVANCED, label: 'Advanced' },
              ]}
            />

            <Input
              label="Price (USD)"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="0.00 for Free"
            />
          </div>

          <Input
            label="Thumbnail Image URL"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Description
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe syllabus, prerequisites, milestones, and target audience..."
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
              className="font-bold text-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              <span>{isEditing ? 'Save Changes' : 'Create & Proceed'}</span>
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: Curriculum Builder */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Course Curriculum Outline
              </h2>
              <p className="text-xs text-slate-500">
                Organize your course into chronological sections and lessons
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSectionModalOpen(true)}
              className="text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Section</span>
            </Button>
          </div>

          {sections.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-400 space-y-3">
              <Layers className="w-10 h-10 mx-auto opacity-50" />
              <p className="text-sm font-medium">No curriculum sections created yet.</p>
              <Button variant="outline" size="sm" onClick={() => setSectionModalOpen(true)}>
                Add First Section
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((sec, sIdx) => (
                <div
                  key={sec.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                        {sIdx + 1}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {sec.title}
                      </h3>
                      <span className="text-xs text-slate-400">
                        ({sec.lessons?.length || 0} lessons)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAddLesson(sec.id)}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        <span>Add Lesson</span>
                      </Button>
                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons list inside section */}
                  <div className="space-y-2">
                    {sec.lessons?.map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-slate-400 font-mono">
                            {sIdx + 1}.{lIdx + 1}
                          </span>
                          <Video className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {lesson.title}
                          </span>
                          <span className="text-slate-400">
                            ({lesson.durationMinutes || 10}m)
                          </span>
                          {lesson.preview && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-[10px] font-bold">
                              Preview
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link to={`/instructor/quizzes/${sec.id}/edit?lessonId=${lesson.id}`}>
                            <button
                              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                              title="Configure Quiz Questions"
                            >
                              <HelpCircle className="w-3 h-3" />
                              <span>Quiz</span>
                            </button>
                          </Link>

                          <button
                            onClick={() => handleDeleteLesson(sec.id, lesson.id)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Publish & Review */}
      {activeTab === 'publish' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Publish or Submit Course
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              You can publish your course directly to make it live for students immediately, or submit it for administrative review.
            </p>
          </div>

          {sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) === 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
              <span className="text-base">⚠️</span>
              <div>
                <p className="font-bold">At least 1 lesson required to publish</p>
                <p className="mt-0.5 opacity-90">Please go to the <strong>Curriculum</strong> tab, add a section, and click <strong>"+ Lesson"</strong> before submitting or publishing.</p>
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pre-Launch Checklist:
            </h3>
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${title ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>Course title, description, and pricing set</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${sections.length > 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>At least one curriculum section added ({sections.length} sections)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) > 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>Lessons uploaded ({sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)} lessons)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="md"
              loading={saving}
              disabled={sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) === 0}
              onClick={handleSubmitReview}
              className="font-medium text-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>Submit for Admin Review</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              loading={saving}
              disabled={sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) === 0}
              onClick={handleDirectPublish}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              <span>Publish Now to Marketplace</span>
            </Button>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      <Modal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        title="Add Curriculum Section"
        size="sm"
      >
        <form onSubmit={handleAddSection} className="space-y-4">
          <Input
            label="Section Title"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="e.g. Chapter 1: Architectural Foundations"
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setSectionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={addingSection}>
              Save Section
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal
        isOpen={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        title="Add New Lesson"
        size="md"
      >
        <form onSubmit={handleSaveLesson} className="space-y-4">
          <Input
            label="Lesson Title"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="e.g. Setting up Docker & PostgreSQL"
            required
          />

          <Input
            label="Video URL or Embed Link (Optional)"
            value={lessonVideoUrl}
            onChange={(e) => setLessonVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or direct mp4"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Estimated Duration (Minutes)"
              type="number"
              min="1"
              value={lessonDuration}
              onChange={(e) => setLessonDuration(Number(e.target.value))}
              required
            />
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lessonIsPreview}
                  onChange={(e) => setLessonIsPreview(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Allow Free Preview</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Lesson Text Content / Instructions
            </label>
            <textarea
              rows={4}
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              placeholder="Provide accompanying code samples, links, or notes..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setLessonModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={savingLesson}>
              Save Lesson
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default CourseEditorPage;
