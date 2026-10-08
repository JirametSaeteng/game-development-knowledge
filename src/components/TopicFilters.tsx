import React, { useState, useRef, useEffect } from 'react';
import type { Category, Difficulty } from '../types/topic';
import {
  Search,
  X,
  ArrowUpDown,
  Filter,
  Check,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Beaker,
  Gamepad2,
} from 'lucide-react';
import { sound } from '../utils/audio';

export type SortMode =
  | 'default'
  | 'difficulty-asc'
  | 'difficulty-desc'
  | 'title-asc'
  | 'title-desc'
  | 'category';

interface TopicFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: Category | 'all';
  onCategorySelect: (cat: Category | 'all') => void;
  selectedDifficulty: Difficulty | 'all';
  onDifficultySelect: (diff: Difficulty | 'all') => void;
  selectedEngine: 'all' | 'unity' | 'unreal' | 'pure';
  onEngineSelect: (eng: 'all' | 'unity' | 'unreal' | 'pure') => void;
  onlyWithLab: boolean;
  onToggleOnlyWithLab: () => void;
  sortMode: SortMode;
  onSortModeChange: (sort: SortMode) => void;
  totalCount: number;
  filteredCount: number;
  onResetFilters: () => void;
  onOpenMatrix: () => void;
}

export const TopicFilters: React.FC<TopicFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  selectedDifficulty,
  onDifficultySelect,
  selectedEngine,
  onEngineSelect,
  onlyWithLab,
  onToggleOnlyWithLab,
  sortMode,
  onSortModeChange,
  totalCount,
  filteredCount,
  onResetFilters,
  onOpenMatrix,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement | null>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions: Array<{ id: SortMode; label: string; desc: string }> = [
    {
      id: 'default',
      label: 'ลำดับแนะนำ (Curriculum Order)',
      desc: 'เรียงตามลำดับปูพื้นฐานสู่ระบบขั้นสูง (1 ➔ 14)',
    },
    {
      id: 'difficulty-asc',
      label: 'ความยาก: ง่าย ➔ ยาก',
      desc: 'Beginner ➔ Intermediate ➔ Advanced',
    },
    {
      id: 'difficulty-desc',
      label: 'ความยาก: ยาก ➔ ง่าย',
      desc: 'Advanced ➔ Intermediate ➔ Beginner',
    },
    {
      id: 'title-asc',
      label: 'ชื่อหัวข้อ: ก ➔ ฮ (A ➔ Z)',
      desc: 'เรียงตามตัวอักษรของชื่อภาษาไทย',
    },
    {
      id: 'title-desc',
      label: 'ชื่อหัวข้อ: ฮ ➔ ก (Z ➔ A)',
      desc: 'เรียงย้อนกลับตามตัวอักษร',
    },
    {
      id: 'category',
      label: 'จัดกลุ่มตามหมวดหมู่ (Category)',
      desc: 'จัดเรียงแยกตามกลุ่มประเภทงาน',
    },
  ];

  const categories: Array<{ id: Category | 'all'; label: string; icon: string }> = [
    { id: 'all', label: 'ทุกหมวดหมู่', icon: '✨' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'physics', label: 'Physics', icon: '🪐' },
    { id: 'rendering', label: 'Rendering', icon: '🎨' },
    { id: 'ai', label: 'Game AI', icon: '🤖' },
    { id: 'architecture', label: 'Architecture', icon: '🏛️' },
    { id: 'networking', label: 'Netcode', icon: '🌐' },
    { id: 'audio', label: 'Audio', icon: '🔊' },
  ];

  const difficulties: Array<{ id: Difficulty | 'all'; label: string; color: string }> = [
    { id: 'all', label: 'ทุกระดับ', color: 'border-slate-800' },
    { id: 'Beginner', label: 'Beginner (เริ่มต้น)', color: 'text-emerald-400 border-emerald-500/30' },
    { id: 'Intermediate', label: 'Intermediate (ระดับกลาง)', color: 'text-amber-400 border-amber-500/30' },
    { id: 'Advanced', label: 'Advanced (ระดับสูง)', color: 'text-rose-400 border-rose-500/30' },
  ];

  const engines: Array<{ id: 'all' | 'unity' | 'unreal' | 'pure'; label: string }> = [
    { id: 'all', label: 'ทุกโจทย์' },
    { id: 'unity', label: 'Unity C#' },
    { id: 'unreal', label: 'Unreal C++' },
    { id: 'pure', label: 'Pure Logic' },
  ];

  const isAnyFilterActive =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedEngine !== 'all' ||
    onlyWithLab;

  const currentSortLabel = sortOptions.find((s) => s.id === sortMode)?.label || 'จัดเรียง';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl backdrop-blur-md">
      {/* Top Row: Search Input + Sorting Dropdown + Benchmark Matrix Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาบทเรียน เช่น Object Pool, Frustum, Cache, Physics, C++, Unity, Unreal..."
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                sound.playClick(400);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls: Sort + Matrix Button */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {/* Sorting Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                sound.playClick(600);
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-all shadow-sm"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline text-slate-400">จัดเรียง:</span>
              <span className="font-bold text-cyan-300 truncate max-w-[150px]">{currentSortLabel}</span>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 border-b border-slate-800">
                  เลือกรูปแบบการจัดเรียง (Sorting):
                </div>
                <div className="space-y-1 mt-1">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        onSortModeChange(opt.id);
                        setIsSortOpen(false);
                        sound.playClick(700);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                        sortMode === opt.id
                          ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div>
                        <div>{opt.label}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{opt.desc}</div>
                      </div>
                      {sortMode === opt.id && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Master Matrix Modal Button */}
          <button
            onClick={() => {
              sound.playClick(650);
              onOpenMatrix();
            }}
            className="px-3.5 py-2.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">ตารางเทียบ</span>
            <span>Matrix</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Groups */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        {/* Row 1: Difficulty Tag Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-cyan-400" />
            <span>ระดับความยาก:</span>
          </span>

          {difficulties.map((diff) => (
            <button
              key={diff.id}
              onClick={() => {
                onDifficultySelect(diff.id);
                sound.playClick(500);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                selectedDifficulty === diff.id
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {diff.label}
            </button>
          ))}
        </div>

        {/* Row 2: Category Tag Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>หมวดหมู่:</span>
          </span>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onCategorySelect(cat.id);
                sound.playClick(500);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/20 font-bold'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Row 3: Feature / Engine Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Gamepad2 className="w-3 h-3 text-emerald-400" />
            <span>รูปแบบโจทย์ & ฟีเจอร์:</span>
          </span>

          {/* Engine filter tags */}
          {engines.map((eng) => (
            <button
              key={eng.id}
              onClick={() => {
                onEngineSelect(eng.id);
                sound.playClick(500);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                selectedEngine === eng.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {eng.label}
            </button>
          ))}

          {/* Only with Interactive Lab toggle */}
          <button
            onClick={() => {
              onToggleOnlyWithLab();
              sound.playClick(550);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              onlyWithLab
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Beaker className="w-3 h-3 text-cyan-400" />
            <span>มี Interactive Lab (60 FPS)</span>
          </button>

          {/* Clear Filters Button if any active */}
          {isAnyFilterActive && (
            <button
              onClick={() => {
                onResetFilters();
                sound.playClick(400);
              }}
              className="ml-auto px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Status Badge */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
        <div>
          แสดงผล <span className="font-bold text-cyan-400 font-mono text-sm">{filteredCount}</span> จากทั้งหมด{' '}
          <span className="font-bold text-white font-mono">{totalCount}</span> บทเรียน
        </div>

        {isAnyFilterActive && (
          <div className="text-[11px] text-slate-400">
            กำลังกรองข้อมูล:{' '}
            {searchQuery && <span className="text-cyan-400 font-mono mr-1.5">"{searchQuery}"</span>}
            {selectedDifficulty !== 'all' && (
              <span className="text-amber-400 font-semibold mr-1.5">{selectedDifficulty}</span>
            )}
            {selectedCategory !== 'all' && (
              <span className="text-indigo-400 font-semibold mr-1.5">{selectedCategory}</span>
            )}
            {selectedEngine !== 'all' && (
              <span className="text-emerald-400 font-semibold mr-1.5">{selectedEngine}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
