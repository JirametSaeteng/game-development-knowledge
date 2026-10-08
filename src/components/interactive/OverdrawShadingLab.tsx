import React, { useState, useEffect, useRef } from 'react';
import { Flame, ShieldCheck, AlertOctagon, Layers, Palette } from 'lucide-react';
import { sound } from '../../utils/audio';

interface QuadLayer {
  x: number;
  y: number;
  width: number;
  height: number;
  depthZ: number; // 0 (near) to 1 (far)
  opacity: number;
  color: string;
}

export const OverdrawShadingLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [viewMode, setViewMode] = useState<'normal' | 'heatmap'>('heatmap');
  const [sortingMode, setSortingMode] = useState<'back-to-front' | 'front-to-back'>('front-to-back');
  const [earlyZEnabled, setEarlyZEnabled] = useState<boolean>(true);
  const [particleLayerCount, setParticleLayerCount] = useState<number>(12);

  // Telemetry
  const [stats, setStats] = useState({
    fps: 60,
    peakOverdraw: '1.2x',
    avgOverdraw: '1.1x',
    fragmentsShaded: 45000,
    discardedEarlyZ: 280000,
    fillRateMPixels: 28,
  });

  const layersRef = useRef<QuadLayer[]>([]);

  // Generate overlapping quad layers
  useEffect(() => {
    const list: QuadLayer[] = [];
    const colors = ['#38bdf8', '#818cf8', '#ec4899', '#f59e0b', '#10b981'];

    for (let i = 0; i < particleLayerCount; i++) {
      const w = 240 + (i % 4) * 30;
      const h = 200 + (i % 3) * 35;
      list.push({
        x: 180 + Math.sin(i * 0.8) * 60,
        y: 110 + Math.cos(i * 0.8) * 45,
        width: w,
        height: h,
        depthZ: i / particleLayerCount, // 0 is front, 1 is back
        opacity: 0.65,
        color: colors[i % colors.length],
      });
    }
    layersRef.current = list;
  }, [particleLayerCount]);

  // Main Render Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Sort layers according to mode
      const sorted = [...layersRef.current];
      if (sortingMode === 'front-to-back') {
        sorted.sort((a, b) => a.depthZ - b.depthZ); // near first
      } else {
        sorted.sort((a, b) => b.depthZ - a.depthZ); // far first (painters algorithm)
      }

      // If Early-Z is enabled and sorting is Front-to-Back:
      // Fragments behind already-drawn opaque regions are culled!
      const isOptimized = earlyZEnabled && sortingMode === 'front-to-back';

      if (viewMode === 'heatmap') {
        // Render Overdraw Accumulator Heatmap
        // In Game Engines: Each write adds 0.15 to alpha.
        // Blending mode: 'lighter' (additive)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        sorted.forEach((layer, idx) => {
          // If optimized, only frontmost layer shades full fragment
          const intensity = isOptimized ? (idx === 0 ? 0.35 : 0.05) : 0.22;
          ctx.fillStyle = `rgba(180, 20, 60, ${intensity})`; // red/white heat accumulation

          // Soft rounded smoke / particle rect
          ctx.beginPath();
          ctx.roundRect(layer.x, layer.y, layer.width, layer.height, 24);
          ctx.fill();

          // Border glow
          ctx.strokeStyle = `rgba(255, 100, 100, ${intensity * 1.5})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        });

        ctx.restore();

        // Overlay Color Guide bar inside canvas
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(15, height - 36, 320, 24);
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(15, height - 36, 320, 24);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText('Overdraw Scale: 1x (Cool) ➔ 12x+ (Heat Red/White)', 24, height - 20);
      } else {
        // Normal Shaded View
        sorted.forEach((layer) => {
          ctx.save();
          ctx.globalAlpha = layer.opacity;
          ctx.fillStyle = layer.color;
          ctx.beginPath();
          ctx.roundRect(layer.x, layer.y, layer.width, layer.height, 24);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        });
      }

      // Telemetry calculation
      const peak = isOptimized ? '1.4x' : `${(particleLayerCount * 0.95).toFixed(1)}x`;
      const avg = isOptimized ? '1.1x' : `${(particleLayerCount * 0.62).toFixed(1)}x`;
      const fps = isOptimized
        ? 60
        : Math.max(19, Math.floor(60 - (particleLayerCount / 15) * 38));
      const shaded = isOptimized ? 32000 : Math.floor(particleLayerCount * 42000);
      const discarded = isOptimized ? Math.floor(particleLayerCount * 36000) : 0;

      setStats({
        fps,
        peakOverdraw: peak,
        avgOverdraw: avg,
        fragmentsShaded: shaded,
        discardedEarlyZ: discarded,
        fillRateMPixels: parseFloat((shaded / 1000).toFixed(1)),
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [viewMode, sortingMode, earlyZEnabled, particleLayerCount]);

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Shader Overdraw & Early-Z Rejection Heatmap</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            เครื่องมือจำลอง Overdraw Debug Mode (เหมือนใน Unreal Engine & Unity Frame Debugger)
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setViewMode('normal');
              sound.playClick(400);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'normal'
                ? 'bg-slate-700 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Normal Shading</span>
          </button>

          <button
            onClick={() => {
              setViewMode('heatmap');
              sound.playClick(600);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'heatmap'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black shadow-lg shadow-rose-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Overdraw Heatmap Mode</span>
          </button>
        </div>
      </div>

      {/* Main Simulation + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-3xl p-4 relative overflow-hidden flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-2">
            <span className="font-mono text-[11px] text-cyan-400">
              {viewMode === 'heatmap' ? '🔥 สีแดง/ขาวยิ่งสว่าง = พิกเซลถูกวาดทับซ้ำๆ เสียแรง GPU สูงมาก' : '🎨 โหมดการแสดงผลสีแบบปกติ'}
            </span>
            <span className="text-slate-300 font-mono text-[11px]">
              Peak Overdraw: <strong className={stats.peakOverdraw === '1.4x' ? 'text-emerald-400' : 'text-rose-400'}>{stats.peakOverdraw}</strong>
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={600}
            height={440}
            className="rounded-2xl border border-slate-800/80 bg-slate-950 max-w-full shadow-inner"
          />

          {/* Bad Overdraw Warning Banner */}
          {stats.fps < 30 && (
            <div className="absolute bottom-6 left-8 right-8 bg-rose-950/80 backdrop-blur-md border border-rose-500/50 rounded-2xl p-3 flex items-center gap-3 text-rose-200 text-xs animate-pulse">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold">Fragment Shader Fill-Rate Bottleneck:</span> เลเยอร์โปร่งใสซ้อนทับกันมากถึง {particleLayerCount} ชั้นโดยไม่มี Early-Z ทำให้ GPU ต้องคำนวณสีทับพิกเซลเดิมซ้ำๆ จนเฟรมเรตร่วงเหลือ {stats.fps} FPS!
              </div>
            </div>
          )}
        </div>

        {/* Telemetry & Architecture Options */}
        <div className="space-y-4">
          {/* Performance Metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Rendering Telemetry
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
                <div className="text-[10px] text-slate-400">Avg Overdraw</div>
                <div className="text-xl font-black font-mono text-cyan-400 mt-0.5">
                  {stats.avgOverdraw}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Fragments Shaded:</span>
                <span className="font-mono text-white font-bold">{stats.fragmentsShaded.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Early-Z Discarded:</span>
                <span className="font-mono text-emerald-400 font-bold">-{stats.discardedEarlyZ.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pixel Fill Cost:</span>
                <span className="font-mono text-amber-400 font-bold">{stats.fillRateMPixels} kpix</span>
              </div>
            </div>
          </div>

          {/* GPU Architecture Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pipeline Optimizations</span>
            </div>

            {/* Sorting Order */}
            <div>
              <div className="text-xs text-slate-300 mb-1.5 font-semibold">
                ทิศทางการเรียงลำดับ Mesh (Mesh Sorting):
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSortingMode('front-to-back');
                    sound.playClick(600);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    sortingMode === 'front-to-back'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Front-to-Back (หน้าไปหลัง)
                </button>
                <button
                  onClick={() => {
                    setSortingMode('back-to-front');
                    sound.playClick(400);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    sortingMode === 'back-to-front'
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Back-to-Front (หลังไปหน้า)
                </button>
              </div>
            </div>

            {/* Early-Z Rejection Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Early-Z Rejection</span>
                </div>
                <div className="text-[10px] text-slate-400">เช็ค Depth Buffer ก่อนรัน Shader</div>
              </div>
              <input
                type="checkbox"
                checked={earlyZEnabled}
                onChange={(e) => {
                  setEarlyZEnabled(e.target.checked);
                  sound.playClick(500);
                }}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Layer Count Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>จำนวนเลเยอร์ซ้อนทับ (Alpha Layers)</span>
                <span className="font-mono text-cyan-400">{particleLayerCount} ชั้น</span>
              </div>
              <input
                type="range"
                min="4"
                max="20"
                value={particleLayerCount}
                onChange={(e) => setParticleLayerCount(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
