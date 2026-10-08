import React from 'react';
import type { Topic } from '../types/topic';
import {
  Boxes,
  Grid,
  Cpu,
  Timer,
  Layers,
  Compass,
  Brain,
  Eye,
  Flame,
  Wifi,
  Volume2,
  DownloadCloud,
  ArrowRight,
  Beaker,
  TrendingUp,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface TopicCardProps {
  topic: Topic;
  onSelect: (topic: Topic) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onSelect }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Boxes':
        return <Boxes className="w-5 h-5 text-cyan-400" />;
      case 'Grid':
        return <Grid className="w-5 h-5 text-indigo-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'Timer':
        return <Timer className="w-5 h-5 text-amber-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-emerald-400" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-rose-400" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-pink-400" />;
      case 'Eye':
        return <Eye className="w-5 h-5 text-cyan-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'Wifi':
        return <Wifi className="w-5 h-5 text-emerald-400" />;
      case 'Volume2':
        return <Volume2 className="w-5 h-5 text-amber-400" />;
      case 'DownloadCloud':
        return <DownloadCloud className="w-5 h-5 text-blue-400" />;
      default:
        return <Boxes className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Intermediate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Advanced':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div
      onClick={() => {
        sound.playClick(600);
        onSelect(topic);
      }}
      className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1 flex flex-col justify-between"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            {getIcon(topic.iconName)}
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyBadge(
                topic.difficulty
              )}`}
            >
              {topic.difficulty}
            </span>

            {topic.hasInteractiveLab && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                <Beaker className="w-3 h-3" />
                <span>Lab</span>
              </span>
            )}

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Quiz 2 ระดับ
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
          {topic.title}
        </h3>
        <div className="text-xs font-mono text-slate-400 mb-2.5 line-clamp-1">{topic.titleEn}</div>

        {/* Summary Description */}
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">
          {topic.summary}
        </p>
      </div>

      {/* Bottom Performance Highlights */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="truncate max-w-[170px]">
              {topic.performanceComparison.metrics[0]?.improvement || 'Performance Boost'}
            </span>
          </div>

          <span className="text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex items-center gap-1 text-xs font-semibold">
            <span>เรียนรู้</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
