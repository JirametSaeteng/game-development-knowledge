import React, { useState, useEffect, useRef } from 'react';
import { DownloadCloud, AlertOctagon, Cpu, HardDrive } from 'lucide-react';
import { sound } from '../../utils/audio';

export const AsyncLoadingLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [loadMode, setLoadMode] = useState<'sync' | 'async'>('async');
  const [assetSizeMb, setAssetSizeMb] = useState<number>(80);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [bossSpawned, setBossSpawned] = useState<boolean>(false);

  // Simulated freeze hitch
  const isFrozenRef = useRef<boolean>(false);
  const runnerXRef = useRef<number>(50);
  const frameTimesHistoryRef = useRef<number[]>(new Array(40).fill(16.6));

  // Telemetry
  const [stats, setStats] = useState({
    fps: 60,
    peakHitchMs: '16.6 ms',
    mainThreadState: 'Running (Responsive)',
    ioWorkerState: 'Idle',
  });

  // Trigger Asset Load
  const triggerLoad = () => {
    if (isLoading) return;
    setIsLoading(true);
    setLoadProgress(0);
    setBossSpawned(false);
    sound.playClick(600);

    if (loadMode === 'sync') {
      // Synchronous Blocking Load: Freeze main loop
      isFrozenRef.current = true;
      const freezeDuration = Math.round(assetSizeMb * 5.5); // e.g. 440ms
      frameTimesHistoryRef.current.push(freezeDuration);
      if (frameTimesHistoryRef.current.length > 40) frameTimesHistoryRef.current.shift();

      setStats({
        fps: 2,
        peakHitchMs: `${freezeDuration} ms (HARD FREEZE)`,
        mainThreadState: 'BLOCKED / UNRESPONSIVE (I/O Wait)',
        ioWorkerState: 'Blocking Main Thread Disk Read',
      });

      setTimeout(() => {
        isFrozenRef.current = false;
        setIsLoading(false);
        setLoadProgress(100);
        setBossSpawned(true);
        sound.playLaser(500);
        setStats({
          fps: 60,
          peakHitchMs: `${freezeDuration} ms (Recovered)`,
          mainThreadState: 'Running (Responsive)',
          ioWorkerState: 'Idle',
        });
      }, freezeDuration);
    } else {
      // Asynchronous Streamed Load: Background thread
      setStats({
        fps: 60,
        peakHitchMs: '16.6 ms (Smooth)',
        mainThreadState: 'Running at 60 FPS (Zero Hitch)',
        ioWorkerState: 'Streaming via Background I/O Thread',
      });

      let current = 0;
      const interval = setInterval(() => {
        current += 10;
        setLoadProgress(current);
        if (current >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          setBossSpawned(true);
          sound.playLaser(700);
          setStats({
            fps: 60,
            peakHitchMs: '16.6 ms (Zero Drop)',
            mainThreadState: 'Running (Responsive)',
            ioWorkerState: 'Idle',
          });
        }
      }, 70);
    }
  };

  // Main Canvas animation loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // If not frozen, advance runner
      if (!isFrozenRef.current) {
        runnerXRef.current += 3;
        if (runnerXRef.current > width - 40) {
          runnerXRef.current = 40;
        }

        frameTimesHistoryRef.current.push(16.6 + (Math.random() - 0.5) * 1.5);
        if (frameTimesHistoryRef.current.length > 40) frameTimesHistoryRef.current.shift();
      }

      ctx.clearRect(0, 0, width, height);

      // 1. World Floor Track
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, 160);
      ctx.lineTo(width - 20, 160);
      ctx.stroke();

      // 2. Runner Character
      ctx.save();
      ctx.translate(runnerXRef.current, 140);

      // Character body
      ctx.fillStyle = isFrozenRef.current ? '#f43f5e' : '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Running legs (if not frozen)
      if (!isFrozenRef.current) {
        const legSwing = Math.sin(Date.now() / 80) * 8;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-4, 14);
        ctx.lineTo(-4 - legSwing, 24);
        ctx.moveTo(4, 14);
        ctx.lineTo(4 + legSwing, 24);
        ctx.stroke();
      }

      ctx.restore();

      // 3. Boss Actor if loaded
      if (bossSpawned) {
        ctx.save();
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(width - 80, 120, 28, 0, Math.PI * 2);
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('BOSS SPAWNED', width - 125, 80);
        ctx.restore();
      }

      // 4. Frametime Timeline Graph on the bottom half
      const graphY = 230;
      const graphH = 100;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(20, graphY, width - 40, graphH);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(20, graphY, width - 40, graphH);

      // 16.6ms Target line
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(20, graphY + graphH - 25);
      ctx.lineTo(width - 20, graphY + graphH - 25);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#10b981';
      ctx.font = '9px monospace';
      ctx.fillText('Target 60 FPS (16.6ms)', 26, graphY + graphH - 28);

      // Plot frame times
      ctx.beginPath();
      const points = frameTimesHistoryRef.current;
      const step = (width - 40) / (points.length - 1);

      points.forEach((ft, idx) => {
        const x = 20 + idx * step;
        const normalizedH = Math.min(graphH - 10, (ft / 100) * (graphH - 30));
        const y = graphY + graphH - normalizedH;

        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.strokeStyle = points.some((p) => p > 50) ? '#f43f5e' : '#22d3ee';
      ctx.lineWidth = 2;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [bossSpawned]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DownloadCloud className="w-4 h-4 text-cyan-400" />
            <span>Async Asset Loading & Addressables Streamer</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            เปรียบเทียบการโหลดไฟล์ฉากขนาดใหญ่แบบบล็อกเธรดหลัก (Resources.Load) กับการสตรีมเบื้องหลัง (Addressables Async)
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLoadMode('sync');
              sound.playClick(400);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              loadMode === 'sync'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Synchronous Load (Freeze Hitch)</span>
          </button>

          <button
            onClick={() => {
              setLoadMode('async');
              sound.playClick(700);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              loadMode === 'async'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Addressables Async Stream</span>
          </button>
        </div>
      </div>

      {/* Main Simulation + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-3xl p-4 relative overflow-hidden flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-2">
            <span className="font-mono text-[11px] text-cyan-400">
              🏃 ตัวละครวิ่งอย่างต่อเนื่อง — กดปุ่มโหลด Asset เพื่อดูการกระตุกของเฟรมเรต
            </span>
            <span className="text-slate-300 font-mono text-[11px]">
              กราฟความหน่วงเวลาต่อเฟรม (Frametime ms History)
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={600}
            height={360}
            className="rounded-2xl border border-slate-800/80 bg-slate-950 max-w-full shadow-inner"
          />

          {/* Trigger Loading Button + Progress */}
          <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
            <button
              onClick={triggerLoad}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg ${
                isLoading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 active:scale-95'
              }`}
            >
              <DownloadCloud className="w-4 h-4" />
              <span>{isLoading ? 'กำลังโหลด Asset...' : `โหลดบอสขนาด ${assetSizeMb} MB (Stream Asset)`}</span>
            </button>

            {/* Stream Progress Bar */}
            <div className="flex-1 w-full max-w-xs space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>I/O Background Stream:</span>
                <span className="text-cyan-400 font-bold">{loadProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-150"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Freeze alert */}
          {stats.fps < 10 && (
            <div className="mt-4 w-full bg-rose-950/80 backdrop-blur-md border border-rose-500/50 rounded-2xl p-3 flex items-center gap-3 text-rose-200 text-xs animate-pulse">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold">Main Thread Hard Freeze ({stats.peakHitchMs}):</span> เรียกคำสั่งโหลดแบบ Synchronous บนเธรดเกมหลัก ทำให้เกมหยุดนิ่ง ภาพค้าง ผู้เล่นกดอะไรไม่ได้จนกว่าฮาร์ดดิสก์จะอ่านไฟล์เสร็จ!
              </div>
            </div>
          )}
        </div>

        {/* Telemetry and Size Slider */}
        <div className="space-y-4">
          {/* Telemetry */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Thread Telemetry
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400">Peak Frametime Spike</div>
              <div
                className={`text-lg font-black font-mono ${
                  stats.fps < 30 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {stats.peakHitchMs}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="text-slate-400">Main Thread State:</div>
              <div className="font-mono text-white font-bold">{stats.mainThreadState}</div>
              <div className="text-slate-400 pt-1">Disk Worker:</div>
              <div className="font-mono text-cyan-400 font-bold">{stats.ioWorkerState}</div>
            </div>
          </div>

          {/* Asset Size Slider */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Asset Properties
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>ขนาด Asset (File Payload)</span>
                <span className="font-mono text-cyan-400">{assetSizeMb} MB</span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                step="10"
                value={assetSizeMb}
                onChange={(e) => setAssetSizeMb(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
