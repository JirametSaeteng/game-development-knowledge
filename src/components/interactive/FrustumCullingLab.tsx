import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, RotateCw, ZoomIn, ShieldAlert, Sparkles, CheckCircle2, Sliders } from 'lucide-react';
import { sound } from '../../utils/audio';

interface WorldObject {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: 'tree' | 'rock' | 'building';
  color: string;
}

interface Occluder {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const FrustumCullingLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [cullingMode, setCullingMode] = useState<'none' | 'frustum' | 'both'>('frustum');
  const [camAngle, setCamAngle] = useState<number>(45); // in degrees
  const [camFov, setCamFov] = useState<number>(65); // degrees
  const [camDistance, setCamDistance] = useState<number>(260); // px
  const [objectCount] = useState<number>(500);

  // Telemetry stats
  const [stats, setStats] = useState({
    fps: 60,
    frameTimeMs: 16.6,
    totalObjects: 500,
    renderedObjects: 75,
    culledFrustum: 425,
    culledOcclusion: 0,
    savedTriangles: 125000,
  });

  const objectsRef = useRef<WorldObject[]>([]);
  const occludersRef = useRef<Occluder[]>([
    { x: 180, y: 150, width: 35, height: 160 },
    { x: 380, y: 220, width: 40, height: 140 },
  ]);

  const cameraPosRef = useRef<{ x: number; y: number }>({ x: 300, y: 250 });
  const isDraggingCamRef = useRef<boolean>(false);
  const jitterFrameRef = useRef<number>(0);

  // Generate random objects once
  useEffect(() => {
    const list: WorldObject[] = [];
    const colors = ['#38bdf8', '#818cf8', '#a78bfa', '#34d399', '#f472b6'];
    const types: ('tree' | 'rock' | 'building')[] = ['tree', 'rock', 'building'];

    for (let i = 0; i < objectCount; i++) {
      list.push({
        id: i,
        x: Math.random() * 560 + 20,
        y: Math.random() * 440 + 20,
        radius: Math.random() * 6 + 4,
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    objectsRef.current = list;
  }, [objectCount]);

  // Main render & simulation loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const cam = cameraPosRef.current;
      const radAngle = (camAngle * Math.PI) / 180;
      const halfFovRad = ((camFov / 2) * Math.PI) / 180;

      // Unoptimized simulated lag (driver bottleneck when culling is OFF)
      if (cullingMode === 'none') {
        jitterFrameRef.current++;
        // Simulate jitter every few frames
        if (jitterFrameRef.current % 3 === 0) {
          // slight frame delay simulation
        }
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle background grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Occluders (solid heavy walls)
      occludersRef.current.forEach((occ) => {
        ctx.fillStyle = '#475569';
        ctx.fillRect(occ.x, occ.y, occ.width, occ.height);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(occ.x, occ.y, occ.width, occ.height);

        // Label
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px monospace';
        ctx.fillText('OCCLUDER', occ.x + 2, occ.y + occ.height / 2);
      });

      // 3. Draw Camera Frustum Cone
      const leftAngle = radAngle - halfFovRad;
      const rightAngle = radAngle + halfFovRad;

      const leftX = cam.x + Math.cos(leftAngle) * camDistance;
      const leftY = cam.y + Math.sin(leftAngle) * camDistance;

      // Frustum cone visual
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cam.x, cam.y);
      ctx.lineTo(leftX, leftY);
      ctx.arc(cam.x, cam.y, camDistance, leftAngle, rightAngle);
      ctx.closePath();

      const frustumGrad = ctx.createRadialGradient(cam.x, cam.y, 10, cam.x, cam.y, camDistance);
      frustumGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      frustumGrad.addColorStop(1, 'rgba(6, 182, 212, 0.05)');
      ctx.fillStyle = frustumGrad;
      ctx.fill();

      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // 4. Test Objects & Render
      let rendered = 0;
      let frustumCulled = 0;
      let occlusionCulled = 0;

      objectsRef.current.forEach((obj) => {
        const dx = obj.x - cam.x;
        const dy = obj.y - cam.y;
        const dist = Math.sqrt(dx * dy * 0 + dx * dx + dy * dy);

        // Frustum Angle test
        const angleToObj = Math.atan2(dy, dx);
        let diff = angleToObj - radAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        const inDistance = dist <= camDistance + obj.radius;
        const inAngle = Math.abs(diff) <= halfFovRad + 0.08;
        const inFrustum = inDistance && inAngle;

        // Simple Occlusion Test behind walls
        let isOccluded = false;
        if (inFrustum && (cullingMode === 'both')) {
          for (const occ of occludersRef.current) {
            // If object is behind occ relative to camera
            const occCenterX = occ.x + occ.width / 2;
            const occCenterY = occ.y + occ.height / 2;
            const distToOcc = Math.hypot(occCenterX - cam.x, occCenterY - cam.y);
            if (dist > distToOcc) {
              // Raycast from camera to object intersects occ
              if (
                Math.min(cam.x, obj.x) < occ.x + occ.width &&
                Math.max(cam.x, obj.x) > occ.x &&
                Math.min(cam.y, obj.y) < occ.y + occ.height &&
                Math.max(cam.y, obj.y) > occ.y
              ) {
                isOccluded = true;
                break;
              }
            }
          }
        }

        let willRender = false;
        if (cullingMode === 'none') {
          willRender = true;
        } else if (cullingMode === 'frustum') {
          willRender = inFrustum;
          if (!inFrustum) frustumCulled++;
        } else if (cullingMode === 'both') {
          willRender = inFrustum && !isOccluded;
          if (!inFrustum) frustumCulled++;
          else if (isOccluded) occlusionCulled++;
        }

        if (willRender) {
          rendered++;
          // Draw Active Rendered Object
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
          ctx.fillStyle = obj.color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Little glow
          ctx.shadowColor = obj.color;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Draw Culled Object (Dimmed Outline)
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
          if (isOccluded) {
            ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)'; // Orange = Occluded
          } else {
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)'; // Slate = Frustum culled
          }
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // 5. Draw Camera Actor
      ctx.save();
      ctx.translate(cam.x, cam.y);
      ctx.rotate(radAngle);

      // Camera body
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Camera lens pointer
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(12, -6);
      ctx.lineTo(20, 0);
      ctx.lineTo(12, 6);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Telemetry computation
      const calculatedFps = cullingMode === 'none' ? Math.floor(22 + Math.random() * 4) : 60;
      const frameTime = cullingMode === 'none' ? (1000 / calculatedFps).toFixed(1) : '16.6';

      setStats({
        fps: calculatedFps,
        frameTimeMs: parseFloat(frameTime),
        totalObjects: objectsRef.current.length,
        renderedObjects: rendered,
        culledFrustum: frustumCulled,
        culledOcclusion: occlusionCulled,
        savedTriangles: (objectsRef.current.length - rendered) * 240,
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [cullingMode, camAngle, camFov, camDistance]);

  // Mouse drag camera
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cam = cameraPosRef.current;
    if (Math.hypot(x - cam.x, y - cam.y) < 25) {
      isDraggingCamRef.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingCamRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(30, Math.min(canvas.width - 30, e.clientX - rect.left));
    const y = Math.max(30, Math.min(canvas.height - 30, e.clientY - rect.top));
    cameraPosRef.current = { x, y };
  };

  const handleMouseUp = () => {
    isDraggingCamRef.current = false;
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Frustum & Occlusion Culling Simulator</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ลากกล้อง หรือปรับมุมมอง FOV เพื่อดูการตัดวัตถุที่ไม่ปรากฏบนจอภาพออกจาก GPU Pipeline ทันที
          </p>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCullingMode('none');
              sound.playClick(400);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              cullingMode === 'none'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>ไม่ตัดวัตถุ (No Culling)</span>
          </button>

          <button
            onClick={() => {
              setCullingMode('frustum');
              sound.playClick(600);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              cullingMode === 'frustum'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Frustum Culling</span>
          </button>

          <button
            onClick={() => {
              setCullingMode('both');
              sound.playClick(750);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              cullingMode === 'both'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Frustum + Occlusion</span>
          </button>
        </div>
      </div>

      {/* Main Canvas + Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-3xl p-4 relative overflow-hidden flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-2">
            <span className="font-mono text-[11px] text-cyan-400">💡 คลิกแล้วลากวงกลมสีฟ้าตรงกลางเพื่อย้ายกล้อง</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> กำลังส่งไปเรนเดอร์ ({stats.renderedObjects})
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full border border-slate-500 inline-block" /> ถูกตัดทิ้ง (Culled)
              </span>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={600}
            height={460}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="rounded-2xl border border-slate-800/80 cursor-crosshair bg-slate-950 max-w-full shadow-inner"
          />

          {/* Warning banner when No Culling */}
          {cullingMode === 'none' && (
            <div className="absolute bottom-6 left-8 right-8 bg-rose-950/80 backdrop-blur-md border border-rose-500/50 rounded-2xl p-3 flex items-center gap-3 text-rose-200 text-xs animate-pulse">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold">GPU Driver Bottleneck:</span> ส่งวัตถุทั้งหมด 500 ชิ้นไปยังการ์ดจอ ทั้งที่อยู่นอกสายตาและหลังกำแพง ทำให้ Draw Calls และ Vertex Pipeline ล้นจนเฟรมเรตร่วงเหลือ {stats.fps} FPS!
              </div>
            </div>
          )}
        </div>

        {/* Live Metrics & Sliders Panel */}
        <div className="space-y-4">
          {/* Telemetry Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              GPU Telemetry
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
                <div className="text-[10px] text-slate-400">Frame Time</div>
                <div className="text-xl font-black font-mono text-cyan-400 mt-0.5">
                  {stats.frameTimeMs} <span className="text-xs font-normal">ms</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>วัตถุทั้งหมดในฉาก:</span>
                <span className="font-mono text-white font-bold">{stats.totalObjects}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>ส่งเข้า GPU (Draw Calls):</span>
                <span className="font-mono text-cyan-400 font-bold">{stats.renderedObjects}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>ตัดด้วย Frustum:</span>
                <span className="font-mono text-emerald-400 font-bold">-{stats.culledFrustum}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>ตัดด้วย Occlusion:</span>
                <span className="font-mono text-amber-400 font-bold">-{stats.culledOcclusion}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex justify-between font-bold text-emerald-400">
                <span>ประหยัดรูปสามเหลี่ยม:</span>
                <span className="font-mono">~{stats.savedTriangles.toLocaleString()} tris</span>
              </div>
            </div>
          </div>

          {/* Camera Adjust Sliders */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Camera Parameters</span>
            </div>

            {/* Angle Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1">
                  <RotateCw className="w-3 h-3 text-cyan-400" /> หมุนกล้อง (Angle)
                </span>
                <span className="font-mono text-cyan-400">{camAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={camAngle}
                onChange={(e) => setCamAngle(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* FOV Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>มุมมองเลนส์ (FOV)</span>
                <span className="font-mono text-cyan-400">{camFov}°</span>
              </div>
              <input
                type="range"
                min="30"
                max="120"
                value={camFov}
                onChange={(e) => setCamFov(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Distance Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3 h-3 text-cyan-400" /> ระยะมองเห็น (Draw Distance)
                </span>
                <span className="font-mono text-cyan-400">{camDistance} px</span>
              </div>
              <input
                type="range"
                min="120"
                max="400"
                value={camDistance}
                onChange={(e) => setCamDistance(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Engine Tip */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Engine Implementation:</span> Unity มีระบบ Frustum Culling อัตโนมัติทุกกล้อง และใช้ Umbra สำหรับ Occlusion Culling ส่วน Unreal Engine 5 ใช้ Hierarchical Z-Buffer (HZB) บน GPU ทำให้ตัดวัตถุได้ไวระดับ Sub-millisecond
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
