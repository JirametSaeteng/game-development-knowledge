import React from 'react';
import { X, TrendingUp, ArrowRight } from 'lucide-react';
import { TOPICS } from '../data/topics';
import type { Topic } from '../types/topic';
import { sound } from '../utils/audio';

interface PerformanceMatrixProps {
  onClose: () => void;
  onSelectTopic: (topic: Topic) => void;
}

export const PerformanceMatrix: React.FC<PerformanceMatrixProps> = ({
  onClose,
  onSelectTopic,
}) => {
  const matrixData = [
    {
      topicId: 'object-pooling',
      name: 'Object Pooling',
      domain: 'Memory & Garbage Collection',
      unoptimized: 'Instantiate / Destroy ทุกเฟรม (Heap Churn)',
      optimized: 'Ring Buffer / Stack Pre-allocation',
      gain: 'Zero GC Spike (+65% FPS stability)',
      gameExample: 'Bullet Hell, Touhou, Vampire Survivors',
    },
    {
      topicId: 'spatial-partitioning',
      name: 'Spatial Partitioning',
      domain: 'Physics & Collision Detection',
      unoptimized: 'Brute-Force Pairwise O(N²)',
      optimized: 'Spatial Hash Grid / Quadtree O(N)',
      gain: 'ลดการคำนวณลง 99.5% (เร็วขึ้น 65 เท่า)',
      gameExample: 'StarCraft, Vampire Survivors, Dynasty Warriors',
    },
    {
      topicId: 'ecs-dod',
      name: 'Data-Oriented (ECS)',
      domain: 'CPU Cache Locality & Hardware',
      unoptimized: 'OOP Pointer Chasing (L1/L2 Cache Misses)',
      optimized: 'Contiguous TypedArrays (SoA) + SIMD',
      gain: 'เร็วขึ้นกว่า 50 เท่า (Cache Hit 98%)',
      gameExample: 'The Matrix Awakens, Days Gone, Total War',
    },
    {
      topicId: 'fixed-timestep',
      name: 'Fixed Timestep Loop',
      domain: 'Physics Stability & Netcode',
      unoptimized: 'Variable Delta Time Integration',
      optimized: 'Accumulator Pattern + Substepping',
      gain: 'ขจัด Tunneling 100% (Physics Determinism)',
      gameExample: 'Rocket League, TrackMania, Fighting Games',
    },
    {
      topicId: 'draw-calls-batching',
      name: 'GPU Instancing',
      domain: 'Rendering & Graphics Pipeline',
      unoptimized: '1 Draw Call ต่อวัตถุ (CPU Driver Bottleneck)',
      optimized: '1 Instanced Call ต่อ 1,000+ วัตถุ',
      gain: 'ลดคำสั่งวาดลง 99.9% (+114% FPS)',
      gameExample: 'No Man\'s Sky (Asteroids/Forests), Fortnite',
    },
    {
      topicId: 'pathfinding-algorithms',
      name: 'A* Pathfinding Search',
      domain: 'AI & Graph Navigation',
      unoptimized: 'Dijkstra / BFS สำรวจวงกลมรอบทิศ',
      optimized: 'A* ด้วย Manhattan / Euclidean Heuristic',
      gain: 'ลดโหนดสำรวจลง 88.5% (เร็วขึ้น 10 เท่า)',
      gameExample: 'Age of Empires, RimWorld, Baldur\'s Gate',
    },
    {
      topicId: 'game-ai-fsm-bt',
      name: 'Behavior Trees',
      domain: 'Game AI Architecture',
      unoptimized: 'FSM Spaghetti Switches (State Explosion)',
      optimized: 'Hierarchical Modular BT + Blackboard',
      gain: 'ขยายระบบ AI ได้ไม่จำกัด ไม่เกิด Transition Hell',
      gameExample: 'Halo 2, Unreal Engine 5 Shooters, Cyberpunk',
    },
    {
      topicId: 'frustum-culling',
      name: 'Frustum & Occlusion Culling',
      domain: 'GPU Pipeline & Geometry',
      unoptimized: 'วาดวัตถุทั้งหมด 2,500 ชิ้นรวมทั้งหลังกล้อง',
      optimized: '6-Plane Frustum AABB + HZB Occlusion',
      gain: 'ลด Draw Calls ลง 92.8% (+200% FPS)',
      gameExample: 'Horizon Zero Dawn, Zelda BOTW, GTA V',
    },
    {
      topicId: 'multi-threading',
      name: 'Job System & Multi-Threading',
      domain: 'CPU Multicore Architecture',
      unoptimized: 'Main Game Thread Choke (1 คอร์ 100%)',
      optimized: 'Work-Stealing Worker Threads + SIMD Burst',
      gain: 'เร็วขึ้นกว่า 17 เท่า (กระจายครบ 8-16 คอร์)',
      gameExample: 'Spider-Man Remastered, Cities: Skylines II',
    },
    {
      topicId: 'shader-overdraw',
      name: 'Shader Overdraw & Early-Z',
      domain: 'GPU Pixel Fill-Rate',
      unoptimized: 'Back-to-Front Alpha Blending Overdraw (14x)',
      optimized: 'Front-to-Back Opaque + Early-Z Depth Test',
      gain: 'ลด Fragment Shading ลง 90% (เครื่องเย็นลง 3 เท่า)',
      gameExample: 'Doom Eternal, Genshin Impact, Fortnite Mobile',
    },
    {
      topicId: 'netcode-prediction',
      name: 'Client-Side Prediction',
      domain: 'Multiplayer Netcode',
      unoptimized: 'Lockstep รอเซิร์ฟเวอร์ตอบกลับ (200ms Delay)',
      optimized: 'Client Prediction + Server Reconciliation',
      gain: 'ขจัดความรู้สึกหน่วง 100% (0ms Input Latency)',
      gameExample: 'Valorant, Apex Legends, Overwatch 2',
    },
    {
      topicId: 'texture-streaming',
      name: 'Texture Streaming & Mipmaps',
      domain: 'VRAM & Memory Management',
      unoptimized: 'โหลด Texture 4K เต็มขนาดทุกระยะ (VRAM ล้น)',
      optimized: 'Streaming Mipmaps Pool ตามระยะสายตา',
      gain: 'ประหยัด VRAM ลง 88.5% และขจัด Aliasing ชัดเจน',
      gameExample: 'Unreal Engine 5 Nanite Games, Cyberpunk 2077',
    },
    {
      topicId: 'audio-concurrency',
      name: 'Audio Voice Concurrency',
      domain: 'DSP Audio Mixing & CPU',
      unoptimized: 'เล่นทุกเสียงซ้อนทับกัน (60 Voices Clipping)',
      optimized: 'Max Concurrency Limit + Voice Stealing',
      gain: 'ลดภาระ CPU เสียงลง 90% และเสียงไม่แตกพร่า',
      gameExample: 'Battlefield 2042, Call of Duty: Warzone',
    },
    {
      topicId: 'async-loading',
      name: 'Async Addressables Loading',
      domain: 'I/O & Seamless Streaming',
      unoptimized: 'Resources.Load บล็อกเธรดหลัก (Freeze 450ms)',
      optimized: 'Background Thread Streamer + Soft Object Ptrs',
      gain: 'ขจัด Frame Hitch 100% (เล่นลื่น 60 FPS ขณะโหลด)',
      gameExample: 'World of Warcraft, Elden Ring, Genshin Impact',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick(400);
            onClose();
          }}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Master Game Dev Benchmark Matrix</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            ตารางเปรียบเทียบเทคนิคการปรับแต่งประสิทธิภาพ (Performance Comparison)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            สรุปหัวใจสำคัญของเทคนิค Optimization แต่ละด้าน และผลลัพธ์ที่ได้ในการผลิตเกมจริง
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-3.5">หัวข้อ / เทคนิค</th>
                <th className="p-3.5">หมวดหมู่</th>
                <th className="p-3.5 text-rose-400">วิธีเดิม (คอขวด)</th>
                <th className="p-3.5 text-cyan-400">วิธีที่ Optimize</th>
                <th className="p-3.5 text-emerald-400">ผลกำไรความเร็ว (Gain)</th>
                <th className="p-3.5 text-slate-400">ตัวอย่างเกมที่ใช้</th>
                <th className="p-3.5 text-center">แอ็กชัน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
              {matrixData.map(item => {
                const topicObj = TOPICS.find(t => t.id === item.topicId);
                return (
                  <tr key={item.topicId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white whitespace-nowrap">{item.name}</td>
                    <td className="p-3.5 text-xs text-slate-400 whitespace-nowrap">{item.domain}</td>
                    <td className="p-3.5 text-xs text-rose-300">{item.unoptimized}</td>
                    <td className="p-3.5 text-xs text-cyan-300 font-medium">{item.optimized}</td>
                    <td className="p-3.5 text-xs text-emerald-400 font-bold whitespace-nowrap">
                      {item.gain}
                    </td>
                    <td className="p-3.5 text-xs text-slate-300">{item.gameExample}</td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (topicObj) {
                            sound.playClick(700);
                            onSelectTopic(topicObj);
                            onClose();
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors mx-auto"
                      >
                        <span>ดู Lab</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div>💡 คำแนะนำ: เลือก Optimize ในจุดที่เป็นคอขวดจริงของเกมก่อน (Profile First, Optimize Later)</div>
          <button
            onClick={() => {
              sound.playClick(500);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            ปิดหน้าต่างนี้
          </button>
        </div>
      </div>
    </div>
  );
};
