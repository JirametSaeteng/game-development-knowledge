import React, { useState, useMemo } from 'react';
import { TOPICS } from './data/topics';
import type { Topic, Category, Difficulty } from './types/topic';
import { Navbar } from './components/Navbar';
import { TopicCard } from './components/TopicCard';
import { TopicDetail } from './components/TopicDetail';
import { PerformanceMatrix } from './components/PerformanceMatrix';
import { TopicFilters } from './components/TopicFilters';
import type { SortMode } from './components/TopicFilters';
import { sound } from './utils/audio';
import {
  Gamepad2,
  Sparkles,
} from 'lucide-react';

export const App: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedEngine, setSelectedEngine] = useState<'all' | 'unity' | 'unreal' | 'pure'>('all');
  const [onlyWithLab, setOnlyWithLab] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick(900);
  };

  // Filter and Sort topics
  const filteredAndSortedTopics = useMemo(() => {
    const filtered = TOPICS.filter((t) => {
      const matchesCategory =
        selectedCategory === 'all' || t.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === 'all' || t.difficulty === selectedDifficulty;
      const matchesEngine =
        selectedEngine === 'all' ||
        (selectedEngine === 'unity' && !!t.challenges?.unity) ||
        (selectedEngine === 'unreal' && !!t.challenges?.unreal) ||
        (selectedEngine === 'pure' && !!t.challenges?.pureLogic);
      const matchesLab = !onlyWithLab || t.hasInteractiveLab;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        t.title.toLowerCase().includes(query) ||
        t.titleEn.toLowerCase().includes(query) ||
        t.summary.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.difficulty.toLowerCase().includes(query) ||
        t.simpleExplanation.analogy.toLowerCase().includes(query) ||
        t.deepExplanation.architecturalDetail.toLowerCase().includes(query);

      return (
        matchesCategory &&
        matchesDifficulty &&
        matchesEngine &&
        matchesLab &&
        matchesSearch
      );
    });

    const result = [...filtered];

    switch (sortMode) {
      case 'difficulty-asc': {
        const order: Record<Difficulty, number> = {
          Beginner: 1,
          Intermediate: 2,
          Advanced: 3,
        };
        return result.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
      }
      case 'difficulty-desc': {
        const order: Record<Difficulty, number> = {
          Beginner: 1,
          Intermediate: 2,
          Advanced: 3,
        };
        return result.sort((a, b) => order[b.difficulty] - order[a.difficulty]);
      }
      case 'title-asc':
        return result.sort((a, b) => a.title.localeCompare(b.title, 'th'));
      case 'title-desc':
        return result.sort((a, b) => b.title.localeCompare(a.title, 'th'));
      case 'category':
        return result.sort((a, b) => a.category.localeCompare(b.category));
      case 'default':
      default:
        return result; // Original pedagogical order (1 to 14)
    }
  }, [
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedEngine,
    onlyWithLab,
    sortMode,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedEngine('all');
    setOnlyWithLab(false);
    setSortMode('default');
    sound.playClick(400);
  };

  const handleSelectTopicById = (id: string) => {
    const found = TOPICS.find((t) => t.id === id);
    if (found) {
      setSelectedTopic(found);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategorySelect={(cat) => {
          setSelectedCategory(cat);
          if (selectedTopic) setSelectedTopic(null);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onSelectTopicById={handleSelectTopicById}
        onOpenMatrix={() => setShowMatrixModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {selectedTopic ? (
          <TopicDetail
            topic={selectedTopic}
            onBack={() => {
              setSelectedTopic(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-950 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>แพลตฟอร์มสื่อการสอน Game Development Architecture</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  เรียนรู้สถาปัตยกรรมเกม{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
                    ตั้งแต่เข้าใจง่าย สู่ระดับฮาร์ดแวร์
                  </span>
                </h1>

                <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                  รวบรวมเทคนิคสำคัญใน Game Development: อธิบายด้วยภาพเปรียบเทียบในชีวิตประจำวัน,
                  เจาะลึกระดับ CPU/GPU Cache & Engine Internals (Unity, Unreal, Godot), พร้อมตัวอย่างโค้ดจริง
                  และ <strong>Interactive Benchmark Simulations</strong> รันสดบนเบราว์เซอร์
                </p>

                {/* Features Highlights Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xs text-slate-400 font-medium">3 ระดับการอธิบาย</div>
                    <div className="text-sm font-bold text-white mt-0.5">แบบง่าย / เชิงลึก / โค้ด</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xs text-slate-400 font-medium">Interactive Labs</div>
                    <div className="text-sm font-bold text-cyan-400 mt-0.5">14 ห้องทดลองสด 60 FPS</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xs text-slate-400 font-medium">โจทย์ฝึกเติม Logic</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">42 โจทย์ (Pure, Unity, Unreal)</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xs text-slate-400 font-medium">Game Engines</div>
                    <div className="text-sm font-bold text-indigo-400 mt-0.5">Unity, Unreal, Godot</div>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW: Comprehensive Search, Tag Filters & Sorting Toolbar */}
            <TopicFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              selectedDifficulty={selectedDifficulty}
              onDifficultySelect={setSelectedDifficulty}
              selectedEngine={selectedEngine}
              onEngineSelect={setSelectedEngine}
              onlyWithLab={onlyWithLab}
              onToggleOnlyWithLab={() => setOnlyWithLab(!onlyWithLab)}
              sortMode={sortMode}
              onSortModeChange={setSortMode}
              totalCount={TOPICS.length}
              filteredCount={filteredAndSortedTopics.length}
              onResetFilters={handleResetFilters}
              onOpenMatrix={() => setShowMatrixModal(true)}
            />

            {/* Topics Catalog Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">หัวข้อการเรียนรู้ทั้งหมด</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    คลิกเลือกหัวข้อเพื่อเริ่มเรียนรู้ เจาะลึกสถาปัตยกรรม ทดลองรัน Benchmark Lab และฝึกเติมโค้ด Logic
                  </p>
                </div>
              </div>

              {filteredAndSortedTopics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredAndSortedTopics.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      onSelect={(t) => {
                        setSelectedTopic(t);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
                  <p className="text-slate-400 text-sm">
                    ไม่พบบทเรียนที่ตรงกับเงื่อนไขการค้นหาและตัวกรองที่เลือก
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
                  >
                    ล้างตัวกรองและการค้นหาทั้งหมด
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Performance Matrix Modal */}
      {showMatrixModal && (
        <PerformanceMatrix
          onClose={() => setShowMatrixModal(false)}
          onSelectTopic={(t) => {
            setSelectedTopic(t);
            setShowMatrixModal(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-400">GameDev Engine Lab</span>
            <span>— สื่อการสอนเพื่อพัฒนาศักยภาพนักพัฒนาเกม</span>
          </div>
          <div>
            Built with React, TypeScript, Tailwind CSS & Web Audio API
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
