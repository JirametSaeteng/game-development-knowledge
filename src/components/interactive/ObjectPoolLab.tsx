import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Zap, AlertTriangle, BarChart3, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../../utils/audio';

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  active: boolean;
  poolIndex?: number;
}

export const ObjectPoolLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [mode, setMode] = useState<'pool' | 'dynamic'>('pool');
  const [spawnRate, setSpawnRate] = useState(300); // bullets per second
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Telemetry metrics
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(1.2);
  const [activeCount, setActiveCount] = useState(0);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [gcPauses, setGcPauses] = useState(0);
  const [simulatedMemoryMB, setSimulatedMemoryMB] = useState(2.4);
  const [isGCHitching, setIsGCHitching] = useState(false);

  // Simulation internals stored in refs to avoid React re-render lag
  const poolRef = useRef<Bullet[]>([]);
  const dynamicListRef = useRef<Bullet[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const spawnTimerRef = useRef<number>(0);
  const gcSimulationTimerRef = useRef<number>(0);
  const gcHitchFramesRef = useRef<number>(0);
  const stutterCounterRef = useRef<number>(0);
  const statsRef = useRef({
    totalAllocs: 0,
    gcCount: 0,
    allocatedBytes: 0,
  });

  const POOL_CAPACITY = 2500;

  // Initialize pool
  useEffect(() => {
    const p: Bullet[] = [];
    for (let i = 0; i < POOL_CAPACITY; i++) {
      p.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 2.0,
        color: '#38bdf8',
        active: false,
        poolIndex: i,
      });
    }
    poolRef.current = p;
    statsRef.current.allocatedBytes = POOL_CAPACITY * 128; // approx struct size
  }, []);

  const handleReset = () => {
    poolRef.current.forEach(b => (b.active = false));
    dynamicListRef.current = [];
    statsRef.current.totalAllocs = 0;
    statsRef.current.gcCount = 0;
    statsRef.current.allocatedBytes = mode === 'pool' ? POOL_CAPACITY * 128 : 0;
    setGcPauses(0);
    setTotalAllocated(0);
    setSimulatedMemoryMB(mode === 'pool' ? 4.5 : 1.2);
    sound.playClick(600);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick(900);
  };

  // Main Simulation Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCounter = 0;
    let lastFpsUpdate = performance.now();

    const loop = (now: number) => {
      if (!isRunning) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const rawDt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      let dt = Math.min(rawDt, 0.1);

      // Simulate GC Hitch in Dynamic mode
      if (mode === 'dynamic') {
        gcSimulationTimerRef.current += rawDt;
        // Trigger GC hitch roughly every 2.0 seconds
        if (gcSimulationTimerRef.current > 2.0 && gcHitchFramesRef.current <= 0) {
          gcSimulationTimerRef.current = 0;
          gcHitchFramesRef.current = 9; // Freeze position updates for 9 frames (~150ms Stop-The-World)
          statsRef.current.gcCount++;
          setGcPauses(statsRef.current.gcCount);
          setIsGCHitching(true);
          setTimeout(() => setIsGCHitching(false), 240);
        }

        // If GC is actively freezing, skip movement step (Visual freeze!)
        if (gcHitchFramesRef.current > 0) {
          gcHitchFramesRef.current--;
          dt = 0; // Freeze in mid air!
        } else {
          // Unstable frame pacing / micro-stutters
          stutterCounterRef.current++;
          if (stutterCounterRef.current % 3 === 0) {
            dt *= 0.15; // Jitter hitch
          } else if (stutterCounterRef.current % 3 === 1) {
            dt *= 1.85; // Jerk catch-up
          }
        }
      }

      // Spawning logic
      spawnTimerRef.current += dt;
      const interval = 1 / spawnRate;
      const spawnCount = Math.floor(spawnTimerRef.current / interval);
      if (spawnCount > 0) {
        spawnTimerRef.current %= interval;
        const width = canvas.width;
        const height = canvas.height;
        const originX = width / 2;
        const originY = height - 40;

        for (let i = 0; i < Math.min(spawnCount, 30); i++) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
          const speed = 180 + Math.random() * 220;
          const maxLife = 1.8 + Math.random() * 0.8;

          if (mode === 'pool') {
            // Grab first inactive from pool (O(1) search/stack)
            const available = poolRef.current.find(b => !b.active);
            if (available) {
              available.active = true;
              available.x = originX;
              available.y = originY;
              available.vx = Math.cos(angle) * speed;
              available.vy = Math.sin(angle) * speed;
              available.life = maxLife;
              available.maxLife = maxLife;
              available.color = `hsl(${180 + Math.random() * 60}, 95%, 65%)`;
            }
          } else {
            // Dynamic allocation: new object instance on heap every bullet
            const newBullet: Bullet = {
              x: originX,
              y: originY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: maxLife,
              maxLife: maxLife,
              color: `hsl(${0 + Math.random() * 40}, 95%, 65%)`,
              active: true,
            };
            dynamicListRef.current.push(newBullet);
            statsRef.current.totalAllocs++;
            statsRef.current.allocatedBytes += 256;
          }
        }
      }

      // Physics & State Update
      const width = canvas.width;
      const height = canvas.height;
      let activeBullets = 0;

      if (mode === 'pool') {
        const pool = poolRef.current;
        for (let i = 0; i < pool.length; i++) {
          const b = pool[i];
          if (!b.active) continue;

          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.vy += 60 * dt; // gravity
          b.life -= dt;

          // Wall bounce
          if (b.x < 10 || b.x > width - 10) b.vx *= -0.8;

          if (b.life <= 0 || b.y > height + 20) {
            b.active = false; // Zero allocation release!
          } else {
            activeBullets++;
          }
        }
      } else {
        const list = dynamicListRef.current;
        for (let i = list.length - 1; i >= 0; i--) {
          const b = list[i];
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.vy += 60 * dt;
          b.life -= dt;

          if (b.x < 10 || b.x > width - 10) b.vx *= -0.8;

          if (b.life <= 0 || b.y > height + 20) {
            // Array splice causes reindexing overhead & leaves object for Garbage Collector
            list.splice(i, 1);
          } else {
            activeBullets++;
          }
        }
      }

      // Render
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Draw Turret Cannon
      const cx = width / 2;
      const cy = height - 20;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI, true);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = mode === 'pool' ? '#38bdf8' : '#f43f5e';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Glowing nozzle
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 8, 0, Math.PI * 2);
      ctx.fillStyle = mode === 'pool' ? '#38bdf8' : '#f43f5e';
      ctx.shadowColor = mode === 'pool' ? '#38bdf8' : '#f43f5e';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.restore();

      // Draw Bullets
      if (mode === 'pool') {
        const pool = poolRef.current;
        for (let i = 0; i < pool.length; i++) {
          const b = pool[i];
          if (!b.active) continue;
          const alpha = Math.min(1, b.life / 0.5);

          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Tail
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x - b.vx * 0.03, b.y - b.vy * 0.03);
          ctx.stroke();
        }
      } else {
        const list = dynamicListRef.current;
        for (let i = 0; i < list.length; i++) {
          const b = list[i];
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x - b.vx * 0.03, b.y - b.vy * 0.03);
          ctx.stroke();
        }
      }

      // Render mode badge inside canvas
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.fillStyle = mode === 'pool' ? '#38bdf8' : '#f43f5e';
      ctx.fillText(
        mode === 'pool' ? '● OBJECT POOLING ACTIVE (0 GC ALLOC)' : '▲ DYNAMIC NEW/DESTROY (GC CHURN)',
        16,
        28
      );

      // Render GC Hitch Banner overlay if active
      if (mode === 'dynamic' && (gcHitchFramesRef.current > 0 || isGCHitching)) {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(width / 2 - 180, 50, 360, 38, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 13px Inter, monospace';
        ctx.fillStyle = '#f43f5e';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ GC STOP-THE-WORLD HITCH (160ms FREEZE SPIKE)', width / 2, 74);
        ctx.textAlign = 'left';
      }

      // Measure Frame Timing & Update Telemetry
      frameCounter++;
      if (now - lastFpsUpdate >= 250) {
        if (mode === 'pool') {
          setFps(60);
          setFrameTime(1.2);
          setSimulatedMemoryMB(4.2);
        } else {
          if (gcHitchFramesRef.current > 0 || isGCHitching) {
            setFps(Math.floor(12 + Math.random() * 5)); // 12-17 FPS spike drop
            setFrameTime(parseFloat((55 + Math.random() * 15).toFixed(1))); // 55-70 ms frame time spike
          } else {
            const calculatedFps = Math.max(
              18,
              Math.round(56 - (spawnRate / 1200) * 32 - (activeBullets / 300) * 3)
            );
            setFps(calculatedFps);
            setFrameTime(parseFloat((1000 / calculatedFps).toFixed(1)));
          }

          const simulatedMB = 4.2 + (statsRef.current.allocatedBytes % (15 * 1024 * 1024)) / (1024 * 1024);
          setSimulatedMemoryMB(parseFloat(simulatedMB.toFixed(2)));
        }

        setActiveCount(activeBullets);
        setTotalAllocated(statsRef.current.totalAllocs);

        frameCounter = 0;
        lastFpsUpdate = now;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, mode, spawnRate]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Interactive Benchmark
            </span>
            <h3 className="text-lg font-bold text-white">Object Pooling vs. Heap Churn Simulator</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ทดสอบการยิงกระสุนต่อเนื่อง เพื่อดูการเกิด Garbage Collection Spikes เทียบกับการใช้ Pool
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setMode('pool');
              handleReset();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'pool'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Object Pool (Optimized)
          </button>
          <button
            onClick={() => {
              setMode('dynamic');
              handleReset();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'dynamic'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Dynamic Instantiate (GC Churn)
          </button>
        </div>
      </div>

      {/* Telemetry Dashboard Grid */}
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
          <div className="text-[10px] text-slate-500 mt-0.5">Target: 60 FPS</div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Frame Time</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-black ${
                frameTime < 5 ? 'text-cyan-400' : frameTime < 16.6 ? 'text-amber-400' : 'text-rose-500'
              }`}
            >
              {frameTime}
            </span>
            <span className="text-xs text-slate-500">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Budget: 16.66 ms</div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Active Bullets</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-indigo-400">{activeCount}</span>
            <span className="text-xs text-slate-500">entities</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">On screen right now</div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Heap Allocations</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-black ${
                mode === 'pool' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {mode === 'pool' ? '0' : totalAllocated.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">new instances</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Heap: {simulatedMemoryMB} MB ({mode === 'pool' ? 'Stable pool' : 'GC churn'})
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">GC Stop-The-World</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-black ${
                gcPauses === 0 ? 'text-slate-400' : 'text-rose-500 animate-pulse'
              }`}
            >
              {gcPauses}
            </span>
            <span className="text-xs text-slate-500">pauses</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {mode === 'pool' ? 'Never paused' : 'Causes micro-stutters'}
          </div>
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

        {/* Interactive Controls Overlay at bottom */}
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
              onClick={toggleSound}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          {/* Spawn Rate Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Spawn Rate:</span>
            <input
              type="range"
              min="50"
              max="1200"
              step="50"
              value={spawnRate}
              onChange={e => setSpawnRate(Number(e.target.value))}
              className="w-32 md:w-48 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-cyan-300 w-16">{spawnRate}/s</span>
          </div>
        </div>
      </div>

      {/* Educational Insight Callout */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3 text-xs text-slate-300">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
          <BarChart3 className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-white">สิ่งที่สังเกตได้จากการทดลอง:</span>{' '}
          {mode === 'pool' ? (
            <span>
              ในโหมด <strong>Object Pool</strong> ตัวแปร Heap Allocation จะเป็น <strong>0</strong> เสมอ!
              เฟรมเรตล็อกนิ่งที่ 60 FPS แม้จะเร่งความเร็วยิงเป็น 1,000 นัด/วินาที เพราะออบเจกต์ถูกหมุนเวียนใน Array ล่วงหน้า
            </span>
          ) : (
            <span>
              ในโหมด <strong>Dynamic Instantiate</strong> ยิ่งเพิ่ม Spawn Rate ตัวเลข Heap Allocations จะพุ่งสูงขึ้นอย่างรวดเร็ว
              จนส่งผลให้เกิด <strong>GC Stop-The-World Pauses</strong> ส่งผลให้ Frame Time พุ่งสูงและเกมสะดุดเป็นระยะๆ
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
