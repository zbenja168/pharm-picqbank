import { TopicsIndex, Category } from '../types/topic';
import { CategoryAccordion } from '../components/TopicFilter/CategoryAccordion';
import { ProgressData } from '../types/progress';
import { getOverallStats } from '../utils/stats';
import { BrandCard } from '../components/Brand';
import type { ReviewMode } from './ReviewPage';

interface Props {
  topics: TopicsIndex;
  selectedTopicIds: Set<string>;
  selectedCount: number;
  progress: ProgressData;
  onToggleTopic: (topicId: string) => void;
  onToggleCategory: (category: Category) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onStartQuiz: () => void;
  onGoToDashboard: () => void;
  onGoToReview: (mode?: ReviewMode) => void;
  onClearProgress: () => void;
}

export function HomePage({
  topics, selectedTopicIds, selectedCount, progress,
  onToggleTopic, onToggleCategory, onSelectAll, onClearAll,
  onStartQuiz, onGoToDashboard, onGoToReview, onClearProgress,
}: Props) {
  const stats = getOverallStats(progress);
  const missedCount = Object.values(progress.answers).filter((a) => !a.isCorrect).length;
  const bookmarkCount = progress.bookmarkedQuestions.length;

  return (
    <div className="min-h-screen bg-slate-900">
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* Progress shortcuts: the header above carries the title and the
            course's sibling tools, so these sit at the top of the content. */}
        {(stats.total > 0 || missedCount > 0 || bookmarkCount > 0) && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            {stats.total > 0 && (
              <button
                onClick={onGoToDashboard}
                className="px-4 py-2 min-h-10 text-sm rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Dashboard ({stats.percentage}%)
              </button>
            )}
            {missedCount > 0 && (
              <button
                onClick={() => onGoToReview('incorrect')}
                className="px-4 py-2 min-h-10 text-sm rounded-lg border border-amber-600 bg-amber-500/10 text-amber-400 font-medium hover:bg-amber-500/20 transition-colors"
                title="Redo the questions you got wrong"
              >
                Missed ({missedCount})
              </button>
            )}
            {bookmarkCount > 0 && (
              <button
                onClick={() => onGoToReview()}
                className="px-4 py-2 min-h-10 text-sm rounded-lg border border-amber-700 text-amber-400 hover:bg-amber-900/30 transition-colors"
              >
                Bookmarked ({bookmarkCount})
              </button>
            )}
          </div>
        )}

        {/* Stats summary */}
        {stats.total > 0 && (<>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
              <div className="text-2xl font-bold text-slate-200">{stats.total}</div>
              <div className="text-sm text-slate-400">Answered</div>
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.percentage}%</div>
              <div className="text-sm text-slate-400">Correct</div>
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
              <div className="text-2xl font-bold text-slate-200">{topics.totalQuestions - stats.total}</div>
              <div className="text-sm text-slate-400">Remaining</div>
            </div>
          </div>
          <div className="text-right">
            <button
              onClick={() => {
                if (window.confirm('Clear all progress? This cannot be undone.')) {
                  onClearProgress();
                }
              }}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Reset Progress
            </button>
          </div>
        </>)}

        {/* Filter controls */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-slate-200">Select Topics</h2>
          <div className="flex items-center gap-3">
            <button onClick={onSelectAll} className="text-sm text-blue-400 hover:text-blue-300">Select All</button>
            <span className="text-slate-600">|</span>
            <button onClick={onClearAll} className="text-sm text-blue-400 hover:text-blue-300">Clear All</button>
          </div>
        </div>

        {/* Category accordions, grouped by teaching week so a student revising
            one week of the block can find its sessions together. Falls back to
            a flat list if the data has no week on it. */}
        <div className="mb-8">
          {topics.categories.map((cat, i) => {
            const prev = i > 0 ? topics.categories[i - 1] : undefined;
            const startsWeek = cat.week !== undefined && cat.week !== prev?.week;
            const inWeek = topics.categories.filter(c => c.week === cat.week);
            const topicCount = inWeek.reduce((n, c) => n + c.topics.length, 0);
            const questionCount = inWeek.reduce(
              (n, c) => n + c.topics.reduce((m, t) => m + t.questionCount, 0), 0);
            return (
              <div key={cat.id}>
                {startsWeek && (
                  <div className={`flex items-baseline gap-3 flex-wrap rounded-lg border border-blue-900/60 bg-blue-950/30 px-4 py-3 ${i === 0 ? 'mb-3' : 'mt-6 mb-3'}`}>
                    <span className="text-base font-bold text-blue-300 at-wrap">{cat.weekName}</span>
                    {cat.weekSubtitle && (
                      <span className="text-sm text-slate-300">{cat.weekSubtitle}</span>
                    )}
                    <span className="ml-auto text-xs text-slate-500 whitespace-nowrap">
                      {topicCount} topics &middot; {questionCount} questions
                    </span>
                  </div>
                )}
                <div className="mb-2">
                  <CategoryAccordion
                    category={cat}
                    selectedTopicIds={selectedTopicIds}
                    onToggleTopic={onToggleTopic}
                    onToggleCategory={onToggleCategory}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Start button */}
        <div className="at-sticky-bottom sticky bottom-0 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pt-4 pb-6">
          <button
            onClick={onStartQuiz}
            disabled={selectedCount === 0}
            className="w-full py-4 rounded-xl at-btn-primary font-semibold text-lg transition-colors shadow-lg"
          >
            {selectedCount > 0
              ? `Start Quiz (${selectedCount} questions)`
              : 'Select topics to begin'}
          </button>
        </div>

        <BrandCard kind="qbank" />
      </main>
    </div>
  );
}
