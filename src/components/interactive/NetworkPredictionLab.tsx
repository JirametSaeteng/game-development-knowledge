import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Zap, ShieldAlert, ArrowLeft, ArrowRight, Gauge } from 'lucide-react';
import { sound } from '../../utils/audio';

interface InputRecord {
  sequence: number;
  dx: number;
  timestamp: number;
}

export const NetworkPredictionLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [netMode, setNetMode] = useState<'server-only' | 'prediction'>('prediction');
  const [pingMs, setPingMs] = useState<number>(180); // One-way ping = 90ms, RTT = 180ms
  const [packetLoss, setPacketLoss] = useState<boolean>(false);

  // Client and Server positions
  const clientXRef = useRef<number>(200);
  const serverXRef = useRef<number>(200);
  const pendingInputsRef = useRef<InputRecord[]>([]);
  const sequenceCounterRef = useRef<number>(0);

  // Input queue simulating network latency
  const networkQueueToServerRef = useRef<{ sequence: number; dx: number; arriveAt: number }[]>([]);
  const networkQueueToClientRef = useRef<{ sequence: number; serverX: number; arriveAt: number }[]>([]);

  // Telemetry
  const [stats, setStats] = useState({
    inputLatencyMs: 0,
    perceivedLag: '0 ms (Instant)',
    unacknowledgedInputs: 0,
    serverDiscrepancy: 0,
    clientPosition: 200,
    serverPosition: 200,
  });

  // Handle player moving
  const handleMove = (direction: -1 | 1) => {
    sound.playClick(600);
    const speed = 25;
    const now = performance.now();
    const seq = ++sequenceCounterRef.current;
    const moveDx = direction * speed;

    if (netMode === 'prediction') {
      // 1. Immediately predict movement locally
      clientXRef.current = Math.max(40, Math.min(560, clientXRef.current + moveDx));
      pendingInputsRef.current.push({
        sequence: seq,
        dx: moveDx,
        timestamp: now,
      });
    }

    // Send input packet to server with latency
    const oneWayLatency = pingMs / 2;
    networkQueueToServerRef.current.push({
      sequence: seq,
      dx: moveDx,
      arriveAt: now + oneWayLatency,
    });
  };

  // Main Simulation Loop
  useEffect(() => {
    let animId: number;

    const loop = (currentTime: number) => {
      const oneWayLatency = pingMs / 2;

      // 1. Process packets reaching the server
      while (
        networkQueueToServerRef.current.length > 0 &&
        networkQueueToServerRef.current[0].arriveAt <= currentTime
      ) {
        const packet = networkQueueToServerRef.current.shift()!;

        // Check packet loss
        const isDropped = packetLoss && Math.random() < 0.15;
        if (!isDropped) {
          // Authoritative server updates position
          serverXRef.current = Math.max(40, Math.min(560, serverXRef.current + packet.dx));

          // Server sends state snapshot back to client
          networkQueueToClientRef.current.push({
            sequence: packet.sequence,
            serverX: serverXRef.current,
            arriveAt: currentTime + oneWayLatency,
          });
        }
      }

      // 2. Process server snapshots reaching the client
      while (
        networkQueueToClientRef.current.length > 0 &&
        networkQueueToClientRef.current[0].arriveAt <= currentTime
      ) {
        const snapshot = networkQueueToClientRef.current.shift()!;

        if (netMode === 'server-only') {
          // No prediction: client snaps only when server tells it
          clientXRef.current = snapshot.serverX;
        } else {
          // Prediction mode: Server Reconciliation
          // Discard inputs that server has already processed
          pendingInputsRef.current = pendingInputsRef.current.filter(
            (input) => input.sequence > snapshot.sequence
          );

          // In case of discrepancy (misprediction or dropped packet):
          // Re-apply remaining unacknowledged inputs from authoritative position
          let reconciledX = snapshot.serverX;
          for (const input of pendingInputsRef.current) {
            reconciledX = Math.max(40, Math.min(560, reconciledX + input.dx));
          }
          clientXRef.current = reconciledX;
        }
      }

      // 3. Render Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          ctx.clearRect(0, 0, width, height);

          // Floor track
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(30, 260);
          ctx.lineTo(570, 260);
          ctx.stroke();

          // Distance markers
          for (let x = 50; x <= 550; x += 50) {
            ctx.fillStyle = '#334155';
            ctx.fillRect(x - 1, 255, 2, 10);
            ctx.font = '9px monospace';
            ctx.fillText(`${x}m`, x - 8, 280);
          }

          // Authoritative Server Shadow (Ghost)
          ctx.save();
          ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
          ctx.beginPath();
          ctx.arc(serverXRef.current, 240, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#fda4af';
          ctx.font = '10px monospace';
          ctx.fillText('SERVER (Authoritative)', serverXRef.current - 50, 210);
          ctx.restore();

          // Client Player (Current visual on screen)
          ctx.save();
          ctx.beginPath();
          ctx.arc(clientXRef.current, 240, 18, 0, Math.PI * 2);
          ctx.fillStyle = netMode === 'prediction' ? '#06b6d4' : '#e2e8f0';
          ctx.shadowColor = netMode === 'prediction' ? '#06b6d4' : '#64748b';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('CLIENT', clientXRef.current - 18, 244);
          ctx.restore();
        }
      }

      // Update telemetry
      const latency = netMode === 'prediction' ? 0 : pingMs;
      setStats({
        inputLatencyMs: latency,
        perceivedLag: netMode === 'prediction' ? '0 ms (Instant Local Prediction)' : `${pingMs} ms (High Input Delay)`,
        unacknowledgedInputs: pendingInputsRef.current.length,
        serverDiscrepancy: Math.round(Math.abs(clientXRef.current - serverXRef.current)),
        clientPosition: Math.round(clientXRef.current),
        serverPosition: Math.round(serverXRef.current),
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [netMode, pingMs, packetLoss]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span>Client-Side Prediction & Server Reconciliation (Netcode Lab)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ทดลองจำลอง Ping 180ms เพื่อเปรียบเทียบระหว่างระบบที่ไม่คาดการณ์ (Input Delay) กับระบบทำนายตำแหน่งในเครื่องผู้เล่น
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNetMode('server-only');
              sound.playClick(400);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              netMode === 'server-only'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>No Prediction (Input Delay)</span>
          </button>

          <button
            onClick={() => {
              setNetMode('prediction');
              sound.playClick(700);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              netMode === 'prediction'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Client Prediction (Zero Delay)</span>
          </button>
        </div>
      </div>

      {/* Main Canvas + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-3xl p-4 relative overflow-hidden flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-2">
            <span className="font-mono text-[11px] text-cyan-400">
              🎮 กดปุ่มลูกศรด้านล่างเพื่อบังคับเดิน แล้วสังเกตความหน่วงในการตอบสนอง
            </span>
            <span className="text-slate-300 font-mono text-[11px]">
              RTT Ping: <strong className="text-amber-400">{pingMs} ms</strong>
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={600}
            height={340}
            className="rounded-2xl border border-slate-800/80 bg-slate-950 max-w-full shadow-inner"
          />

          {/* Interactive Movement Buttons Bar */}
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => handleMove(-1)}
              className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>เดินซ้าย (Move Left)</span>
            </button>

            <button
              onClick={() => handleMove(1)}
              className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-lg"
            >
              <span>เดินขวา (Move Right)</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          {netMode === 'server-only' && (
            <div className="mt-4 w-full bg-rose-950/80 backdrop-blur-md border border-rose-500/50 rounded-2xl p-3 flex items-center gap-3 text-rose-200 text-xs animate-pulse">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold">Severe Input Latency ({pingMs}ms Delay):</span> ผู้เล่นกดปุ่มแล้วตัวละครไม่ยอมขยับทันที ต้องรอคำสั่งส่งข้ามทวีปไปเซิร์ฟเวอร์แล้วส่งกลับมาก่อน เกมยิงหรือเกมต่อสู้จะเล่นไม่ได้เลย!
              </div>
            </div>
          )}
        </div>

        {/* Telemetry and Network Sliders */}
        <div className="space-y-4">
          {/* Latency Stats */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Netcode Telemetry
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400">Perceived Input Latency</div>
              <div
                className={`text-lg font-black font-mono ${
                  stats.inputLatencyMs === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {stats.perceivedLag}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Client Position:</span>
                <span className="font-mono text-cyan-400 font-bold">{stats.clientPosition}m</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Server Snapshot Ghost:</span>
                <span className="font-mono text-rose-400 font-bold">{stats.serverPosition}m</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Inputs รอ Reconcile:</span>
                <span className="font-mono text-amber-400 font-bold">{stats.unacknowledgedInputs} packets</span>
              </div>
            </div>
          </div>

          {/* Network Conditions Sliders */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Network Conditions</span>
            </div>

            {/* Ping Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Ping Latency (RTT)</span>
                <span className="font-mono text-amber-400 font-bold">{pingMs} ms</span>
              </div>
              <input
                type="range"
                min="20"
                max="400"
                step="10"
                value={pingMs}
                onChange={(e) => setPingMs(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Packet Loss */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-bold text-white">Simulate Packet Loss</div>
                <div className="text-[10px] text-slate-400">ทดสอบทำนายเมื่อแพ็กเก็ตหลุด 15%</div>
              </div>
              <input
                type="checkbox"
                checked={packetLoss}
                onChange={(e) => {
                  setPacketLoss(e.target.checked);
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
