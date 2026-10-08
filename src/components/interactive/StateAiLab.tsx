import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Brain, Shield, Crosshair, Heart } from 'lucide-react';
import { sound } from '../../utils/audio';

type AIState = 'PATROL' | 'INVESTIGATE' | 'CHASE' | 'ATTACK' | 'FLEE';

export const StateAiLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [aiMode, setAiMode] = useState<'fsm' | 'bt'>('fsm');
  const [currentState, setCurrentState] = useState<AIState>('PATROL');
  const [guardHp, setGuardHp] = useState(100);
  const visionRange = 160;
  const [activeBtNode, setActiveBtNode] = useState('PatrolNode');

  // Guard state
  const guardRef = useRef({
    x: 180,
    y: 190,
    vx: 0,
    vy: 0,
    angle: 0,
    speed: 70,
    hp: 100,
    patrolIndex: 0,
    state: 'PATROL' as AIState,
  });

  // Waypoints for patrol
  const waypoints = [
    { x: 120, y: 100 },
    { x: 340, y: 100 },
    { x: 340, y: 280 },
    { x: 120, y: 280 },
  ];

  // Player state
  const playerRef = useRef({
    x: 520,
    y: 190,
    isDragging: false,
  });

  const lastTimeRef = useRef<number>(performance.now());

  const handleReset = () => {
    guardRef.current = {
      x: 180,
      y: 190,
      vx: 0,
      vy: 0,
      angle: 0,
      speed: 70,
      hp: 100,
      patrolIndex: 0,
      state: 'PATROL',
    };
    playerRef.current = {
      x: 520,
      y: 190,
      isDragging: false,
    };
    setGuardHp(100);
    setCurrentState('PATROL');
    setActiveBtNode('PatrolNode');
    sound.playClick(600);
  };

  const handleDamageGuard = () => {
    setGuardHp(15);
    guardRef.current.hp = 15;
    sound.playClick(350);
  };

  const handleHealGuard = () => {
    setGuardHp(100);
    guardRef.current.hp = 100;
    sound.playClick(800);
  };

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastStateBroadcast = performance.now();

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
      const guard = guardRef.current;
      const player = playerRef.current;

      // 1. AI SENSING & EVALUATION
      const dx = player.x - guard.x;
      const dy = player.y - guard.y;
      const distToPlayer = Math.sqrt(dx * dx + dy * dy);

      // Angle to player
      const angleToPlayer = Math.atan2(dy, dx);
      let angleDiff = Math.abs(angleToPlayer - guard.angle);
      while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);

      const FOV = Math.PI / 3; // 60 degrees cone
      const canSeePlayer = distToPlayer < visionRange && angleDiff < FOV / 2;

      // DECISION LOGIC
      let nextState: AIState = 'PATROL';
      let nextBtNode = 'PatrolAction';

      if (guard.hp <= 25) {
        // Low HP -> FLEE!
        nextState = 'FLEE';
        nextBtNode = 'FleeToSafetyAction';
      } else if (distToPlayer < 45) {
        // Very close -> ATTACK
        nextState = 'ATTACK';
        nextBtNode = 'MeleeAttackAction';
      } else if (canSeePlayer) {
        // Seen -> CHASE
        nextState = 'CHASE';
        nextBtNode = 'ChasePlayerAction';
      } else if (distToPlayer < visionRange * 1.3 && guard.state === 'CHASE') {
        // Lost sight recently -> INVESTIGATE
        nextState = 'INVESTIGATE';
        nextBtNode = 'InvestigateLastPosAction';
      } else {
        // Normal -> PATROL
        nextState = 'PATROL';
        nextBtNode = 'PatrolAction';
      }

      guard.state = nextState;

      // 2. STATE EXECUTION
      if (nextState === 'PATROL') {
        const wp = waypoints[guard.patrolIndex];
        const wdx = wp.x - guard.x;
        const wdy = wp.y - guard.y;
        const wdist = Math.sqrt(wdx * wdx + wdy * wdy);

        if (wdist < 10) {
          guard.patrolIndex = (guard.patrolIndex + 1) % waypoints.length;
        } else {
          const targetAngle = Math.atan2(wdy, wdx);
          guard.angle = targetAngle;
          guard.x += Math.cos(targetAngle) * guard.speed * dt;
          guard.y += Math.sin(targetAngle) * guard.speed * dt;
        }
      } else if (nextState === 'CHASE') {
        const targetAngle = Math.atan2(dy, dx);
        guard.angle = targetAngle;
        guard.x += Math.cos(targetAngle) * (guard.speed * 1.3) * dt;
        guard.y += Math.sin(targetAngle) * (guard.speed * 1.3) * dt;
      } else if (nextState === 'ATTACK') {
        guard.angle = Math.atan2(dy, dx);
        // vibrating attack
      } else if (nextState === 'FLEE') {
        // Run away from player to medic bay
        const fleeX = 40;
        const fleeY = 40;
        const fdx = fleeX - guard.x;
        const fdy = fleeY - guard.y;
        const targetAngle = Math.atan2(fdy, fdx);
        guard.angle = targetAngle;
        guard.x += Math.cos(targetAngle) * (guard.speed * 1.4) * dt;
        guard.y += Math.sin(targetAngle) * (guard.speed * 1.4) * dt;
      }

      // Sync state to UI every 150ms
      if (now - lastStateBroadcast > 150) {
        setCurrentState(nextState);
        setActiveBtNode(nextBtNode);
        lastStateBroadcast = now;
      }

      // 3. RENDER CANVAS
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Draw Medic Bay / Safe Zone
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(40, 40, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.font = '10px Inter, monospace';
      ctx.fillText('+ MED STATION', 10, 85);

      // Draw Patrol Waypoints
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      waypoints.forEach((wp, idx) => {
        if (idx === 0) ctx.moveTo(wp.x, wp.y);
        else ctx.lineTo(wp.x, wp.y);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      waypoints.forEach((wp, idx) => {
        ctx.fillStyle = idx === guard.patrolIndex && nextState === 'PATROL' ? '#38bdf8' : '#334155';
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Guard Vision Cone
      ctx.save();
      ctx.translate(guard.x, guard.y);
      ctx.rotate(guard.angle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, visionRange, -FOV / 2, FOV / 2);
      ctx.closePath();

      if (canSeePlayer) {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
      } else {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Draw Guard Body
      ctx.beginPath();
      ctx.arc(guard.x, guard.y, 14, 0, Math.PI * 2);
      ctx.fillStyle =
        nextState === 'FLEE'
          ? '#eab308'
          : nextState === 'CHASE' || nextState === 'ATTACK'
          ? '#f43f5e'
          : '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Guard Face direction notch
      ctx.beginPath();
      ctx.moveTo(guard.x, guard.y);
      ctx.lineTo(guard.x + Math.cos(guard.angle) * 18, guard.y + Math.sin(guard.angle) * 18);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Guard Health Bar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(guard.x - 18, guard.y - 24, 36, 4);
      ctx.fillStyle = guard.hp > 25 ? '#10b981' : '#f43f5e';
      ctx.fillRect(guard.x - 18, guard.y - 24, 36 * (guard.hp / 100), 4);

      // Draw Player
      ctx.beginPath();
      ctx.arc(player.x, player.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Player label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText('PLAYER (ลากได้)', player.x - 30, player.y + 24);

      // Current State Badge in Canvas
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle =
        nextState === 'FLEE'
          ? '#eab308'
          : nextState === 'CHASE' || nextState === 'ATTACK'
          ? '#f43f5e'
          : '#38bdf8';
      ctx.fillText(`CURRENT STATE: [${nextState}]`, 16, 28);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, visionRange, waypoints]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Interactive AI Sandbox
            </span>
            <h3 className="text-lg font-bold text-white">AI State Machine vs. Behavior Tree Sandbox</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ลาก Player สีม่วงเข้าไปในกรวยสายตาของ Guard หรือกดลดเลือดเพื่อดูการเปลี่ยน State ในทันที
          </p>
        </div>

        {/* AI Diagram Type */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setAiMode('fsm');
              sound.playClick(600);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              aiMode === 'fsm'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Finite State Machine (FSM)
          </button>
          <button
            onClick={() => {
              setAiMode('bt');
              sound.playClick(500);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              aiMode === 'bt'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Behavior Tree (BT)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Canvas Sandbox (2 Cols) */}
        <div className="lg:col-span-2 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <canvas
            ref={canvasRef}
            width={520}
            height={360}
            onMouseDown={e => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                const mx = ((e.clientX - rect.left) / rect.width) * 520;
                const my = ((e.clientY - rect.top) / rect.height) * 360;
                playerRef.current.x = mx;
                playerRef.current.y = my;
                playerRef.current.isDragging = true;
              }
            }}
            onMouseMove={e => {
              if (playerRef.current.isDragging) {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (rect) {
                  playerRef.current.x = ((e.clientX - rect.left) / rect.width) * 520;
                  playerRef.current.y = ((e.clientY - rect.top) / rect.height) * 360;
                }
              }
            }}
            onMouseUp={() => {
              playerRef.current.isDragging = false;
            }}
            className="w-full h-[320px] md:h-[360px] block cursor-pointer"
          />

          {/* Bottom Canvas Controls */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDamageGuard}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
              >
                ลดเลือดเหลือ 15 HP (บังคับหนี)
              </button>
              <button
                onClick={handleHealGuard}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
              >
                ฟื้นฟู 100 HP
              </button>
            </div>
          </div>
        </div>

        {/* Live Visual Architecture Inspector (1 Col) */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-cyan-400" />
                {aiMode === 'fsm' ? 'FSM State Transitions' : 'Behavior Tree Hierarchy'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                Active: {aiMode === 'fsm' ? currentState : activeBtNode}
              </span>
            </div>

            {aiMode === 'fsm' ? (
              // FSM State Boxes
              <div className="space-y-2">
                {[
                  { state: 'PATROL', desc: 'เดินตาม Waypoints จุดตรวจ', icon: Shield },
                  { state: 'CHASE', desc: 'เห็นผู้เล่น -> วิ่งไล่ล่า', icon: Crosshair },
                  { state: 'ATTACK', desc: 'เข้าระยะประชิด -> โจมตี', icon: Crosshair },
                  { state: 'FLEE', desc: 'เลือดต่ำกว่า 25% -> หนีเข้าห้องพยาบาล', icon: Heart },
                ].map(item => {
                  const isActive = currentState === item.state;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.state}
                      className={`p-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                        isActive
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-md ${
                          isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold font-mono">{item.state}</div>
                        <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-mono font-bold text-cyan-400 animate-pulse">
                          ● RUNNING
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Behavior Tree Nodes
              <div className="space-y-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-indigo-300">
                  ROOT: Selector (Priority Fallback)
                </div>

                <div className="pl-3 space-y-1.5 border-l-2 border-indigo-900">
                  {/* Branch 1: Low HP Flee */}
                  <div
                    className={`p-2 rounded border transition-all ${
                      currentState === 'FLEE'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    1. Sequence: [HP &lt; 25% ?] ➔ [FleeAction]
                  </div>

                  {/* Branch 2: Chase & Attack */}
                  <div
                    className={`p-2 rounded border transition-all ${
                      currentState === 'CHASE' || currentState === 'ATTACK'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    2. Sequence: [SeePlayer ?] ➔ [Chase] ➔ [Attack]
                  </div>

                  {/* Branch 3: Patrol Fallback */}
                  <div
                    className={`p-2 rounded border transition-all ${
                      currentState === 'PATROL'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    3. Action: [PatrolWaypoints] (Default)
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span className="text-white font-semibold">Guard HP:</span> {guardHp}/100
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  guardHp > 25 ? 'bg-emerald-400' : 'bg-rose-500'
                }`}
                style={{ width: `${guardHp}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
