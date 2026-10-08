import React, { useState } from 'react';
import type { Topic } from '../types/topic';
import {
  ArrowLeft,
  Sparkles,
  Cpu,
  Code2,
  Beaker,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Flame,
  Check,
  Copy,
  Terminal,
  HelpCircle,
} from 'lucide-react';
import { ObjectPoolLab } from './interactive/ObjectPoolLab';
import { SpatialPartitionLab } from './interactive/SpatialPartitionLab';
import { DataOrientedLab } from './interactive/DataOrientedLab';
import { FixedTimestepLab } from './interactive/FixedTimestepLab';
import { DrawCallLab } from './interactive/DrawCallLab';
import { PathfindingLab } from './interactive/PathfindingLab';
import { StateAiLab } from './interactive/StateAiLab';
import { FrustumCullingLab } from './interactive/FrustumCullingLab';
import { MultiThreadingLab } from './interactive/MultiThreadingLab';
import { OverdrawShadingLab } from './interactive/OverdrawShadingLab';
import { NetworkPredictionLab } from './interactive/NetworkPredictionLab';
import { TextureStreamingLab } from './interactive/TextureStreamingLab';
import { AudioConcurrencyLab } from './interactive/AudioConcurrencyLab';
import { AsyncLoadingLab } from './interactive/AsyncLoadingLab';
import { ChallengeView } from './ChallengeView';
import { QuizView } from './QuizView';
import { sound } from '../utils/audio';

interface TopicDetailProps {
  topic: Topic;
  onBack: () => void;
}

export const TopicDetail: React.FC<TopicDetailProps> = ({ topic, onBack }) => {
  const [activeTab, setActiveTab] = useState<'simple' | 'deep' | 'code' | 'lab' | 'challenge' | 'quiz'>('simple');
  const [exampleVariant, setExampleVariant] = useState<'pure' | 'unity' | 'unreal'>('pure');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    sound.playClick(800);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const renderLab = () => {
    switch (topic.labType) {
      case 'object-pool':
        return <ObjectPoolLab />;
      case 'spatial-grid':
        return <SpatialPartitionLab />;
      case 'ecs-dod':
        return <DataOrientedLab />;
      case 'fixed-timestep':
        return <FixedTimestepLab />;
      case 'draw-calls':
        return <DrawCallLab />;
      case 'pathfinding':
        return <PathfindingLab />;
      case 'ai-fsm':
        return <StateAiLab />;
      case 'frustum-culling':
        return <FrustumCullingLab />;
      case 'multi-threading':
        return <MultiThreadingLab />;
      case 'shader-overdraw':
        return <OverdrawShadingLab />;
      case 'netcode-prediction':
        return <NetworkPredictionLab />;
      case 'texture-streaming':
        return <TextureStreamingLab />;
      case 'audio-concurrency':
        return <AudioConcurrencyLab />;
      case 'async-loading':
        return <AsyncLoadingLab />;
      default:
        return (
          <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
            Interactive lab อยู่ระหว่างการพัฒนาสำหรับหัวข้อนี้
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => {
            sound.playClick(500);
            onBack();
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้ารายการหัวข้อ</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            หมวดหมู่: <span className="text-cyan-400 font-bold uppercase">{topic.category}</span>
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            ระดับ: <span className="text-amber-400 font-bold">{topic.difficulty}</span>
          </span>
        </div>
      </div>

      {/* Hero Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {topic.title}
          </h1>
          <p className="text-sm font-mono text-cyan-400 mt-1">{topic.titleEn}</p>
          <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
            {topic.summary}
          </p>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{topic.performanceComparison.metrics[0]?.improvement || 'High Efficiency'}</span>
            </div>
            {topic.hasInteractiveLab && (
              <button
                onClick={() => {
                  setActiveTab('lab');
                  sound.playClick(700);
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5"
              >
                <Beaker className="w-3.5 h-3.5" />
                <span>ทดสอบ Interactive Simulation ➔</span>
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('challenge');
                sound.playClick(700);
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-xs font-semibold text-purple-300 hover:bg-purple-500/30 transition-colors flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>🎯 โจทย์เติม Logic ➔</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('quiz');
                sound.playClick(700);
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>📝 ทำแบบทดสอบ 2 ระดับ (สุ่ม 5 ข้อ) ➔</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar gap-2">
        {[
          { id: 'simple', label: '🌱 แบบเข้าใจง่าย (ELI5)', icon: Lightbulb },
          { id: 'deep', label: '⚡ สถาปัตยกรรมเชิงลึก (Deep Dive)', icon: Cpu },
          { id: 'code', label: '💻 ตัวอย่างโค้ด (Code & Practices)', icon: Code2 },
          { id: 'lab', label: '🧪 Interactive Lab & Benchmark', icon: Beaker },
          { id: 'challenge', label: '🎯 โจทย์ฝึกเติม Logic (3 รูปแบบ)', icon: Terminal },
          { id: 'quiz', label: '📝 แบบทดสอบ 2 ระดับ (Quiz)', icon: HelpCircle },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                sound.playClick(600);
              }}
              className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-cyan-400 text-cyan-400 bg-slate-900/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: แบบเข้าใจง่าย (ELI5) */}
      {activeTab === 'simple' && (
        <div className="space-y-6">
          {/* Analogy Box */}
          <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>ภาพเปรียบเทียบในชีวิตประจำวัน (Real-World Analogy)</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              {topic.simpleExplanation.analogy}
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {topic.simpleExplanation.keyConcept}
            </p>
          </div>

          {/* Why It Matters Callout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>ทำไมสิ่งนี้ถึงสำคัญต่อเกมของคุณ?</span>
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {topic.simpleExplanation.whyItMatters}
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>สรุป 4 ประเด็นสำคัญที่ต้องจำ</span>
              </h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {topic.simpleExplanation.bulletPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Performance Comparison Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-base font-bold text-white mb-4">
              📊 {topic.performanceComparison.benchmarkTitle}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">ตัวชี้วัด (Metric)</th>
                    <th className="pb-3 font-semibold text-rose-400">แบบเดิม (Unoptimized)</th>
                    <th className="pb-3 font-semibold text-emerald-400">หลังใช้เทคนิคนี้ (Optimized)</th>
                    <th className="pb-3 font-semibold text-cyan-400">ผลลัพธ์ (Improvement)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {topic.performanceComparison.metrics.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-medium text-white">{m.metric}</td>
                      <td className="py-3 text-rose-300">{m.unoptimized}</td>
                      <td className="py-3 text-emerald-300 font-semibold">{m.optimized}</td>
                      <td className="py-3 text-cyan-300 font-bold">{m.improvement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-white">บทสรุปทางสถาปัตยกรรม:</span>{' '}
              {topic.performanceComparison.verdict}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: สถาปัตยกรรมเชิงลึก (Deep Dive) */}
      {activeTab === 'deep' && (
        <div className="space-y-6">
          {/* Low-level mechanics */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Cpu className="w-4 h-4" />
              <span>สถาปัตยกรรมระดับฮาร์ดแวร์ & รันไทม์ (Hardware & Runtime Mechanics)</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-3">
              {topic.deepExplanation.architecturalDetail}
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {topic.deepExplanation.lowLevelMechanics}
            </p>

            {topic.deepExplanation.mathOrTheory && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs sm:text-sm text-cyan-300">
                <span className="text-slate-400 block mb-1 font-sans text-xs">
                  สูตรและการคำนวณทางทฤษฎี:
                </span>
                {topic.deepExplanation.mathOrTheory}
              </div>
            )}
          </div>

          {/* Engine Internals: Unity, Unreal, Godot */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-base font-bold text-white mb-4">
              ⚙️ การประยุกต์ใช้ใน Game Engine ชั้นนำ (Engine Internals)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topic.deepExplanation.engineInternals.unity && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-cyan-400 mb-2">Unity Engine</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {topic.deepExplanation.engineInternals.unity}
                  </p>
                </div>
              )}

              {topic.deepExplanation.engineInternals.unreal && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-indigo-400 mb-2">Unreal Engine 5</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {topic.deepExplanation.engineInternals.unreal}
                  </p>
                </div>
              )}

              {topic.deepExplanation.engineInternals.godot && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-purple-400 mb-2">Godot Engine 4</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {topic.deepExplanation.engineInternals.godot}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Complexity & Pitfalls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-base font-bold text-white mb-3">
                ⏱️ Big-O Algorithmic Complexity
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Time Complexity:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {topic.deepExplanation.complexity.time}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Space Complexity:</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {topic.deepExplanation.complexity.space}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  {topic.deepExplanation.complexity.explanation}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-base font-bold text-rose-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>ข้อผิดพลาดที่พบบ่อย (Common Pitfalls)</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {topic.deepExplanation.pitfalls.map((pf, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold shrink-0">⚠️</span>
                    <span>{pf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: โค้ดตัวอย่าง 3 แบบ (Pure Logic, Unity, Unreal) */}
      {activeTab === 'code' && (() => {
        const currentExample = topic.codeExamples
          ? (exampleVariant === 'pure'
              ? topic.codeExamples.pureLogic
              : exampleVariant === 'unity'
              ? topic.codeExamples.unity
              : topic.codeExamples.unreal)
          : topic.codeExample;

        return (
          <div className="space-y-6">
            {/* 3 Variant Sub-Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setExampleVariant('pure');
                    sound.playClick(500);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    exampleVariant === 'pure'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>🧩 1. แบบปกติ (Pure Logic)</span>
                </button>

                <button
                  onClick={() => {
                    setExampleVariant('unity');
                    sound.playClick(600);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    exampleVariant === 'unity'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>🎮 2. Implement ใน Unity (C#)</span>
                </button>

                <button
                  onClick={() => {
                    setExampleVariant('unreal');
                    sound.playClick(700);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    exampleVariant === 'unreal'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>🕹️ 3. Implement ใน Unreal (C++)</span>
                </button>
              </div>

              {currentExample && (
                <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-bold text-cyan-400">
                    {currentExample.language}
                  </span>
                </div>
              )}
            </div>

            {/* Title Banner of the current implementation */}
            {currentExample?.title && (
              <div className="px-5 py-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-sm font-bold text-white">{currentExample.title}</span>
              </div>
            )}

            {/* Bad vs Good Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bad Pattern Card */}
              {currentExample?.badCode && (
                <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="px-4 py-3 bg-rose-950/40 border-b border-rose-500/30 flex items-center justify-between">
                      <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                        <span>{currentExample.badTitle || '❌ Bad Practice (Unscalable)'}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(currentExample.badCode!)}
                        className="p-1 rounded-lg bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 text-xs flex items-center gap-1 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-4 bg-slate-950 overflow-x-auto">
                      <pre className="text-xs font-mono text-rose-200/90 leading-relaxed">
                        <code>{currentExample.badCode}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Good Pattern Card */}
              {currentExample?.goodCode && (
                <div className="bg-slate-900/80 border border-cyan-500/40 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="px-4 py-3 bg-cyan-950/40 border-b border-cyan-500/30 flex items-center justify-between">
                      <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                        <span>{currentExample.goodTitle || '✅ Best Practice (Scalable Production)'}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(currentExample.goodCode!)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>
                    <div className="p-4 bg-slate-950 overflow-x-auto">
                      <pre className="text-xs font-mono text-cyan-200/90 leading-relaxed">
                        <code>{currentExample.goodCode}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Explanation & Architectural Notes */}
            {currentExample?.explanation && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm text-slate-300 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">คำอธิบายโครงสร้างและแนวคิด:</span>{' '}
                  {currentExample.explanation}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB CONTENT 4: Interactive Lab & Live Benchmark */}
      {activeTab === 'lab' && (
        <div className="space-y-6">
          {renderLab()}
        </div>
      )}

      {/* TAB CONTENT 5: โจทย์ฝึกเติม Logic (3 รูปแบบ: Pure / Unity / Unreal) */}
      {activeTab === 'challenge' && (
        <ChallengeView challenges={topic.challenges} />
      )}

      {/* TAB CONTENT 6: แบบทดสอบ 2 ระดับ (เริ่มต้น & ปฏิบัติจริง สุ่ม 5 ข้อ) */}
      {activeTab === 'quiz' && (
        <QuizView topicId={topic.id} topicTitle={topic.title} />
      )}
    </div>
  );
};
