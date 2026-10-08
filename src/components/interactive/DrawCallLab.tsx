import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Zap, AlertTriangle, Layers } from 'lucide-react';
import { sound } from '../../utils/audio';

interface Asteroid {
  x: number;
  y: number;
  size: number;
  angle: number;
  rotSpeed: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitAngle: number;
  vertices: Array<{ x: number; y: number }>;
}

export const DrawCallLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [mode, setMode] = useState<'instanced' | 'unbatched'>('instanced');
  const [asteroidCount, setAsteroidCount] = useState(1500);

  // Telemetry metrics
  const [fps, setFps] = useState(60);
  const [drawCallsCount, setDrawCallsCount] = useState(1);
  const [cpuDispatchMs, setCpuDispatchMs] = useState(0.4);
  const [gpuLoadPercent, setGpuLoadPercent] = useState('14%');

  const asteroidsRef = useRef<Asteroid[]>([]);
  const lastTimeRef = useRef<number>(performance.now());

  // Initialize Asteroids
  useEffect(() => {
    const list: Asteroid[] = [];
    const width = 760;
    const height = 380;
    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < asteroidCount; i++) {
      const orbitRadius = 40 + Math.random() * (Math.min(cx, cy) - 50);
      const orbitAngle = Math.random() * Math.PI * 2;
      const size = 3 + Math.random() * 5;

      // Generate random asteroid polygon vertices
      const verts: Array<{ x: number; y: number }> = [];
      const numVerts = 6;
      for (let v = 0; v < numVerts; v++) {
        const theta = (v / numVerts) * Math.PI * 2;
        const r = size * (0.7 + Math.random() * 0.6);
        verts.push({
          x: Math.cos(theta) * r,
          y: Math.sin(theta) * r,
        });
      }

      list.push({
        x: cx + Math.cos(orbitAngle) * orbitRadius,
        y: cy + Math.sin(orbitAngle) * orbitRadius,
        size,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 2,
        orbitRadius,
        orbitSpeed: (0.15 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : -1),
        orbitAngle,
        vertices: verts,
      });
    }
    asteroidsRef.current = list;
    setDrawCallsCount(mode === 'instanced' ? 1 : asteroidCount);
  }, [asteroidCount, mode]);

  const handleReset = () => {
    asteroidsRef.current.forEach((a: Asteroid) => {
      a.orbitAngle = Math.random() * Math.PI * 2;
      a.angle = Math.random() * Math.PI * 2;
    });
    sound.playClick(600);
  };

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    let lastStatsTime = performance.now();

    const loop = (now: number) => {
      if (!isRunning) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const rawDt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      const dt = Math.min(rawDt, 0.05);

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const list = asteroidsRef.current;
      const total = list.length;

      // Update positions
      for (let i = 0; i < total; i++) {
        const a = list[i];
        a.orbitAngle += (a.orbitSpeed / (a.orbitRadius * 0.04)) * dt;
        a.angle += a.rotSpeed * dt;
        a.x = cx + Math.cos(a.orbitAngle) * a.orbitRadius;
        a.y = cy + Math.sin(a.orbitAngle) * a.orbitRadius;
      }

      // RENDER SIMULATION & CPU DRIVER DISPATCH MEASUREMENT

      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Draw Galaxy Core
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      grad.addColorStop(0.5, 'rgba(99, 102, 241, 0.15)');
      grad.addColorStop(1, 'rgba(6, 10, 18, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      if (mode === 'unbatched') {
        // UNBATCHED INDIVIDUAL DRAW CALLS
        // Simulates CPU Driver State Changes overhead:
        // In real OpenGL/DirectX, every individual draw call incurs pipeline validation
        let driverSimulatedDelay = 0;
        const delayPerCall = 0.0065; // ~6.5 microseconds per driver validation call
        const artificialCycles = Math.min(total * delayPerCall, 24);
        const spinStart = performance.now();
        while (performance.now() - spinStart < artificialCycles) {
          driverSimulatedDelay++;
        }

        ctx.fillStyle = '#f43f5e';
        for (let i = 0; i < total; i++) {
          const a = list[i];
          ctx.save();
          ctx.translate(a.x, a.y);
          ctx.rotate(a.angle);
          ctx.beginPath();
          const verts = a.vertices;
          for (let v = 0; v < verts.length; v++) {
            if (v === 0) ctx.moveTo(verts[v].x, verts[v].y);
            else ctx.lineTo(verts[v].x, verts[v].y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      } else {
        // GPU INSTANCED BATCHED DRAW CALL (1 Draw Call)
        // 1 single combined buffer stream
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        for (let i = 0; i < total; i++) {
          const a = list[i];
          const cos = Math.cos(a.angle);
          const sin = Math.sin(a.angle);
          const verts = a.vertices;

          for (let v = 0; v < verts.length; v++) {
            const rx = verts[v].x * cos - verts[v].y * sin + a.x;
            const ry = verts[v].x * sin + verts[v].y * cos + a.y;
            if (v === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
          }
          ctx.closePath();
        }
        ctx.fill();
      }

      // Text in canvas
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.fillStyle = mode === 'instanced' ? '#38bdf8' : '#f43f5e';
      ctx.fillText(
        mode === 'instanced'
          ? `● GPU INSTANCED BATCHING (1 DRAW CALL) - ZERO CPU DRIVER BOTTLENECK`
          : `▲ UNBATCHED RENDERING (${total.toLocaleString()} SEPARATE DRAW CALLS) - CPU OVERHEAD`,
        16,
        28
      );

      // Telemetry update
      frameCount++;
      if (now - lastStatsTime >= 250) {
        if (mode === 'instanced') {
          setFps(60);
          setCpuDispatchMs(0.4);
          setGpuLoadPercent('18%');
        } else {
          const simFps = Math.max(19, Math.round(58 - (total / 3500) * 36));
          setFps(simFps);
          const simDispatch = parseFloat((14 + (total / 3500) * 24).toFixed(1));
          setCpuDispatchMs(simDispatch);
          setGpuLoadPercent('82% (Waiting for CPU)');
        }

        setDrawCallsCount(mode === 'instanced' ? 1 : total);
        frameCount = 0;
        lastStatsTime = now;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, mode, asteroidCount]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Rendering & Graphics Lab
            </span>
            <h3 className="text-lg font-bold text-white">GPU Instancing vs. Individual Draw Calls</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            จำลองคอขวด CPU Command Buffer เมื่อสั่งวาดวัตถุในอวกาศนับพันชิ้น
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setMode('instanced');
              sound.playClick(600);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'instanced'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            GPU Instancing (1 Call)
          </button>
          <button
            onClick={() => {
              setMode('unbatched');
              sound.playClick(400);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'unbatched'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Unbatched ({asteroidCount} Calls)
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Draw Calls Dispatched</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-black ${
                mode === 'instanced' ? 'text-cyan-400' : 'text-rose-400'
              }`}
            >
              {drawCallsCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">calls</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {mode === 'instanced' ? 'Batched in 1 GPU command' : 'Driver state change per object'}
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">CPU Render Dispatch Time</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-black ${
                cpuDispatchMs < 4 ? 'text-emerald-400' : 'text-rose-500'
              }`}
            >
              {cpuDispatchMs}
            </span>
            <span className="text-xs text-slate-500">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">CPU Driver Overhead</div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Frame Rate</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-black ${
                fps >= 55 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-rose-500'
              }`}
            >
              {fps}
            </span>
            <span className="text-xs text-slate-500">FPS</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Target: 60 FPS</div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Pipeline Status</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-base font-black ${
                mode === 'instanced' ? 'text-cyan-400' : 'text-amber-400'
              }`}
            >
              {mode === 'instanced' ? 'Optimal Pipeline' : 'CPU Bottleneck'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">GPU Load: {gpuLoadPercent}</div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={760}
          height={380}
          className="w-full h-[320px] md:h-[380px] block"
        />

        {/* Bottom Interactive Toolbar */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsRunning(!isRunning);
                sound.playClick(700);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title={isRunning ? 'Pause' : 'Play'}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Asteroids Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Asteroids Count:</span>
            <input
              type="range"
              min="300"
              max="3500"
              step="200"
              value={asteroidCount}
              onChange={e => setAsteroidCount(Number(e.target.value))}
              className="w-32 md:w-48 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-cyan-300 w-16">
              {asteroidCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Explanatory Banner */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3 text-xs text-slate-300">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-white">หัวใจสำคัญของ Draw Calls:</span>{' '}
          ปัญหาเกมแล็กส่วนใหญ่ไม่ได้เกิดจาก GPU วาดสามเหลี่ยมไม่ไหว แต่เกิดจาก <strong>CPU Driver Overhead</strong>{' '}
          ที่ต้องส่ง State change ทีละครั้ง เมื่อเปลี่ยนมาใช้ <strong>GPU Instancing</strong> ข้อมูล Transform Matrix
          ของวัตถุทั้ง {asteroidCount.toLocaleString()} ชิ้นจะถูกส่งไปใน Command เดียว ทำให้ CPU เหลือภาระเพียงไม่ถึง 1 ms!
        </div>
      </div>
    </div>
  );
};
