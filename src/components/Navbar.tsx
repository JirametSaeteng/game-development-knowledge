import React from 'react';
import { Gamepad2, Search, Volume2, VolumeX, Beaker, Sparkles } from 'lucide-react';
import type { Category } from '../types/topic';
import { sound } from '../utils/audio';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: Category | 'all';
  onCategorySelect: (cat: Category | 'all') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSelectTopicById: (id: string) => void;
  onOpenMatrix: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  soundEnabled,
  onToggleSound,
  onSelectTopicById,
  onOpenMatrix,
}) => {
  const categories: Array<{ id: Category | 'all'; label: string }> = [
    { id: 'all', label: 'ทั้งหมด (All Topics)' },
    { id: 'performance', label: '⚡ Performance & Memory' },
    { id: 'physics', label: '🪐 Physics & Collision' },
    { id: 'rendering', label: '🎨 Graphics & Rendering' },
    { id: 'ai', label: '🤖 Game AI & Pathfinding' },
    { id: 'architecture', label: '🏛️ Architecture & ECS' },
    { id: 'networking', label: '🌐 Netcode & Multiplayer' },
    { id: 'audio', label: '🔊 Audio & Sound Engineering' },
  ];

  const quickLabs = [
    { id: 'object-pooling', name: 'Object Pool (GC Spike)' },
    { id: 'spatial-partitioning', name: 'Spatial Grid (O(N²))' },
    { id: 'ecs-dod', name: 'Data-Oriented (ECS Cache)' },
    { id: 'fixed-timestep', name: 'Fixed Timestep (Tunneling)' },
    { id: 'draw-calls-batching', name: 'GPU Instancing' },
    { id: 'pathfinding-algorithms', name: 'A* Pathfinding' },
    { id: 'game-ai-fsm-bt', name: 'AI State Machine' },
    { id: 'frustum-culling', name: 'Frustum & Occlusion Culling' },
    { id: 'multi-threading', name: 'Multi-Thread Job System' },
    { id: 'shader-overdraw', name: 'Shader Overdraw Heatmap' },
    { id: 'netcode-prediction', name: 'Netcode Client Prediction' },
    { id: 'texture-streaming', name: 'Texture Streaming Mipmaps' },
    { id: 'audio-concurrency', name: 'Audio Concurrency Voice Stealing' },
    { id: 'async-loading', name: 'Async Addressables Loading' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onCategorySelect('all')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-tight">GameDev Engine Lab</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v2.0
              </span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              สื่อการสอนสถาปัตยกรรมและการปรับแต่งประสิทธิภาพเกม
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="ค้นหาหัวข้อ เช่น Object Pool, Cache, Quadtree, ECS, Draw Call..."
            className="w-full pl-10 pr-4 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Lab Selector Dropdown */}
          <div className="relative group">
            <button
              onClick={() => sound.playClick(600)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Beaker className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive Labs</span>
            </button>
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 hidden group-hover:block transition-all z-50">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                เลือก Interactive Lab:
              </div>
              {quickLabs.map(lab => (
                <button
                  key={lab.id}
                  onClick={() => {
                    onSelectTopicById(lab.id);
                    sound.playClick(700);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-between"
                >
                  <span>{lab.name}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">🧪</span>
                </button>
              ))}
            </div>
          </div>

          {/* Performance Matrix Button */}
          <button
            onClick={() => {
              onOpenMatrix();
              sound.playClick(600);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">ตารางเทียบสเปก</span>
          </button>

          {/* Audio Feedback Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-slate-900 border-slate-700 text-cyan-400'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto flex items-center gap-2 no-scrollbar border-t border-slate-900">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                onCategorySelect(cat.id);
                sound.playClick(500);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/80'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
