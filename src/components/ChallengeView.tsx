import React, { useState } from 'react';
import type { TopicChallenges, ChallengeItem } from '../types/topic';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Terminal,
  Code2,
  Cpu,
  Layers,
  Check,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface ChallengeViewProps {
  challenges: TopicChallenges;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({ challenges }) => {
  const [selectedVariant, setSelectedVariant] = useState<'pure' | 'unity' | 'unreal'>('pure');
  const [userInputs, setUserInputs] = useState<Record<string, Record<string, string>>>({
    pure: {},
    unity: {},
    unreal: {},
  });
  const [showHints, setShowHints] = useState(false);
  const [showFullSolution, setShowFullSolution] = useState(false);
  const [verifiedState, setVerifiedState] = useState<Record<string, boolean | null>>({
    pure: null,
    unity: null,
    unreal: null,
  });

  const currentChallenge: ChallengeItem =
    selectedVariant === 'pure'
      ? challenges.pureLogic
      : selectedVariant === 'unity'
      ? challenges.unity
      : challenges.unreal;

  const currentInputs = userInputs[selectedVariant] || {};

  const handleInputChange = (blankId: string, value: string) => {
    setUserInputs(prev => ({
      ...prev,
      [selectedVariant]: {
        ...prev[selectedVariant],
        [blankId]: value,
      },
    }));
    // Reset verified state on edit
    setVerifiedState(prev => ({
      ...prev,
      [selectedVariant]: null,
    }));
  };

  const handleSelectOption = (blankId: string, optionValue: string) => {
    handleInputChange(blankId, optionValue);
    sound.playClick(700);
  };

  const checkAnswer = () => {
    let allCorrect = true;
    for (const blank of currentChallenge.blanks) {
      const userVal = (currentInputs[blank.id] || '').trim();
      const normalize = (s: string) => s.replace(/\s+/g, '').replace(/;$/, '').toLowerCase();
      
      const expectedNormalized = normalize(blank.expected);
      const userNormalized = normalize(userVal);
      
      const matchesExpected = userNormalized === expectedNormalized;
      const matchesAlternative = (blank.acceptedAlternatives || []).some(
        alt => normalize(alt) === userNormalized
      );

      if (!matchesExpected && !matchesAlternative) {
        allCorrect = false;
        break;
      }
    }

    setVerifiedState(prev => ({
      ...prev,
      [selectedVariant]: allCorrect,
    }));

    if (allCorrect) {
      sound.playSuccess();
    } else {
      sound.playCollision();
    }
  };

  const resetChallenge = () => {
    setUserInputs(prev => ({
      ...prev,
      [selectedVariant]: {},
    }));
    setVerifiedState(prev => ({
      ...prev,
      [selectedVariant]: null,
    }));
    setShowFullSolution(false);
    sound.playClick(600);
  };

  const renderCodeWithInteractiveBlanks = () => {
    const parts = currentChallenge.starterCode.split(/(___BLANK_\d+___)/g);

    return (
      <div className="font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800">
        <pre className="whitespace-pre-wrap">
          {parts.map((part, idx) => {
            const blankMatch = part.match(/___BLANK_(\d+)___/);
            if (blankMatch) {
              const blankIndex = parseInt(blankMatch[1], 10) - 1;
              const blank = currentChallenge.blanks[blankIndex];
              if (!blank) return null;

              const val = currentInputs[blank.id] || '';
              const isChecked = verifiedState[selectedVariant] !== null;
              
              const normalize = (s: string) => s.replace(/\s+/g, '').replace(/;$/, '').toLowerCase();
              const isCorrect =
                normalize(val) === normalize(blank.expected) ||
                (blank.acceptedAlternatives || []).some(alt => normalize(alt) === normalize(val));

              return (
                <span key={idx} className="inline-flex items-center mx-1 my-0.5">
                  <input
                    type="text"
                    value={val}
                    onChange={e => handleInputChange(blank.id, e.target.value)}
                    placeholder={`เติมโค้ดช่องที่ ${blankIndex + 1}...`}
                    className={`px-2.5 py-1 text-xs rounded-lg font-mono font-bold border transition-all ${
                      isChecked
                        ? isCorrect
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                          : 'bg-rose-950/80 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                        : 'bg-slate-900 border-cyan-500/40 text-cyan-300 focus:border-cyan-400 focus:bg-slate-850 focus:ring-1 focus:ring-cyan-400'
                    }`}
                    style={{ minWidth: '180px' }}
                  />
                  {isChecked && (
                    <span className="ml-1">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 inline" />
                      )}
                    </span>
                  )}
                </span>
              );
            }
            return <span key={idx}>{part}</span>;
          })}
        </pre>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header & Variant Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Interactive Code Challenge
            </span>
            <h3 className="text-lg font-bold text-white">โจทย์ฝึกเติม Logic ที่หายไป (3 รูปแบบ)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            เลือกรูปแบบโจทย์ที่ต้องการฝึกฝน: Pure Logic (LeetCode Style), Unity C#, หรือ Unreal Engine C++
          </p>
        </div>

        {/* 3 Variant Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setSelectedVariant('pure');
              sound.playClick(600);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedVariant === 'pure'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>1. Pure Logic (LeetCode)</span>
          </button>

          <button
            onClick={() => {
              setSelectedVariant('unity');
              sound.playClick(600);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedVariant === 'unity'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Unity (C#)</span>
          </button>

          <button
            onClick={() => {
              setSelectedVariant('unreal');
              sound.playClick(600);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedVariant === 'unreal'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>3. Unreal Engine (C++)</span>
          </button>
        </div>
      </div>

      {/* Challenge Overview Banner */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
              ภาษา: {currentChallenge.language.toUpperCase()}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              ความยาก: {currentChallenge.difficulty}
            </span>
          </div>

          <span className="text-xs text-slate-400">
            จำนวนช่องที่ต้องเติม: <strong className="text-white">{currentChallenge.blanks.length} ช่อง</strong>
          </span>
        </div>

        <h4 className="text-base font-bold text-white">{currentChallenge.title}</h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {currentChallenge.description}
        </p>

        <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/50 text-xs text-indigo-300 flex items-start gap-2">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
          <div>
            <strong className="text-white">หลักคิดทางสถาปัตยกรรม:</strong> {currentChallenge.conceptNotes}
          </div>
        </div>
      </div>

      {/* Interactive Code Editor with Embedded Inputs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>เติมโค้ดในช่องสี่เหลี่ยมด้านล่าง (สามารถพิมพ์เองหรือคลิกตัวเลือกที่แนะนำ):</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHints(!showHints)}
              className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHints ? 'ซ่อนคำใบ้' : 'ดูคำใบ้'}</span>
            </button>
          </div>
        </div>

        {renderCodeWithInteractiveBlanks()}
      </div>

      {/* Suggested Options Chips per Blank */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-slate-400">
          💡 คลิกตัวเลือกเพื่อนำไปใส่ในช่องว่างอัตโนมัติ:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {currentChallenge.blanks.map(b => (
            <div
              key={b.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5"
            >
              <div className="font-bold text-slate-300 flex items-center justify-between">
                <span>{b.label}</span>
                {showHints && <span className="text-[10px] text-amber-400 font-normal">({b.hint})</span>}
              </div>

              {b.options && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {b.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(b.id, opt)}
                      className={`px-2 py-1 rounded text-[11px] font-mono transition-all border ${
                        currentInputs[b.id] === opt
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Validation Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={checkAnswer}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 hover:opacity-90 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>ตรวจคำตอบ (Verify Code)</span>
          </button>

          <button
            onClick={resetChallenge}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="ล้างคำตอบเพื่อเริ่มใหม่"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setShowFullSolution(!showFullSolution);
              sound.playClick(500);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {showFullSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showFullSolution ? 'ซ่อนเฉลย' : 'ดูเฉลยเต็ม'}</span>
          </button>
        </div>

        {/* Verification Status Banner */}
        {verifiedState[selectedVariant] !== null && (
          <div
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
              verifiedState[selectedVariant]
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
            }`}
          >
            {verifiedState[selectedVariant] ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>ถูกต้องสมบูรณ์แบบ! โค้ดผ่านการทดสอบและทำงานได้ตามหลักการ Optimize</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>ยังมีช่องที่ตอบไม่ถูกต้อง ลองตรวจสอบ Syntax หรือกดปุ่มดูคำใบ้</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Full Solution & Detailed Explanation Drawer */}
      {showFullSolution && (
        <div className="mt-4 p-5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>เฉลยคำตอบฉบับสมบูรณ์ (Reference Solution):</span>
            </span>
            <span className="text-xs font-mono text-slate-400">{currentChallenge.language}</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
            <pre className="text-xs font-mono text-emerald-300/90 leading-relaxed">
              <code>{currentChallenge.fullSolution}</code>
            </pre>
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            <div>
              <strong className="text-white">คำอธิบายกลไกการทำงาน:</strong>{' '}
              {currentChallenge.explanation}
            </div>
            {currentChallenge.testCaseDescription && (
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 font-mono text-[11px] text-cyan-300">
                <span className="text-slate-400 font-sans block mb-0.5">Test Case Verification:</span>
                ✔ {currentChallenge.testCaseDescription}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
