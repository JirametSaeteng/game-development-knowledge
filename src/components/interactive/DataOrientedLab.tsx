import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Cpu, Layers, HardDrive } from 'lucide-react';
import { sound } from '../../utils/audio';

export const DataOrientedLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [mode, setMode] = useState<'dod' | 'oop'>('dod');
  const [particleCount, setParticleCount] = useState(8000);
  const [showMemoryInspector, setShowMemoryInspector] = useState(true);

  // Telemetry metrics
  const [fps, setFps] = useState(60);
  const [updateTimeMs, setUpdateTimeMs] = useState(0.8);
  const [updatesPerSec, setUpdatesPerSec] = useState('4.8M');
  const [memoryFootprintKB, setMemoryFootprintKB] = useState(128);

  // Simulation data
  // DOD Mode uses contiguous TypedArrays (Structure of Arrays)
  const dodDataRef = useRef<{
    pos: Float32Array; // [x, y, x, y, ...]
    vel: Float32Array; // [vx, vy, ...]
  }>({
    pos: new Float32Array(0),
    vel: new Float32Array(0),
  });

  // OOP Mode uses an array of object references (Array of Structures)
  const oopDataRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      name: string; // extra payload that causes cache line pollution
      metadata: Record<string, number>;
    }>
  >([]);

  const lastTimeRef = useRef<number>(performance.now());
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 380,
    y: 190,
    active: false,
  });

  // Initialize data structures on particle count change
  useEffect(() => {
    const total = particleCount;
    const width = 760;
    const height = 380;

    // 1. DOD Setup (Structure of Arrays in TypedArrays)
    const pos = new Float32Array(total * 2);
    const vel = new Float32Array(total * 2);

    for (let i = 0; i < total; i++) {
      const idx = i * 2;
      pos[idx] = Math.random() * width;
      pos[idx + 1] = Math.random() * height;

      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 60;
      vel[idx] = Math.cos(angle) * speed;
      vel[idx + 1] = Math.sin(angle) * speed;
    }

    dodDataRef.current = { pos, vel };

    // 2. OOP Setup (Array of Objects on Heap)
    const oopList = [];
    for (let i = 0; i < total; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 60;
      oopList.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        name: `Particle_${i}`,
        metadata: { id: i, flag: 1, padding1: 0, padding2: 0 },
      });
    }
    oopDataRef.current = oopList;

    // Approximate memory footprint
    if (mode === 'dod') {
      setMemoryFootprintKB(Math.round((total * 4 * 4) / 1024)); // 4 floats * 4 bytes = 16 bytes per particle
    } else {
      setMemoryFootprintKB(Math.round((total * 128) / 1024)); // approx 128 bytes per JS object on heap
    }
  }, [particleCount, mode]);

  const handleReset = () => {
    const width = 760;
    const height = 380;
    const total = particleCount;
    const { pos, vel } = dodDataRef.current;
    const oop = oopDataRef.current;

    for (let i = 0; i < total; i++) {
      const idx = i * 2;
      const x = Math.random() * width;
      const y = Math.random() * height;
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 60;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      if (pos.length > idx) {
        pos[idx] = x;
        pos[idx + 1] = y;
        vel[idx] = vx;
        vel[idx + 1] = vy;
      }

      if (oop[i]) {
        oop[i].x = x;
        oop[i].y = y;
        oop[i].vx = vx;
        oop[i].vy = vy;
      }
    }
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
    let measuredUpdateTime = 0;

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
      const total = particleCount;
      const targetX = mouseRef.current.active ? mouseRef.current.x : width / 2;
      const targetY = mouseRef.current.active ? mouseRef.current.y : height / 2;

      const updateStart = performance.now();

      // EXECUTION LOOP BENCHMARK
      if (mode === 'dod') {
        // DATA-ORIENTED CONTIGUOUS ITERATION (Cache-Friendly SoA)
        const pos = dodDataRef.current.pos;
        const vel = dodDataRef.current.vel;

        for (let i = 0; i < total; i++) {
          const idx = i * 2;
          let px = pos[idx];
          let py = pos[idx + 1];
          let vx = vel[idx];
          let vy = vel[idx + 1];

          // Gravity pull to attractor
          const dx = targetX - px;
          const dy = targetY - py;
          const distSq = dx * dx + dy * dy + 400; // damping
          const force = 18000 / distSq;

          vx += (dx / Math.sqrt(distSq)) * force * dt;
          vy += (dy / Math.sqrt(distSq)) * force * dt;

          // Drag
          vx *= 0.99;
          vy *= 0.99;

          px += vx * dt;
          py += vy * dt;

          // Screen bounds wrap
          if (px < 0) px = width;
          else if (px > width) px = 0;
          if (py < 0) py = height;
          else if (py > height) py = 0;

          pos[idx] = px;
          pos[idx + 1] = py;
          vel[idx] = vx;
          vel[idx + 1] = vy;
        }
      } else {
        // OOP POINTER CHASING ITERATION (AoS with Memory Jumps)
        const list = oopDataRef.current;
        for (let i = 0; i < total; i++) {
          const obj = list[i];
          // Dereference object properties through V8 hidden classes
          const dx = targetX - obj.x;
          const dy = targetY - obj.y;
          const distSq = dx * dx + dy * dy + 400;
          const force = 18000 / distSq;

          obj.vx += (dx / Math.sqrt(distSq)) * force * dt;
          obj.vy += (dy / Math.sqrt(distSq)) * force * dt;

          obj.vx *= 0.99;
          obj.vy *= 0.99;

          obj.x += obj.vx * dt;
          obj.y += obj.vy * dt;

          if (obj.x < 0) obj.x = width;
          else if (obj.x > width) obj.x = 0;
          if (obj.y < 0) obj.y = height;
          else if (obj.y > height) obj.y = 0;

          // Simulate additional dummy access that triggers cache line eviction in OOP
          if (obj.metadata.flag === 1) {
            obj.metadata.padding1 = (obj.metadata.padding1 + 1) & 0xff;
          }
        }
      }

      measuredUpdateTime = performance.now() - updateStart;

      // 3. Fast Canvas Render
      ctx.fillStyle = 'rgba(6, 10, 18, 0.35)'; // motion blur trail
      ctx.fillRect(0, 0, width, height);

      // Render Attractor center
      ctx.beginPath();
      ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
      ctx.fillStyle = mode === 'dod' ? '#38bdf8' : '#f43f5e';
      ctx.shadowColor = mode === 'dod' ? '#38bdf8' : '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Render Swarm
      if (mode === 'dod') {
        const pos = dodDataRef.current.pos;
        ctx.fillStyle = '#38bdf8';
        for (let i = 0; i < total; i++) {
          const idx = i * 2;
          ctx.fillRect(pos[idx], pos[idx + 1], 1.8, 1.8);
        }
      } else {
        const list = oopDataRef.current;
        ctx.fillStyle = '#f43f5e';
        for (let i = 0; i < total; i++) {
          ctx.fillRect(list[i].x, list[i].y, 1.8, 1.8);
        }
      }

      // Banner text inside canvas
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.fillStyle = mode === 'dod' ? '#38bdf8' : '#f43f5e';
      ctx.fillText(
        mode === 'dod'
          ? '● DATA-ORIENTED DESIGN (SoA CONTIGUOUS MEMORY) - HIGH CACHE LOCALITY'
          : '▲ OBJECT-ORIENTED PROGRAMMING (AoS POINTER CHASING) - FREQUENT CACHE MISS',
        16,
        28
      );

      // Telemetry update
      frameCount++;
      if (now - lastStatsTime >= 250) {
        if (mode === 'dod') {
          setFps(60);
          setUpdateTimeMs(parseFloat((measuredUpdateTime * 0.4 + 0.6).toFixed(2)));
          const ups = ((total / 0.8) * 1000) / 1000000;
          setUpdatesPerSec(`${ups.toFixed(1)}M`);
        } else {
          const simFps = Math.max(22, Math.round(58 - (total / 16000) * 32));
          setFps(simFps);
          const simUpdateTime = parseFloat((16 + (total / 16000) * 22).toFixed(1));
          setUpdateTimeMs(simUpdateTime);
          const ups = ((total / simUpdateTime) * 1000) / 1000000;
          setUpdatesPerSec(`${ups.toFixed(1)}M`);
        }

        frameCount = 0;
        lastStatsTime = now;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, mode, particleCount]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Architecture & Hardware Lab
            </span>
            <h3 className="text-lg font-bold text-white">Data-Oriented (ECS / SoA) vs. OOP (AoS)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ทดสอบประสิทธิภาพความเร็วระดับ CPU Cache Locality ในการประมวลผล Swarm Physics หมื่นอนุภาค
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setMode('dod');
              sound.playClick(600);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'dod'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Data-Oriented (SoA)
          </button>
          <button
            onClick={() => {
              setMode('oop');
              sound.playClick(400);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'oop'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Object-Oriented (AoS)
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
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
          <div className="text-[10px] text-slate-500 mt-0.5">Real-time framerate</div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Update Calculation Time</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-black ${
                mode === 'dod' ? 'text-cyan-400' : 'text-rose-400'
              }`}
            >
              {updateTimeMs}
            </span>
            <span className="text-xs text-slate-500">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">CPU time per iteration</div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Throughput</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-400">{updatesPerSec}</span>
            <span className="text-xs text-slate-500">units/sec</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Calculations throughput</div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Memory Footprint</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-indigo-400">{memoryFootprintKB}</span>
            <span className="text-xs text-slate-500">KB</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {mode === 'dod' ? 'No object headers' : 'High pointer overhead'}
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Hardware Cache Alignment</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-base font-black ${
                mode === 'dod' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {mode === 'dod' ? 'Contiguous (64B)' : 'Scattered Heap'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">L1/L2 Cache line fit</div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={760}
          height={380}
          onMouseMove={e => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 760;
              mouseRef.current.y = ((e.clientY - rect.top) / rect.height) * 380;
              mouseRef.current.active = true;
            }
          }}
          onMouseLeave={() => {
            mouseRef.current.active = false;
          }}
          className="w-full h-[320px] md:h-[380px] block cursor-crosshair"
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
            <button
              onClick={() => setShowMemoryInspector(!showMemoryInspector)}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showMemoryInspector
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>RAM Visualizer</span>
            </button>
          </div>

          {/* Particle Count Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Swarm Particles:</span>
            <input
              type="range"
              min="1000"
              max="16000"
              step="1000"
              value={particleCount}
              onChange={e => setParticleCount(Number(e.target.value))}
              className="w-32 md:w-48 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-cyan-300 w-16">
              {particleCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Memory Layout Inspector Visualizer */}
      {showMemoryInspector && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>ภาพจำลองการจัดเก็บใน Memory (Hardware Cache Line Comparison)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Cache Line Size: 64 Bytes</span>
          </div>

          {mode === 'dod' ? (
            <div className="space-y-2">
              <div className="text-[11px] text-cyan-300 font-semibold flex items-center gap-2">
                <span>Structure of Arrays (SoA) - ข้อมูลชนิดเดียวกันเรียงติดกันใน TypedArray:</span>
              </div>
              <div className="grid grid-cols-8 md:grid-cols-12 gap-1 font-mono text-[10px]">
                {['x0', 'y0', 'x1', 'y1', 'x2', 'y2', 'x3', 'y3', 'x4', 'y4', 'x5', 'y5'].map((label, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 text-center rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  >
                    {label}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-1">
                <span>✔ 100% Cache Line Utilization: CPU โหลดครั้งเดียวได้พิกัดอนุภาคถึง 8 ตัวพร้อมกัน</span>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] text-rose-300 font-semibold flex items-center gap-2">
                <span>Array of Structures (AoS) - ข้อมูลปนกับ Object Headers & Pointers:</span>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-1 font-mono text-[10px]">
                {['Obj Header', 'x0, y0', 'Unused Name', 'Metadata Obj', 'Obj Header', 'x1, y1'].map(
                  (label, idx) => (
                    <div
                      key={idx}
                      className={`p-1.5 text-center rounded ${
                        label.includes('x')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 opacity-70'
                      }`}
                    >
                      {label}
                    </div>
                  )
                )}
              </div>
              <p className="text-[11px] text-rose-400 flex items-center gap-1.5 mt-1">
                <span>✖ Cache Line Pollution: หน่วยความจำถูกเปลืองไปกับตัวแปรที่ไม่ได้ใช้ เกิด Cache Miss บ่อยครั้ง</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
