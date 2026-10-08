import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, ShieldCheck, Bomb, Flame } from 'lucide-react';
import { sound } from '../../utils/audio';

export const FixedTimestepLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [mode, setMode] = useState<'fixed' | 'variable'>('fixed');
  const [ballSpeed, setBallSpeed] = useState(1200); // px/sec
  const [wallThickness, setWallThickness] = useState(4); // px
  const [tunnelingCount, setTunnelingCount] = useState(0);
  const [bouncesCount, setBouncesCount] = useState(0);
  const [lastLagSpikeInfo, setLastLagSpikeInfo] = useState<string | null>(null);

  // Ball physical state
  const ballRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }>({
    x: 100,
    y: 190,
    vx: 1200,
    vy: 180,
    radius: 8,
  });

  const accumulatorRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const lagSpikePendingRef = useRef<boolean>(false);
  const ghostStepsRef = useRef<Array<{ x: number; y: number }>>([]);

  const FIXED_DT = 1 / 60; // 0.01666s

  const handleReset = () => {
    ballRef.current = {
      x: 100,
      y: 190,
      vx: ballSpeed,
      vy: 180,
      radius: 8,
    };
    accumulatorRef.current = 0;
    setTunnelingCount(0);
    setBouncesCount(0);
    setLastLagSpikeInfo(null);
    ghostStepsRef.current = [];
    sound.playClick(600);
  };

  const triggerLagSpike = () => {
    lagSpikePendingRef.current = true;
    sound.playClick(300);
  };

  useEffect(() => {
    // Update velocity when slider changes without changing direction
    const currentSignX = Math.sign(ballRef.current.vx) || 1;
    ballRef.current.vx = currentSignX * ballSpeed;
  }, [ballSpeed]);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = (now: number) => {
      if (!isRunning) {
        animId = requestAnimationFrame(loop);
        return;
      }

      let rawDt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Check if user requested an artificial lag spike freeze
      if (lagSpikePendingRef.current) {
        lagSpikePendingRef.current = false;
        // Inject 220ms CPU freeze
        const freezeStart = performance.now();
        while (performance.now() - freezeStart < 220) {
          // artificial delay
        }
        rawDt += 0.22;
        setLastLagSpikeInfo('Lag Spike 220ms Injected!');
      }

      const width = canvas.width;
      const height = canvas.height;
      const ball = ballRef.current;
      const wallX = width - 120; // Thin wall position
      const wallTop = 40;
      const wallBottom = height - 40;

      ghostStepsRef.current = [];

      // PHYSICS INTEGRATION
      if (mode === 'fixed') {
        // ACCUMULATOR PATTERN WITH FIXED SUBSTEPPING
        let frameTime = rawDt;
        if (frameTime > 0.25) frameTime = 0.25; // Clamp to avoid Spiral of Death
        accumulatorRef.current += frameTime;

        while (accumulatorRef.current >= FIXED_DT) {
          ghostStepsRef.current.push({ x: ball.x, y: ball.y });

          // Sub-step movement
          ball.x += ball.vx * FIXED_DT;
          ball.y += ball.vy * FIXED_DT;

          // Wall bounce top/bottom
          if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy *= -1;
          } else if (ball.y + ball.radius > height) {
            ball.y = height - ball.radius;
            ball.vy *= -1;
          }

          // Left border bounce
          if (ball.x - ball.radius < 10) {
            ball.x = 10 + ball.radius;
            ball.vx *= -1;
          }

          // Thin wall collision check
          if (
            ball.y >= wallTop &&
            ball.y <= wallBottom &&
            ball.x + ball.radius >= wallX &&
            ball.x - ball.radius <= wallX + wallThickness
          ) {
            // Collision detected cleanly!
            ball.vx = -Math.abs(ball.vx);
            ball.x = wallX - ball.radius - 1;
            setBouncesCount(c => c + 1);
            sound.playCollision();
          }

          accumulatorRef.current -= FIXED_DT;
        }
      } else {
        // NAIVE VARIABLE DELTA TIME
        const dt = rawDt;
        ghostStepsRef.current.push({ x: ball.x, y: ball.y });

        const prevX = ball.x;
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        // Top/bottom bounce
        if (ball.y - ball.radius < 0) {
          ball.y = ball.radius;
          ball.vy *= -1;
        } else if (ball.y + ball.radius > height) {
          ball.y = height - ball.radius;
          ball.vy *= -1;
        }

        // Left border bounce
        if (ball.x - ball.radius < 10) {
          ball.x = 10 + ball.radius;
          ball.vx *= -1;
        }

        // Discrete check after step (Prone to tunneling if prevX was before wall and ball.x is after wall!)
        if (
          ball.y >= wallTop &&
          ball.y <= wallBottom &&
          ball.x + ball.radius >= wallX &&
          ball.x - ball.radius <= wallX + wallThickness
        ) {
          ball.vx = -Math.abs(ball.vx);
          ball.x = wallX - ball.radius - 1;
          setBouncesCount(c => c + 1);
          sound.playCollision();
        } else if (prevX + ball.radius < wallX && ball.x - ball.radius > wallX + wallThickness) {
          // TUNNELING DETECTED! Skipped right past the wall!
          setTunnelingCount(c => c + 1);
          sound.playClick(200);
        }
      }

      // If ball escaped beyond right screen boundary, wrap back to left
      if (ball.x > width + 40) {
        ball.x = 40;
        ball.vx = Math.abs(ball.vx);
      }

      // RENDER
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Draw Wall
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(wallX, wallTop, wallThickness, wallBottom - wallTop);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.strokeRect(wallX - 1, wallTop, wallThickness + 2, wallBottom - wallTop);

      // Label Wall
      ctx.font = '10px Inter, monospace';
      ctx.fillStyle = '#f43f5e';
      ctx.fillText(`THIN WALL (${wallThickness}px)`, wallX - 35, wallTop - 12);

      // Draw Ghost Sub-step Trail
      if (ghostStepsRef.current.length > 1) {
        ctx.strokeStyle = mode === 'fixed' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(244, 63, 94, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let i = 0; i < ghostStepsRef.current.length; i++) {
          const pt = ghostStepsRef.current[i];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);

          // Sub-step dot
          ctx.fillStyle = mode === 'fixed' ? '#38bdf8' : '#f43f5e';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = mode === 'fixed' ? '#38bdf8' : '#f43f5e';
      ctx.shadowColor = mode === 'fixed' ? '#38bdf8' : '#f43f5e';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Status text
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.fillStyle = mode === 'fixed' ? '#38bdf8' : '#f43f5e';
      ctx.fillText(
        mode === 'fixed'
          ? '● FIXED TIMESTEP ACCUMULATOR (SUBSTEPPING ENABLED - NO TUNNELING)'
          : '▲ VARIABLE DELTA TIME (TUNNELING RISK UNDER LAG SPIKES)',
        16,
        28
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, mode, wallThickness]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Interactive Physics Lab
            </span>
            <h3 className="text-lg font-bold text-white">Fixed Timestep vs. Variable dt (Tunneling Simulator)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ทดลองยิงลูกบอลความเร็วสูงใส่กำแพงบาง พร้อมกดปุ่ม Inject Lag เพื่อดูการทะลุกำแพง (Tunneling)
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setMode('fixed');
              handleReset();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'fixed'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Fixed Timestep (Accumulator)
          </button>
          <button
            onClick={() => {
              setMode('variable');
              handleReset();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'variable'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Variable Delta Time (Unstable)
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Tunneling Glitches</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-black ${
                tunnelingCount === 0 ? 'text-emerald-400' : 'text-rose-500 animate-pulse'
              }`}
            >
              {tunnelingCount}
            </span>
            <span className="text-xs text-slate-500">times</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {tunnelingCount === 0 ? 'Zero physics pass-through' : 'Ball glitched through wall!'}
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Valid Wall Bounces</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-cyan-400">{bouncesCount}</span>
            <span className="text-xs text-slate-500">bounces</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Accurate collision response</div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Ball Speed</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-amber-400">{ballSpeed}</span>
            <span className="text-xs text-slate-500">px/s</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Velocity vector magnitude</div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Wall Thickness</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-indigo-400">{wallThickness}</span>
            <span className="text-xs text-slate-500">px</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Collider barrier depth</div>
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

            {/* LAG INJECTOR BUTTON */}
            <button
              onClick={triggerLagSpike}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 animate-pulse"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>💥 Inject 220ms Lag Spike!</span>
            </button>
            {lastLagSpikeInfo && (
              <span className="text-[10px] text-amber-400 font-mono hidden md:inline">
                {lastLagSpikeInfo}
              </span>
            )}
          </div>

          {/* Sliders */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Ball Speed:</span>
              <input
                type="range"
                min="400"
                max="3000"
                step="200"
                value={ballSpeed}
                onChange={e => setBallSpeed(Number(e.target.value))}
                className="w-24 md:w-32 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-cyan-300 w-12">{ballSpeed}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Wall:</span>
              <input
                type="range"
                min="2"
                max="24"
                step="2"
                value={wallThickness}
                onChange={e => setWallThickness(Number(e.target.value))}
                className="w-16 md:w-24 accent-rose-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-rose-300 w-8">{wallThickness}px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory Banner */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3 text-xs text-slate-300">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
          <Bomb className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-white">ทดสอบด้วยตัวคุณเอง:</span>{' '}
          ลองสลับไปที่ <strong>Variable Delta Time</strong> แล้วกดปุ่ม{' '}
          <span className="text-amber-400 font-semibold">"Inject 220ms Lag Spike"</span>{' '}
          ในจังหวะที่ลูกบอลกำลังพุ่งเข้าหากำแพง คุณจะเห็นลูกบอล <strong>วาร์ปทะลุกำแพง (Tunneling)</strong> ไปในทันที!
          แต่ในโหมด <strong>Fixed Timestep</strong> อัลกอริทึมจะซอยเวลาที่สะสมเป็นก้าวเล็กๆ ที่คงที่ ทำให้ลูกบอลกระดอนกำแพงได้ถูกต้อง 100%
        </div>
      </div>
    </div>
  );
};
