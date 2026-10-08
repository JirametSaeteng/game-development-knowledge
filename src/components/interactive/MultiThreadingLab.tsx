import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Activity, AlertTriangle } from 'lucide-react';
import { sound } from '../../utils/audio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export const MultiThreadingLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [threadMode, setThreadMode] = useState<'single' | 'multithread'>('multithread');
  const [particleCount, setParticleCount] = useState<number>(4000);
  const [coreCount, setCoreCount] = useState<number>(8);

  // Core loads (0 to 100%)
  const [coreLoads, setCoreLoads] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);

  // Telemetry
  const [stats, setStats] = useState({
    fps: 60,
    computeTimeMs: 2.1,
    mainThreadTimeMs: 3.5,
    totalParticles: 4000,
    speedupRatio: '6.8x',
  });

  const particlesRef = useRef<Particle[]>([]);
  const attractorRef = useRef<{ x: number; y: number }>({ x: 300, y: 220 });

  // Init particles
  useEffect(() => {
    const list: Particle[] = [];
    const colors = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#34d399'];
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 180;
      list.push({
        x: 300 + Math.cos(angle) * dist,
        y: 220 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: colors[i % colors.length],
      });
    }
    particlesRef.current = list;
  }, [particleCount]);

  // Render & Sim Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const attractor = attractorRef.current;

      // Clear
      ctx.fillStyle = 'rgba(2, 6, 23, 0.25)'; // slight trail
      ctx.fillRect(0, 0, width, height);

      // Draw attractor center
      ctx.beginPath();
      ctx.arc(attractor.x, attractor.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Update particles
      const particles = particlesRef.current;
      const isSingle = threadMode === 'single';

      // Simulate physics step
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = attractor.x - p.x;
        const dy = attractor.y - p.y;
        const distSq = dx * dx + dy * dy + 100;
        const force = 400 / distSq;

        p.vx += (dx / Math.sqrt(distSq)) * force * 0.12;
        p.vy += (dy / Math.sqrt(distSq)) * force * 0.12;

        // Damping
        p.vx *= 0.985;
        p.vy *= 0.985;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle dot
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2, 2);
      }

      // Compute telemetry
      if (isSingle) {
        // Core 0 pegged at 100%, others at 0%
        setCoreLoads([98, 2, 1, 2, 0, 1, 0, 1]);
        const calcFps = Math.max(18, Math.floor(62 - (particleCount / 4000) * 36));
        const calcTime = (1000 / calcFps).toFixed(1);
        setStats({
          fps: calcFps,
          computeTimeMs: parseFloat((parseFloat(calcTime) * 0.85).toFixed(1)),
          mainThreadTimeMs: parseFloat(calcTime),
          totalParticles: particles.length,
          speedupRatio: '1.0x (Baseline)',
        });
      } else {
        // Multi-threaded: spread load across active cores
        const avgLoad = Math.min(95, Math.floor((particleCount / 8000) * 45 + 15));
        const loads = Array.from({ length: 8 }, (_, idx) => {
          if (idx < coreCount) {
            return Math.min(100, Math.max(10, avgLoad + Math.floor((Math.random() - 0.5) * 8)));
          }
          return Math.floor(Math.random() * 3);
        });
        setCoreLoads(loads);

        const computeTime = (2.2 * (particleCount / 4000) * (8 / coreCount)).toFixed(1);
        setStats({
          fps: 60,
          computeTimeMs: parseFloat(computeTime),
          mainThreadTimeMs: 4.8,
          totalParticles: particles.length,
          speedupRatio: `${(coreCount * 0.82).toFixed(1)}x Faster`,
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [threadMode, particleCount, coreCount]);

  // Click on canvas to move attractor
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    attractorRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    sound.playClick(600);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Job System & Multi-Threading Lab (Worker Core Scheduler)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            จำลองการกระจายโหลดคำนวณฟิสิกส์อนุภาค (Boids) ออกจาก Main Thread สู่ Worker Thread Pool
          </p>
        </div>

        {/* Thread Mode Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setThreadMode('single');
              sound.playClick(400);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              threadMode === 'single'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Single Thread (Main Thread Choke)</span>
          </button>

          <button
            onClick={() => {
              setThreadMode('multithread');
              sound.playClick(700);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              threadMode === 'multithread'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Multi-Threaded Job System (Parallel)</span>
          </button>
        </div>
      </div>

      {/* Main Simulation + Core Monitors */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-3xl p-4 relative overflow-hidden flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-2">
            <span className="font-mono text-[11px] text-cyan-400">💡 คลิกที่จอภาพเพื่อย้ายจุดศูนย์กลางแรงดึงดูด (Gravity Well)</span>
            <span className="font-mono text-slate-300">
              Simulation: <strong className="text-white">{stats.totalParticles.toLocaleString()} Particles</strong>
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={600}
            height={440}
            onClick={handleCanvasClick}
            className="rounded-2xl border border-slate-800/80 cursor-pointer bg-slate-950 max-w-full shadow-inner"
          />

          {threadMode === 'single' && (
            <div className="absolute bottom-6 left-8 right-8 bg-rose-950/80 backdrop-blur-md border border-rose-500/50 rounded-2xl p-3 flex items-center gap-3 text-rose-200 text-xs animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold">Main Thread Bottleneck:</span> ฟิสิกส์ทั้งหมดคำนวณบน Core 0 เพียงแกนเดียว ทำให้เฟรมเรตร่วงเหลือ {stats.fps} FPS และบล็อกอินพุตของผู้เล่น ขณะที่อีก 7 Cores ว่างเปล่าไม่ได้ทำอะไรเลย!
              </div>
            </div>
          )}
        </div>

        {/* Cores Monitor + Parameters */}
        <div className="space-y-4">
          {/* Telemetry Numbers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Performance</span>
              <span className="text-emerald-400 font-mono text-[11px] font-bold">{stats.speedupRatio}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Frame Rate</div>
                <div
                  className={`text-xl font-black font-mono mt-0.5 ${
                    stats.fps < 30 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {stats.fps} <span className="text-xs font-normal">FPS</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Compute Time</div>
                <div className="text-xl font-black font-mono text-cyan-400 mt-0.5">
                  {stats.computeTimeMs} <span className="text-xs font-normal">ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* CPU Cores Heatmap / Activity Bars */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>CPU Core Load Monitor (8 Cores)</span>
            </div>

            <div className="space-y-2">
              {coreLoads.map((load, index) => {
                const isCoreActive = threadMode === 'multithread' ? index < coreCount : index === 0;
                return (
                  <div key={index} className="space-y-0.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className={`${isCoreActive ? 'text-slate-300 font-bold' : 'text-slate-600'}`}>
                        Core #{index} {index === 0 ? '(Main Thread)' : '(Worker)'}
                      </span>
                      <span
                        className={`${
                          load > 85 ? 'text-rose-400 font-bold' : load > 20 ? 'text-cyan-400' : 'text-slate-500'
                        }`}
                      >
                        {load}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-200 ${
                          load > 85
                            ? 'bg-rose-500'
                            : load > 50
                            ? 'bg-amber-400'
                            : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                        }`}
                        style={{ width: `${load}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sliders */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>จำนวนอนุภาค (Particles)</span>
                <span className="font-mono text-cyan-400">{particleCount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="8000"
                step="500"
                value={particleCount}
                onChange={(e) => setParticleCount(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {threadMode === 'multithread' && (
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>จำนวน Worker Cores</span>
                  <span className="font-mono text-emerald-400">{coreCount} Cores</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 4, 8].map((cores) => (
                    <button
                      key={cores}
                      onClick={() => {
                        setCoreCount(cores);
                        sound.playClick(500);
                      }}
                      className={`py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                        coreCount === cores
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {cores} Cores
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
