import React, { useState, useEffect, useRef } from 'react';
import { Layers, HardDrive, ZoomIn, Eye, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { sound } from '../../utils/audio';

export const TextureStreamingLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [streamingMode, setStreamingMode] = useState<'uncompressed-full' | 'streaming-mipmaps'>('streaming-mipmaps');
  const [debugMipColors, setDebugMipColors] = useState<boolean>(true);
  const [cameraDistance, setCameraDistance] = useState<number>(45); // meters (5 to 100)
  const [anisotropicFilter, setAnisotropicFilter] = useState<boolean>(true);

  // Telemetry
  const [stats, setStats] = useState({
    vramMb: 142,
    vramReductionPercent: '-93%',
    activeMipLevel: 'Mip 1 (2048x2048)',
    texelDensity: '1.2 texels/pixel',
    cacheMissRate: '2.1%',
  });

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
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Perspective 3D Runway / Floor Grid simulation
      const horizonY = 120;
      const fovScale = Math.max(0.2, 1 - cameraDistance / 120);

      // Determine active Mip based on distance
      let mipLevel = 0;
      let mipName = 'Mip 0 (4096 x 4096 Uncompressed)';

      if (streamingMode === 'streaming-mipmaps') {
        if (cameraDistance < 20) {
          mipLevel = 0;
          mipName = 'Mip 0 (4K - Highest Detail)';
        } else if (cameraDistance < 45) {
          mipLevel = 1;
          mipName = 'Mip 1 (2K - Mid Detail)';
        } else if (cameraDistance < 75) {
          mipLevel = 2;
          mipName = 'Mip 2 (1K - Far Distance)';
        } else {
          mipLevel = 3;
          mipName = 'Mip 3 (512px - Horizon)';
        }
      }

      // Draw Floor Perspective Trapezoid
      ctx.save();
      const topW = 120 * fovScale;
      const btmW = 540;

      ctx.beginPath();
      ctx.moveTo(width / 2 - topW, horizonY);
      ctx.lineTo(width / 2 + topW, horizonY);
      ctx.lineTo(width / 2 + btmW / 2, height - 30);
      ctx.lineTo(width / 2 - btmW / 2, height - 30);
      ctx.closePath();

      // If Debug Mip Colors is enabled
      if (debugMipColors && streamingMode === 'streaming-mipmaps') {
        const floorGrad = ctx.createLinearGradient(0, height - 30, 0, horizonY);
        floorGrad.addColorStop(0, '#ef4444'); // Near: Red (Mip 0)
        floorGrad.addColorStop(0.3, '#10b981'); // Mid: Green (Mip 1)
        floorGrad.addColorStop(0.65, '#3b82f6'); // Far: Blue (Mip 2)
        floorGrad.addColorStop(1, '#f59e0b'); // Horizon: Yellow (Mip 3)
        ctx.fillStyle = floorGrad;
      } else {
        // Texture simulation
        ctx.fillStyle = '#1e293b';
      }
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Checkerboard texture lines on the floor
      const lines = 16;
      for (let i = 0; i <= lines; i++) {
        const t = i / lines;
        // Perspective curve
        const y = horizonY + Math.pow(t, 2.2) * (height - 30 - horizonY);
        const w = topW + (btmW / 2 - topW) * t;

        ctx.strokeStyle = streamingMode === 'uncompressed-full' && cameraDistance > 50
          ? (i % 2 === 0 ? '#cbd5e1' : '#0f172a') // Severe aliasing / shimmering!
          : 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = anisotropicFilter ? 1 : 2;

        ctx.beginPath();
        ctx.moveTo(width / 2 - w, y);
        ctx.lineTo(width / 2 + w, y);
        ctx.stroke();
      }

      // Draw perspective vanishing rays
      for (let x = -4; x <= 4; x++) {
        ctx.beginPath();
        ctx.moveTo(width / 2, horizonY);
        ctx.lineTo(width / 2 + (x * btmW) / 8, height - 30);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.stroke();
      }

      ctx.restore();

      // Draw Mipmap Color Legend inside canvas if debug colors enabled
      if (debugMipColors && streamingMode === 'streaming-mipmaps') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(20, 20, 220, 90);
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(20, 20, 220, 90);

        ctx.font = '10px monospace';
        const legends = [
          { color: '#ef4444', label: 'Mip 0 (4K - 0m to 20m)' },
          { color: '#10b981', label: 'Mip 1 (2K - 20m to 45m)' },
          { color: '#3b82f6', label: 'Mip 2 (1K - 45m to 75m)' },
          { color: '#f59e0b', label: 'Mip 3 (512px - 75m+)' },
        ];

        legends.forEach((item, idx) => {
          ctx.fillStyle = item.color;
          ctx.fillRect(28, 30 + idx * 18, 10, 10);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillText(item.label, 44, 39 + idx * 18);
        });
      }

      // Telemetry calculation
      const isFull = streamingMode === 'uncompressed-full';
      setStats({
        vramMb: isFull ? 2048 : Math.round(32 + Math.max(16, 256 / Math.pow(2, mipLevel))),
        vramReductionPercent: isFull ? '0% (Full VRAM Churn)' : '-93% Saved',
        activeMipLevel: isFull ? 'No Mipmaps (Forced 4K RGBA32)' : mipName,
        texelDensity: isFull ? '14.8 texels/pixel (Undersampled Aliasing!)' : '1.05 texels/pixel (Optimal 1:1)',
        cacheMissRate: isFull ? '54.2% (Texture Cache Thrash)' : '1.8% (Warm L2 Cache)',
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [streamingMode, debugMipColors, cameraDistance, anisotropicFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Texture Streaming & Mipmapping Lab (VRAM Budget)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ทดลองซูมกล้องเข้า-ออก เพื่อดูการเปลี่ยนชั้น Mipmap อัตโนมัติและการประหยัดหน่วยความจำ VRAM ของการ์ดจอ
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setStreamingMode('uncompressed-full');
              sound.playClick(400);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              streamingMode === 'uncompressed-full'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Force 4K Textures (No Mips)</span>
          </button>

          <button
            onClick={() => {
              setStreamingMode('streaming-mipmaps');
              sound.playClick(700);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              streamingMode === 'streaming-mipmaps'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Streaming Mipmap Pool</span>
          </button>
        </div>
      </div>

      {/* Main Canvas + Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-3xl p-4 relative overflow-hidden flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-2">
            <span className="font-mono text-[11px] text-cyan-400">
              🔍 เลื่อน Camera Distance ด้านขวา เพื่อดูระดับ Mipmap ปรับตัวตามระยะทาง
            </span>
            <span className="text-slate-300 font-mono text-[11px]">
              Camera Distance: <strong className="text-white">{cameraDistance} meters</strong>
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={600}
            height={440}
            className="rounded-2xl border border-slate-800/80 bg-slate-950 max-w-full shadow-inner"
          />

          {streamingMode === 'uncompressed-full' && (
            <div className="absolute bottom-6 left-8 right-8 bg-rose-950/80 backdrop-blur-md border border-rose-500/50 rounded-2xl p-3 flex items-center gap-3 text-rose-200 text-xs animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold">Texture Cache Thrashing (2,048 MB VRAM):</span> โหลด Texture 4K เต็มขนาดแม้จะอยู่ไกล 100 เมตร ทำให้ VRAM ล้น, GPU Cache Miss พุ่งสูง และเกิดภาพระยิบระยับ (Moiré Aliasing Shimmer) ที่เส้นขอบฟ้า!
              </div>
            </div>
          )}
        </div>

        {/* Telemetry and Controls */}
        <div className="space-y-4">
          {/* Telemetry */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>VRAM Footprint</span>
              <span className="text-emerald-400 font-mono text-[11px] font-bold">{stats.vramReductionPercent}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400">Total VRAM Allocation</div>
              <div
                className={`text-2xl font-black font-mono ${
                  stats.vramMb > 1000 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {stats.vramMb} <span className="text-xs font-normal">MB</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Active Mip:</span>
                <span className="font-mono text-cyan-400 font-bold">{stats.activeMipLevel}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Texel Density:</span>
                <span className="font-mono text-slate-300 font-bold">{stats.texelDensity}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GPU Cache Miss:</span>
                <span
                  className={`font-mono font-bold ${
                    parseFloat(stats.cacheMissRate) > 20 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {stats.cacheMissRate}
                </span>
              </div>
            </div>
          </div>

          {/* Sliders and Toggles */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Camera & Filtering</span>
            </div>

            {/* Distance Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>ระยะห่างกล้อง (Camera Distance)</span>
                <span className="font-mono text-cyan-400">{cameraDistance} m</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={cameraDistance}
                onChange={(e) => setCameraDistance(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Debug Colors Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mipmap Color Heatmap</span>
                </div>
                <div className="text-[10px] text-slate-400">แสดงสีแยกชั้น Mip 0, 1, 2, 3</div>
              </div>
              <input
                type="checkbox"
                checked={debugMipColors}
                onChange={(e) => {
                  setDebugMipColors(e.target.checked);
                  sound.playClick(500);
                }}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Anisotropic Filtering Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Anisotropic Filtering (16x)</span>
                </div>
                <div className="text-[10px] text-slate-400">ลดภาพเบลอตามมุมเอียงเฉียง</div>
              </div>
              <input
                type="checkbox"
                checked={anisotropicFilter}
                onChange={(e) => {
                  setAnisotropicFilter(e.target.checked);
                  sound.playClick(500);
                }}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
