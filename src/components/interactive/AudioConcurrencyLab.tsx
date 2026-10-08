import React, { useState, useEffect, useRef } from 'react';
import { Volume2, AlertTriangle, ShieldCheck, Flame, Radio, Activity } from 'lucide-react';
import { sound } from '../../utils/audio';

interface AudioVoice {
  id: number;
  soundName: string;
  volume: number;
  priority: number; // 1 (low) to 10 (high)
  startTime: number;
  durationMs: number;
  isStolen: boolean;
}

export const AudioConcurrencyLab: React.FC = () => {
  // States
  const [concurrencyMode, setConcurrencyMode] = useState<'uncapped' | 'managed'>('managed');
  const [maxConcurrency, setMaxConcurrency] = useState<number>(6);
  const [stealingRule, setStealingRule] = useState<'oldest' | 'quietest'>('oldest');

  const [activeVoices, setActiveVoices] = useState<AudioVoice[]>([]);
  const voiceIdCounterRef = useRef<number>(0);

  // Telemetry stats
  const [stats, setStats] = useState({
    activeVoicesCount: 0,
    stolenVoicesCount: 0,
    cpuAudioLoadPercent: 4.5,
    audioClippingWarning: false,
    dspBufferLatencyMs: '5.2 ms',
  });

  const voiceListRef = useRef<AudioVoice[]>([]);
  const totalStolenRef = useRef<number>(0);

  // Sound triggering logic
  const triggerSound = (name: string, priority: number, count: number = 1) => {
    const now = Date.now();

    for (let c = 0; c < count; c++) {
      const id = ++voiceIdCounterRef.current;
      const vol = Math.max(0.3, Math.min(1.0, 0.4 + Math.random() * 0.6));
      const newVoice: AudioVoice = {
        id,
        soundName: name,
        volume: vol,
        priority,
        startTime: now + c * 20,
        durationMs: 900 + Math.random() * 500,
        isStolen: false,
      };

      if (concurrencyMode === 'uncapped') {
        voiceListRef.current.push(newVoice);
        sound.playLaser(200 + Math.random() * 400);
      } else {
        // Managed concurrency
        const currentVoices = voiceListRef.current;
        if (currentVoices.length >= maxConcurrency) {
          // Voice Stealing
          totalStolenRef.current++;
          if (stealingRule === 'oldest') {
            // Find oldest voice (earliest startTime)
            let oldestIdx = 0;
            for (let i = 1; i < currentVoices.length; i++) {
              if (currentVoices[i].startTime < currentVoices[oldestIdx].startTime) {
                oldestIdx = i;
              }
            }
            currentVoices.splice(oldestIdx, 1);
          } else {
            // Steal quietest
            let quietestIdx = 0;
            for (let i = 1; i < currentVoices.length; i++) {
              if (currentVoices[i].volume < currentVoices[quietestIdx].volume) {
                quietestIdx = i;
              }
            }
            currentVoices.splice(quietestIdx, 1);
          }
        }
        voiceListRef.current.push(newVoice);
        sound.playLaser(300 + Math.random() * 200);
      }
    }
  };

  // Heartbeat loop for voice lifetimes & meters
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // Remove expired voices
      voiceListRef.current = voiceListRef.current.filter((v) => now - v.startTime < v.durationMs);

      const count = voiceListRef.current.length;
      const isUncapped = concurrencyMode === 'uncapped';
      const cpuLoad = isUncapped ? Math.min(98, count * 2.2 + 4) : Math.min(30, count * 2.8 + 4);
      const isClipping = isUncapped && count > 18;

      setActiveVoices([...voiceListRef.current]);
      setStats({
        activeVoicesCount: count,
        stolenVoicesCount: totalStolenRef.current,
        cpuAudioLoadPercent: parseFloat(cpuLoad.toFixed(1)),
        audioClippingWarning: isClipping,
        dspBufferLatencyMs: isClipping ? '42.8 ms (Buffer Underrun!)' : '5.3 ms (Solid)',
      });
    }, 50);

    return () => clearInterval(interval);
  }, [concurrencyMode, maxConcurrency, stealingRule]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Audio Concurrency & Voice Stealing Lab</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ทดลองจำลองการยิงกระสุนและระเบิดหลายสิบเสียงพร้อมกัน เพื่อดูการจำกัด Voice Channel และป้องกัน CPU Audio Thread แฮงก์
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setConcurrencyMode('uncapped');
              sound.playClick(400);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              concurrencyMode === 'uncapped'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Uncapped Voices (ไม่จำกัดเสียง)</span>
          </button>

          <button
            onClick={() => {
              setConcurrencyMode('managed');
              sound.playClick(700);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              concurrencyMode === 'managed'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sound Concurrency Limit</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Voice Rack + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Voice Channel Rack */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
              <span className="font-mono text-cyan-400 text-xs font-bold flex items-center gap-1.5">
                <Radio className="w-4 h-4" />
                <span>Virtual DSP Mixing Voice Channels</span>
              </span>
              <span className="font-mono text-slate-300">
                Active Voices: <strong className="text-white">{stats.activeVoicesCount} Channels</strong>
              </span>
            </div>

            {/* Visual Voice Slots */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: concurrencyMode === 'uncapped' ? 24 : maxConcurrency }).map((_, idx) => {
                const voice = activeVoices[idx];
                const isActive = !!voice;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all duration-150 flex flex-col justify-between h-24 ${
                      isActive
                        ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800/60 opacity-40'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-slate-500 font-bold">CH #{idx + 1}</span>
                      {isActive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                          PRIORITY {voice.priority}
                        </span>
                      )}
                    </div>

                    {isActive ? (
                      <div>
                        <div className="text-xs font-bold text-white truncate">{voice.soundName}</div>
                        {/* Audio VU Meter Bar */}
                        <div className="mt-1.5 h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-rose-400 animate-pulse"
                            style={{ width: `${Math.round(voice.volume * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-600 font-mono italic">Idle Voice</div>
                    )}
                  </div>
                );
              })}
            </div>

            {concurrencyMode === 'uncapped' && activeVoices.length > 24 && (
              <div className="mt-3 text-center text-xs text-rose-400 font-bold animate-pulse">
                + มีอีก {activeVoices.length - 24} เสียงกำลังรันซ้อนทับกันอยู่เบื้องหลัง!
              </div>
            )}
          </div>

          {/* Sound Spam Trigger Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
            <button
              onClick={() => triggerSound('💣 Explosion', 9, 1)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-md"
            >
              <span>💣 1x ระเบิดเดี่ยว</span>
            </button>

            <button
              onClick={() => triggerSound('💣 Cluster Bomb', 7, 15)}
              className="px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500 text-rose-200 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-md"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>💣💥 ระเบิด Cluster (15 ลูกพร้อมกัน)</span>
            </button>

            <button
              onClick={() => triggerSound('🔫 Machine Gun', 4, 30)}
              className="px-4 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 border border-amber-500 text-amber-200 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-md"
            >
              <span>🔫 ยิงรัว 30 นัด (Spam Fire)</span>
            </button>
          </div>

          {/* Audio Clipping Warning */}
          {stats.audioClippingWarning && (
            <div className="mt-4 bg-rose-950/80 backdrop-blur-md border border-rose-500/50 rounded-2xl p-3 flex items-center gap-3 text-rose-200 text-xs animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold">DSP Buffer Underrun & Audio Clipping:</span> เสียงซ้อนทับกันเกินกำลังมิกเซอร์ ส่งผลให้เสียงแตกพร่า (Harsh Distortion) และ Audio Thread แย่งเวลา CPU หลักจนเกมกระตุก!
              </div>
            </div>
          )}
        </div>

        {/* Telemetry and Voice Settings */}
        <div className="space-y-4">
          {/* DSP Telemetry */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audio DSP Telemetry</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Audio CPU Load</div>
                <div
                  className={`text-xl font-black font-mono mt-0.5 ${
                    stats.cpuAudioLoadPercent > 50 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {stats.cpuAudioLoadPercent}%
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Voices Stolen</div>
                <div className="text-xl font-black font-mono text-cyan-400 mt-0.5">
                  {stats.stolenVoicesCount}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Active Voice Count:</span>
                <span className="font-mono text-white font-bold">{stats.activeVoicesCount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>DSP Buffer Latency:</span>
                <span className="font-mono text-cyan-400 font-bold">{stats.dspBufferLatencyMs}</span>
              </div>
            </div>
          </div>

          {/* Voice Stealing Policy Settings */}
          {concurrencyMode === 'managed' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Voice Concurrency Rules
              </div>

              {/* Max Concurrency Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>จำกัดจำนวนเสียงสูงสุด (Max Voices)</span>
                  <span className="font-mono text-cyan-400">{maxConcurrency} ช่อง</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={maxConcurrency}
                  onChange={(e) => setMaxConcurrency(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Stealing Policy */}
              <div>
                <div className="text-xs text-slate-300 mb-1.5 font-semibold">
                  กติกาการตัดเสียง (Voice Stealing Rule):
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setStealingRule('oldest');
                      sound.playClick(500);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                      stealingRule === 'oldest'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Oldest First (ตัดเสียงเก่า)
                  </button>
                  <button
                    onClick={() => {
                      setStealingRule('quietest');
                      sound.playClick(500);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                      stealingRule === 'quietest'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Quietest First (ตัดเสียงเบา)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
